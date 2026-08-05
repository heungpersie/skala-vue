<script setup>
/* ── [과제3-2] BaseDashboardCard.vue ──
   검색박스 / 리스트박스의 공통 디자인(회색 섹션 박스)을 담당한다.
   내부 콘텐츠는 <slot>으로 열어두어 부모(WeatherParent)가
   '도시 검색(SearchBar)'과 '날씨 현황(WeatherCard 목록)'을 주입한다.
   이 버전은 Element Plus의 <el-card>를 기반으로 만든 디자인이다.
   순수 CSS로 같은 역할을 하는 버전은 src/components/exercise/BaseDashboardCard.vue 참고. */
// title: 카드 상단에 표시할 섹션 제목. 비어있으면(default '') 헤더 자체를 렌더링하지 않는다
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <el-card class="section" shadow="never">
    <template v-if="title" #header>
      <span class="section-title">{{ title }}</span>
    </template>

    <!-- 부모가 내용을 주입하는 자리 -->
    <slot></slot>
  </el-card>
</template>

<style scoped>
/* [과제3-5] 이 컴포넌트가 책임지는 디자인만 scoped로 보관 */
.section {
  margin-bottom: 16px;
}
.section-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--color-heading);
}
</style>
