import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Import Element Plus and its default styles.  Element Plus provides a rich
// set of UI components that aligns with the aesthetics of the original
// IDC PWA.  See https://element-plus.org for component documentation.
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Global application styles (including overrides for Element Plus) are
// imported from the assets directory.  Additional SCSS can be added here.
import '@/assets/styles/element.scss'

// Create the Vue application instance and register plugins.  Pinia is used
// for state management, while the router handles navigation between pages.
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')