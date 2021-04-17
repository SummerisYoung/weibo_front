<template>
  <div
    v-loading="loading"
    class="category"
    :element-loading-text="'数据处理中 ' + loadingPercent + '%'"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div style="width: 70%">
      <div style="margin: 40px">
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        >
        </el-date-picker>
        <el-button
          style="margin-left: 20px"
          type="primary"
          round
          @click="getData()"
          >查询</el-button
        >
      </div>
      <div class="echarts" ref="echarts"></div>
    </div>
    <div class="data-analysis" v-if="timeArr.length == 2 && topList.length">
      从<span class="blue-text">{{ timeArr[0] }}</span
      >到<span class="blue-text">{{ timeArr[1] }}</span
      >时间范围内,前10条热搜共有<span class="blue-text">{{ total }}</span
      >条
      <ul v-if="categoryData.length">
        <li
          v-for="(category, index) in categoryData.slice(0, 3)"
          :key="category.name"
        >
          热搜分类里分类第{{ index + 1 }}的是
          <span class="blue-text">{{ category.name }}</span
          >， 属于该类的热搜有<span class="green-text">{{
            category.value
          }}</span
          >条，占比为<span class="red-text"
            >{{ ((category.value * 100) / total).toFixed(2) }}%</span
          >
        </li>
      </ul>
      在热搜榜里排行里，
      <ul v-if="topList.length">
        <li v-for="(top, index) in topList.slice(0, 3)" :key="top.title">
          霸占榜首热搜时长Top{{ index + 1 }}为
          <el-link
            type="primary"
            class="resou-url"
            :href="top.url"
            target="_blank"
            >{{ top.title }}</el-link
          >，霸榜时长为<span class="green-text">{{ top.duration }}</span
          >小时，最高热度为<span class="red-text">{{ top.weight }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import utils from "../utils";
export default {
  data() {
    return {
      categoryData: [],
      timeRange: null,
      timeArr: [],
      category: [],
      query: this.Bmob.Query("weibo"),
      loading: false,
      loadingPercent: 0,
      domination: {},
      topList: [],
      total: 0,
    };
  },
  methods: {
    // 获取数据
    async getData() {
      // 开启loading
      this.loading = true;

      if (this.timeRange.length < 2) {
        this.$alert("日期范围不完整");
      }
      // 获取开始时间和结束时间
      let startTime = this.timeRange[0],
        endTime = this.timeRange[1];
      // 日期格式化
      this.timeArr.push(
        utils.dateFormat(startTime.getTime()),
        utils.dateFormat(endTime.getTime())
      );
      // 获取范围内的开始时间戳和结束时间戳
      [startTime, endTime] = await utils.dateRange(
        startTime,
        endTime,
        this.query
      );

      // 记录一下开始时间
      const beginTime = startTime;

      // 分类结果
      let category = {};

      //循环生成时间范围
      for (startTime, endTime; startTime <= endTime; startTime += 1800) {
        // 获取字符型时间
        let timestamp = `${startTime}`;
        // 去掉最后一位
        let temp = timestamp.substring(0, timestamp.length - 1);
        // 在数据库里，时间戳最后一位可能是2或3，所以制造数组
        let timearr = [temp + "2", temp + "3"];
        // 查询库里的时间戳是否有在上面数组里的
        this.query.containedIn("time", timearr);
        // 取每个时间戳的前10条
        this.query.limit(10);
        // 获取数据
        await this.query.find().then((res) => {
          // 记录霸榜内容
          const top = res[0];
          // 如果不是undefined
          if (top) {
            // 如果霸榜内容没有这条热搜就对其初始化
            if (!this.domination[top.title]) {
              this.domination[top.title] = {
                url: top.url,
                time: [top.time],
                weight: [top.weight],
              };
            }
            // 如果已经有了就把新的时间和热度推入数组
            else {
              this.domination[top.title].time.push(top.time);
              this.domination[top.title].weight.push(top.weight);
            }
          }
          // 循环结果
          res.forEach((r) => {
            // 如果结果数据集里有这个分类了就+1
            if (category[r.category] != undefined) {
              category[r.category]++;
            } else {
              // 没有就新增一个分类对象
              category[r.category] = 0;
            }
          });
        });
        // 修改数据处理完成度百分比
        this.loadingPercent = parseInt(
          ((startTime - beginTime) * 100) / (endTime - beginTime)
        );
      }

      // 循环完毕，将结果放入data
      for (let c in category) {
        this.categoryData.push({ name: c, value: category[c] });
      }

      // 绘图
      this.drawChart();
      // 展示结果文案
      this.dataAnalysis();

      // 关闭loading
      this.loading = false;
    },
    // 对前10条热搜分类绘制饼状图
    drawChart() {
      let myChart = echarts.init(document.getElementsByClassName("echarts")[0]);

      let startTime = utils.dateFormat(Date.parse(this.timeRange[0])),
        endTime = utils.dateFormat(Date.parse(this.timeRange[1]));

      myChart.setOption({
        title: {
          text: `${startTime}至${endTime}全部热搜数据分类统计`,
          left: "center",
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          orient: "vertical",
          left: "left",
        },
        series: [
          {
            name: "热搜分类",
            type: "pie",
            radius: "50%",
            data: this.categoryData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      });
    },
    // 给两个字符串型时间戳，返回持续时长
    computeDuration(start, end) {
      // 如果开始时间等于结束时间，说明这个热榜只霸榜一次，即0.5小时
      if (start == end) {
        return 0.5;
      }
      // 时间差的毫秒数
      const time =
        new Date(parseInt(end)).getTime() - new Date(parseInt(start)).getTime();
      // 计算天数
      const days = Math.floor(time / (24 * 3600));
      // 计算天数后剩余的毫秒数
      const leave1 = time % (24 * 3600);
      // 计算出小时数
      let hours = Math.floor(leave1 / 3600);
      //计算小时数后剩余的毫秒数
      const leave2 = leave1 % 3600;
      // 计算出分钟数
      const minutes = Math.floor(leave2 / 60);
      // 如果有天数，那么归入小时
      if (days > 0) {
        hours += days * 24;
      }
      // 30分钟归入0.5小时
      if (minutes == 30) {
        hours += 0.5;
      }
      return hours;
    },
    // 数据分析及展示分析结果
    dataAnalysis() {
      // 将内容分类数组以每个类的值按从大到小排序，排序后第一个即为数量最多的类
      this.categoryData.sort((a, b) => b.value - a.value);
      // 计算前10条热搜总量
      this.categoryData.map((item) => {
        this.total += item.value;
      });
      // 初始化霸榜数组
      this.topList = [];
      // 将霸榜对象格式化后放入霸榜数组
      for (const d in this.domination) {
        this.topList.push({
          title: d,
          url: this.domination[d].url,
          duration: this.computeDuration(
            this.domination[d].time[0],
            this.domination[d].time[this.domination[d].time.length - 1]
          ),
          weight: Math.max(...this.domination[d].weight),
        });
      }
      // 对霸榜数组按照时长从大到小排序，排序后第一个即为霸榜时间最长的热搜
      this.topList.sort((a, b) => b.duration - a.duration);
    },
  },
};
</script>

<style lang="less" scoped>
.echarts {
  padding: 0 40px;
  width: 80%;
  height: 100%;
}
.category {
  display: flex;
  min-height: 100%;
}
.data-analysis {
  padding: 120px 20px 0 0;

  ul li {
    line-height: 30px;
    word-break: keep-all;
  }
}
.blue-text {
  color: #409eff;
}
.green-text {
  color: #67c23a;
}
.red-text {
  color: #f56c6c;
}
.el-link {
  vertical-align: initial;
  font-size: 16px;
}
</style>