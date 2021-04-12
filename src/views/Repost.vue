<template>
  <div 
    v-loading="loading"
    style="overflow: hidden; height: 100%"
    element-loading-text="数据爬取中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    class="echarts" 
    ref="echarts">
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  data() {
    return {
      data: [],
      loading: false
    }
  },
  mounted() {
    const link = this.$route.query.link;
    const title = this.$route.query.title;
    if (!link) if (!this.date || !this.time) {
      this.$alert("请先从热搜数据页选择一条热搜", {
        callback: () => this.$router.push('/')
      });
      return;
    }
    this.loading = true; // 添加loading
    let myChart = echarts.init(document.getElementsByClassName("echarts")[0]);
    this.$axios('http://localhost:8000/?link=' + link)
      .then(res => {
        const data = {
          "name": `${res.data.time}\n${title}`, 
          "children" : res.data.children
        }

        myChart.setOption({
          tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
          },
          series: [
            {
              type: 'tree',

              data: [data],
              width: 500,
              top: '1%',
              left: '20%',
              bottom: '1%',
              right: '20%',

              symbolSize: 7,

              label: {
                  position: 'left',
                  verticalAlign: 'middle',
                  align: 'right',
                  fontSize: 9
              },

              leaves: {
                  label: {
                      position: 'right',
                      verticalAlign: 'middle',
                      align: 'left'
                  }
              },

              emphasis: {
                  focus: 'descendant'
              },

              expandAndCollapse: true,
              animationDuration: 550,
              animationDurationUpdate: 750
            }
          ]
        });

        this.loading = false; //取消loading
      }).catch(() => {
        this.loading = false; // 添加loading
        this.$alert("请求数据失败,请稍后再试");
      })
  }
}
</script>

<style lang="less" scoped>
.echarts {
  width: 100%;
  height: 100%;
}
</style>