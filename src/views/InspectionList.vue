<template>
  <div>
    <h2>巡检记录</h2>
    <el-table :data="store.list" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="inspector" label="巡检人" />
      <el-table-column prop="date" label="日期" />
      <el-table-column prop="abnormal" label="异常数" width="80" />
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button size="small" @click="edit(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInspectionStore } from '@/stores/useInspectionStore'

const store = useInspectionStore()
const router = useRouter()

onMounted(() => {
  store.load()
})

function edit(id: number) {
  router.push(`/inspections/${id}/edit`)
}
</script>

<style scoped>
h2 {
  margin-bottom: 12px;
}
</style>
