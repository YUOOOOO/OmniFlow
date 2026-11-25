<template>
  <div class="omniflow-app">
    <h1>OmniFlow</h1>
    <p>无限画布 + 插件系统</p>
    <el-button type="primary">Hello Element Plus</el-button>
  </div>
</template>

<script setup lang="ts">
// TODO: 实现插件系统和画布
</script>

<style scoped>
.omniflow-app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #409eff;
}

p {
  font-size: 1.2rem;
  color: #606266;
  margin-bottom: 2rem;
}
</style>
