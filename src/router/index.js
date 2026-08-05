import { createRouter, createWebHashHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth.js'
import MockDash from '@/views/work/MockDash.vue'
import LoginView from '@/views/work/LoginView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
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

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if ((to.name === 'login' || to.name === 'signup') && authStore.isLoggedIn) {
    return { name: 'dashboard' }
  }
})

export default router
