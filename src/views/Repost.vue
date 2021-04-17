<template>
  <div class="repost">
    <h1 class="title" v-if="title != '' && url != ''">
      <el-link type="primary" :href="url" target="_blank">{{ title }}</el-link>
    </h1>
    <div
      v-loading="loading"
      style="overflow: hidden; height: 100%"
      element-loading-text="数据爬取中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      class="echarts"
      ref="echarts"
    ></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  data() {
    return {
      data: [],
      loading: false,
      title: "",
      url: "",
    };
  },
  mounted() {
    const link = this.$route.query.link;
    const content = this.$route.query.content;
    if (!link) {
      this.$alert("请先从热搜数据页选择一条热搜", {
        callback: () => this.$router.push("/"),
      });
      return;
    }
    this.loading = true; // 添加loading
    let myChart = echarts.init(document.getElementsByClassName("echarts")[0]);
    this.$axios("http://localhost:8000/?link=" + link)
      .then((res) => {
        const data = {
          name: `${res.data.time}\n${content}`,
          data: res.data.data,
          children: res.data.children,
        };

        myChart.setOption({
          series: [
            {
              type: "tree",

              data: [data],
              top: "1%",
              left: "5%",
              bottom: "1%",
              right: "20%",

              symbolSize: 7,

              label: {
                normal: {
                  position: "left",
                  verticalAlign: "middle",
                  align: "left",
                  formatter(v) {
                    let text = v.name;
                    for (let i = 16; i < text.length; i += 16) {
                      text = text.slice(0, i) + "\n" + text.slice(i);
                    }
                    text += `\n\n点赞：${v.data.data.like}\n转发：${v.data.data.repost}\n评论：${v.data.data.comment}`;
                    return text;
                  },
                },
              },

              leaves: {
                label: {
                  position: "right",
                  verticalAlign: "middle",
                  align: "left",
                },
              },

              emphasis: {
                focus: "descendant",
              },

              expandAndCollapse: true,
              animationDuration: 550,
              animationDurationUpdate: 750,
            },
          ],
        });

        this.title = this.$route.query.title;
        this.url = this.$route.query.url;
        this.loading = false; //取消loading
      })
      .catch(() => {
        this.loading = false; // 添加loading
        this.$alert("请求数据失败,请稍后再试");
      });
  },
};
</script>

<style lang="less" scoped>
.echarts {
  width: 100%;
  height: 100%;
}
.repost {
  width: 100%;
  height: 100%;
  position: relative;
  .title {
    position: absolute;
    left: 50px;
    top: 0;
    z-index: 100;
  }
}
</style>