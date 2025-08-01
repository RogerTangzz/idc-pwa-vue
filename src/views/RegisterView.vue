<template>
  <!--
    RegisterView allows creation of a new user account.  Users must
    supply a unique username, a password and confirmation, and select
    a role.  On successful registration the user is automatically
    logged in and redirected to the home page.  Input validation
    prevents submitting with blank fields or mismatched passwords.
  -->
  <div class="auth-page">
    <el-card class="auth-card">
      <h2 class="title">注册新账号</h2>
      <el-form @submit.prevent="doRegister">
        <el-form-item label="用户名" label-width="70px">
          <el-input v-model="username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码" label-width="70px">
          <el-input v-model="password" type="password" autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="确认密码" label-width="70px">
          <el-input v-model="confirm" type="password" autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="角色" label-width="70px">
          <el-select v-model="role" placeholder="请选择角色">
            <el-option label="管理员" value="管理员" />
            <el-option label="巡检员" value="巡检员" />
            <el-option label="运维工程师" value="运维工程师" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doRegister">注册</el-button>
          <router-link to="/login" class="link">返回登录</router-link>
        </el-form-item>
        <div v-if="error" class="error">{{ error }}</div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const username = ref('')
const password = ref('')
const confirm = ref('')
const role = ref('管理员')
const error = ref('')

const auth = useAuthStore()
auth.load()
const router = useRouter()

function doRegister() {
  error.value = ''
  if (!username.value || !password.value || !confirm.value) {
    error.value = '请填写所有字段'
    return
  }
  if (password.value !== confirm.value) {
    error.value = '两次密码输入不一致'
    return
  }
  try {
    auth.register(username.value.trim(), password.value, role.value)
    router.push('/')
  } catch (e) {
    error.value = (e as Error).message || '注册失败'
  }
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
.error {
  color: #f56c6c;
  margin-top: 8px;
}
</style>