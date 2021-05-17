<template>
  <div
    v-loading="loading"
    style="overflow: hidden; height: 100%"
    element-loading-text="数据处理中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
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
</template>

<script>
import * as echarts from "echarts";
import utils from "../utils";
export default {
  data() {
    return {
      data: [],
      timeRange: null,
      category: [],
      query: this.Bmob.Query("weibo"),
      loading: false,
    };
  },
  methods: {
    // 获取数据
    async getData() {
      // 开启loading
      this.loading = true;

      // 日期范围不完整要报错
      if (this.timeRange.length < 2) {
        this.$alert("日期范围不完整");
      }
      // 获取开始时间和结束时间
      let startTime = this.timeRange[0],
        endTime = this.timeRange[1];
      // 获取范围内的开始时间戳和结束时间戳
      [startTime, endTime] = await utils.dateRange(
        startTime,
        endTime,
        this.query
      );

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
      }

      // 循环完毕，将结果放入data
      for (let c in category) {
        this.data.push({ name: c, value: category[c] });
      }

      // 绘图
      this.drawChart();

      // 关闭loading
      this.loading = false;
    },
    drawChart() {
      // 取到页面里的绘图节点
      let myChart = echarts.init(document.getElementsByClassName("echarts")[0]);

      // 格式化开始时间和结束时间
      let startTime = utils.dateFormat(Date.parse(this.timeRange[0])),
        endTime = utils.dateFormat(Date.parse(this.timeRange[1]));

      // 图表配置，详见echarts官网
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
            data: this.data,
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
  },
};
</script>

<style lang="less" scoped>
.echarts {
  padding: 0 40px;
  width: 100%;
  height: 100%;
}
</style>