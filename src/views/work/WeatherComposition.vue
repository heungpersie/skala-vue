<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { WEATHER_CITIES } from '@/data/weatherCities'
import { fetchWeatherForCities } from '@/composables/useWeatherApi'
import WeatherMap from './WeatherMap.vue'

/* ── [과제1-1 / 과제2-1] 반응형 상태 + 날씨 데이터 배열 (Open-Meteo 실시간 API) ── */
const weatherList = ref([])
const apiError = ref(false)

const searchQuery = ref('') // 검색어
const selectedCityInfo = ref(null) // 선택된 도시

/* ── 부가 기능 (과제 요구사항 외) ── */
const activeStatus = ref('전체')
const statusOptions = computed(() => ['전체', ...new Set(weatherList.value.map((c) => c.status))])

const sortOrder = ref('default')

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

/* ── [과제2-2] 검색 도시 (computed 활용) ── */
const filteredWeatherList = computed(() => {
  let list = weatherList.value

  const q = searchQuery.value.trim()
  if (q) list = list.filter((city) => city.name.includes(q)) // 검색어가 비면 원본 데이터 그대로

  if (activeStatus.value !== '전체') {
    list = list.filter((city) => city.status === activeStatus.value)
  }
  return list
})

// 정렬 (원본 훼손 방지를 위해 얕은 복사 후 정렬)
const sortedList = computed(() => {
  const list = [...filteredWeatherList.value]
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

const averageTemp = computed(() => {
  const known = filteredWeatherList.value.filter((c) => c.temp !== null)
  if (known.length === 0) return null
  const sum = known.reduce((acc, c) => acc + c.temp, 0)
  return (sum / known.length).toFixed(1)
})

/* ── [과제1-4] 상태 바 문구 ── */
const statusMessage = computed(() =>
  selectedCityInfo.value
    ? `${selectedCityInfo.value.name}이 선택되었습니다.`
    : '카드를 클릭하거나 검색해 보세요.',
)

/* ── [과제2-3-1] selectedCityInfo 감시 (watch) ──
   상태 바 문구가 바뀔 때마다 콘솔로그 작성 */
watch(statusMessage, (newMsg, oldMsg) => {
  console.log(`👁 [watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newMsg}" (이전: "${oldMsg}")`)
})

/* ── [과제2-3-2] searchQuery 감시 (watchEffect) ──
   타이핑할 때마다 변하는 searchQuery를 추적 */
watchEffect(() => {
  console.log(
    `🤖 [watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다. (${filteredWeatherList.value.length}건)`,
  )
})

/* ── [과제1-4] 이벤트 핸들러 ── */
// 카드 클릭 -> 상태바 표기
const selectCity = (city) => {
  selectedCityInfo.value = city
}

// 지도 마커 클릭 -> id로 도시를 찾아 동일한 선택 로직 재사용
const selectedCityId = computed(() => selectedCityInfo.value?.id ?? null)
const selectCityById = (id) => {
  const city = weatherList.value.find((c) => c.id === id)
  if (city) selectCity(city)
}

// 상세보기 -> 버블링 없이(@click.stop) alert
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="card-panel">
    <p class="panel-title">
      🌤️ 과제 2: 날씨 대시보드 <span class="live-dot" title="Open-Meteo 실시간 연동"></span>
    </p>
    <p v-if="apiError" class="api-error">
      ⚠️ 날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
    </p>

    <!-- [과제1-3] 한글 검색: :value + @input -->
    <div class="section">
      <p class="section-title">🔍 도시 검색</p>
      <input
        type="text"
        placeholder="검색할 도시 이름 입력"
        :value="searchQuery"
        @input="searchQuery = $event.target.value"
      />
      <p class="search-status">
        검색 중인 도시: <b>{{ searchQuery || '(없음)' }}</b>
      </p>
    </div>

    <!-- 부가 컨트롤 -->
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

    <!-- [과제1-1] 배열 렌더링 / [과제2-4] 검색 결과 표시 -->
    <div class="section">
      <p class="section-title">📍 지역별 날씨 현황</p>

      <div v-if="loading" class="loading">날씨 불러오는 중...</div>

      <TransitionGroup v-else name="card-list" tag="div">
        <div
          v-for="city in sortedList"
          :key="city.id"
          class="weather-card"
          :class="{ selected: selectedCityInfo?.id === city.id }"
          @click="selectCity(city)"
        >
          <div class="weather-info">
            <div class="city-line">{{ city.name }} ({{ city.status }})</div>
            <div class="temp-line">
              현재 기온: {{ city.temp === null ? '조회 실패' : `${city.temp}°C` }}
            </div>

            <!-- [과제1-2] 조건부 렌더링 -->
            <span v-if="city.temp === null" class="badge unknown">❓ 정보 없음</span>
            <span v-else-if="city.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
            <span v-else-if="city.temp >= 10" class="badge cool">☁️ 선선함 (10~24도)</span>
            <span v-else class="badge cold">🧊 추움 (10도 미만)</span>
          </div>

          <button class="detail-btn" @click.stop="showDetail(city.name, city.status)">
            상세보기
          </button>
        </div>
      </TransitionGroup>

      <!-- 검색어와 일치하는 데이터가 없을 때 -->
      <p v-if="!loading && sortedList.length === 0" class="empty">
        '{{ searchQuery }}' 검색 결과와 일치하는 도시가 없습니다.
      </p>
    </div>

    <!-- 지도 -->
    <div class="section" v-if="!loading">
      <p class="section-title">🗺️ 지도로 보기</p>
      <WeatherMap
        :cities="sortedList"
        :selected-id="selectedCityId"
        @select-city="selectCityById"
      />
    </div>

    <!-- 상태바 -->
    <div class="status-bar">{{ statusMessage }}</div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

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
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
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
  animation: live-pulse 1.8s infinite;
}
@keyframes live-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.5);
  }
  70% {
    box-shadow: 0 0 0 7px rgba(46, 204, 113, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
  }
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
input[type='text'] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: var(--color-background);
  color: var(--color-text);
}
input[type='text']:focus {
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

.loading {
  text-align: center;
  padding: 24px 0;
  color: var(--color-text);
  opacity: 0.7;
  font-size: 14px;
}

.weather-card {
  background: var(--color-background);
  border-radius: 12px;
  padding: 14px 16px;
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

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>
