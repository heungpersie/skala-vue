<script setup>
import { computed } from 'vue'

import { useAuthStore } from '@/stores/auth.js'
import magpieHero from '@/assets/magpie-hero.png'

const authStore = useAuthStore()

const greeting = computed(() =>
  authStore.isLoggedIn ? `${authStore.user?.name ?? '회원'}님, 오늘도 화이팅이에요!` : null,
)
</script>

<template>
  <div class="home">
    <section class="hero">
      <img :src="magpieHero" alt="소나무 가지에 앉은 까치" class="hero-image" />
      <div class="hero-overlay">
        <el-tag class="badge" effect="plain" round>🐦‍⬛ Skala Vue</el-tag>
        <h1>까치 둥지</h1>
        <p class="lead">
          까치를 따라 오늘의 날씨, 영화 기록, 흥부와 까치 등 다양한 기능을 확인해보세요.
        </p>

        <div class="hero-actions">
          <template v-if="authStore.isLoggedIn">
            <span class="greeting">👋 {{ greeting }}</span>
            <RouterLink to="/dashboard">
              <el-button type="primary" round>마이 페이지로 이동</el-button>
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/login">
              <el-button type="primary" round>로그인</el-button>
            </RouterLink>
            <RouterLink to="/signup">
              <el-button round>회원가입</el-button>
            </RouterLink>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
}

/* ── Hero ── */
.hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  margin: -2.5rem -3rem;
  min-height: 100vh;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
}

.hero-overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.85rem;
  padding: 3rem 1.5rem 2.5rem;
  background: linear-gradient(to top, rgba(10, 10, 14, 0.88) 10%, rgba(10, 10, 14, 0.35) 60%, transparent 100%);
}

.badge {
  --el-tag-bg-color: var(--magpie-accent-soft);
  background: rgba(0, 0, 0, 0.45);
  --el-tag-text-color: var(--magpie-accent);
  --el-tag-border-color: transparent;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: none;
}

.hero-overlay h1 {
  background: var(--magpie-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1.2;
}

.hero-overlay h1::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  border-radius: 12px;
  z-index: -1;
}

.lead {
  color: #f2f2f4;
  opacity: 0.9;
  max-width: 560px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.greeting {
  font-weight: 600;
  color: #f2f2f4;
}

@media (max-width: 480px) {
  .hero {
    margin: -1.5rem;
  }

  .hero-overlay h1 {
    font-size: 2.1rem;
  }
}
</style>
