<script setup>
/* ── WeatherComposition.vue ──
   WeatherParent.vue와 같은 기능(검색/필터/정렬/지도)을 제공하지만,
   화면을 자식 컴포넌트로 쪼개지 않고 이 파일 하나(template)에 그대로 작성한 버전이다.
   즉 "컴포넌트 분리 전" 형태 — 지도(WeatherMap)만 별도 컴포넌트로 빼고
   검색창/카드 목록 등은 모두 이 파일의 <template> 안에 인라인으로 존재한다.
   상태 관리 로직(ref/computed/watch)은 WeatherParent.vue와 동일한 패턴을 사용한다. */
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

// 데이터가 아직 도착하지 않은 동안 el-skeleton을 보여주기 위한 로딩 플래그
const loading = ref(true)
// onMounted: 컴포넌트가 화면(DOM)에 실제로 붙은 뒤 1회 실행되는 생명주기 훅.
// 여기서 비동기 API 호출을 시작해 weatherList를 채운다.
onMounted(async () => {
  try {
    weatherList.value = await fetchWeatherForCities(WEATHER_CITIES)
    // 모든 도시가 error 플래그를 가지고 있으면(=전부 실패) 전역 에러 배너를 띄운다
    apiError.value = weatherList.value.every((c) => c.error)
  } catch {
    apiError.value = true
  } finally {
    loading.value = false
  }
})

/* ── [과제2-2] 검색 도시 (computed 활용) ──
   computed는 의존하는 ref(weatherList/searchQuery/activeStatus)가 바뀔 때만
   자동으로 다시 계산되고, 그 외에는 캐시된 값을 재사용한다(메서드 호출과의 차이점). */
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
   watch는 "감시 대상(statusMessage)"을 명시적으로 지정하고, 값이 바뀌기 전(oldMsg)과
   후(newMsg)를 함께 받을 수 있다. 상태 바 문구가 바뀔 때마다 콘솔로그를 남긴다. */
watch(statusMessage, (newMsg, oldMsg) => {
  console.log(`👁 [watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newMsg}" (이전: "${oldMsg}")`)
})

/* ── [과제2-3-2] searchQuery 감시 (watchEffect) ──
   watchEffect는 감시 대상을 따로 적지 않고, 콜백 안에서 "읽은" 반응형 값(searchQuery,
   filteredWeatherList)을 자동으로 추적해 그중 하나라도 바뀌면 즉시 재실행된다.
   또한 컴포넌트가 마운트될 때 최초 1회도 즉시 실행된다(watch와 달리 immediate 옵션 불필요). */
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
    <el-alert
      v-if="apiError"
      class="api-error"
      title="⚠️ 날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
      type="error"
      show-icon
      :closable="false"
    />

    <!-- [과제1-3] 한글 검색: :value + @input -->
    <el-card class="section" shadow="never">
      <p class="section-title">🔍 도시 검색</p>
      <el-input
        placeholder="검색할 도시 이름 입력"
        :model-value="searchQuery"
        clearable
        @input="(val) => (searchQuery = val)"
        @clear="searchQuery = ''"
      />
      <p class="search-status">
        검색 중인 도시: <b>{{ searchQuery || '(없음)' }}</b>
      </p>
    </el-card>

    <!-- 부가 컨트롤 -->
    <el-card class="section controls" shadow="never">
      <div class="control-row">
        <span class="control-label">상태 필터</span>
        <el-radio-group v-model="activeStatus" size="small">
          <el-radio-button v-for="status in statusOptions" :key="status" :value="status">
            {{ status }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="control-row">
        <span class="control-label">정렬</span>
        <el-select v-model="sortOrder" style="width: 140px">
          <el-option label="기본순" value="default" />
          <el-option label="기온 높은순" value="temp-desc" />
          <el-option label="기온 낮은순" value="temp-asc" />
          <el-option label="이름순" value="name" />
        </el-select>
      </div>

      <div class="control-row" v-if="averageTemp !== null">
        <span class="control-label">평균 기온</span>
        <el-tag type="primary" effect="plain">{{ averageTemp }}°C</el-tag>
      </div>
    </el-card>

    <!-- [과제1-1] 배열 렌더링 / [과제2-4] 검색 결과 표시 -->
    <el-card class="section" shadow="never">
      <p class="section-title">📍 지역별 날씨 현황</p>

      <el-skeleton v-if="loading" :rows="4" animated />

      <TransitionGroup v-else name="card-list" tag="div">
        <el-card
          v-for="city in sortedList"
          :key="city.id"
          class="weather-card"
          :class="{ selected: selectedCityInfo?.id === city.id }"
          shadow="hover"
          @click="selectCity(city)"
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

          <el-button class="detail-btn" size="small" @click.stop="showDetail(city.name, city.status)">
            상세보기
          </el-button>
        </el-card>
      </TransitionGroup>

      <!-- 검색어와 일치하는 데이터가 없을 때 -->
      <p v-if="!loading && sortedList.length === 0" class="empty">
        '{{ searchQuery }}' 검색 결과와 일치하는 도시가 없습니다.
      </p>
    </el-card>

    <!-- 지도 -->
    <el-card class="section" shadow="never" v-if="!loading">
      <p class="section-title">🗺️ 지도로 보기</p>
      <WeatherMap
        :cities="sortedList"
        :selected-id="selectedCityId"
        @select-city="selectCityById"
      />
    </el-card>

    <!-- 상태바 -->
    <el-alert class="status-bar" :title="statusMessage" type="info" :closable="false" center />
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
  margin: 0 0 16px 0;
}
.section {
  margin-bottom: 16px;
}
.section-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--color-heading);
  margin: 0 0 10px 0;
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
