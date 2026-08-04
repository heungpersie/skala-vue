<script setup>
/* ── [Router 실습] BaseDashboardCard.vue ──
   검색박스 / 리스트박스의 공통 디자인(회색 섹션 박스)을 담당한다.
   내부 콘텐츠는 <slot>으로 열어두어 부모(WeatherHomeView)가
   '도시 검색(SearchBar)'과 '날씨 현황(WeatherCard 목록)'을 주입한다. */
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <div class="section">
    <p v-if="title" class="section-title">{{ title }}</p>

    <!-- 부모가 내용을 주입하는 자리 -->
    <slot></slot>
  </div>
</template>

<style scoped>
.section {
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 16px;
}
.section-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--color-heading);
  margin: 0 0 10px 0;
}
</style>
