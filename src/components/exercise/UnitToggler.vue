<script setup>
/* ── [Store 실습] UnitToggler.vue ──
   props/emits 없이 Pinia 스토어(configStore)를 컴포넌트가 직접 구독/변경하는 예시.
   props로 값을 내려받는 방식과 달리, useConfigStore()를 호출하는 모든 컴포넌트가
   같은 스토어 인스턴스를 공유하므로 여기서 단위를 바꾸면 configStore를 쓰는
   다른 컴포넌트(WeatherCardStore.vue 등)에도 즉시 반영된다. */
import { useConfigStore } from '@/stores/configStore'

// 스토어 인스턴스를 가져온다. template에서 configStore.xxx로 상태/액션에 바로 접근 가능
const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <!-- configStore.unit(state)을 그대로 읽어 표시 -->
    <span class="unit-label">
      날씨단위: {{ configStore.unit === 'fahrenheit' ? '화씨' : '섭씨' }}({{ configStore.unitSymbol }})
    </span>
    <!-- 버튼 클릭 시 스토어의 액션(toggleUnit)을 직접 호출해 상태를 변경 -->
    <button class="unit-btn" @click="configStore.toggleUnit">단위변경</button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.unit-label {
  font-size: 13px;
  color: var(--color-text);
  opacity: 0.75;
  white-space: nowrap;
}
.unit-btn {
  background: var(--magpie-gradient);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.unit-btn:hover {
  filter: brightness(1.08);
}
</style>
