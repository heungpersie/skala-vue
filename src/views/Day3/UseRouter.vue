<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const handleGoHome = () => {
  router.push('/')
}
const handleLoginRedirect = () => {
  router.replace('/')
}
const handleAdvancedMove = () => {
  router.push({
    name: 'WeatherDetail', // 라우터 설정에 등록된 고유 Name 호출
    params: { cityId: 'city_02' }, // 주소창 :cityId 구역에 변수 매핑
    query: { search: '수원' }, // 주소창 뒤에 ?search=수원 쿼리 추가
  })
}
const handleGoBack = () => {
  router.go(-1) // 💡 1단계 이전 주소 기록으로 Back
}
</script>
<template>
  <button @click="handleGoHome">일반 홈 이동 (push)</button>
  <button @click="handleLoginRedirect">인증 만료! 강제 리다이렉트 (replace)</button>
  <button @click="handleAdvancedMove">고급 파라미터 이동</button>
  <button @click="handleGoBack">이전 화면으로</button>
</template>
