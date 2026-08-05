<!--   http://localhost:5173/skala-vue/-->

<script setup>
// 앱의 루트 컴포넌트. 상단 네비게이션(카테고리/탭 바)과 로그인 상태 UI를 그리고,
// 실제 페이지 내용은 <RouterView />를 통해 현재 라우트에 맞는 뷰 컴포넌트로 위임한다.
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.js'

// useRoute()는 현재 라우트 정보(읽기 전용), useRouter()는 이동(push 등)을 위한 라우터 인스턴스.
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 상단 네비게이션에 표시할 카테고리/탭 구조를 정의한다.
// 라우트의 meta.category, meta.tab 값과 매칭시켜 현재 활성화된 메뉴를 하이라이트하는 데 사용한다.
const categories = [
  {
    key: 'weather',
    label: '🌤️ 날씨',
    to: '/weather-store',
    tabs: [
      { key: 'store', label: 'Store', to: '/weather-store' },
      { key: 'mockup', label: 'Mockup', to: '/WeatherMockup' },
      { key: 'composition', label: 'Composition', to: '/WeatherComposition' },
      { key: 'parent', label: '컴포넌트', to: '/WeatherParent' },
      { key: 'router-demo', label: 'Router 데모', to: '/weather-router' },
    ],
  },
  {
    key: 'magpie',
    label: '🐦‍⬛ 흥부와 까치',
    to: '/MagpieHeung',
    tabs: [],
  },
  {
    key: 'movie',
    label: '🎬 까치 극장',
    to: '/RankSystem',
    tabs: [],
  },
  {
    key: 'library',
    label: '📚 까치의 서재',
    to: '/library',
    tabs: [
      { key: 'wishlist', label: '위시리스트', to: '/library' },
      { key: 'classics', label: '책BTI', to: '/library/classics' },
    ],
  },
]

// 현재 라우트의 meta.category를 읽어온다. 라우트가 바뀌면 route가 반응형으로 갱신되므로
// computed로 선언해두면 페이지 이동 시 자동으로 다시 계산된다.
const activeCategoryKey = computed(() => route.meta.category ?? null)

// 위에서 구한 key로 categories 배열에서 해당 카테고리 객체(탭 목록 포함)를 찾는다.
const activeCategory = computed(
  () => categories.find((category) => category.key === activeCategoryKey.value) ?? null,
)

const activeTabKey = computed(() => route.meta.tab ?? null)

// 로그아웃 후 보호된 페이지에 남아있지 않도록 홈으로 이동시킨다.
async function handleLogout() {
  authStore.logout()
  await router.push('/')
}
</script>

<template>
  <div class="layout">
    <header class="topbar">
      <div class="topbar-row">
        <RouterLink to="/" class="brand">
          <svg class="logo" viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
            <defs>
              <linearGradient id="magpieTail" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="var(--magpie-teal)" />
                <stop offset="55%" stop-color="var(--magpie-blue)" />
                <stop offset="100%" stop-color="var(--magpie-violet)" />
              </linearGradient>
            </defs>
            <path d="M40 32 L61 47 L52 50 L58 58 L47 54 L44 44 Z" fill="url(#magpieTail)" />
            <ellipse
              cx="32"
              cy="35"
              rx="16"
              ry="13"
              fill="#2c313a"
              stroke="rgba(255,255,255,0.5)"
              stroke-width="1"
            />
            <ellipse cx="28" cy="40" rx="8" ry="6.5" fill="var(--magpie-white)" />
            <circle
              cx="17"
              cy="24"
              r="9"
              fill="#2c313a"
              stroke="rgba(255,255,255,0.5)"
              stroke-width="1"
            />
            <polygon
              points="8,24 2,22 8,20"
              fill="#2c313a"
              stroke="rgba(255,255,255,0.5)"
              stroke-width="1"
              stroke-linejoin="round"
            />
            <circle cx="15" cy="22" r="1.6" fill="var(--magpie-white)" />
            <line
              x1="24"
              y1="46"
              x2="22"
              y2="54"
              stroke="#2c313a"
              stroke-width="2"
              stroke-linecap="round"
            />
            <line
              x1="32"
              y1="47"
              x2="31"
              y2="55"
              stroke="#2c313a"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>Skala Vue</span>
        </RouterLink>

        <nav class="primary-nav">
          <RouterLink
            v-for="category in categories"
            :key="category.key"
            :to="category.to"
            class="nav-pill"
            :class="{ active: activeCategoryKey === category.key }"
          >
            {{ category.label }}
          </RouterLink>
        </nav>

        <div class="auth-area">
          <template v-if="authStore.isLoggedIn">
            <RouterLink to="/dashboard" class="user-name">
              {{ authStore.user?.name }}
            </RouterLink>
            <button class="auth-button" @click="handleLogout">로그아웃</button>
          </template>
          <RouterLink v-else to="/login" class="auth-button auth-button--primary">
            로그인
          </RouterLink>
        </div>
      </div>

      <div v-if="activeCategory && activeCategory.tabs.length" class="secondary-row">
        <RouterLink
          v-for="tab in activeCategory.tabs"
          :key="tab.key"
          :to="tab.to"
          class="tab-pill"
          :class="{ active: activeTabKey === tab.key }"
        >
          {{ tab.label }}
        </RouterLink>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--magpie-black);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.topbar::before {
  content: '';
  display: block;
  height: 3px;
  background: var(--magpie-gradient);
}

.topbar-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.85rem 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--magpie-white);
  font-weight: 700;
  font-size: 1.05rem;
  flex-shrink: 0;
}

.logo {
  display: block;
}

.primary-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  flex: 1;
}

.nav-pill {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 600;
  color: rgba(250, 250, 250, 0.75);
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.nav-pill:hover {
  background: var(--magpie-accent-soft);
  color: var(--magpie-white);
}

.nav-pill.active {
  background: var(--magpie-gradient);
  color: #fff;
}

.auth-area {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--magpie-white);
  text-decoration: none;
  opacity: 0.9;
}

.user-name:hover {
  opacity: 1;
}

.auth-button {
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: transparent;
  color: var(--magpie-white);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.auth-button:hover {
  border-color: var(--magpie-accent);
  color: var(--magpie-accent);
}

.auth-button--primary {
  background: var(--magpie-gradient);
  border-color: transparent;
  color: #fff;
}

.auth-button--primary:hover {
  color: #fff;
  filter: brightness(1.08);
}

.secondary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0 1.5rem 0.75rem 4.25rem;
}

.tab-pill {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(250, 250, 250, 0.6);
  text-decoration: none;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid transparent;
  white-space: nowrap;
}

.tab-pill:hover {
  color: var(--magpie-white);
  border-color: rgba(255, 255, 255, 0.12);
}

.tab-pill.active {
  color: var(--magpie-accent);
  border-color: var(--magpie-accent-strong);
  background: var(--magpie-accent-soft);
}

.content {
  padding: 2.5rem 3rem;
  min-width: 0;
}

@media (max-width: 860px) {
  .topbar-row {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .primary-nav {
    order: 3;
    width: 100%;
  }

  .secondary-row {
    padding-left: 1.5rem;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 1.5rem;
  }
}
</style>
