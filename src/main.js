import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createHead } from '@vueuse/head'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

const app = createApp(App)
const head = createHead()

app.use(head)
app.use(router)

app.mount('#app')
