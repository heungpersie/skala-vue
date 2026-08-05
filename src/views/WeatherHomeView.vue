<script setup>
/* ── [Router 실습 / 과제4] WeatherHomeView.vue ──
   route: '/weather-router'. WeatherParent.vue를 참고하여 작성한 메인 날씨 대시보드.
   Open-Meteo 실시간 API + 지도 연동은 work/Weather* 과제와 동일한 방식을 사용하고,
   여기서는 목록에 없는 도시를 검색해 직접 추가하는 기능까지 더한다.
   이 뷰는 Pinia store 없이 컴포저블(useWeatherCities)만으로 상태를 관리하는 버전이다 —
   온도 단위(섭씨/화씨) 설정을 Pinia configStore로 전역 관리하는 버전은 WeatherStoreHomeView.vue 참고. */
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import WeatherMap from '@/views/work/WeatherMap.vue'
import { useWeatherCities } from '@/composables/useWeatherCities'
import { searchCities } from '@/composables/useWeatherApi'

const router = useRouter()

/* ── 반응형 상태 + 날씨 데이터 배열 (Home/Detail 공유, Open-Meteo 실시간 API) ── */
const {
  cities: weatherList,
  loading,
  error: apiError,
  removedDefaultIds,
  loadCities,
  addCity,
  removeCity,
  restoreDefaultCities,
} = useWeatherCities()

onMounted(loadCities)

const restoring = ref(false)
const handleRestoreDefaults = async () => {
  restoring.value = true
  try {
    await restoreDefaultCities()
  } finally {
    restoring.value = false
  }
}

const searchQuery = ref('') // 검색어
const selectedCityInfo = ref(null) // 선택된 도시

const activeStatus = ref('전체')
const statusOptions = computed(() => ['전체', ...new Set(weatherList.value.map((c) => c.status))])

const sortOrder = ref('default')

/* ── 검색 도시 (computed 활용) ── */
const filteredWeatherList = computed(() => {
  let list = weatherList.value

  const q = searchQuery.value.trim()
  if (q) list = list.filter((city) => city.name.includes(q))

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

/* ── 상태 바 문구 ── */
const statusMessage = computed(() =>
  selectedCityInfo.value
    ? `${selectedCityInfo.value.name}이 선택되었습니다.`
    : '카드를 클릭하거나 검색해 보세요.',
)

// watch: 감시 대상(statusMessage)을 명시적으로 지정해, 값이 바뀔 때만 콜백을 실행한다.
// 콜백에서 변경 전/후 값을 모두 받을 수 있는 것이 watchEffect와의 가장 큰 차이다.
watch(statusMessage, (newMsg, oldMsg) => {
  console.log(`👁 [watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newMsg}" (이전: "${oldMsg}")`)
})

// watchEffect: 감시 대상을 따로 지정하지 않고, 콜백 내부에서 "참조하는" 모든 반응형 값
// (여기서는 searchQuery, filteredWeatherList)을 자동으로 추적한다. 등록 시점에 즉시 1회
// 실행되고, 이후 추적된 값이 바뀔 때마다 다시 실행된다.
watchEffect(() => {
  console.log(
    `🤖 [watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 데이터를 필터링합니다. (${filteredWeatherList.value.length}건)`,
  )
})

/* ── 자식 컴포넌트가 emit한 이벤트를 받는 핸들러 ── */
const handleUpdateQuery = (value) => {
  searchQuery.value = value
}

const selectCity = (city) => {
  selectedCityInfo.value = city
}

// [요구사항] window.alert() 제거, Programmatic Navigation으로 대체
const showDetail = (city) => {
  router.push('/weather/' + city.id)
}

const handleRemove = (id) => {
  if (selectedCityInfo.value?.id === id) selectedCityInfo.value = null
  removeCity(id)
}

// 지도 마커 클릭 -> 동일한 선택 로직 재사용
const selectedCityId = computed(() => selectedCityInfo.value?.id ?? null)
const selectCityById = (id) => {
  const city = weatherList.value.find((c) => c.id === id)
  if (city) selectCity(city)
}

/* ── [요구사항] 목록에 없는 도시를 검색해서 추가 ── */
const citySearchQuery = ref('')
const citySearchResults = ref([])
const citySearching = ref(false)
const citySearchError = ref('')

const searchForCity = async () => {
  const q = citySearchQuery.value.trim()
  if (!q) return
  citySearching.value = true
  citySearchError.value = ''
  try {
    citySearchResults.value = await searchCities(q)
    if (citySearchResults.value.length === 0) {
      citySearchError.value = '검색 결과가 없습니다.'
    }
  } catch {
    citySearchError.value = '도시 검색에 실패했습니다.'
  } finally {
    citySearching.value = false
  }
}

const addingCityId = ref('')
const handleAddCity = async (result) => {
  addingCityId.value = result.id
  try {
    await addCity(result)
    citySearchResults.value = citySearchResults.value.filter((r) => r.id !== result.id)
  } catch {
    citySearchError.value = '이미 추가된 도시이거나 날씨 조회에 실패했습니다.'
  } finally {
    addingCityId.value = ''
  }
}
</script>

<template>
  <div class="card-panel">
    <p class="panel-title">
      🌤️ 과제 4: 날씨 대시보드(라우터) <span class="live-dot" title="Open-Meteo 실시간 연동"></span>
    </p>
    <div class="link-row">
      <RouterLink to="/weather-router/about" class="about-link">ℹ️ 이 실습 소개</RouterLink>
      <RouterLink to="/weather-router/no-such-page" class="about-link">
        🚧 키키 보러가기 ->
      </RouterLink>
      <button
        v-if="removedDefaultIds.length > 0"
        class="restore-link"
        :disabled="restoring"
        @click="handleRestoreDefaults"
      >
        {{ restoring ? '복원 중...' : '↺ 삭제한 기본 도시 복원' }}
      </button>
    </div>
    <p v-if="apiError" class="api-error">
      ⚠️ 날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
    </p>

    <BaseDashboardCard title="🔍 도시 검색 (한글 즉시 동기화)">
      <SearchBar :query="searchQuery" @update-query="handleUpdateQuery" />
    </BaseDashboardCard>

    <BaseDashboardCard title="➕ 도시 추가 (목록에 없는 도시도 검색해서 추가)">
      <form class="add-city" @submit.prevent="searchForCity">
        <input v-model="citySearchQuery" type="text" placeholder="예: 도쿄, 뉴욕, 파리..." />
        <button type="submit" :disabled="citySearching">
          {{ citySearching ? '검색 중...' : '검색' }}
        </button>
      </form>

      <p v-if="citySearchError" class="add-city-error">{{ citySearchError }}</p>

      <ul v-if="citySearchResults.length" class="add-city-results">
        <li v-for="result in citySearchResults" :key="result.id">
          <span>{{ result.name }}</span>
          <button
            class="add-btn"
            :disabled="addingCityId === result.id"
            @click="handleAddCity(result)"
          >
            {{ addingCityId === result.id ? '추가 중...' : '+ 추가' }}
          </button>
        </li>
      </ul>
    </BaseDashboardCard>

    <BaseDashboardCard title="⚙️ 필터 & 정렬">
      <div class="controls">
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
    </BaseDashboardCard>

    <BaseDashboardCard title="📍 지역별 날씨 현황">
      <div v-if="loading" class="loading">날씨 불러오는 중...</div>

      <TransitionGroup v-else name="card-list" tag="div" class="card-list">
        <WeatherCard
          v-for="city in sortedList"
          :key="city.id"
          :city="city"
          :is-selected="selectedCityInfo?.id === city.id"
          @select-card="selectCity"
          @click-detail="showDetail"
          @remove="handleRemove"
        />
      </TransitionGroup>

      <p v-if="!loading && sortedList.length === 0" class="empty">
        '{{ searchQuery }}' 검색 결과와 일치하는 도시가 없습니다.
      </p>
    </BaseDashboardCard>

    <BaseDashboardCard title="🗺️ 지도로 보기" v-if="!loading">
      <WeatherMap
        :cities="sortedList"
        :selected-id="selectedCityId"
        @select-city="selectCityById"
      />
    </BaseDashboardCard>

    <div class="status-bar">{{ statusMessage }}</div>
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
  margin: 0 0 6px 0;
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
.link-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.about-link {
  font-size: 13px;
  color: var(--magpie-accent);
  text-decoration: none;
}
.about-link:hover {
  text-decoration: underline;
}
.restore-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  color: var(--color-text);
  opacity: 0.6;
  cursor: pointer;
}
.restore-link:hover:not(:disabled) {
  opacity: 0.9;
  text-decoration: underline;
}
.restore-link:disabled {
  cursor: default;
  opacity: 0.7;
}
.api-error {
  background: #fdecea;
  color: #c0392b;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  margin: 0 0 16px 0;
}

.add-city {
  display: flex;
  gap: 8px;
}
.add-city input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: var(--color-background);
  color: var(--color-text);
}
.add-city input:focus {
  border-color: var(--magpie-accent);
}
.add-city button {
  background: var(--magpie-gradient);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.add-city button:disabled {
  opacity: 0.6;
  cursor: default;
}
.add-city-error {
  margin: 10px 0 0 0;
  font-size: 13px;
  color: #c0392b;
}
.add-city-results {
  list-style: none;
  padding: 0;
  margin: 12px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.add-city-results li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text);
}
.add-btn {
  background: #eaf6ee;
  color: #2f8f52;
  border: 1px solid #bfe6cc;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.add-btn:disabled {
  opacity: 0.6;
  cursor: default;
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
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>
