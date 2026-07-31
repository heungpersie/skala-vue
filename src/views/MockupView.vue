<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 1. 배열 렌더링용 날씨 데이터
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 15, status: '천둥번개' },
  { id: 'city_02', name: '수원', temp: 5, status: '비' },
  { id: 'city_03', name: '부산', temp: 20, status: '구름' },
  { id: 'city_04', name: '탄천', temp: 30, status: '아주 맑음' },
  { id: 'city_05', name: '평택', temp: 25, status: '맑음' },
  { id: 'city_06', name: '건양', temp: -4, status: '눈' },
])

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

// ---------- 로딩 흉내 ----------
const loading = ref(true)
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 800)
})

// ---------- 선택된 도시 ----------
const selectedCity = ref('')

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

// 평균 기온 (필터링된 리스트 기준)
const averageTemp = computed(() => {
  if (filteredList.value.length === 0) return null
  const sum = filteredList.value.reduce((acc, c) => acc + c.temp, 0)
  return (sum / filteredList.value.length).toFixed(1)
})

// 최고 / 최저 기온 도시 (필터링된 리스트 기준, 동률이면 첫 번째)
const maxTempCity = computed(() => {
  if (filteredList.value.length === 0) return null
  return filteredList.value.reduce((a, b) => (b.temp > a.temp ? b : a))
})
const minTempCity = computed(() => {
  if (filteredList.value.length === 0) return null
  return filteredList.value.reduce((a, b) => (b.temp < a.temp ? b : a))
})

// 카드 클릭 -> 상태바에 표시
const selectCity = (cityName) => {
  selectedCity.value = cityName
}

// 상세보기 클릭 (버블링 방지: @click.stop)
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="card-panel">
    <p class="panel-title">🌤️ 과제 1: 날씨 (Mockup)</p>

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
            <div class="temp-line">현재 기온: {{ city.temp }}°C</div>

            <span v-if="city.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
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

    <!-- 상태바 -->
    <div class="status-bar">
      {{ selectedCity ? `${selectedCity}이 선택되었습니다.` : '카드를 클릭하거나 검색해 보세요.' }}
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.card-panel {
  background: #fff;
  width: 100%;
  max-width: 640px;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(30, 60, 100, 0.12);
  padding: 28px;
  font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
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
input[type="text"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cdd9e5;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
}
input[type="text"]:focus {
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

/* 로딩 */
.loading {
  text-align: center;
  padding: 24px 0;
  color: #8a97a5;
  font-size: 14px;
}

/* 카드 */
.weather-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
  border: 1px solid transparent;
}
.weather-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.10);
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
  display: flex;
  align-items: center;
  gap: 6px;
}
.mark { font-size: 13px; }
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
.badge.hot { background: #ef5b5b; }
.badge.cool { background: #5b9bef; }
.badge.cold { background: #6b7cff; }
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
</style>