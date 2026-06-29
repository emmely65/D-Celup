import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import { useAuthStore } from './stores/authStore'

const pinia = createPinia()

createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')

// BUG-10: Aktifkan listener 401 agar Pinia state ikut bersih saat token expired
useAuthStore().setupUnauthorizedListener()
