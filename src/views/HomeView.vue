<template>
  <div>
    <h2>欢迎使用数据中心管理系统</h2>
    <el-card class="box-card">
      <template #header>
        系统概况
      </template>
      <div>待开发：服务器在线率、告警统计、资源使用率等</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// No script logic is required on the home page yet.  When dashboard
// widgets (e.g. server health, alarms, resource utilisation) are
// implemented, fetch logic can be placed here.
</script>

<style scoped>
.box-card {
  margin: 20px 0;
}
</style>