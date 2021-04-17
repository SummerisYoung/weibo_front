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
        @click="getRangeData()"
        >查询</el-button
      >
    </div>
    <!-- 图表节点 -->
    <div ref="chart"></div>
  </div>
</template>

<script>
import utils from "../utils";
export default {
  data() {
    return {
      timeRange: null,
      dataOri: [["热搜"]],
      data: [],
      date: "",
      dateIndex: 1,
      dataSlice: "",
      svg: null,
      scale: null,
      axis: null,
      width: 1200,
      height: 600,
      margin: { top: 20, bottom: 0, left: 50, right: 100 },
      chartWidth: 0,
      chartHeight: 0,
      duration: 1000,
      barPadding: 20,
      barHeight: 0,
      count: 10,
      query: this.Bmob.Query("weibo"),
      loading: false,
    };
  },
  methods: {
    // 初始化
    initialData() {
      this.$refs.chart.innerHTML = "";
      (this.dataOri = [["热搜"]]),
        (this.data = []),
        (this.date = ""),
        (this.dateIndex = 1),
        (this.dataSlice = ""),
        (this.svg = null),
        (this.scale = null),
        (this.axis = null),
        (this.chartWidth = this.width - (this.margin.left + this.margin.right));
      this.chartHeight = this.height - (this.margin.top + this.margin.bottom);
      this.barHeight =
        (this.chartHeight - this.barPadding * this.count) / this.count;
    },
    // 主代码
    async getRangeData() {
      if (this.timeRange.length < 2) {
        this.$alert("日期范围不完整");
      }
      this.initialData(); // 初始化
      this.loading = true; // 添加loading
      await this.getData(); // 获取和处理数据
      this.createSvg(); // 创建svg
      this.sliceData(); // 截取当天数据
      this.renderAxis(); // 创建坐标轴
      this.renderAxisLine(); // 创建坐标线
      this.renderDateTitle(); // 渲染日期标题
      this.createChart(); // 创建图表
      this.loading = false; // 关闭loading
      this.renderChart(); // 渲染图表
      this.createTicker(); // 创建定时器
    },
    // 获取数据
    async getData() {
      // 获取开始时间和结束时间
      let startTime = this.timeRange[0],
        endTime = this.timeRange[1];
      // 获取范围内的开始时间戳和结束时间戳
      [startTime, endTime] = await utils.dateRange(startTime, endTime, this.query);

      // 临时数据数组
      let resData = {};

      //循环生成时间范围
      for (startTime, endTime; startTime <= endTime; startTime += 1800) {
        // 获取字符型时间
        let timestamp = `${startTime}`;
        // 保存所有时间作为日期标题
        this.dataOri[0].push(utils.dateFormat(timestamp));
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
            // 将数据按照一定格式保存
            this.data.push({
              name: r.title,
              value: r.weight,
              lastValue: resData[r.title]
                ? resData[r.title][resData[r.title].length - 1]
                : 0,
              date: utils.dateFormat(timestamp),
              color: this.randomRgbColor(),
              category: r.category,
            });
            // 保存一个热搜热度map
            if (resData[r.title]) {
              resData[r.title].push(r.weight);
            } else {
              resData[r.title] = [r.weight];
            }
          });
        });
      }
    },
    // 创建SVG
    createSvg() {
      this.svg = this.d3
        .select(this.$refs.chart)
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);
    },
    //随机生成颜色
    randomRgbColor() {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r},${g},${b})`;
    },
    // 截取当天数据
    sliceData() {
      this.date = this.dataOri[0][this.dateIndex];
      this.dataSlice = this.data
        .filter((d) => d.date === this.date)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    },
    // 创建比例尺
    createScale() {
      this.scale = this.d3
        .scaleLinear()
        .domain([0, this.d3.max(this.dataSlice, (d) => d.value)])
        .range([0, this.chartWidth]);
    },
    // 创建坐标轴
    renderAxis() {
      this.createScale();

      this.axis = this.d3
        .axisTop()
        .scale(this.scale)
        .ticks(5)
        .tickPadding(10)
        .tickSize(0);

      this.svg
        .append("g")
        .classed("axis", true)
        .style(
          "transform",
          `translate3d(${this.margin.left * 5}px, ${
            this.margin.top
          }px, 0) scale(0.8)`
        )
        .call(this.axis);
    },
    // 创建坐标线
    renderAxisLine() {
      this.d3.selectAll("g.axis g.tick").select("line.grid-line").remove();
      this.d3
        .selectAll("g.axis g.tick")
        .append("line")
        .classed("grid-line", true)
        .attr("stroke", "black")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", this.chartHeight);
    },
    // 渲染日期标题
    renderDateTitle() {
      this.dateTitle = this.svg
        .append("text")
        .classed("date-title", true)
        .text(this.date)
        .attr("x", this.chartWidth + this.margin.top * 6)
        .attr("y", this.chartHeight - this.margin.left)
        .attr("fill", "rgb(128, 128, 128)")
        .attr("font-size", 30)
        .attr("text-anchor", "end");
    },
    // 创建图表
    createChart() {
      this.chart = this.svg
        .append("g")
        .classed("chart", true)
        .style(
          "transform",
          `translate3d(${this.margin.left * 5}px, ${
            this.margin.top
          }px, 0) scale(0.8)`
        );
    },
    // 渲染图表
    renderChart() {
      let that = this;
      const bars = this.chart
        .selectAll("g.bar")
        .data(this.dataSlice, (d) => d.name);
      let barsEnter;

      barsEnter = bars
        .enter()
        .append("g")
        .classed("bar", true)
        .style(
          "transform",
          (d, i) => `translate3d(0, ${this.calTranslateY(i)}px, 0)`
        );

      this.dateIndex > 1 &&
        barsEnter
          .transition()
          .duration(this.duration)
          .style(
            "transform",
            (d, i) => `translate3d(0, ${this.calTranslateY(i, "end")}px, 0)`
          );

      barsEnter
        .append("rect")
        .style("width", (d) => this.scale(d.value))
        .style("height", this.barHeight + "px")
        .style("fill", (d) => d.color);

      barsEnter
        .append("text")
        .classed("label", true)
        .text((d) => d.name)
        .attr("x", "-5")
        .attr("y", this.barPadding)
        .attr("font-size", 16)
        .style("text-anchor", "end");

      barsEnter
        .append("text")
        .classed("category", true)
        .text((d) => d.category)
        .attr("x", (d) => this.scale(d.value) / 2.5)
        .attr("y", this.barPadding);

      barsEnter
        .append("text")
        .classed("value", true)
        .text((d) => d.value)
        .attr("x", (d) => this.scale(d.value) + 10)
        .attr("y", this.barPadding);

      // 更新模式
      bars
        .transition()
        .duration(this.duration)
        .ease(this.d3.easeLinear)
        .style(
          "transform",
          (d, i) => "translate3d(0, " + this.calTranslateY(i, "end") + "px, 0)"
        )
        .select("rect")
        .style("width", (d) => this.scale(d.value) + "px");

      bars
        .select("text.value")
        .transition()
        .duration(this.duration)
        .ease(this.d3.easeLinear)
        .attr("x", (d) => this.scale(d.value) + 10)
        .tween("text", function (d) {
          const textDom = this;
          const i = that.d3.interpolateRound(d.lastValue, d.value);
          return (t) => (textDom.textContent = i(t));
        });

      bars
        .select("text.category")
        .transition()
        .duration(this.duration)
        .ease(this.d3.easeLinear)
        .attr("x", (d) => this.scale(d.value) / 2.5);

      // 退出模式
      bars
        .exit()
        .transition()
        .duration(this.duration)
        .ease(this.d3.easeLinear)
        .style(
          "transform",
          (d, i) => "translate3d(0, " + this.calTranslateY(i) * 2 + "px, 0)"
        )
        .style("width", (d) => this.scale(d.value) + "px")
        .remove();
    },
    // 创建定时器
    createTicker() {
      const ticker = this.d3.interval(() => {
        if (this.dateIndex < this.dataOri[0].length - 1) {
          this.dateIndex++;
          this.date = this.dataOri[0][this.dateIndex];
          this.dateTitle.text(this.date);
          this.sliceData();
          this.updateAxis();
          this.renderAxisLine();
          this.renderChart();
        } else {
          ticker.stop();
        }
      }, this.duration * 1.2);
    },
    // 当数据变化时更新坐标轴
    updateAxis() {
      this.createScale();

      this.axis
        .scale()
        .domain([0, this.d3.max(this.dataSlice, (d) => d.value)]);

      this.svg
        .select("g.axis")
        .transition()
        .duration(this.duration)
        .ease(this.d3.easeLinear)
        .call(this.axis);

      this.d3.selectAll("g.axis g.tick text").attr("font-size", 14);
    },
    // 计算y轴变化
    calTranslateY(i, end) {
      if (this.dateIndex === 1 || end) {
        return (this.barHeight + this.barPadding) * i + this.barPadding / 2;
      } else {
        return (this.barHeight + this.barPadding) * (this.count + 1);
      }
    },
  },
};
</script>
