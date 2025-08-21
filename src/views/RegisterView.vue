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

        <el-alert
          v-if="error"
          :title="error"
          type="error"
          show-icon
          class="mt-2"
        />

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            :disabled="loading"
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
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/useAuthStore'
import { t } from '@/locales'
import type { InputInstance } from 'element-plus'

const username = ref('')
const password = ref('')
const confirm = ref('')
const role = ref(t('register.admin')) // 默认管理员（i18n）
const error = ref('')
const loading = ref(false)
const usernameInput = ref<InputInstance>()

const auth = useAuthStore()
auth.load()
const router = useRouter()

onMounted(() => {
  usernameInput.value?.focus()
})

async function doRegister() {
  if (loading.value) return

  error.value = ''
  if (!username.value || !password.value || !confirm.value) {
    const msg = t('register.errorMissing') || '请填写所有字段'
    error.value = msg
    ElMessage.error(msg)
    usernameInput.value?.focus()
    return
  }
  if (password.value !== confirm.value) {
    const msg = t('register.errorMismatch') || '两次密码输入不一致'
    error.value = msg
    ElMessage.error(msg)
    usernameInput.value?.focus()
    return
  }

  loading.value = true
  try {
    auth.register(username.value.trim(), password.value, role.value)
    ElMessage.success(t('register.success') || '注册成功')
    router.push('/')
  } catch (e) {
    const msg = (e as Error).message || t('register.errorGeneric') || '注册失败'
    error.value = msg
    ElMessage.error(msg)
    usernameInput.value?.focus()
  } finally {
    loading.value = false
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
.mt-2 {
  margin-top: 12px;
}
</style>
