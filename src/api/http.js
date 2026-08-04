import axios from 'axios'

const accessTokenKey = 'jwt-lab-access-token'

export const http = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'X-Lab-Client': 'vue-pinia-jwt-sample',
  },
})

/**
 * 모든 API 요청 직전에 실행되는 Axios 요청 인터셉터입니다.
 * 저장된 토큰이 있으면 Authorization: Bearer ... 헤더를 자동으로 추가합니다.
 */
http.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem(accessTokenKey)

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

// 서버 오류 응답에서 사용자에게 보여줄 메시지만 꺼내 Error로 통일합니다.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'API 응답 시간이 초과되었습니다.'
        : 'Mock API에 연결할 수 없습니다. npm run dev:all을 확인하세요.')

    const normalizedError = new Error(message)
    normalizedError.status = error.response?.status

    return Promise.reject(normalizedError)
  },
)

export { accessTokenKey }

