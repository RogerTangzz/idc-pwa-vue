<template>
  <div>
    <h2>服务器列表</h2>
    <el-table :data="serverStore.list" stripe style="width: 100%">
      <el-table-column prop="name" label="服务器名" />
      <el-table-column prop="ip"   label="IP 地址" />
      <el-table-column prop="status" label="状态" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useServerStore } from '@/stores/useServerStore'

const serverStore = useServerStore()

onMounted(() => {
  serverStore.fetchServers()
})
</script>

<style scoped>
h2 {
  margin-bottom: 16px;
}
</style>