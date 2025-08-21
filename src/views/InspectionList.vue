<template>
  <div>
    <h2>巡检记录</h2>

    <div class="toolbar">
      <el-button type="primary" class="mb-2" @click="createNew">＋ 新建巡检</el-button>

      <div class="filters">
        <!-- 关键字（标题/人员/备注模糊匹配） -->
        <el-input v-model="keyword" placeholder="关键词搜索..." clearable class="filter-item" />

        <!-- 日期（YYYY-MM-DD 前缀匹配） -->
        <el-date-picker
          v-model="dateFilter"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="巡检日期"
          class="filter-item"
        />

        <!-- 精确筛选：巡检人 / 接力人 -->
        <el-select v-model="inspector" clearable placeholder="巡检人员" class="filter-item">
          <el-option v-for="p in inspectors" :key="p" :label="p" :value="p" />
        </el-select>

        <el-select v-model="relay" clearable placeholder="接力人员" class="filter-item">
          <el-option v-for="p in relayInspectors" :key="p" :label="p" :value="p" />
        </el-select>

        <!-- 备注关键词（notes/title 模糊） -->
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

      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="edit(scope.row.id)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="remove(scope.row.id)">删除</el-button>
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

// —— 筛选状态 —— //
const keyword = ref('')
const dateFilter = ref<string | null>(null)
const inspector = ref('')
const relay = ref('')
const remark = ref('')

// 可选项集合
const inspectors = computed(
  () => Array.from(new Set(store.list.map(i => i.inspector).filter(Boolean))) as string[]
)
const relayInspectors = computed(
  () => Array.from(new Set(store.list.map(i => i.relayInspector).filter(Boolean))) as string[]
)

// 组合筛选
const filtered = computed(() =>
  store.filter({
    keyword: keyword.value || undefined,
    date: dateFilter.value || undefined,
    inspector: inspector.value || undefined,
    relayInspector: relay.value || undefined,
    remark: remark.value || undefined
  })
)

function resetFilters() {
  keyword.value = ''
  dateFilter.value = null
  inspector.value = ''
  relay.value = ''
  remark.value = ''
}

function createNew() {
  router.push('/inspections/new')
}

function edit(id: number) {
  // 路由已支持 /inspections/:id -> 重定向到 /edit
  router.push(`/inspections/${id}/edit`)
}

function remove(id: number) {
  store.remove(id)
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
