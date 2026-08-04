<script setup>
import { ref } from 'vue'
import axios from 'axios'

const weatherData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const API_KEY = '932ca7604324101f9197901123c3b625'

// 현재 위치 가져오기
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    // 브라우저가 위치 기능을 지원하는지 확인
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저에서는 위치 정보를 사용할 수 없습니다.'))
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude

        console.log('현재 위치:', lat, lon)

        resolve({ lat, lon })
      },
      (error) => {
        reject(error)
      },
    )
  })
}

// 날씨 데이터 가져오기
const handleFetchWeather = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // 1. 현재 위치 가져오기
    const { lat, lon } = await getCurrentLocation()

    // 2. OpenWeather API 요청
    const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`

    const response = await axios.get(URL)

    console.log('Axios 응답 전체:', response)
    console.log('날씨 데이터:', response.data)

    weatherData.value = response.data
  } catch (error) {
    console.error('오류 발생:', error)

    if (error.code === 1) {
      errorMessage.value = '위치 권한을 허용해주세요.'
    } else {
      errorMessage.value = '날씨 데이터를 가져오지 못했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="practice-section">
    <h2>⚡ 내 위치 실시간 날씨 조회</h2>

    <button @click="handleFetchWeather" :disabled="isLoading">
      {{ isLoading ? '위치 확인 및 데이터 로딩 중...' : '현재 위치 날씨 가져오기' }}
    </button>

    <!-- 에러 출력 -->
    <p v-if="errorMessage">❌ {{ errorMessage }}</p>

    <!-- 날씨 출력 -->
    <div v-if="weatherData" class="result-card">
      <p>
        📍 위치:
        <strong>{{ weatherData.name }}</strong>
      </p>

      <p>
        🌡️ 현재 기온:
        <strong>{{ weatherData.main.temp }}°C</strong>
      </p>

      <p>
        ☁️ 날씨:
        <strong>{{ weatherData.weather[0].description }}</strong>
      </p>

      <p>
        💧 습도:
        <strong>{{ weatherData.main.humidity }}%</strong>
      </p>

      <p>
        🌬️ 풍속:
        <strong>{{ weatherData.wind.speed }} m/s</strong>
      </p>
    </div>
  </div>
</template>
