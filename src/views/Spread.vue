<template>
  <!-- 图表节点 -->
  <div class="echarts" ref="echarts"></div>
</template>

<script>
import * as echarts from "echarts";
import utils from "../utils";
export default {
  data() {
    return {
      data: {
        repost: [],
        comment: [],
        like: [],
      },
      category: [],
      query: this.Bmob.Query("weibo"),
    };
  },
  async mounted() {
    // 从跳转传过来的参数中获取标题
    let title = this.$route.query.resou;
    // 标题没传要报错并返回首页
    if (!title) if (!this.date || !this.time) {
      this.$alert("请先从热搜数据页选择一条热搜", {
        callback: () => this.$router.push('/')
      });
      return;
    }
    // 数据库查询该标题的数据
    this.query.equalTo("title", "==", title);
    // 从数据库获取数据
    await this.query.find().then((res) => {
      res.forEach((r) => {
        // 日期(用于x轴显示)
        this.category.push(utils.dateFormat(r.time));
        // 转发数组
        this.data.repost.push(r.repost);
        // 评论数组
        this.data.comment.push(r.comment);
        // 点赞数组
        this.data.like.push(r.like);
      });
    });

    // 取到页面里的绘图节点
    let myChart = echarts.init(document.getElementsByClassName("echarts")[0]);

    // 图表配置，详见echarts官网
    myChart.setOption({
      title: {
        text: title,
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["邮件营销", "联盟广告", "视频广告", "直接访问", "搜索引擎"],
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      xAxis: {
        type: "category",
        data: this.category,
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "转发",
          data: this.data.repost,
          type: "line",
          smooth: true,
        },
        {
          name: "评论",
          data: this.data.comment,
          type: "line",
          smooth: true,
        },
        {
          name: "点赞",
          data: this.data.like,
          type: "line",
          smooth: true,
        },
      ],
    });
  },
};
</script>

<style lang="less" scoped>
.echarts {
  width: 100%;
  height: 100%;
}
</style>