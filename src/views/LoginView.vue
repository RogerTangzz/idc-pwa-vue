<template>
  <!--
    LoginView provides a simple login form.  Users supply their
    username and password; if the credentials match a record in the
    authentication store they are redirected to the home page.  If
    authentication fails an error message is displayed.  A link is
    provided to navigate to the registration page for new users.
  -->
  <div class="auth-page">
    <el-card class="auth-card">
      <h2 class="title">用户登录</h2>
      <el-form @submit.prevent="doLogin">
        <el-form-item label="用户名" label-width="70px">
          <el-input v-model="username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码" label-width="70px">
          <el-input v-model="password" type="password" autocomplete="current-password" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            :disabled="loading"
            @click="doLogin"
          >登录</el-button>
          <router-link to="/register" class="link">注册新账号</router-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/useAuthStore'

// Reactive form fields
const username = ref('')
const password = ref('')
const loading = ref(false)

// Access the auth store and router.  Ensure persisted users are loaded
// before attempting to authenticate.  When the component is created
// Pinia automatically persists state; however calling load() here
// ensures the store initialises from localStorage on first visit.
const auth = useAuthStore()
auth.load()
const router = useRouter()

// Perform login and navigate to the home page on success.  Show an
// Element Plus message for success or failure.  Disable the submit
// button while processing to prevent duplicate submissions.
async function doLogin() {
  if (loading.value) return
  if (!username.value || !password.value) {
    ElMessage.error('请输入用户名和密码')
    return
  }
  loading.value = true
  const ok = auth.login(username.value.trim(), password.value)
  if (ok) {
    ElMessage.success('登录成功')
    router.push('/')
  } else {
    ElMessage.error('用户名或密码不正确')
  }
  loading.value = false
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f7fa;
}
.auth-card {
  width: 360px;
  padding: 20px;
}
.title {
  text-align: center;
  margin-bottom: 20px;
}
.link {
  margin-left: 12px;
  font-size: 14px;
}
</style>