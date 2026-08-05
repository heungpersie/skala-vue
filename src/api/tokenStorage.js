// 로그인 폼의 '로그인 상태 유지' 체크 여부에 따라 sessionStorage(탭 종료 시 삭제)와
// localStorage(브라우저를 닫아도 유지) 중 어디에 토큰을 저장할지 결정합니다.
const rememberMeKey = 'jwt-lab-remember-me'

// '로그인 상태 유지' 체크박스의 on/off 여부 자체는 항상 localStorage에 저장합니다.
// (이 플래그가 sessionStorage에 있으면 새 탭을 열 때마다 초기화되어 버리므로 의미가 없음)
export function isRememberMeEnabled() {
  return localStorage.getItem(rememberMeKey) === '1'
}

// 로그인 폼에서 '로그인 상태 유지' 체크박스를 토글할 때 호출합니다.
export function setRememberMe(enabled) {
  if (enabled) {
    localStorage.setItem(rememberMeKey, '1')
  } else {
    localStorage.removeItem(rememberMeKey)
  }
}

// remember me 여부에 따라 실제 토큰을 저장할 storage를 결정합니다.
function activeStorage() {
  return isRememberMeEnabled() ? localStorage : sessionStorage
}

// 두 storage를 모두 확인해서, remember 여부가 바뀌기 전에 저장된 값도 놓치지 않습니다.
export function readItem(key) {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key)
}

// 이전에 어느 storage에 저장했었는지 알 수 없으므로 두 곳을 모두 지운 뒤,
// remember me 설정에 맞는 storage 한 곳에만 새로 씁니다. (값이 두 곳에 중복 저장되는 것을 방지)
export function writeItem(key, value) {
  sessionStorage.removeItem(key)
  localStorage.removeItem(key)
  activeStorage().setItem(key, value)
}

// 로그아웃 시 로그인 상태 유지 여부와 상관없이 두 storage에서 모두 제거합니다.
export function clearItem(key) {
  sessionStorage.removeItem(key)
  localStorage.removeItem(key)
}
