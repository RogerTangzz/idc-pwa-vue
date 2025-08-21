<template>
  <!--
    NavigationMenu renders the main navigation for the application. It
    mirrors the button bar found in the original IDC PWA and exposes
    links to each functional area of the system.

    The Element Plus `el-menu` component highlights the active route
    when the `router` attribute is present and the `index` matches the
    route path. In this implementation we additionally bind
    `:default-active="route.path"` so both the bound value and
    router-driven behaviour control which menu item appears active.
    Removing `:default-active` would cause the menu to rely entirely on
    the router to determine the highlighted item. Adjust or extend the
    menu items here to add new sections.
  -->
  <el-menu
    :default-active="route.path"
    class="el-menu-vertical"
    router
    background-color="#324057"
    text-color="#fff"
    active-text-color="#ffd04b"
  >
    <el-menu-item index="/">
      <el-icon><House /></el-icon>
      <span>首页</span>
    </el-menu-item>
    <el-menu-item index="/maintenance-plans">
      <el-icon><Tickets /></el-icon>
      <span>维保计划</span>
    </el-menu-item>
    <el-menu-item index="/orders">
      <el-icon><Suitcase /></el-icon>
      <span>工单</span>
    </el-menu-item>
    <el-menu-item index="/servers">
      <el-icon><Monitor /></el-icon>
      <span>服务器</span>
    </el-menu-item>
    <el-menu-item index="/inspections">
      <el-icon><Search /></el-icon>
      <span>巡检</span>
    </el-menu-item>
    <el-menu-item index="/assets">
      <el-icon><Box /></el-icon>
      <span>资产</span>
    </el-menu-item>
    <el-menu-item index="/notifications">
      <el-icon><Bell /></el-icon>
      <span>通知</span>
    </el-menu-item>
    <el-menu-item index="/knowledge">
      <el-icon><Reading /></el-icon>
      <span>知识库</span>
    </el-menu-item>
    <el-menu-item index="/messages">
      <el-icon><Message /></el-icon>
      <span>消息</span>
    </el-menu-item>
    <el-menu-item index="/reports">
      <el-icon><Document /></el-icon>
      <span>报表</span>
    </el-menu-item>
    <el-menu-item index="/users">
      <el-icon><User /></el-icon>
      <span>用户</span>
    </el-menu-item>
    <el-menu-item index="/logs">
      <el-icon><Notebook /></el-icon>
      <span>日志</span>
    </el-menu-item>
    <el-menu-item index="/tags">
      <el-icon><Collection /></el-icon>
      <span>标签</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { House, Tickets, Suitcase, Monitor, Search, Box, Bell, Reading, Message, Document, User, Notebook, Collection } from '@element-plus/icons-vue'

// Access the current route so that `el-menu` can highlight the
// appropriate menu item.  The `route.path` property holds the
// current pathname (e.g. "/maintenance-plans").
const route = useRoute()
</script>

<style scoped>
/* Ensure the navigation occupies full height of the aside and uses a
   dark colour scheme reminiscent of the original IDC PWA. */
.el-menu-vertical {
  height: 100%;
  border-right: none;
}
.el-menu-vertical .el-menu-item {
  font-size: 14px;
}
.el-menu-vertical i {
  margin-right: 8px;
}
</style>
