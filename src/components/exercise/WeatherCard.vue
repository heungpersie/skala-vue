<script setup>
/* ── [Router 실습] WeatherCard.vue ──
   - 도시 객체(city)를 props로 전달받아 표시
   - 카드 클릭 → select-card 이벤트, 상세보기 클릭 → click-detail 이벤트를 부모에게 전달
   - 실제 라우터 이동(router.push)은 부모(WeatherHomeView)가 담당한다 */
defineProps({
  city: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['select-card', 'click-detail', 'remove'])
</script>

<template>
  <div class="weather-card" :class="{ selected: isSelected }" @click="emit('select-card', city)">
    <!-- @click.stop: 카드 선택 이벤트로 버블링되지 않게 차단 -->
    <button class="remove-btn" title="목록에서 삭제" @click.stop="emit('remove', city.id)">×</button>

    <div class="weather-info">
      <div class="city-line">
        {{ city.name }} ({{ city.status }})
        <span v-if="city.custom" class="custom-tag">직접 추가</span>
      </div>
      <div class="temp-line">현재 기온: {{ city.temp === null ? '조회 실패' : `${city.temp}°C` }}</div>

      <span v-if="city.temp === null" class="badge unknown">❓ 정보 없음</span>
      <span v-else-if="city.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
      <span v-else-if="city.temp >= 10" class="badge cool">☁️ 선선함 (10~24도)</span>
      <span v-else class="badge cold">🧊 추움 (10도 미만)</span>
    </div>

    <button class="detail-btn" @click.stop="emit('click-detail', city)">상세보기</button>
  </div>
</template>

<style scoped>
.weather-card {
  position: relative;
  background: var(--color-background);
  border-radius: 12px;
  padding: 14px 40px 14px 16px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;
  border: 1px solid var(--color-border);
  box-sizing: border-box;
}
.weather-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}
.weather-card.selected {
  border-color: var(--magpie-accent);
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
  background: var(--magpie-blue);
}
.badge.cold {
  background: var(--magpie-violet);
}
.badge.unknown {
  background: #9aa5b1;
}
.custom-tag {
  font-size: 10px;
  font-weight: 700;
  color: var(--magpie-accent);
  background: var(--magpie-accent-soft);
  padding: 2px 6px;
  border-radius: 10px;
  vertical-align: middle;
  margin-left: 4px;
}
.detail-btn {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.detail-btn:hover {
  background: var(--magpie-accent-soft);
  border-color: var(--magpie-accent);
}

/* 카드 우상단에 조용히 얹히는 삭제 아이콘. 평소엔 옅게, 호버 시에만 위험색으로 도드라진다 */
.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text);
  opacity: 0.5;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;
}
.remove-btn:hover {
  background: #fdecea;
  color: #c0392b;
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .weather-card {
    transition: none !important;
  }
}
</style>
