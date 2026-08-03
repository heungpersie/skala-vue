<script setup>
/* ── [과제3-1] WeatherParent.vue ──
   모든 반응형 데이터와 로직(watch / computed / 이벤트 처리)을 이 곳에서 유지한다.
   자식은 표시(props)와 알림(emits)만 담당한다. */
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

/* ── [과제1-1 / 과제2-1] 반응형 상태 + 날씨 데이터 배열 ── */
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 15, status: '천둥번개' },
  { id: 'city_02', name: '수원', temp: 5, status: '비' },
  { id: 'city_03', name: '부산', temp: 20, status: '구름' },
  { id: 'city_04', name: '탄천', temp: 30, status: '아주 맑음' },
  { id: 'city_05', name: '평택', temp: 25, status: '맑음' },
  { id: 'city_06', name: '건양', temp: -4, status: '눈' },
])

const searchQuery = ref('') // 검색어
const selectedCityInfo = ref(null) // 선택된 도시

/* ── 부가 기능 (과제 요구사항 외) ── */
const activeStatus = ref('전체')
const statusOptions = computed(() => ['전체', ...new Set(weatherList.value.map((c) => c.status))])

const sortOrder = ref('default')

const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 800))

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
  if (filteredWeatherList.value.length === 0) return null
  const sum = filteredWeatherList.value.reduce((acc, c) => acc + c.temp, 0)
  return (sum / filteredWeatherList.value.length).toFixed(1)
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

// WeatherCard → click-detail
const showDetail = (city) => {
  window.alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)
}
</script>

<template>
  <div class="card-panel">
    <p class="panel-title">🌤️ 과제 3: 날씨 (컴포넌트)</p>

    <!-- [과제3-2] 공통 카드에 SearchBar를 slot으로 주입 -->
    <BaseDashboardCard title="🔍 도시 검색 (한글 즉시 동기화)">
      <SearchBar :query="searchQuery" @update-query="handleUpdateQuery" />
    </BaseDashboardCard>

    <!-- 부가 컨트롤도 동일한 공통 카드 재사용 -->
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

    <!-- [과제3-2] 공통 카드에 날씨 현황 목록을 slot으로 주입 -->
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
        />
      </TransitionGroup>

      <!-- 검색어와 일치하는 데이터가 없을 때 -->
      <p v-if="!loading && sortedList.length === 0" class="empty">
        '{{ searchQuery }}' 검색 결과와 일치하는 도시가 없습니다.
      </p>
    </BaseDashboardCard>

    <!-- 상태바 -->
    <div class="status-bar">{{ statusMessage }}</div>
  </div>
</template>

<style scoped>
.card-panel {
  background: #fff;
  width: 100%;
  max-width: 640px;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(30, 60, 100, 0.12);
  padding: 28px;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  box-sizing: border-box;
}
.panel-title {
  font-size: 22px;
  font-weight: 700;
  color: #1c2b3a;
  margin: 0 0 20px 0;
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
  color: #45566a;
  min-width: 60px;
}
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  border: 1px solid #cdd9e5;
  background: #fff;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  color: #45566a;
  cursor: pointer;
}
.chip.active {
  background: #5b8def;
  border-color: #5b8def;
  color: #fff;
}
.sort-select {
  border: 1px solid #cdd9e5;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
  background: #fff;
  color: #34495e;
}
.avg-temp {
  font-size: 14px;
  font-weight: 700;
  color: #2f6fef;
}

.loading {
  text-align: center;
  padding: 24px 0;
  color: #8a97a5;
  font-size: 14px;
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

.status-bar {
  text-align: center;
  background: #e5f6ec;
  color: #2f8f52;
  font-size: 14px;
  font-weight: 600;
  padding: 12px;
  border-radius: 10px;
}
.empty {
  text-align: center;
  color: #8a97a5;
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
