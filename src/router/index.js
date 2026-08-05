import { createRouter, createWebHashHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth.js'
import MockDash from '@/views/work/MockDash.vue'
import LoginView from '@/views/work/LoginView.vue'
import HomeView from '../views/HomeView.vue'

// 앱 전체 라우트 테이블과 네비게이션 가드를 정의하는 Vue Router 설정 파일.
// 과제별 화면(Day1~Day5)들이 모두 이 라우터 하나에 등록되어 App.vue의 <RouterView />로 렌더링된다.
const router = createRouter({
  // GitHub Pages는 서버 라우팅이 없어 새로고침 시 존재하지 않는 경로로 요청이 가면 404가 뜬다.
  // Hash history(#/path)를 쓰면 실제로는 항상 같은 정적 파일(index.html)만 요청되므로 이 문제를 피할 수 있다.
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/work/SignUpView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: MockDash,
      meta: { requiresAuth: true },
    },
    {
      path: '/WeatherMockup',
      name: 'WeatherMockup',
      component: () => import('../views/work/WeatherMockup.vue'),
      meta: { category: 'weather', tab: 'mockup' },
    },
    {
      path: '/Login',
      name: 'Login',
      component: () => import('../views/work/LoginView.vue'),
    },
    {
      path: '/library',
      name: 'MagpieLibrary',
      component: () => import('../views/work/MagpieLibraryView.vue'),
      meta: { category: 'library', tab: 'wishlist' },
    },
    {
      path: '/library/classics',
      name: 'ClassicLiterature',
      component: () => import('../views/work/ClassicLiteratureView.vue'),
      meta: { category: 'library', tab: 'classics' },
    },
    {
      path: '/WeatherComposition',
      name: 'WeatherComposition',
      component: () => import('../views/work/WeatherComposition.vue'),
      meta: { category: 'weather', tab: 'composition' },
    },
    {
      path: '/WeatherParent',
      name: 'WeatherParent',
      component: () => import('../views/work/WeatherParent.vue'),
      meta: { category: 'weather', tab: 'parent' },
    },
    // ── 지연 로딩 + 동적 경로 매칭 + Catch-all Route ──
    {
      path: '/weather-router',
      name: 'WeatherHome',
      component: () => import('../views/WeatherHomeView.vue'),
      meta: { category: 'weather', tab: 'router-demo' },
    },
    {
      path: '/weather-router/about',
      name: 'WeatherAbout',
      component: () => import('../views/WeatherAboutView.vue'),
      meta: { category: 'weather', tab: 'router-demo' },
    },
    {
      path: '/weather/:cityId',
      name: 'WeatherDetail',
      component: () => import('../views/WeatherDetailView.vue'),
      meta: { category: 'weather', tab: 'router-demo' },
    },

    // ── [과제5] 과제4를 기반으로 Pinia configStore(단위 설정)를 적용 ──
    {
      path: '/weather-store',
      name: 'WeatherStoreHome',
      component: () => import('../views/WeatherStoreHomeView.vue'),
      meta: { category: 'weather', tab: 'store' },
    },
    {
      path: '/weather-store/about',
      name: 'WeatherStoreAbout',
      component: () => import('../views/WeatherStoreAboutView.vue'),
      meta: { category: 'weather', tab: 'store' },
    },
    {
      path: '/weather-store/:cityId',
      name: 'WeatherStoreDetail',
      component: () => import('../views/WeatherStoreDetailView.vue'),
      meta: { category: 'weather', tab: 'store' },
    },
    {
      path: '/MagpieHeung',
      name: 'MagpieHeung',
      component: () => import('../views/work/MagpieHeungView.vue'),
      meta: { category: 'magpie' },
    },
    {
      path: '/RankSystem',
      name: 'RankSystem',
      component: () => import('../views/work/RankSystem.vue'),
      meta: { category: 'movie' },
    },

    // Catch-all Route: 위 규칙에 매칭되지 않는 모든 경로 (반드시 배열의 마지막에 위치)
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

// 전역 네비게이션 가드(Navigation Guard): 라우트 이동이 실제로 일어나기 전에 실행된다.
// 반환값이 없으면(undefined) 원래 목적지로 그대로 이동하고, 객체를 반환하면 해당 위치로 리다이렉트한다.
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // meta.requiresAuth가 붙은 라우트(예: /dashboard)는 로그인하지 않으면 접근할 수 없다.
  // 로그인 후 원래 가려던 곳으로 돌아올 수 있도록 redirect 쿼리에 목적지를 함께 담아 보낸다.
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지에 다시 들어오는 것은 의미가 없으므로 대시보드로 보낸다.
  if ((to.name === 'login' || to.name === 'signup') && authStore.isLoggedIn) {
    return { name: 'dashboard' }
  }
})

export default router
