<script setup>
/* 재흥 — 과제5(Store 실습) 날씨 대시보드. 화면 모음 사이트에 그대로 옮겨 쓸 수 있도록
   vue-router 없이 내부 상태(view)로만 화면을 전환한다.

   실행 전 체크리스트:
   - package.json에 axios, pinia, leaflet 의존성 필요
   - main.js에 app.use(pinia)가 등록되어 있어야 useConfigStore()가 동작함
   - .env에 VITE_OPENWEATHER_API_KEY 필요 (https://openweathermap.org 에서 발급) */
import { ref } from 'vue'
import HomeView from './views/HomeView.vue'
import AboutView from './views/AboutView.vue'
import DetailView from './views/DetailView.vue'

const view = ref('home') // 'home' | 'about' | 'detail'
const selectedCityId = ref(null)

const showDetail = (cityId) => {
  selectedCityId.value = cityId
  view.value = 'detail'
}
const showAbout = () => {
  view.value = 'about'
}
const goHome = () => {
  view.value = 'home'
}
</script>

<template>
  <div class="jh-weather-scope">
    <HomeView v-if="view === 'home'" @show-about="showAbout" @show-detail="showDetail" />
    <AboutView v-else-if="view === 'about'" @back="goHome" />
    <DetailView v-else-if="view === 'detail'" :city-id="selectedCityId" @back="goHome" />
  </div>
</template>

<style scoped>
/* 이 컴포넌트 트리 안에서만 쓰이는 색상 변수. :root/body/html/#app 같은 전역 선택자
   대신 .jh-weather-scope에 정의해서, CSS 변수 상속만으로 하위 컴포넌트에 전달한다
   (Vue의 scoped 속성 스코핑과 무관하게 변수 상속은 DOM 트리를 따라가므로 정상 동작). */
.jh-weather-scope {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  --jh-vt-white: #ffffff;
  --jh-vt-white-soft: #f8f8f8;
  --jh-vt-white-mute: #f2f2f2;
  --jh-vt-black: #181818;
  --jh-vt-black-soft: #222222;
  --jh-vt-black-mute: #282828;
  --jh-vt-indigo: #2c3e50;
  --jh-vt-divider-light-2: rgba(60, 60, 60, 0.12);
  --jh-vt-divider-dark-2: rgba(84, 84, 84, 0.48);
  --jh-vt-text-light-1: var(--jh-vt-indigo);
  --jh-vt-text-dark-2: rgba(235, 235, 235, 0.64);

  --color-background: var(--jh-vt-white);
  --color-background-soft: var(--jh-vt-white-soft);
  --color-background-mute: var(--jh-vt-white-mute);
  --color-border: var(--jh-vt-divider-light-2);
  --color-heading: var(--jh-vt-text-light-1);
  --color-text: var(--jh-vt-text-light-1);

  --magpie-black: #14161a;
  --magpie-white: #fafafa;
  --magpie-blue: #2e86de;
  --magpie-teal: #17a589;
  --magpie-violet: #7c5cff;
  --magpie-gradient: linear-gradient(135deg, var(--magpie-teal), var(--magpie-blue) 55%, var(--magpie-violet));
  --magpie-accent: var(--magpie-blue);
  --magpie-accent-soft: rgba(46, 134, 222, 0.14);
}

@media (prefers-color-scheme: dark) {
  .jh-weather-scope {
    --color-background: var(--jh-vt-black);
    --color-background-soft: var(--jh-vt-black-soft);
    --color-background-mute: var(--jh-vt-black-mute);
    --color-border: var(--jh-vt-divider-dark-2);
    --color-heading: #ffffff;
    --color-text: var(--jh-vt-text-dark-2);
    --magpie-accent: var(--magpie-teal);
    --magpie-accent-soft: rgba(23, 165, 137, 0.18);
  }
}
</style>
