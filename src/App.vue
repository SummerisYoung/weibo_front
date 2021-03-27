<template>
  <div id="app">
    <div class="sidebar">
      <el-menu
        default-active="1"
        class="el-menu-vertical-demo"
        background-color="#304156"
        text-color="rgb(191, 203, 217)"
        active-text-color="#409EFF"
      >
        <el-menu-item index="1" @click="goPage('/')">
          <i class="el-icon-setting"></i>
          <span slot="title">热搜数据</span>
        </el-menu-item>
        <el-menu-item index="2" @click="goPage('/evolution')">
          <i class="el-icon-setting"></i>
          <span slot="title">内容演化</span>
        </el-menu-item>
        <el-menu-item index="3" @click="goPage('/spread')">
          <i class="el-icon-setting"></i>
          <span slot="title">内容传播</span>
        </el-menu-item>
        <el-menu-item index="4" @click="goPage('/Category')">
          <i class="el-icon-setting"></i>
          <span slot="title">内容分类(仅供参考)</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="main-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  methods: {
    goPage(url) {
      this.$router.push({ path: url });
    },
  },
};
</script>

<style lang="less">
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
#app {
  display: flex;
  height: 100%;

  .sidebar {
    height: 100%;
    width: 210px;
    background-color: #304156;
  }

  .main-container {
    flex: 1;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }
}
</style>
