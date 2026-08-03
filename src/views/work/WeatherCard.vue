<script setup>
/* ── [과제3-4] WeatherCard.vue ──
   - 도시 객체(city)를 props로 전달받아 표시
   - 카드 클릭 → select-card 이벤트, 상세보기 클릭 → click-detail 이벤트를 부모에게 전달
   - alert 같은 실제 동작은 부모(WeatherParent)가 담당한다 */
defineProps({
  city: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['select-card', 'click-detail'])
</script>

<template>
  <div class="weather-card" :class="{ selected: isSelected }" @click="emit('select-card', city)">
    <div class="weather-info">
      <div class="city-line">{{ city.name }} ({{ city.status }})</div>
      <div class="temp-line">현재 기온: {{ city.temp }}°C</div>

      <!-- [과제1-2] 조건부 렌더링 -->
      <span v-if="city.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
      <span v-else-if="city.temp >= 10" class="badge cool">☁️ 선선함 (10~24도)</span>
      <span v-else class="badge cold">🧊 추움 (10도 미만)</span>
    </div>

    <!-- @click.stop: 카드 선택 이벤트로 버블링되지 않게 차단 -->
    <button class="detail-btn" @click.stop="emit('click-detail', city)">상세보기</button>
  </div>
</template>

<style scoped>
.weather-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;
  border: 1px solid transparent;
  box-sizing: border-box;
}
.weather-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}
.weather-card.selected {
  border-color: #5b8def;
}
.weather-info .city-line {
  font-weight: 700;
  font-size: 15px;
  color: #1c2b3a;
  margin-bottom: 4px;
}
.weather-info .temp-line {
  font-size: 13px;
  color: #5b6b7a;
  margin-bottom: 8px;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  color: #fff;
}
.badge.hot {
  background: #ef5b5b;
}
.badge.cool {
  background: #5b9bef;
}
.badge.cold {
  background: #6b7cff;
}
.detail-btn {
  background: #fff;
  border: 1px solid #cdd9e5;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  color: #34495e;
  cursor: pointer;
  white-space: nowrap;
}
.detail-btn:hover {
  background: #eef3f9;
}

@media (prefers-reduced-motion: reduce) {
  .weather-card {
    transition: none !important;
  }
}
</style>
