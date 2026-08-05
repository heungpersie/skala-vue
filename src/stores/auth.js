// [JWT 인증 실습] 로그인 상태(Access Token + 사용자 정보)를 앱 전역에서 공유하는 Pinia 스토어.
// 로그인/로그아웃 처리와 storage(local/session) 동기화를 이 한 곳에서 관리해,
// 컴포넌트들은 authStore.isLoggedIn / authStore.user만 보고 UI를 그리면 된다.
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { authApi } from '@/api/authApi.js'
import { accessTokenKey } from '@/api/http.js'
import { clearItem, readItem, setRememberMe, writeItem } from '@/api/tokenStorage.js'

const userStorageKey = 'jwt-lab-user'

// storage에 저장된 사용자 정보를 초기 state로 복원한다. 값이 없거나(JSON.parse(null) 실패)
// 손상된 경우에도 앱이 죽지 않도록 try/catch로 안전하게 null을 반환한다.
function readStoredUser() {
  try {
    return JSON.parse(readItem(userStorageKey))
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  // 새로고침해도 같은 브라우저 탭에서는 로그인 상태를 유지합니다.
  const accessToken = ref(readItem(accessTokenKey))
  const user = ref(readStoredUser())

  const isLoading = ref(false)
  const errorMessage = ref('')

  // state에서 계산되는 Pinia getter 역할의 computed 값입니다.
  const isLoggedIn = computed(() => Boolean(accessToken.value && user.value))
  const statusMessage = computed(() =>
    isLoggedIn.value
      ? `${user.value.name}님이 로그인했습니다.`
      : '로그인이 필요합니다.',
  )

  // 로그인 성공 시 state와 storage(local/session)를 함께 갱신하는 내부 헬퍼.
  // state만 바꾸면 새로고침 시 로그인 정보가 사라지므로 반드시 storage에도 반영한다.
  function saveAuthentication(loginResponse) {
    accessToken.value = loginResponse.accessToken
    user.value = loginResponse.user

    writeItem(accessTokenKey, loginResponse.accessToken)
    writeItem(userStorageKey, JSON.stringify(loginResponse.user))
  }

  // 로그아웃/인증 실패 시 state와 storage를 모두 비우는 내부 헬퍼.
  function clearAuthentication() {
    accessToken.value = null
    user.value = null

    clearItem(accessTokenKey)
    clearItem(userStorageKey)
  }

  /**
   * POST /auth/login을 호출하고 응답받은 토큰과 프로필을 Store에 저장합니다.
   * rememberMe가 true면 브라우저를 닫아도 로그인이 유지되도록 localStorage에 저장합니다.
   */
  async function login(email, password, rememberMe = false) {
    isLoading.value = true
    errorMessage.value = ''
    setRememberMe(rememberMe)

    try {
      const result = await authApi.login({ email, password })
      saveAuthentication(result)
      return true
    } catch (error) {
      clearAuthentication()
      errorMessage.value = error.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Axios 인터셉터가 토큰을 자동 첨부하는지 /auth/me 호출로 검증합니다.
   */
  async function fetchMyProfile() {
    try {
      const profile = await authApi.getMyProfile()
      user.value = profile
      writeItem(userStorageKey, JSON.stringify(profile))
      return profile
    } catch (error) {
      // 서버가 토큰을 거부하면 남아 있는 잘못된 인증 정보를 제거합니다.
      if (error.status === 401) clearAuthentication()
      throw error
    }
  }

  function logout() {
    clearAuthentication()
    errorMessage.value = ''
  }

  return {
    accessToken,
    user,
    isLoading,
    errorMessage,
    isLoggedIn,
    statusMessage,
    login,
    logout,
    fetchMyProfile,
  }
})

