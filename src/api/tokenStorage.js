// 로그인 폼의 '로그인 상태 유지' 체크 여부에 따라 sessionStorage(탭 종료 시 삭제)와
// localStorage(브라우저를 닫아도 유지) 중 어디에 토큰을 저장할지 결정합니다.
const rememberMeKey = 'jwt-lab-remember-me'

export function isRememberMeEnabled() {
  return localStorage.getItem(rememberMeKey) === '1'
}

export function setRememberMe(enabled) {
  if (enabled) {
    localStorage.setItem(rememberMeKey, '1')
  } else {
    localStorage.removeItem(rememberMeKey)
  }
}

function activeStorage() {
  return isRememberMeEnabled() ? localStorage : sessionStorage
}

// 두 storage를 모두 확인해서, remember 여부가 바뀌기 전에 저장된 값도 놓치지 않습니다.
export function readItem(key) {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key)
}

export function writeItem(key, value) {
  sessionStorage.removeItem(key)
  localStorage.removeItem(key)
  activeStorage().setItem(key, value)
}

export function clearItem(key) {
  sessionStorage.removeItem(key)
  localStorage.removeItem(key)
}
