// 앱의 진입점(entry point). Vue 앱 인스턴스를 생성하고 Pinia/Router/Element Plus 같은
// 플러그인을 등록한 뒤 #app에 마운트한다. index.html의 <script type="module" src="/src/main.js">에서 로드된다.
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

// app.use()로 전역 플러그인을 등록한다: Pinia(상태 관리), Router(라우팅), Element Plus(UI 컴포넌트).
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 실제 DOM에 마운트되어야 비로소 화면에 렌더링이 시작된다.
app.mount('#app')
