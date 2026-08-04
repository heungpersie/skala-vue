// [Store 실습 / 과제5] WeatherStore Home ↔ Detail 뷰가 같은 도시 목록(+ OpenWeatherMap 실시간 날씨)을
// 공유하기 위한 모듈 스코프 싱글턴 상태. useWeatherCities.js(과제4, Open-Meteo)와는 완전히 독립적이다.
import { ref } from 'vue'
import { WEATHER_ROUTER_DEFAULT_CITIES } from '@/data/weatherRouterCities'
import { fetchOpenWeatherByCoords } from './useOpenWeatherApi'

const CUSTOM_KEY = 'skala-vue:weather-store:custom-cities'
const REMOVED_KEY = 'skala-vue:weather-store:removed-default-cities'

function loadJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage를 쓸 수 없는 환경(프라이빗 모드 등)에서는 조용히 무시
  }
}

const cities = ref([])
const loading = ref(false)
const loaded = ref(false)
const error = ref(false)
const removedDefaultIds = ref(loadJson(REMOVED_KEY))

async function fetchWeatherForCities(targets) {
  const results = await Promise.allSettled(
    targets.map((city) => fetchOpenWeatherByCoords(city.lat, city.lon)),
  )

  return targets.map((city, index) => {
    const result = results[index]
    if (result.status === 'fulfilled') {
      return { ...city, ...result.value, error: false }
    }
    return { ...city, temp: null, status: '알 수 없음', error: true }
  })
}

// 기본 도시(사용자가 지우지 않은 것) + 사용자가 이전에 추가해 저장해 둔 도시를 함께 조회한다.
// loaded 플래그로 감싸 Home/Detail 어느 쪽에서 먼저 진입해도 한 번만 호출되게 한다.
async function loadCities() {
  if (loaded.value || loading.value) return
  loading.value = true
  try {
    const removedIds = removedDefaultIds.value
    const activeDefaults = WEATHER_ROUTER_DEFAULT_CITIES.filter((c) => !removedIds.includes(c.id))
    const customMetas = loadJson(CUSTOM_KEY)
    const targets = [...activeDefaults, ...customMetas]
    const result = await fetchWeatherForCities(targets)

    cities.value = result.map((city, index) => ({
      ...city,
      custom: index >= activeDefaults.length,
    }))
    error.value = targets.length > 0 && cities.value.every((c) => c.error)
  } catch {
    error.value = true
  } finally {
    loading.value = false
    loaded.value = true
  }
}

// 검색으로 찾은 도시(meta: {id,name,lat,lon})를 목록에 추가하고 localStorage에 저장한다.
async function addCity(meta) {
  if (cities.value.some((c) => c.id === meta.id)) {
    throw new Error('이미 추가된 도시입니다.')
  }
  const weather = await fetchOpenWeatherByCoords(meta.lat, meta.lon)
  cities.value.push({ ...meta, ...weather, error: false, custom: true })

  const metas = loadJson(CUSTOM_KEY)
  metas.push(meta)
  saveJson(CUSTOM_KEY, metas)
}

// 기본 도시 / 사용자가 추가한 도시 구분 없이 전부 제거 가능하다.
// 기본 도시는 "삭제됨" 목록에 id를 저장해 다음 로드부터도 계속 빠지게 한다.
function removeCity(id) {
  cities.value = cities.value.filter((c) => c.id !== id)

  if (WEATHER_ROUTER_DEFAULT_CITIES.some((c) => c.id === id)) {
    if (!removedDefaultIds.value.includes(id)) {
      removedDefaultIds.value = [...removedDefaultIds.value, id]
      saveJson(REMOVED_KEY, removedDefaultIds.value)
    }
  } else {
    saveJson(
      CUSTOM_KEY,
      loadJson(CUSTOM_KEY).filter((m) => m.id !== id),
    )
  }
}

// 삭제했던 기본 도시를 전부 복원한다 (사용자가 추가한 도시는 건드리지 않음).
async function restoreDefaultCities() {
  removedDefaultIds.value = []
  saveJson(REMOVED_KEY, [])
  loaded.value = false
  await loadCities()
}

export function useOpenWeatherCities() {
  return {
    cities,
    loading,
    loaded,
    error,
    removedDefaultIds,
    loadCities,
    addCity,
    removeCity,
    restoreDefaultCities,
  }
}
