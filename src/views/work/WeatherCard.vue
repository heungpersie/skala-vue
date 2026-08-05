<script setup>
/* ── [과제3-4] WeatherCard.vue ──
   - 도시 객체(city)를 props로 전달받아 표시
   - 카드 클릭 → select-card 이벤트, 상세보기 클릭 → click-detail 이벤트를 부모에게 전달
   - alert 같은 실제 동작은 부모(WeatherParent)가 담당한다 (자식은 순수 표시 + 알림만 담당)
   props/emits만 사용하는 기본형 버전이다. Pinia 스토어로 온도 단위(섭씨/화씨)를
   변환해 보여주는 버전은 src/components/exercise/WeatherCardStore.vue 참고. */
// city: 표시할 도시 데이터(이름/상태/기온). isSelected: 현재 선택된 카드인지 여부(강조 테두리용)
defineProps({
  city: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})

// select-card: 카드 클릭 시 선택 도시를 알림 / click-detail: 상세보기 버튼 클릭을 알림
const emit = defineEmits(['select-card', 'click-detail'])
</script>

<template>
  <el-card
    class="weather-card"
    :class="{ selected: isSelected }"
    shadow="hover"
    @click="emit('select-card', city)"
  >
    <div class="weather-info">
      <div class="city-line">{{ city.name }} ({{ city.status }})</div>
      <div class="temp-line">
        현재 기온: {{ city.temp === null ? '조회 실패' : `${city.temp}°C` }}
      </div>

      <!-- [과제1-2] 조건부 렌더링 -->
      <el-tag v-if="city.temp === null" type="info" effect="dark" round>❓ 정보 없음</el-tag>
      <el-tag v-else-if="city.temp >= 25" class="tag-hot" effect="dark" round>🔥 더움 (25도 이상)</el-tag>
      <el-tag v-else-if="city.temp >= 10" type="primary" effect="dark" round>☁️ 선선함 (10~24도)</el-tag>
      <el-tag v-else class="tag-cold" effect="dark" round>🧊 추움 (10도 미만)</el-tag>
    </div>

    <!-- @click.stop: 카드 선택 이벤트로 버블링되지 않게 차단 -->
    <el-button class="detail-btn" size="small" @click.stop="emit('click-detail', city)">
      상세보기 및 미세먼지
    </el-button>
  </el-card>
</template>

<style scoped>
.weather-card {
  margin-bottom: 10px;
  cursor: pointer;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;
}
.weather-card:hover {
  transform: translateY(-1px);
}
.weather-card.selected {
  border-color: var(--magpie-accent);
}
.weather-card :deep(.el-card__body) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.weather-info .city-line {
  font-weight: 700;
  font-size: 15px;
  color: var(--color-heading);
  margin-bottom: 4px;
}
.weather-info .temp-line {
  font-size: 13px;
  color: var(--color-text);
  margin-bottom: 8px;
}
.tag-hot {
  background: #ef5b5b;
  border-color: #ef5b5b;
  color: #fff;
}
.tag-cold {
  background: var(--magpie-violet);
  border-color: var(--magpie-violet);
  color: #fff;
}
.detail-btn {
  white-space: nowrap;
  flex-shrink: 0;
}

@media (prefers-reduced-motion: reduce) {
  .weather-card {
    transition: none !important;
  }
}
</style>
