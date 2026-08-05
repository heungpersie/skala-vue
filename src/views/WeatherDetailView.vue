<script setup>
/* ── [Router 실습 / 과제4] WeatherDetailView.vue ──
   route: '/weather/:cityId'. Router 동적 경로 매칭(:cityId)으로 전달받은 cityId를 기반으로
   Mount 시점에 공유 도시 목록(useWeatherCities, Open-Meteo 실시간 데이터)에서
   도시 객체를 선택해 상세 기상관측 정보를 보여준다.
   Home을 거치지 않고 이 주소로 직접 들어와도 동작하도록 loadCities()를 다시 호출한다
   (이미 로드되어 있으면 아무 일도 하지 않는다).
   이 뷰는 Pinia store 없이 컴포저블(useWeatherCities)만으로 상태를 관리하는 버전이다 —
   온도 단위(섭씨/화씨) 변환과 Pinia configStore가 추가된 버전은 WeatherStoreDetailView.vue 참고. */
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWeatherCities } from '@/composables/useWeatherCities'

const route = useRoute()
const router = useRouter()

// useWeatherCities()는 싱글턴 컴포저블 — Home 화면과 이 화면이 같은 반응형 상태(cities 등)를
// 공유한다. 그래서 Home에서 이미 불러온 목록이 있으면 다시 API를 부르지 않고 즉시 재사용된다.
const { cities, loading, loaded, error: apiError, loadCities } = useWeatherCities()

// onMounted: 컴포넌트가 DOM에 처음 마운트된 직후 한 번 실행되는 라이프사이클 훅.
// 이 주소(/weather/:cityId)로 바로 진입한 경우를 대비해 여기서도 도시 목록 로드를 보장한다.
onMounted(loadCities)

// route.params.cityId: URL의 동적 세그먼트(:cityId) 값을 useRoute()로 읽어와, 이미 불러온
// cities 배열에서 일치하는 도시 객체를 찾는다. computed이므로 cities나 params가 바뀌면 자동 재계산된다.
const city = computed(() => cities.value.find((c) => c.id === route.params.cityId) ?? null)
// 목록 로드가 끝났는데도(loaded && !loading) 일치하는 도시를 못 찾았다면 "존재하지 않는 cityId"로 판단한다.
const notFound = computed(() => loaded.value && !loading.value && !city.value)

const goHome = () => {
  router.push('/weather-router')
}
</script>

<template>
  <div class="card-panel">
    <div v-if="loading" class="loading">날씨 불러오는 중...</div>

    <template v-else-if="city">
      <p class="panel-title">
        📡 {{ city.name }} 상세 기상관측 정보 <span class="live-dot" title="Open-Meteo 실시간 연동"></span>
      </p>

      <p v-if="city.temp === null" class="not-found">
        ⚠️ 이 도시의 날씨 정보를 불러오지 못했습니다.
      </p>
      <div v-else class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">현재 상태</span>
          <span class="detail-value">{{ city.status }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">현재 기온</span>
          <span class="detail-value">{{ city.temp }}°C</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">체감 온도</span>
          <span class="detail-value">{{ city.feelsLike }}°C</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">습도</span>
          <span class="detail-value">{{ city.humidity }}%</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">풍속</span>
          <span class="detail-value">{{ city.windSpeed }}m/s</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">도시 코드</span>
          <span class="detail-value">{{ city.id }}</span>
        </div>
      </div>
    </template>

    <template v-else>
      <p v-if="apiError" class="not-found">⚠️ 날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
      <p v-else-if="notFound" class="not-found">
        '{{ route.params.cityId }}' 도시 정보를 찾을 수 없습니다.
      </p>
    </template>

    <button class="back-btn" @click="goHome">← 메인 대시보드로 돌아가기</button>
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
.loading {
  text-align: center;
  padding: 24px 0;
  color: var(--color-text);
  opacity: 0.7;
  font-size: 14px;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
.detail-item {
  background: var(--color-background-mute);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-label {
  font-size: 12px;
  color: var(--color-text);
  opacity: 0.7;
  font-weight: 600;
}
.detail-value {
  font-size: 18px;
  color: var(--color-heading);
  font-weight: 700;
}
.not-found {
  text-align: center;
  color: #c0392b;
  background: #fdecea;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 24px;
}
.back-btn {
  width: 100%;
  background: var(--magpie-gradient);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.back-btn:hover {
  filter: brightness(1.08);
}
</style>
