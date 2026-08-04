<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { WEATHER_CITIES } from '@/data/weatherCities'
import { fetchWeatherForCities } from '@/composables/useWeatherApi'
import WeatherMap from './WeatherMap.vue'

// 1. 배열 렌더링용 날씨 데이터 (Open-Meteo 실시간 API로 채워짐)
const weatherList = ref([])
const apiError = ref(false)

// ---------- 검색 (디바운스) ----------
const searchQuery = ref('')       // 입력창에 즉시 반영되는 값
const debouncedQuery = ref('')    // 실제 필터링에 사용되는 값 (300ms 지연)
let debounceTimer = null

watch(searchQuery, (newVal) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = newVal
  }, 300)
})

// ---------- 상태 필터 ----------
const statusOptions = computed(() => {
  const unique = [...new Set(weatherList.value.map((c) => c.status))]
  return ['전체', ...unique]
})
const activeStatus = ref('전체')

// ---------- 정렬 ----------
const sortOrder = ref('default') // default | temp-desc | temp-asc | name

// ---------- 실시간 날씨 로딩 ----------
const loading = ref(true)
onMounted(async () => {
  try {
    weatherList.value = await fetchWeatherForCities(WEATHER_CITIES)
    apiError.value = weatherList.value.every((c) => c.error)
  } catch {
    apiError.value = true
  } finally {
    loading.value = false
  }
})

// ---------- 선택된 도시 ----------
const selectedCity = ref('')
const selectedCityId = computed(
  () => weatherList.value.find((c) => c.name === selectedCity.value)?.id ?? null,
)

// 검색어 + 상태 필터 적용
const filteredList = computed(() => {
  let list = weatherList.value

  const q = debouncedQuery.value.trim()
  if (q) {
    list = list.filter((city) => city.name.includes(q))
  }

  if (activeStatus.value !== '전체') {
    list = list.filter((city) => city.status === activeStatus.value)
  }

  return list
})

// 정렬 적용 (원본 훼손 방지를 위해 얕은 복사 후 정렬)
const sortedList = computed(() => {
  const list = [...filteredList.value]
  switch (sortOrder.value) {
    case 'temp-desc':
      return list.sort((a, b) => b.temp - a.temp)
    case 'temp-asc':
      return list.sort((a, b) => a.temp - b.temp)
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    default:
      return list
  }
})

// 평균 기온 (필터링된 리스트 기준, API 조회 실패 도시는 제외)
const knownTempList = computed(() => filteredList.value.filter((c) => c.temp !== null))

const averageTemp = computed(() => {
  if (knownTempList.value.length === 0) return null
  const sum = knownTempList.value.reduce((acc, c) => acc + c.temp, 0)
  return (sum / knownTempList.value.length).toFixed(1)
})

// 최고 / 최저 기온 도시 (필터링된 리스트 기준, 동률이면 첫 번째)
const maxTempCity = computed(() => {
  if (knownTempList.value.length === 0) return null
  return knownTempList.value.reduce((a, b) => (b.temp > a.temp ? b : a))
})
const minTempCity = computed(() => {
  if (knownTempList.value.length === 0) return null
  return knownTempList.value.reduce((a, b) => (b.temp < a.temp ? b : a))
})

// 카드 클릭 -> 상태바에 표시
const selectCity = (cityName) => {
  selectedCity.value = cityName
}

// 지도 마커 클릭 -> id로 도시를 찾아 동일한 선택 로직 재사용
const selectCityById = (id) => {
  const city = weatherList.value.find((c) => c.id === id)
  if (city) selectCity(city.name)
}

// 상세보기 클릭 (버블링 방지: @click.stop)
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="card-panel">
    <p class="panel-title">🌤️ 과제 1: 날씨 (Mockup) <span class="live-dot" title="Open-Meteo 실시간 연동"></span></p>
    <p v-if="apiError" class="api-error">⚠️ 날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>

    <!-- 검색 -->
    <div class="section">
      <p class="section-title">🔍 도시 검색</p>
      <input
        type="text"
        placeholder="검색할 도시 이름 입력"
        :value="searchQuery"
        @input="searchQuery = $event.target.value"
      />
      <p class="search-status">검색 중인 도시: <b>{{ searchQuery || '(없음)' }}</b></p>
    </div>

    <!-- 필터 + 정렬 컨트롤 -->
    <div class="section controls">
      <div class="control-row">
        <span class="control-label">상태 필터</span>
        <div class="chip-group">
          <button
            v-for="status in statusOptions"
            :key="status"
            class="chip"
            :class="{ active: activeStatus === status }"
            @click="activeStatus = status"
          >
            {{ status }}
          </button>
        </div>
      </div>

      <div class="control-row">
        <span class="control-label">정렬</span>
        <select v-model="sortOrder" class="sort-select">
          <option value="default">기본순</option>
          <option value="temp-desc">기온 높은순</option>
          <option value="temp-asc">기온 낮은순</option>
          <option value="name">이름순</option>
        </select>
      </div>

      <div class="control-row" v-if="averageTemp !== null">
        <span class="control-label">평균 기온</span>
        <span class="avg-temp">{{ averageTemp }}°C</span>
      </div>
    </div>

    <!-- 지역별 날씨 현황 -->
    <div class="section">
      <p class="section-title">📍 지역별 날씨 현황</p>

      <div v-if="loading" class="loading">날씨 불러오는 중...</div>

      <TransitionGroup v-else name="card-list" tag="div">
        <div
          v-for="city in sortedList"
          :key="city.id"
          class="weather-card"
          :class="{ selected: selectedCity === city.name }"
          @click="selectCity(city.name)"
        >
          <div class="weather-info">
            <div class="city-line">
              {{ city.name }} ({{ city.status }})
              <span v-if="maxTempCity && city.id === maxTempCity.id" class="mark" title="최고 기온">🏆</span>
              <span v-if="minTempCity && city.id === minTempCity.id" class="mark" title="최저 기온">🥶</span>
            </div>
            <div class="temp-line">현재 기온: {{ city.temp === null ? '조회 실패' : `${city.temp}°C` }}</div>

            <span v-if="city.temp === null" class="badge unknown">❓ 정보 없음</span>
            <span v-else-if="city.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
            <span v-else-if="city.temp >= 10" class="badge cool">☁️ 선선함 (10~24도)</span>
            <span v-else class="badge cold">🧊 추움 (10도 미만)</span>
          </div>

          <!-- 버블링 없이(.stop) 상세보기 -->
          <button class="detail-btn" @click.stop="showDetail(city.name, city.status)">
            상세보기
          </button>
        </div>
      </TransitionGroup>

      <p v-if="!loading && sortedList.length === 0" class="empty">검색 결과가 없습니다.</p>
    </div>

    <!-- 지도 -->
    <div class="section" v-if="!loading">
      <p class="section-title">🗺️ 지도로 보기</p>
      <WeatherMap :cities="sortedList" :selected-id="selectedCityId" @select-city="selectCityById" />
    </div>

    <!-- 상태바 -->
    <div class="status-bar">
      {{ selectedCity ? `${selectedCity}이 선택되었습니다.` : '카드를 클릭하거나 검색해 보세요.' }}
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.card-panel {
  position: relative;
  overflow: hidden;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 640px;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 28px;
  font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
}
.card-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--magpie-gradient);
}
.panel-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2ecc71;
  box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.6);
  animation: live-pulse 1.8s infinite;
}
@keyframes live-pulse {
  0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.5); }
  70% { box-shadow: 0 0 0 7px rgba(46, 204, 113, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
}
.api-error {
  background: #fdecea;
  color: #c0392b;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  margin: 0 0 16px 0;
}
.badge.unknown {
  background: #9aa5b1;
}
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
input[type="text"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: var(--color-background);
  color: var(--color-text);
}
input[type="text"]:focus {
  border-color: var(--magpie-accent);
}
.search-status {
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-text);
  opacity: 0.75;
}
.search-status b {
  color: var(--color-heading);
  opacity: 1;
}

/* 컨트롤 영역 */
.controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.control-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  min-width: 60px;
}
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  border: 1px solid var(--color-border);
  background: var(--color-background);
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  color: var(--color-text);
  cursor: pointer;
}
.chip.active {
  background: var(--magpie-gradient);
  border-color: transparent;
  color: #fff;
}
.sort-select {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
  background: var(--color-background);
  color: var(--color-text);
}
.avg-temp {
  font-size: 14px;
  font-weight: 700;
  color: var(--magpie-accent);
}

/* 로딩 */
.loading {
  text-align: center;
  padding: 24px 0;
  color: var(--color-text);
  opacity: 0.7;
  font-size: 14px;
}

/* 카드 */
.weather-card {
  background: var(--color-background);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
  border: 1px solid var(--color-border);
}
.weather-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
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
  display: flex;
  align-items: center;
  gap: 6px;
}
.mark { font-size: 13px; }
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
.badge.hot { background: #ef5b5b; }
.badge.cool { background: var(--magpie-blue); }
.badge.cold { background: var(--magpie-violet); }
.detail-btn {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  white-space: nowrap;
}
.detail-btn:hover {
  background: var(--magpie-accent-soft);
  border-color: var(--magpie-accent);
}

/* 리스트 애니메이션 */
.card-list-enter-active,
.card-list-leave-active,
.card-list-move {
  transition: all 0.3s ease;
}
.card-list-enter-from,
.card-list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.card-list-leave-active {
  position: absolute;
  width: calc(100% - 40px);
}

.status-bar {
  text-align: center;
  background: var(--magpie-accent-soft);
  color: var(--magpie-accent);
  font-size: 14px;
  font-weight: 600;
  padding: 12px;
  border-radius: 10px;
}
.empty {
  text-align: center;
  color: var(--color-text);
  opacity: 0.7;
  font-size: 13px;
  padding: 10px 0;
}
</style>