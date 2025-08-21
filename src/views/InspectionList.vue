<template>
  <div>
    <h2>巡检记录</h2>

    <div class="toolbar">
      <el-button type="primary" class="mb-2" @click="createNew">＋ 新建巡检</el-button>

      <div class="filters">
        <el-select v-model="inspector" clearable placeholder="巡检人员" class="filter-item">
          <el-option v-for="p in inspectors" :key="p" :label="p" :value="p" />
        </el-select>

        <el-select v-model="relay" clearable placeholder="接力人员" class="filter-item">
          <el-option v-for="p in relayInspectors" :key="p" :label="p" :value="p" />
        </el-select>

        <el-input v-model="remark" placeholder="备注搜索" clearable class="filter-item" />

        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <el-table :data="filtered" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="180" />
      <el-table-column prop="inspector" label="巡检人" width="140" />
      <el-table-column prop="relayInspector" label="接力人" width="140" />
      <el-table-column prop="date" label="日期" width="140" />
      <el-table-column prop="abnormal" label="异常数" width="100" />
      <el-table-column prop="notes" label="备注" min-width="200" />

      <el-table-column label="操作" width="140" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="edit(scope.row.id)">编辑</el-button>
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
  store.load() // 迁移逻辑在 store 内部
})

const inspector = ref('')
const relay = ref('')
const remark = ref('')

const inspectors = computed(() =>
  Array.from(new Set(store.list.map(i => i.inspector).filter(Boolean))) as string[]
)
const relayInspectors = computed(() =>
  Array.from(new Set(store.list.map(i => i.relayInspector).filter(Boolean))) as string[]
)

const filtered = computed(() =>
  store.filter({
    inspector: inspector.value || undefined,
    relayInspector: relay.value || undefined,
    remark: remark.value || undefined
  })
)

function resetFilters() {
  inspector.value = ''
  relay.value = ''
  remark.value = ''
}

function createNew() {
  router.push('/inspections/new')
}

function edit(id: number) {
  router.push(`/inspections/${id}/edit`)
}
</script>

<style scoped>
h2 { margin-bottom: 12px; }
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  margin-bottom: 8px;
}
.filters {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-item { min-width: 160px; }
.mb-2 { margin-bottom: 8px; }
</style>
