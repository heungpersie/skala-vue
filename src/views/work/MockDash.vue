<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const router = useRouter()

const { user } = storeToRefs(authStore)

const quickLinks = [
  {
    to: '/weather-store',
    icon: '🌤️',
    title: '날씨 알려주는 까치',
    description: '관심 도시의 실시간 날씨를 확인하세요',
  },
  {
    to: '/MagpieHeung',
    icon: '🐦‍⬛',
    title: '흥부와 까치',
    description: '까치를 치료하고 오늘의 소식을 받아보세요',
  },
  {
    to: '/RankSystem',
    icon: '🎬',
    title: '영화 기록',
    description: '본 영화를 검색하고 평점과 함께 저장하세요',
  },
  {
    to: '/library',
    icon: '📚',
    title: '까치의 서재',
    description: '관심 있는 책을 검색하고 저장하세요 그리고 추천 받으세요',
  }

]

async function logout() {
  authStore.logout()
  await router.replace('/login')
}

// 새로고침 후에도 로그인 상태가 실제로 유효한지 서버에서 다시 확인합니다.
onMounted(async () => {
  try {
    await authStore.fetchMyProfile()
  } catch {
    await router.replace('/login')
  }
})
</script>

<template>
  <section class="dashboard-page">
    <div class="dashboard-hero">
      <div>
        <p class="greeting">안녕하세요</p>
        <h1>{{ user?.name }}님, 반갑습니다.</h1>
        <p class="subtitle">오늘도 즐겨찾는 기능을 이어서 확인해보세요.</p>
      </div>
      <el-button @click="logout">로그아웃</el-button>
    </div>

    <div class="dashboard-grid">
      <el-card class="profile-card" shadow="hover">
        <div class="profile-card__avatar">{{ user?.name?.slice(0, 1) }}</div>
        <h2>{{ user?.name }}</h2>
        <p class="profile-card__email">{{ user?.email }}</p>

        <div class="profile-card__meta">
          <div>
            <span>권한</span>
            <el-tag type="success" size="small">{{ user?.role }}</el-tag>
          </div>
          <div>
            <span>소속</span>
            <strong>{{ user?.department }}</strong>
          </div>
        </div>
      </el-card>

      <div class="quick-links">
        <RouterLink
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          class="quick-link"
        >
          <span class="quick-link__icon">{{ link.icon }}</span>
          <div>
            <strong>{{ link.title }}</strong>
            <small>{{ link.description }}</small>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard-page {
  max-width: 1100px;
  margin: 0 auto;
}

.dashboard-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.greeting {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--magpie-accent);
  margin-bottom: 0.3rem;
}

.dashboard-hero h1 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: var(--color-heading);
  margin-bottom: 0.4rem;
}

.subtitle {
  color: var(--color-text);
  opacity: 0.85;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.profile-card {
  position: relative;
  overflow: hidden;
  text-align: center;
}

.profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--magpie-gradient);
  z-index: 1;
}

.profile-card__avatar {
  width: 64px;
  height: 64px;
  margin: 0.5rem auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--magpie-gradient);
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
}

.profile-card h2 {
  font-size: 1.15rem;
  color: var(--color-heading);
  margin-bottom: 0.2rem;
}

.profile-card__email {
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.7;
  margin-bottom: 1.3rem;
}

.profile-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  text-align: left;
  padding-top: 1.1rem;
  border-top: 1px solid var(--color-border);
}

.profile-card__meta > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
}

.profile-card__meta span {
  color: var(--color-text);
  opacity: 0.65;
}

.profile-card__meta strong {
  color: var(--color-heading);
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.1rem;
}

.quick-link {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1.25rem;
  border-radius: 14px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  text-decoration: none;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.quick-link:hover {
  transform: translateY(-3px);
  border-color: var(--magpie-accent-strong);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.quick-link__icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--magpie-accent-soft);
  font-size: 1.3rem;
}

.quick-link strong {
  display: block;
  color: var(--color-heading);
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.quick-link small {
  color: var(--color-text);
  opacity: 0.7;
  font-size: 0.8rem;
  line-height: 1.5;
}

@media (max-width: 720px) {
  .dashboard-hero {
    flex-direction: column;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
