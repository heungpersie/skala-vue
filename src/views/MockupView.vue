<script setup>
import { ref, computed } from 'vue'

// 1. 배열 렌더링용 날씨 데이터
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 15, status: '천둥번개' },
  { id: 'city_02', name: '수원', temp: 5, status: '비' },
  { id: 'city_03', name: '부산', temp: 20, status: '구름' },
  { id: 'city_04', name: '탄천', temp: 30, status: '아주 맑음' },
  { id: 'city_05', name: '평택', temp: 25, status: '맑음' },
  { id: 'city_06', name: '건양', temp: -4, status: '눈' },
])

// 3. 검색어 (양방향 바인딩 대상)
const searchQuery = ref('')

// 4. 선택된 도시 (이벤트로 갱신)
const selectedCity = ref('')

// 검색어로 필터링된 리스트
const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return weatherList.value
  return weatherList.value.filter((city) =>
    city.name.includes(searchQuery.value.trim())
  )
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

    <!-- 3. 도시 검색 (양방향 바인딩 + 한글 처리) -->
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

    <!-- 1. 배열 렌더링 (v-for) + 2. 조건부 렌더링 (v-i) -->
    <div class="section">
      <p class="section-title">📍 지역별 날씨 현황</p>

      <div
        v-for="city in filteredList"
        :key="city.id"
        class="weather-card"
        :class="{ selected: selectedCity === city.name }"
        @click="selectCity(city.name)"
      >
        <div class="weather-info">
          <div class="city-line">{{ city.name }} ({{ city.status }})</div>
          <div class="temp-line">현재 기온: {{ city.temp }}°C</div>
          <span v-if="city.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
          <span v-else-if="city.temp >= 10" class="badge cool">❄️ 선선함 (25도 미만)</span>
          <span v-else class="badge cold">🧊 추움 (10도 미만)</span>

        </div>

        <!-- 4. 이벤트 수식어: 버블링 없이(.stop) 상세보기 -->
        <button class="detail-btn" @click.stop="showDetail(city.name, city.status)">
          상세보기
        </button>
      </div>

      <p v-if="filteredList.length === 0" class="empty">검색 결과가 없습니다.</p>
    </div>

    <!-- 4. 카드 클릭 시 상태바 표시 -->
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
.weather-card:last-child { margin-bottom: 0; }
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
.badge.hot { background: #ef5b5b; }
.badge.cool { background: #5b9bef; }
.badge.cold { background: #6b7cff;}
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