<template>
  <el-card class="notification-stats">
    <div class="stat-item">
      <span>通知总数</span>
      <el-tag type="primary">{{ total }}</el-tag>
    </div>
    <div class="stat-item">
      <span>未读通知</span>
      <el-tag type="danger">{{ unread }}</el-tag>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/useNotificationStore'

const store = useNotificationStore()
const total = computed(() => store.list.length)
const unread = computed(() => store.list.filter(n => !n.read).length)
</script>

<style scoped>
.notification-stats {
  margin-bottom: 12px;
}
.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.stat-item:last-child {
  margin-bottom: 0;
}
</style>
