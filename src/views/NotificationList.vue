<template>
  <div>
    <h2>通知中心</h2>
    <form @submit.prevent="add" class="mb-4">
      <el-form-item label="标题">
        <el-input v-model="title" />
      </el-form-item>
      <el-form-item label="内容">
        <el-input type="textarea" v-model="content" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">发布</el-button>
      </el-form-item>
    </form>
    <el-table :data="store.list" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="content" label="内容" />
      <el-table-column prop="publisher" label="发布人" />
      <el-table-column prop="createdAt" label="发布时间" />
      <el-table-column prop="confirmed" label="确认数" width="80" />
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button size="small" @click="confirm(scope.row.id)">已确认</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useAuthStore } from '@/stores/useAuthStore'

const store = useNotificationStore()
onMounted(() => {
  store.load()
})

const auth = useAuthStore()
const title = ref('')
const content = ref('')

function add() {
  if (!title.value || !content.value) return
  const publisher = auth.user?.username ?? '匿名'
  store.add({ title: title.value, content: content.value, publisher })
  title.value = ''
  content.value = ''
}

function confirm(id: number) {
  store.confirm(id)
}
</script>

<style scoped>
h2 {
  margin-bottom: 12px;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>
