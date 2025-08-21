<template>
  <div>
    <h2>巡检列表</h2>
    <div class="actions">
      <el-input
        v-model="keyword"
        placeholder="关键词搜索..."
        clearable
        class="action-item"
      />
      <el-date-picker
        v-model="dateFilter"
        type="date"
        placeholder="巡检日期"
        class="action-item"
      />
      <el-button type="primary" class="action-item" @click="create">新建巡检</el-button>
    </div>
    <el-table :data="filtered" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="abnormalCount" label="异常数目" width="100" />
      <el-table-column prop="date" label="巡检日期" />
      <el-table-column prop="inspector" label="巡检人员" />
      <el-table-column prop="relayInspector" label="巡检接力人员" />
      <el-table-column prop="remark" label="备注" />
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button size="small" @click="edit(scope.row.id)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInspectionStore } from '@/stores/useInspectionStore'

const store = useInspectionStore()
const router = useRouter()

onMounted(() => {
  store.load()
})

const keyword = ref('')
const dateFilter = ref<Date | null>(null)

const filtered = computed(() => {
  const date = dateFilter.value ? dateFilter.value.toISOString().slice(0, 10) : undefined
  return store.filter(keyword.value, date)
})

function create() {
  router.push('/inspections/new')
}

function edit(id: number) {
  router.push(`/inspections/${id}`)
}

function remove(id: number) {
  store.remove(id)
}
</script>

<style scoped>
.actions {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.action-item {
  width: 200px;
}
</style>
