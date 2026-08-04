<script setup>
const quickLinks = [
  { to: '/WeatherMockup', label: '🌤️ Weather 과제', desc: '실전 미니 프로젝트' },
  { to: '/reactivity', label: '⚡ Reactivity', desc: 'Day 1 실습' },
  { to: '/Composition', label: '🔄 Composition', desc: 'Day 2 실습' },
  { to: '/about', label: 'ℹ️ About', desc: '프로젝트 소개' },
]
</script>

<template>
  <div class="home">
    <span class="badge">🐦‍⬛ Skala Vue</span>
    <h1>날씨 알려주는 까치</h1>
    <p class="lead">
      Composition API부터 라우터, 실전 날씨 대시보드까지 — Skala 과정에서 다룬 Vue 3 실습을 한
      곳에 모았습니다.
    </p>

    <div class="quick-grid">
      <RouterLink v-for="link in quickLinks" :key="link.to" :to="link.to" class="quick-card">
        <span class="quick-label">{{ link.label }}</span>
        <span class="quick-desc">{{ link.desc }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 60vh;
  gap: 0.75rem;
  padding-top: 2rem;
}

.badge {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  background: var(--magpie-accent-soft);
  color: var(--magpie-accent);
}

.home h1 {
  background: var(--magpie-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 2.1rem;
}

.lead {
  color: var(--color-text);
  opacity: 0.8;
  max-width: 520px;
  line-height: 1.7;
  margin-bottom: 1rem;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 200px));
  gap: 0.9rem;
  width: 100%;
  max-width: 460px;
}

.quick-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  text-align: left;
  text-decoration: none;
  padding: 1rem 1.1rem;
  border-radius: 12px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  transition:
    border-color 0.2s,
    transform 0.15s;
}

.quick-card:hover {
  border-color: var(--magpie-accent);
  transform: translateY(-2px);
}

.quick-label {
  font-weight: 700;
  color: var(--color-heading);
}

.quick-desc {
  font-size: 0.8rem;
  color: var(--color-text);
  opacity: 0.7;
}

@media (max-width: 480px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }
}
</style>
