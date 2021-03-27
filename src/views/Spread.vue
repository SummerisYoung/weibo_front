<template>
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
    let title = this.$route.query.resou;
    console.log(title);
    if (!title) if (!this.date || !this.time) {
        this.$alert("请先从热搜数据页选择一条热搜", {
          callback: () => this.$router.push('/')
        });
        return;
      }
    this.query.equalTo("title", "==", title);
    await this.query.find().then((res) => {
      res.forEach((r) => {
        this.category.push(utils.dateFormat(r.time));
        this.data.repost.push(r.repost);
        this.data.comment.push(r.comment);
        this.data.like.push(r.like);
      });
    });

    let myChart = echarts.init(document.getElementsByClassName("echarts")[0]);

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