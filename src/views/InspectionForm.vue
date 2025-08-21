<template>
  <div>
    <h2>{{ isEdit ? '编辑巡检' : '新建巡检' }}</h2>
    <el-form :model="form" label-width="100px">
      <el-form-item label="异常数目">
        <el-input v-model.number="form.abnormalCount" type="number" />
      </el-form-item>
      <el-form-item label="巡检日期">
        <el-date-picker v-model="form.date" type="date" />
      </el-form-item>
      <el-form-item label="巡检人员">
        <el-input v-model="form.inspector" />
      </el-form-item>
      <el-form-item label="巡检接力人员">
        <el-input v-model="form.relayInspector" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input type="textarea" v-model="form.remark" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInspectionStore } from '@/stores/useInspectionStore'

const store = useInspectionStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  store.load()
})

const id = route.params.id ? Number(route.params.id) : null
const isEdit = computed(() => id !== null)

const form = reactive({
  abnormalCount: 0,
  date: new Date(),
  inspector: '',
  relayInspector: '',
  remark: ''
})

if (isEdit.value) {
  const existing = store.list.find(i => i.id === id)
  if (existing) {
    form.abnormalCount = existing.abnormalCount
    form.date = new Date(existing.date)
    form.inspector = existing.inspector
    form.relayInspector = existing.relayInspector
    form.remark = existing.remark || ''
  }
}

function save() {
  const payload = {
    abnormalCount: form.abnormalCount,
    date: form.date.toISOString().slice(0, 10),
    inspector: form.inspector,
    relayInspector: form.relayInspector,
    remark: form.remark
  }
  if (isEdit.value && id !== null) {
    store.update(id, payload)
  } else {
    store.add(payload)
  }
  router.push('/inspections')
}

function cancel() {
  router.push('/inspections')
}
</script>

<style scoped>
</style>

