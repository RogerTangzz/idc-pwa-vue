<template>
  <!--
    App.vue is the root component of the Vue application.  It
    orchestrates the high-level layout and determines whether to show
    the authentication pages or the main application shell.  The shell
    consists of a header, a side navigation menu and a main content
    area.  When visiting the login or register routes the shell is
    hidden and the corresponding view is rendered full-screen.
  -->
  <div>
    <!-- Authentication pages bypass the app layout -->
    <router-view v-if="isAuthPage" />
    <!-- Main layout for authenticated routes -->
    <el-container v-else class="main-container">
      <el-header class="app-header">
        <div class="title">IDC PWA Vue 版本</div>
        <div class="user-info">
          <span>当前用户：{{ auth.user?.username }}</span>
          <el-button size="small" type="danger" @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px" class="aside">
          <NavigationMenu />
        </el-aside>
        <el-main class="content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import NavigationMenu from '@/components/NavigationMenu.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// Ensure persisted authentication state is restored.  Without calling
// load() here the store may not recognise that a user is already
// logged in when the app is first created.
auth.load()

// Determine if the current route is an authentication page.  If so we
// bypass the shell and simply render the nested route.  This ensures
// the login/register pages occupy the full viewport and are not
// cluttered by navigation or header components.
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.main-container {
  height: 100vh;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #324057;
  color: #fff;
  padding: 0 20px;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.aside {
  background: #324057;
  color: #fff;
}
.content {
  padding: 16px;
  overflow-y: auto;
  background: #f5f7fa;
}
</style>