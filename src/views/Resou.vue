<template>
  <div style="padding: 40px">
    <div>
      <el-date-picker
        v-model="date"
        type="date"
        placeholder="选择日期"
        value-format="yyyy-MM-dd"
      >
      </el-date-picker>

      <el-time-select
        v-model="time"
        :picker-options="{
          start: '00:30',
          step: '00:30',
          end: '23:30',
        }"
        placeholder="选择时间"
        style="margin: 0 10px"
      >
      </el-time-select>

      <el-button type="primary" round @click="getData()">查询</el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      max-height="600"
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="rank" label="排行"> </el-table-column>
      <el-table-column width="250" label="标题">
        <template slot-scope="scope">
          <el-link
            type="primary"
            :href="tableData[scope.$index].url"
            target="_blank"
            >{{ tableData[scope.$index].title }}</el-link
          >
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="热度"> </el-table-column>
      <el-table-column width="500" label="微博">
        <template slot-scope="scope">
          <el-link
            type="info"
            :href="tableData[scope.$index].link"
            target="_blank"
            >{{ tableData[scope.$index].content }}</el-link
          >
        </template>
      </el-table-column>
      <el-table-column prop="author" label="作者"> </el-table-column>
      <el-table-column prop="repost" label="转发"> </el-table-column>
      <el-table-column prop="comment" label="评论"> </el-table-column>
      <el-table-column prop="like" label="点赞"> </el-table-column>
      <el-table-column prop="category" label="分类"> </el-table-column>
      <el-table-column fixed="right" label="操作" width="230">
        <template slot-scope="scope">
          <el-button
            @click="goSpread(tableData[scope.$index].title)"
            type="primary"
            size="medium"
            round
            >内容传播</el-button
          >
          <el-button
            @click="
              goRepost(
                tableData[scope.$index].link,
                tableData[scope.$index].title,
                tableData[scope.$index].content,
                tableData[scope.$index].url,
                tableData[scope.$index].author
              )
            "
            type="primary"
            size="medium"
            round
            >内容转发</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      date: null,
      time: null,
      tableData: [],
      query: this.Bmob.Query("weibo"),
      loading: false,
    };
  },
  methods: {
    getData() {
      if (!this.date || !this.time) {
        this.$alert("日期或时间未选择");
        return;
      }
      this.loading = true;
      let startTime = `${this.date} ${this.time}:00`,
        endTime = `${this.date} ${
          this.time.substring(0, this.time.length - 1) + 5
        }:00`;
      this.query.equalTo("createdAt", ">", startTime);
      this.query.equalTo("createdAt", "<", endTime);
      this.query.find().then((res) => {
        this.tableData = res;
      });
      this.loading = false;
    },
    goSpread(resou) {
      this.$router.push({ path: "/spread", query: { resou } });
    },
    goRepost(link, title, content, url, author) {
      this.$router.push({
        path: "/repost",
        query: { link, title, content, url, author },
      });
    },
  },
};
</script>

<style lang="less">
</style>