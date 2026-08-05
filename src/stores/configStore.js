import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// [Store 실습 / 과제5] 앱 전역에서 공유해야 하는 "설정" 상태(온도 단위)를 담당하는 Pinia 스토어.
// 여러 화면(WeatherStoreHome/Detail 등)이 동일한 단위를 보도록, 각 컴포넌트가 아니라
// 스토어 한 곳에서 단일 진실 공급원(single source of truth)으로 관리한다.
export const useConfigStore = defineStore('config', () => {
  // Composition API 스타일 Pinia 스토어: ref로 선언한 값이 곧 state가 된다.
  const unit = ref('celsius')

  // unit 값이 바뀔 때마다 자동으로 다시 계산되는 반응형 파생 값(getter 역할).
  const unitSymbol = computed(() => (unit.value === 'fahrenheit' ? '°F' : '°C'))

  // 섭씨/화씨를 서로 토글한다 (컴포넌트에서 직접 unit.value를 바꾸지 않고 action을 통해서만 변경).
  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return { unit, unitSymbol, toggleUnit }
})
