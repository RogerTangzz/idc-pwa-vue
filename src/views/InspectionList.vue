<template>
  <div>
    <h2>巡检列表</h2>
    <div class="filters">
      <el-select
        v-model="inspector"
        clearable
        placeholder="巡检人员"
        class="filter-item"
      >
        <el-option
          v-for="p in inspectors"
          :key="p"
          :label="p"
          :value="p"
        />
      </el-select>
      <el-select
        v-model="relay"
        clearable
        placeholder="巡检接力人员"
        class="filter-item"
      >
        <el-option
          v-for="p in relayInspectors"
          :key="p"
          :label="p"
          :value="p"
        />
      </el-select>
      <el-input
        v-model="remark"
        placeholder="备注搜索"
        clearable
        class="filter-item"
      />
      <el-button @click="resetFilters">重置</el-button>
    </div>
    <el-table :data="filtered" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="inspector" label="巡检人员" />
      <el-table-column prop="relayInspector" label="巡检接力人员" />
      <el-table-column prop="remark" label="备注" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInspectionStore } from '@/stores/useInspectionStore'

const store = useInspectionStore()

onMounted(() => {
  store.fetchInspections()
})

const inspector = ref('')
const relay = ref('')
const remark = ref('')

const inspectors = computed(() => Array.from(new Set(store.list.map(i => i.inspector))))
const relayInspectors = computed(() => Array.from(new Set(store.list.map(i => i.relayInspector).filter(Boolean))) as string[])

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
</script>

<style scoped>
h2 {
  margin-bottom: 16px;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.filter-item {
  min-width: 160px;
  flex: 1;
}
</style>
