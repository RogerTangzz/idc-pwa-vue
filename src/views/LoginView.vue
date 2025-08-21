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
      <h2 class="title">{{ t('login.title') }}</h2>

      <el-form @submit.prevent="doLogin">
        <el-form-item :label="t('login.username')" label-width="70px">
          <el-input
            ref="usernameInput"
            v-model="username"
            autocomplete="username"
            :aria-label="t('login.username')"
          />
        </el-form-item>

        <el-form-item :label="t('login.password')" label-width="70px">
          <el-input
            v-model="password"
            type="password"
            autocomplete="current-password"
            :aria-label="t('login.password')"
          />
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
            @click="doLogin"
            :aria-label="t('login.login')"
          >
            {{ t('login.login') }}
          </el-button>

          <router-link
            to="/register"
            class="link"
            :aria-label="t('login.registerLink')"
          >
            {{ t('login.registerLink') }}
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

// Reactive form fields
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const usernameInput = ref<InputInstance>()

// Access the auth store and router
const auth = useAuthStore()
auth.load()
const router = useRouter()

onMounted(() => {
  usernameInput.value?.focus()
})

// Perform login and navigate to the home page on success.
// Disable the submit button while processing to prevent duplicates.
async function doLogin() {
  if (loading.value) return

  error.value = ''
  const missingMsg = t('login.errorMissing')
  if (!username.value || !password.value) {
    error.value = missingMsg
    ElMessage.error(missingMsg)
    usernameInput.value?.focus()
    return
  }

  loading.value = true
  try {
    const ok = auth.login(username.value.trim(), password.value)
    if (ok) {
      ElMessage.success(t('login.success') || '登录成功')
      router.push('/')
    } else {
      const invalidMsg = t('login.errorInvalid') || '用户名或密码不正确'
      error.value = invalidMsg
      ElMessage.error(invalidMsg)
      usernameInput.value?.focus()
    }
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
