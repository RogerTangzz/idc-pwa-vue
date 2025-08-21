<template>
  <div>
    <h2>通知统计</h2>
    <el-table :data="store.stats" stripe style="width: 100%">
      <el-table-column prop="title" label="通知标题" />
      <el-table-column prop="confirmed" label="已确认数" width="120" />
      <el-table-column label="未确认列表">
        <template #default="{ row }">
          <span v-if="!row.unconfirmed.length">--</span>
          <ul v-else>
            <li v-for="name in row.unconfirmed" :key="name">{{ name }}</li>
          </ul>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/useNotificationStore'

const store = useNotificationStore()

onMounted(() => {
  store.fetchStats()
})
</script>

<style scoped>
h2 {
  margin-bottom: 16px;
}
ul {
  padding-left: 16px;
  margin: 0;
}
</style>
