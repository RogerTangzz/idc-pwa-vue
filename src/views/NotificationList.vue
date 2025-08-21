<template>
  <div>
    <h2>通知中心</h2>

    <!-- 统计组件（复用组件分支） -->
    <NotificationStats class="mb-2" />

    <!-- 顶部工具条：示例数据 / 全部已读 -->
    <div class="toolbar mb-4">
      <el-button type="primary" @click="addSample">＋ 添加示例</el-button>
      <el-button
        @click="markAllRead"
        :disabled="!store.list.some(n => !n.read)"
      >
        标记全部已读
      </el-button>
    </div>

    <!-- 加载 / 错误（抽象服务分支） -->
    <div v-if="store.loading">加载中...</div>
    <div v-else>
      <div v-if="store.error" class="error">{{ store.error }}</div>

      <!-- 测试面板：兼容测试分支的数据钩子 -->
      <div class="test-panel mb-4">
        <input v-model="message" data-test="message" placeholder="输入通知" />
        <button @click="create" data-test="create">创建</button>
        <p v-if="localError" class="error" data-test="error">{{ localError }}</p>
      </div>

      <!-- 管理表单（Element Plus） -->
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

      <!-- 列表（合并两分支字段） -->
      <el-table :data="store.list" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="标题" min-width="180">
          <template #default="scope">
            {{ scope.row.title || scope.row.message || `通知 #${scope.row.id}` }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="200" />
        <el-table-column prop="publisher" label="发布人" width="140" />
        <el-table-column label="类型" width="100">
          <template #default="scope">{{ scope.row.type || '-' }}</template>
        </el-table-column>
        <el-table-column label="时间" width="200">
          <template #default="scope">
            {{ scope.row.createdAt || scope.row.date }}
          </template>
        </el-table-column>
        <el-table-column label="确认数" width="100">
          <template #default="scope">
            {{ scope.row.confirmedCount ?? (scope.row.confirmed ? 1 : 0) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.read">已读</el-tag>
            <el-tag type="info" v-else>未读</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              @click="markRead(scope.row.id)"
              :disabled="scope.row.read"
            >
              标记已读
            </el-button>
            <el-button
              size="small"
              @click="confirm(scope.row.id)"
              data-test="confirm"
            >
              已确认
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="remove(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 测试分支需要的统计文本 -->
      <p class="mt-2" data-test="stats">
        未确认: {{ store.unconfirmedCount }} / 总数: {{ store.total }}
      </p>

      <!-- 兼容测试分支：简单 UL 列表（直观验证） -->
      <ul class="mt-2">
        <li v-for="n in store.list" :key="n.id">
          <span :class="{ confirmed: n.confirmed === true }">
            {{ n.title || n.message }}
          </span>
          <button
            v-if="n.confirmed !== true"
            @click="confirm(n.id)"
            data-test="confirm"
          >
            确认
          </button>
          <span v-else>已确认</span>
        </li>
      </ul>

      <!-- 兼容原分支的简易提交表单 -->
      <form @submit.prevent="submit" class="mt-2">
        <input v-model="message" placeholder="新通知" />
        <button type="submit">发送</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useAuthStore } from '@/stores/useAuthStore'
import NotificationStats from '@/components/NotificationStats.vue'

const store = useNotificationStore()
const auth = useAuthStore()

onMounted(() => {
  store.load?.()
})

/** 测试分支输入/错误 */
const message = ref('')
const localError = ref('')

/** 管理分支输入 */
const title = ref('')
const content = ref('')

/** 示例数据（复用组件分支） */
function addSample() {
  store.add({ title: '示例通知', message: '这是一条通知', type: '系统' })
}

/** 标记已读/全部已读/删除（复用组件分支） */
function markRead(id: number) {
  store.markRead(id)
}
function markAllRead() {
  store.markAllRead()
}
function remove(id: number) {
  store.remove(id)
}

/** 创建：优先使用测试输入 message，否则走管理表单 */
async function create() {
  localError.value = ''
  try {
    if (message.value.trim()) {
      await store.add(message.value.trim())
      message.value = ''
    } else if (title.value.trim() && content.value.trim()) {
      const publisher = auth.user?.username ?? '匿名'
      await store.add({
        title: title.value.trim(),
        content: content.value.trim(),
        publisher
      })
      title.value = ''
      content.value = ''
    }
  } catch {
    localError.value = '创建失败'
  }
}

/** Element Plus 表单提交映射到 create() */
function add() {
  return create()
}

/** 简易表单提交（只处理 message） */
async function submit() {
  if (!message.value.trim()) return
  try {
    await store.add(message.value.trim())
    message.value = ''
  } catch {
    localError.value = '创建失败'
  }
}

/** 统一确认（兼容测试与管理） */
async function confirm(id: number) {
  localError.value = ''
  try {
    await store.confirm(id)
  } catch {
    localError.value = '确认失败'
  }
}
</script>

<style scoped>
h2 { margin-bottom: 12px; }
.toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.mt-2 { margin-top: 12px; }
.error { color: red; margin-bottom: 8px; }
.test-panel { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.confirmed { text-decoration: line-through; }
</style>
