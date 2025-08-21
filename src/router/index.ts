import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// Route components are loaded lazily via dynamic import to reduce the
// initial bundle size.  Each view corresponds to a functional area of
// the original IDC PWA.
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/TaskList.vue')
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/OrderList.vue')
  },
  {
    path: '/servers',
    name: 'Servers',
    component: () => import('@/views/ServerList.vue')
  },
  {
    path: '/inspections',
    name: 'Inspections',
    component: () => import('@/views/InspectionList.vue')
  },
  {
    path: '/inspections/new',
    name: 'InspectionNew',
    component: () => import('@/views/InspectionForm.vue')
  },
  {
    path: '/inspections/:id',
    name: 'InspectionEdit',
    component: () => import('@/views/InspectionForm.vue')
  },
  {
    path: '/assets',
    name: 'Assets',
    component: () => import('@/views/AssetList.vue')
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/NotificationList.vue')
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('@/views/KnowledgeList.vue')
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/MessageList.vue')
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/ReportList.vue')
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/UserList.vue')
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/LogList.vue')
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('@/views/TagList.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard that redirects unauthenticated users to the login
// page.  Authentication state is stored in localStorage under
// `idc-current`.  If the user visits `/login` or `/register` directly
// the guard allows the navigation even if not logged in.
router.beforeEach((to, _from, next) => {
  const publicPages = ['/login', '/register']
  const isPublic = publicPages.includes(to.path)
  const current = localStorage.getItem('idc-current')
  if (!current && !isPublic) {
    next('/login')
  } else {
    next()
  }
})

export default router