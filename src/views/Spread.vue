<template>
  <div class="spread">
    <div class="echarts" ref="echarts"></div>
    <div v-if="rates.length" style="margin-top: 10px">
      <el-button
        style="margin-left: 20px"
        type="primary"
        round
        @click="goRepost()"
        >前往纵向分析</el-button
      >
      <ul class="spread-data-analysis">
        <li v-for="(rate, index) in rates" :key="index" v-html="rate"></li>
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
      resou: {},
      data: {
        repost: [],
        comment: [],
        like: [],
        rank: [],
      },
      rates: [],
      category: [],
      query: this.Bmob.Query("weibo"),
    };
  },
  async mounted() {
    let title = this.$route.query.resou;
    if (!title)
      if (!this.date || !this.time) {
        this.$alert("请先从热搜数据页选择一条热搜", {
          callback: () => this.$router.push("/"),
        });
        return;
      }
    this.query.equalTo("title", "==", title);
    await this.query.find().then((res) => {
      this.resou = {
        author: res[0].author,
        link: res[0].link,
        title: res[0].title,
        content: res[0].content,
        url: res[0].url,
      };
      res.forEach((r) => {
        this.category.push(utils.dateFormat(r.time));
        this.data.repost.push(r.repost);
        this.data.comment.push(r.comment);
        this.data.like.push(r.like);
        this.data.rank.push(r.rank);
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
        data: ["点赞", "转发", "评论", "排名"],
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
        {
          name: "排名",
          data: this.data.rank,
          type: "line",
          smooth: true,
        },
      ],
    });

    // 数据分析文案
    this.dataAnalysis();
  },
  methods: {
    dataAnalysis() {
      for (let i = 0; i < this.data.like.length - 1; i++) {
        let rate =
          (this.data.like[i + 1] - this.data.like[i]) / this.data.like[i];
        rate = (rate * 100).toFixed(2);
        let text = `<span class='blue-text'>${this.category[i].slice(
          5
        )}</span> --
        <span class='blue-text'>${this.category[i + 1].slice(
          5
        )}</span>点赞增长速率为
        <span class='green-text'>${rate}%</span>，排名变化为
        <span class='red-text'>${
          this.data.rank[i]
        }</span>--<span class='red-text'>${this.data.rank[i + 1]}</span>
        `;
        this.rates.push(text);
      }
    },
    // 跳转纵向分析页面
    goRepost() {
      this.$router.push({
        path: "/repost",
        query: { ...this.resou },
      });
    },
  },
};
</script>

<style lang="less">
.spread {
  height: 100%;
  display: flex;
}
.spread-data-analysis {
  height: 80%;
  margin-top: 10px;
  padding: 0 20px 20px 20px;
  overflow-y: scroll;

  span {
    line-height: 30px;
  }
}
.echarts {
  padding: 40px;
  width: 70%;
  height: 80%;
}
</style>