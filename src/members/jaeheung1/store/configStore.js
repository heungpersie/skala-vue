import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// store id는 다른 조원 폴더와 충돌하지 않도록 'jh-'로 네임스페이싱했습니다.
export const useConfigStore = defineStore('jh-weather-config', () => {
  const unit = ref('celsius')

  const unitSymbol = computed(() => (unit.value === 'fahrenheit' ? '°F' : '°C'))

  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return { unit, unitSymbol, toggleUnit }
})
