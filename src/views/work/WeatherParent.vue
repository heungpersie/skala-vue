<script setup>
/* ── [과제3-1] WeatherParent.vue ──
   모든 반응형 데이터와 로직(watch / computed / 이벤트 처리)을 이 곳에서 유지한다.
   자식은 표시(props)와 알림(emits)만 담당한다. */
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import WeatherMap from './WeatherMap.vue'
import { WEATHER_CITIES } from '@/data/weatherCities'
import { fetchWeatherForCities } from '@/composables/useWeatherApi'

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

/* ── [과제2-3-1] selectedCityInfo 감시 (watch) ── */
watch(statusMessage, (newMsg, oldMsg) => {
  console.log(`👁 [watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newMsg}" (이전: "${oldMsg}")`)
})

/* ── [과제2-3-2] searchQuery 감시 (watchEffect) ── */
watchEffect(() => {
  console.log(
    `🤖 [watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다. (${filteredWeatherList.value.length}건)`,
  )
})

/* ── [과제3] 자식 컴포넌트가 emit한 이벤트를 받는 핸들러 ── */
// SearchBar → update-query
const handleUpdateQuery = (value) => {
  searchQuery.value = value
}

// WeatherCard → select-card
const selectCity = (city) => {
  selectedCityInfo.value = city
}

// WeatherMap → select-city (id 기반) -> 동일한 선택 로직 재사용
const selectedCityId = computed(() => selectedCityInfo.value?.id ?? null)
const selectCityById = (id) => {
  const city = weatherList.value.find((c) => c.id === id)
  if (city) selectCity(city)
}

// WeatherCard → click-detail
const showDetail = (city) => {
  window.alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)
}
</script>

<template>
  <div class="card-panel">
    <p class="panel-title">🌤️ 과제 3: 날씨 (컴포넌트) <span class="live-dot" title="Open-Meteo 실시간 연동"></span></p>
    <el-alert
      v-if="apiError"
      class="api-error"
      title="⚠️ 날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
      type="error"
      show-icon
      :closable="false"
    />

    <!-- [과제3-2] 공통 카드에 SearchBar를 slot으로 주입 -->
    <BaseDashboardCard title="🔍 도시 검색 (한글 즉시 동기화)">
      <SearchBar :query="searchQuery" @update-query="handleUpdateQuery" />
    </BaseDashboardCard>

    <!-- 부가 컨트롤도 동일한 공통 카드 재사용 -->
    <BaseDashboardCard title="⚙️ 필터 & 정렬">
      <div class="controls">
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
          <el-select v-model="sortOrder" class="sort-select" style="width: 140px">
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
      </div>
    </BaseDashboardCard>

    <!-- [과제3-2] 공통 카드에 날씨 현황 목록을 slot으로 주입 -->
    <BaseDashboardCard title="📍 지역별 날씨 현황">
      <el-skeleton v-if="loading" :rows="4" animated />

      <TransitionGroup v-else name="card-list" tag="div" class="card-list">
        <WeatherCard
          v-for="city in sortedList"
          :key="city.id"
          :city="city"
          :is-selected="selectedCityInfo?.id === city.id"
          @select-card="selectCity"
          @click-detail="showDetail"
        />
      </TransitionGroup>

      <!-- 검색어와 일치하는 데이터가 없을 때 -->
      <p v-if="!loading && sortedList.length === 0" class="empty">
        '{{ searchQuery }}' 검색 결과와 일치하는 도시가 없습니다.
      </p>
    </BaseDashboardCard>

    <!-- 지도 -->
    <BaseDashboardCard title="🗺️ 지도로 보기" v-if="!loading">
      <WeatherMap :cities="sortedList" :selected-id="selectedCityId" @select-city="selectCityById" />
    </BaseDashboardCard>

    <!-- 상태바 -->
    <el-alert class="status-bar" :title="statusMessage" type="info" :closable="false" center />
  </div>
</template>

<style scoped>
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
  box-sizing: border-box;
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
  0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.5); }
  70% { box-shadow: 0 0 0 7px rgba(46, 204, 113, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
}
.api-error {
  margin: 0 0 16px 0;
}

/* 부가 컨트롤 (slot으로 넘기는 내용이므로 부모 스코프에 둔다) */
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

/* TransitionGroup 애니메이션:
   WeatherCard의 루트 엘리먼트에는 부모 스코프 ID가 함께 붙으므로
   여기(부모)에서 전환 클래스를 정의해도 정상 적용된다. */
.card-list {
  position: relative;
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
  width: 100%;
}

.empty {
  text-align: center;
  color: var(--color-text);
  opacity: 0.7;
  font-size: 13px;
  padding: 10px 0;
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>
