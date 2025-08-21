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
        <el-form-item>
          <el-button
            type="primary"
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

// Reactive form fields
const username = ref('')
const password = ref('')
const error = ref('')
const usernameInput = ref<InputInstance>()

// Access the auth store and router.  Ensure persisted users are loaded
// before attempting to authenticate.  When the component is created
// Pinia automatically persists state; however calling load() here
// ensures the store initialises from localStorage on first visit.
const auth = useAuthStore()
auth.load()
const router = useRouter()

onMounted(() => {
  usernameInput.value?.focus()
})

// Perform login and navigate to the home page on success.  On
// failure the error message is displayed beneath the form.
function doLogin() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = t('login.errorMissing')
    usernameInput.value?.focus()
    return
  }
  const ok = auth.login(username.value.trim(), password.value)
  if (ok) {
    router.push('/')
  } else {
    error.value = t('login.errorInvalid')
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