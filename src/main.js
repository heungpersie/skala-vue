import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import router from './router'

// 사이트 자체가 prefers-color-scheme(다크모드)에 맞춰 색을 바꾸므로,
// Element Plus 다크 테마(html.dark)도 동일한 기준으로 함께 전환한다.
const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const syncElementPlusTheme = (isDark) => {
  document.documentElement.classList.toggle('dark', isDark)
}
syncElementPlusTheme(darkMediaQuery.matches)
darkMediaQuery.addEventListener('change', (event) => syncElementPlusTheme(event.matches))

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
