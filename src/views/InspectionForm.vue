<template>
  <div v-if="inspection">
    <h2>编辑巡检</h2>
    <el-form :model="inspection" label-width="80px">
      <el-form-item label="标题">
        <el-input v-model="inspection.title" />
      </el-form-item>
      <el-form-item label="巡检人">
        <el-input v-model="inspection.inspector" />
      </el-form-item>
      <el-form-item label="日期">
        <el-date-picker v-model="inspection.date" type="date" />
      </el-form-item>
    </el-form>
    <el-table :data="inspection.items" stripe style="width: 100%" class="mt-2">
      <el-table-column prop="content" label="项目" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-select v-model="scope.row.status" @change="recalc">
            <el-option label="正常" value="正常" />
            <el-option label="异常" value="异常" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
    <div class="mt-2">异常数：{{ inspection.abnormal }}</div>
    <el-button type="primary" class="mt-2" @click="save">保存</el-button>
    <el-button class="mt-2" @click="router.back()">返回</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useInspectionStore, Inspection } from '@/stores/useInspectionStore'

const store = useInspectionStore()
const route = useRoute()
const router = useRouter()
const inspection = ref<Inspection | null>(null)

onMounted(() => {
  store.load()
  const id = Number(route.params.id)
  const record = store.getById(id)
  if (record) {
    inspection.value = JSON.parse(JSON.stringify(record))
  } else {
    router.push('/inspections')
  }
})

function recalc() {
  if (inspection.value) {
    inspection.value.abnormal = inspection.value.items.filter(i => i.status === '异常').length
  }
}

function save() {
  if (inspection.value) {
    recalc()
    store.update(inspection.value.id, inspection.value)
    ElMessage.success('已更新')
    router.push('/inspections')
  }
}
</script>

<style scoped>
h2 {
  margin-bottom: 12px;
}
.mt-2 {
  margin-top: 12px;
}
</style>
