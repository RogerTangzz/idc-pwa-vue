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
      <h2 class="title">{{ t('register.title') }}</h2>
      <el-form @submit.prevent="doRegister">
        <el-form-item :label="t('register.username')" label-width="70px">
          <el-input
            ref="usernameInput"
            v-model="username"
            autocomplete="username"
            :aria-label="t('register.username')"
          />
        </el-form-item>
        <el-form-item :label="t('register.password')" label-width="70px">
          <el-input
            v-model="password"
            type="password"
            autocomplete="new-password"
            :aria-label="t('register.password')"
          />
        </el-form-item>
        <el-form-item :label="t('register.confirmPassword')" label-width="70px">
          <el-input
            v-model="confirm"
            type="password"
            autocomplete="new-password"
            :aria-label="t('register.confirmPassword')"
          />
        </el-form-item>
        <el-form-item :label="t('register.role')" label-width="70px">
          <el-select
            v-model="role"
            :placeholder="t('register.selectRole')"
            :aria-label="t('register.role')"
          >
            <el-option :label="t('register.admin')" :value="t('register.admin')" />
            <el-option :label="t('register.inspector')" :value="t('register.inspector')" />
            <el-option :label="t('register.engineer')" :value="t('register.engineer')" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="doRegister"
            :aria-label="t('register.register')"
          >
            {{ t('register.register') }}
          </el-button>
          <router-link
            to="/login"
            class="link"
            :aria-label="t('register.loginLink')"
          >
            {{ t('register.loginLink') }}
          </router-link>
        </el-form-item>
        <div v-if="error" class="error">{{ error }}</div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { t } from '@/locales'
import type { InputInstance } from 'element-plus'

const username = ref('')
const password = ref('')
const confirm = ref('')
const role = ref(t('register.admin'))
const error = ref('')
const usernameInput = ref<InputInstance>()

const auth = useAuthStore()
auth.load()
const router = useRouter()

onMounted(() => {
  usernameInput.value?.focus()
})

function doRegister() {
  error.value = ''
  if (!username.value || !password.value || !confirm.value) {
    error.value = t('register.errorMissing')
    usernameInput.value?.focus()
    return
  }
  if (password.value !== confirm.value) {
    error.value = t('register.errorMismatch')
    usernameInput.value?.focus()
    return
  }
  try {
    auth.register(username.value.trim(), password.value, role.value)
    router.push('/')
  } catch (e) {
    error.value = (e as Error).message || t('register.errorGeneric')
    usernameInput.value?.focus()
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