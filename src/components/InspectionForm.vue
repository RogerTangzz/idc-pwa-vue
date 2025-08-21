<template>
  <form @submit.prevent="submit">
    <input v-model="form.inspector" placeholder="巡检人" />
    <div v-for="(item, idx) in form.items" :key="idx">
      <input v-model="item.name" placeholder="项目" />
      <select v-model="item.status">
        <option value="正常">正常</option>
        <option value="异常">异常</option>
      </select>
    </div>
    <div v-if="errors.inspector" class="error">{{ errors.inspector }}</div>
    <button type="submit">提交</button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface InspectionItem {
  name: string
  status: '正常' | '异常'
}

const form = ref({
  inspector: '',
  items: [] as InspectionItem[]
})

const errors = ref<{ inspector?: string }>({})

function validate() {
  errors.value = {}
  if (!form.value.inspector) {
    errors.value.inspector = '巡检人必填'
    return false
  }
  return true
}

function submit() {
  return validate()
}

const abnormalCount = computed(() =>
  form.value.items.filter(i => i.status === '异常').length
)

defineExpose({ form, errors, submit, abnormalCount })
</script>

<style scoped>
.error {
  color: red;
}
</style>
