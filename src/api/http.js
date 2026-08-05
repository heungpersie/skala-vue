import axios from 'axios'

import { staticMockAdapter } from './staticMockAdapter.js'
import { readItem } from './tokenStorage.js'

const accessTokenKey = 'jwt-lab-access-token'

// GitHub Pages는 Node Mock API 서버를 실행할 수 없으므로, static 빌드(.env.pages)와
// 그 외 프로덕션 빌드에서는 브라우저 Axios adapter로 Mock API를 대체합니다.
const isStaticMockMode =
  import.meta.env.VITE_API_MODE === 'static' ||
  (import.meta.env.PROD && import.meta.env.VITE_API_MODE !== 'server')

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000,
  ...(isStaticMockMode ? { adapter: staticMockAdapter } : {}),
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
  const accessToken = readItem(accessTokenKey)

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
        : isStaticMockMode
          ? '브라우저 Mock API를 초기화할 수 없습니다.'
          : 'Mock API에 연결할 수 없습니다. npm run dev를 확인하세요.')

    const normalizedError = new Error(message)
    normalizedError.status = error.response?.status

    return Promise.reject(normalizedError)
  },
)

export { accessTokenKey }

