<script setup>
/* ── [과제5 / Store 실습] WeatherCardStore.vue ──
   WeatherCard.vue를 기반으로, configStore(Pinia)의 단위 설정에 따라
   기온 표시를 섭씨/화씨로 변환해서 보여준다. 등급은 배지 대신 카드 배경/좌측 색상으로 표현한다.
   props/emits만 쓰는 기본형(src/components/exercise/WeatherCard.vue)과 달리,
   이 컴포넌트는 useConfigStore()로 전역 상태(단위 설정)를 직접 구독한다 —
   부모가 단위 값을 props로 내려줄 필요 없이, 스토어를 쓰는 모든 컴포넌트가
   자동으로 같은 단위 설정을 공유하는 것이 Pinia 스토어 패턴의 핵심이다. */
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

// city: 표시할 도시 데이터(원본 기온은 항상 섭씨로 들어온다). isSelected: 선택 강조 여부
const props = defineProps({
  city: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
})

// select-card / click-detail / remove: WeatherCard.vue와 동일한 의미의 이벤트
const emit = defineEmits(['select-card', 'click-detail', 'remove'])

// 컴포넌트마다 새로 만들지 않고, 앱 전역에서 하나로 공유되는 스토어 인스턴스를 가져온다
const configStore = useConfigStore()

const displayTemp = computed(() => {
  const rawTemp = props.city.temp // 기본 원본 데이터는 섭씨 숫자
  if (rawTemp === null) return null
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32) // 화씨 변환 연산
  }
  return rawTemp // 'celsius'일 때는 원본 그대로 반환
})

// 날씨 상태 텍스트(OpenWeatherMap 한글 설명)에 맞는 이모지를 골라준다
const statusEmoji = computed(() => {
  const status = props.city.status ?? ''
  if (status.includes('눈')) return '❄️'
  if (status.includes('천둥')) return '⛈️'
  if (status.includes('비')) return '🌧️'
  if (status.includes('안개')) return '🌫️'
  if (status.includes('약간') || status.includes('조금')) return '🌤️'
  if (status.includes('구름')) return '☁️'
  if (status.includes('맑')) return '☀️'
  return '🌡️'
})

// 온도 구간에 따라 카드 배경/좌측 강조 색을 바꾼다 (기존 배지의 등급 판정 기준을 그대로 이어받음)
const tempRangeClass = computed(() => {
  const t = props.city.temp
  if (t === null) return 'range-unknown'
  if (t >= 25) return 'range-hot'
  if (t >= 10) return 'range-cool'
  return 'range-cold'
})
</script>

<template>
  <div
    class="weather-card"
    :class="[tempRangeClass, { selected: isSelected }]"
    @click="emit('select-card', city)"
  >
    <!-- @click.stop: 카드 선택 이벤트로 버블링되지 않게 차단 -->
    <button class="remove-btn" title="목록에서 삭제" @click.stop="emit('remove', city.id)">×</button>

    <div class="city-col">
      <div class="city-name">{{ statusEmoji }} {{ city.name }}</div>
      <div class="city-status">
        {{ city.status }}
        <span v-if="city.custom" class="custom-tag">직접 추가</span>
      </div>
    </div>

    <span class="temp-value">
      {{ city.temp === null ? '조회 실패' : `${displayTemp}${configStore.unitSymbol}` }}
    </span>

    <button class="detail-btn" @click.stop="emit('click-detail', city)">상세보기 및 미세먼지</button>
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
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;
  border: 1px solid var(--color-border);
  border-left: 5px solid transparent;
  box-sizing: border-box;
}
.weather-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}
.weather-card.selected {
  border-color: var(--magpie-accent);
}

/* 온도 구간별 카드 배경/좌측 강조 색 */
.weather-card.range-hot {
  background: rgba(239, 91, 91, 0.1);
  border-left-color: #ef5b5b;
}
.weather-card.range-cool {
  background: rgba(46, 134, 222, 0.1);
  border-left-color: var(--magpie-blue);
}
.weather-card.range-cold {
  background: rgba(124, 92, 255, 0.1);
  border-left-color: var(--magpie-violet);
}
.weather-card.range-unknown {
  background: rgba(154, 165, 177, 0.1);
  border-left-color: #9aa5b1;
}

.city-col {
  flex: 1;
  min-width: 0;
}
.city-name {
  font-weight: 800;
  font-size: 18px;
  color: var(--color-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.city-status {
  font-size: 13px;
  color: var(--color-text);
  opacity: 0.75;
  margin-top: 2px;
}
.temp-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-heading);
  white-space: nowrap;
  flex-shrink: 0;
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
