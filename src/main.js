import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())

// 初始化认证状态
import { useAuthStore } from './stores/auth'
// 确保在路由守卫前初始化认证状态
const authStore = useAuthStore()

app.use(router)

app.mount('#app')

