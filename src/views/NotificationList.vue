<template>
  <div>
    <h2>通知中心</h2>
    <input v-model="message" data-test="message" placeholder="输入通知" />
    <button @click="create" data-test="create">创建</button>
    <p v-if="error" class="error" data-test="error">{{ error }}</p>
    <ul>
      <li v-for="n in store.list" :key="n.id">
        <span>{{ n.message }}</span>
        <button v-if="!n.confirmed" @click="confirm(n.id)" data-test="confirm">确认</button>
        <span v-else>已确认</span>
      </li>
    </ul>
    <p data-test="stats">未确认: {{ store.unconfirmedCount }} / 总数: {{ store.total }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNotificationStore } from '../stores/useNotificationStore'

const store = useNotificationStore()
const message = ref('')
const error = ref('')

async function create() {
  if (!message.value.trim()) return
  error.value = ''
  try {
    await store.add(message.value)
    message.value = ''
  } catch {
    error.value = '创建失败'
  }
}

async function confirm(id: number) {
  error.value = ''
  try {
    await store.confirm(id)
  } catch {
    error.value = '确认失败'
  }
}
</script>

<style scoped>
h2 { margin-bottom: 12px; }
.error { color: red; }
</style>
