<template>
  <el-dialog
    :model-value="visible"
    @update:modelValue="emit('update:visible', $event)"
    title="借用记录"
  >
    <el-table :data="logs" style="width: 100%">
      <el-table-column prop="borrowerId" label="借用人" />
      <el-table-column prop="borrowTime" label="借出时间" />
      <el-table-column prop="returnTime" label="归还时间" />
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
interface Log {
  borrowerId: string
  borrowTime: string
  returnTime?: string
}

const props = defineProps<{ logs: Log[]; visible: boolean }>()
const emit = defineEmits<{ (e: 'update:visible', value: boolean): void }>()

const { logs, visible } = toRefs(props)
</script>
