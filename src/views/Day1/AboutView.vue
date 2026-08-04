<template>
  <div class="about">
    <span class="badge">🐦‍⬛ Skala Vue</span>
    <h1>About Skala-Vue</h1>
    <p>Vue 3 + Vite로 만든 프로젝트입니다.</p>
  </div>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 60vh;
  gap: 0.75rem;
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

.about h1 {
  background: var(--magpie-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 2rem;
}

.about p {
  color: var(--color-text);
  opacity: 0.8;
}
</style>