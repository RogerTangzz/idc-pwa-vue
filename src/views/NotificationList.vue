<template>
  <div>
    <h2>通知列表</h2>
    <NotificationStats class="mb-2" />
    <el-button type="primary" class="mb-2" @click="addSample">＋ 添加通知</el-button>
    <el-button class="mb-2" @click="markAllRead" :disabled="!store.list.some(n => !n.read)">标记全部已读</el-button>
    <el-table :data="store.list" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="message" label="内容" />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="date" label="时间" />
      <el-table-column label="状态" width="80">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.read">已读</el-tag>
          <el-tag type="info" v-else>未读</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button size="small" @click="markRead(scope.row.id)" :disabled="scope.row.read">标记已读</el-button>
          <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import NotificationStats from '@/components/NotificationStats.vue'

const store = useNotificationStore()

onMounted(() => {
  store.load()
})

function markRead(id: number) {
  store.markRead(id)
}
function remove(id: number) {
  store.remove(id)
}
function markAllRead() {
  store.markAllRead()
}
function addSample() {
  store.add({ title: '示例通知', message: '这是一条通知', type: '系统' })
}
</script>

<style scoped>
h2 {
  margin-bottom: 12px;
}
.mb-2 {
  margin-bottom: 8px;
}
</style>
