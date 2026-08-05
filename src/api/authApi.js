import { http } from './http.js'

// Store가 Axios의 URL과 HTTP 메서드를 직접 관리하지 않도록 API 계층을 분리합니다.
// (Pinia store → authApi → http.js(Axios 인스턴스) 순으로 책임을 나눔)
export const authApi = {
  // 이메일/비밀번호로 로그인하고 accessToken과 사용자 정보를 받아옵니다.
  async login(credentials) {
    const response = await http.post('/auth/login', credentials)
    return response.data
  },

  // 신규 회원가입 요청을 보냅니다. (실제 서버 모드/정적 Mock 모드 모두 동일한 인터페이스)
  async register(payload) {
    const response = await http.post('/auth/register', payload)
    return response.data
  },

  // 저장된 Access Token으로 내 프로필을 조회합니다.
  // http.js의 요청 인터셉터가 Authorization 헤더를 자동으로 붙여주므로 여기선 신경 쓸 필요가 없습니다.
  async getMyProfile() {
    const response = await http.get('/auth/me')
    return response.data
  },
}

