<template>
  <div>
    <h2>巡检记录</h2>
    <el-button type="primary" class="mb-2" @click="createNew">＋ 新建巡检</el-button>
    <el-table :data="store.list" style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="createdAt" label="时间" />
      <el-table-column prop="abnormalCount" label="异常数" width="80" />
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

const router = useRouter()
const store = useInspectionStore()

onMounted(() => {
  store.load()
})

function createNew() {
  router.push('/inspections/new')
}

function edit(id: number) {
  router.push(`/inspections/${id}/edit`)
}
</script>

<style scoped>
h2 { margin-bottom: 12px; }
.mb-2 { margin-bottom: 8px; }
</style>
