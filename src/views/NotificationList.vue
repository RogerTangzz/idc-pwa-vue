<template>
  <div>
    <h2>通知中心</h2>
    <div v-if="store.loading">加载中...</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>
    <ul v-else>
      <li v-for="n in store.list" :key="n.id">
        <span :class="{ confirmed: n.confirmed }">{{ n.message }}</span>
        <button v-if="!n.confirmed" @click="store.confirm(n.id)">确认</button>
      </li>
    </ul>
    <form @submit.prevent="submit">
      <input v-model="message" placeholder="新通知" />
      <button type="submit">发送</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/useNotificationStore'

const store = useNotificationStore()
const message = ref('')

onMounted(() => {
  store.load()
})

async function submit() {
  if (message.value.trim()) {
    await store.add(message.value.trim())
    message.value = ''
  }
}
</script>

<style scoped>
.error {
  color: red;
  margin-bottom: 8px;
}
.confirmed {
  text-decoration: line-through;
}
form {
  margin-top: 12px;
}
</style>
