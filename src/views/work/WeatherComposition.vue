<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'

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

// 상세보기 -> 버블링 없이(@click.stop) alert
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="card-panel">
    <p class="panel-title">🌤️ 날씨 대시보드 (과제 1 + 2)</p>

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
            <div class="temp-line">현재 기온: {{ city.temp }}°C</div>

            <!-- [과제1-2] 조건부 렌더링 -->
            <span v-if="city.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
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

    <!-- 상태바 -->
    <div class="status-bar">{{ statusMessage }}</div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.card-panel {
  background: #fff;
  width: 100%;
  max-width: 640px;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(30, 60, 100, 0.12);
  padding: 28px;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}
.panel-title {
  font-size: 22px;
  font-weight: 700;
  color: #1c2b3a;
  margin: 0 0 20px 0;
}
.section {
  background: #f4f7fb;
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 16px;
}
.section-title {
  font-weight: 700;
  font-size: 15px;
  color: #2a3b4d;
  margin: 0 0 10px 0;
}
input[type='text'] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cdd9e5;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
}
input[type='text']:focus {
  border-color: #5b8def;
}
.search-status {
  margin-top: 8px;
  font-size: 13px;
  color: #6b7a89;
}
.search-status b {
  color: #24405c;
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

.weather-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;
  border: 1px solid transparent;
}
.weather-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}
.weather-card.selected {
  border-color: #5b8def;
}
.weather-info .city-line {
  font-weight: 700;
  font-size: 15px;
  color: #1c2b3a;
  margin-bottom: 4px;
}
.weather-info .temp-line {
  font-size: 13px;
  color: #5b6b7a;
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
  background: #5b9bef;
}
.badge.cold {
  background: #6b7cff;
}
.detail-btn {
  background: #fff;
  border: 1px solid #cdd9e5;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  color: #34495e;
  cursor: pointer;
  white-space: nowrap;
}
.detail-btn:hover {
  background: #eef3f9;
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
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>
