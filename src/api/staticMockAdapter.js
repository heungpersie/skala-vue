// GitHub Pages는 Node Mock API 서버를 실행할 수 없으므로, 프로덕션 빌드에서는
// mock-api/routes/authRoutes.js와 동일한 로직을 브라우저 Axios adapter로 재구현합니다.
const jwtSecret = 'mock-secret-for-classroom-only'
const tokenTtlSeconds = 15 * 60

const mockUsers = [
  {
    id: 1,
    email: 'student@skala.com',
    password: '1234',
    name: 'SKALA 수강생',
    role: 'STUDENT',
    department: 'Frontend Class',
  },
  {
    id: 2,
    email: 'admin@skala.com',
    password: 'admin1234',
    name: '실습 관리자',
    role: 'ADMIN',
    department: 'Training Center',
  },
]

// 응답으로 내보내기 전에 비밀번호 필드를 제거합니다. (실제 서버 mock-api/routes/authRoutes.js와 동일한 규칙)
function toPublicUser(user) {
  const { password: _password, ...publicUser } = user
  return publicUser
}

// JWT는 표준 Base64가 아니라 URL-safe Base64(+/ 대신 -_, 패딩 = 제거)를 사용하므로
// 브라우저 내장 btoa/atob 결과를 JWT 규격에 맞게 변환해줍니다.
function base64UrlEncode(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function base64UrlDecode(value) {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

// JSON 객체를 JWT의 header/payload 세그먼트 형식(URL-safe Base64 문자열)으로 인코딩합니다.
function encodeJson(value) {
  return base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)))
}

// Web Crypto의 HMAC 서명 키는 매번 새로 만들지 않고, 최초 1회 생성해 재사용합니다.
// (import는 비동기이므로 Promise 자체를 캐시해서 동시에 여러 요청이 와도 키를 한 번만 생성)
let signingKeyPromise = null
function getSigningKey() {
  signingKeyPromise ??= crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(jwtSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
  return signingKeyPromise
}

// Axios 에러 객체처럼 error.status를 함께 담아, 아래 reject()에서 그대로 HTTP status로 사용합니다.
function createAuthError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

// 실제 백엔드가 발급하는 것과 같은 형식의 JWT(HS256 서명)를 브라우저에서 직접 생성합니다.
// header.payload를 만들고 HMAC-SHA256으로 서명해 header.payload.signature 형태로 이어붙입니다.
async function createAccessToken(user) {
  const issuedAt = Math.floor(Date.now() / 1000)
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    iat: issuedAt,
    exp: issuedAt + tokenTtlSeconds, // 만료 시각(초 단위 Unix time) — 15분 뒤 만료
    iss: 'vue-pinia-jwt-mock-api',
  }

  const unsignedToken = `${encodeJson(header)}.${encodeJson(payload)}`
  const key = await getSigningKey()
  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(unsignedToken),
  )

  return `${unsignedToken}.${base64UrlEncode(new Uint8Array(signatureBytes))}`
}

// 요청에 담긴 Access Token의 서명과 만료 여부를 검증하고, 유효하면 payload(사용자 정보)를 반환합니다.
async function verifyAccessToken(token) {
  const segments = token.split('.')
  if (segments.length !== 3) {
    throw createAuthError(401, '올바른 JWT 형식이 아닙니다.')
  }

  const [encodedHeader, encodedPayload, receivedSignature] = segments
  const unsignedToken = `${encodedHeader}.${encodedPayload}`
  const key = await getSigningKey()
  // 서명을 다시 계산하지 않고 crypto.subtle.verify로 직접 검증 — 토큰 위변조 여부를 확인합니다.
  const signatureValid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlDecode(receivedSignature),
    new TextEncoder().encode(unsignedToken),
  )

  if (!signatureValid) {
    throw createAuthError(401, 'JWT 서명이 올바르지 않습니다.')
  }

  let payload
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload)))
  } catch {
    throw createAuthError(401, 'JWT Payload를 해석할 수 없습니다.')
  }

  // exp(만료 시각)가 현재 시각보다 이전이면 만료된 토큰으로 간주합니다.
  const now = Math.floor(Date.now() / 1000)
  if (!payload.exp || payload.exp <= now) {
    throw createAuthError(401, 'Access Token이 만료되었습니다.')
  }

  return payload
}

// 인증이 필요한 라우트(/auth/me, /auth/protected-message)에서 공통으로 사용하는 헬퍼.
// Authorization 헤더에서 Bearer 토큰을 꺼내 검증하고, 해당 사용자 정보를 돌려줍니다.
async function authenticateRequest(config) {
  const authorization = config.headers?.Authorization ?? config.headers?.authorization ?? ''
  const [tokenType, token] = String(authorization).split(' ')

  if (tokenType !== 'Bearer' || !token) {
    throw createAuthError(401, 'Bearer Access Token이 필요합니다.')
  }

  const payload = await verifyAccessToken(token)
  const user = mockUsers.find((item) => String(item.id) === payload.sub)

  if (!user) {
    throw createAuthError(401, '토큰의 사용자를 찾을 수 없습니다.')
  }

  return toPublicUser(user)
}

function statusText(status) {
  return (
    {
      200: 'OK',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      404: 'Not Found',
      409: 'Conflict',
    }[status] ?? 'OK'
  )
}

// 실제 Axios 응답 객체와 동일한 모양(shape)으로 성공 응답을 만들어줍니다.
// (인터셉터/호출부가 axios 응답이라고 믿고 response.data 등을 그대로 사용할 수 있도록)
function response(config, status, data) {
  return {
    data,
    status,
    statusText: statusText(status),
    headers: {
      'content-type': 'application/json',
      'x-mock-runtime': 'browser',
    },
    config,
    request: null,
  }
}

// 실제 Axios가 던지는 에러(error.response 포함)와 동일한 모양으로 실패를 표현합니다.
// http.js의 응답 인터셉터는 이 error.response.data.message를 그대로 사용자에게 보여줍니다.
function reject(config, status, message) {
  const error = new Error(message)
  error.config = config
  error.response = response(config, status, { message })
  return Promise.reject(error)
}

// Axios config.data는 문자열(JSON)일 수도, 이미 파싱된 객체일 수도 있어 두 경우를 모두 처리합니다.
function parseBody(config) {
  if (config.data === null || config.data === undefined || config.data === '') return {}
  if (typeof config.data === 'object') return config.data

  try {
    return JSON.parse(config.data)
  } catch {
    return null
  }
}

// Axios의 커스텀 adapter입니다. http.js에서 isStaticMockMode일 때 이 함수가 실제 네트워크 요청
// 대신 실행되어, method + pathname을 보고 알맞은 mock 응답(또는 에러)을 반환합니다.
// (실제 서버 없이도 로그인/회원가입/내 정보 조회 API를 그대로 흉내 냄)
export async function staticMockAdapter(config) {
  const method = (config.method ?? 'get').toUpperCase()
  // config.url은 '/auth/login' 같은 상대 경로라 URL 생성자에 넣으려면 임의의 base가 필요합니다.
  const url = new URL(config.url ?? '/', 'https://browser-mock.invalid')
  const pathname = url.pathname.replace(/^\/api(?=\/|$)/, '') || '/'

  try {
    if (method === 'POST' && pathname === '/auth/register') {
      const body = parseBody(config)
      if (!body) return reject(config, 400, '올바른 JSON 형식이 아닙니다.')

      const name = body.name?.trim()
      const email = body.email?.trim().toLowerCase()
      const password = body.password

      if (!name || !email || !password) {
        return reject(config, 400, '이름, 이메일, 비밀번호를 모두 입력해주세요.')
      }

      if (password.length < 4) {
        return reject(config, 400, '비밀번호는 4자 이상이어야 합니다.')
      }

      if (mockUsers.some((item) => item.email === email)) {
        return reject(config, 409, '이미 가입된 이메일입니다.')
      }

      const newUser = {
        id: Math.max(...mockUsers.map((item) => item.id)) + 1,
        email,
        password,
        name,
        role: 'STUDENT',
        department: '자기주도 실습',
      }

      // 브라우저 탭 메모리에만 저장되므로 새로고침하면 초기화됩니다.
      mockUsers.push(newUser)

      return response(config, 201, {
        message: '회원가입이 완료되었습니다. 로그인해주세요.',
        user: toPublicUser(newUser),
      })
    }

    if (method === 'POST' && pathname === '/auth/login') {
      const body = parseBody(config)
      if (!body) return reject(config, 400, '올바른 JSON 형식이 아닙니다.')

      const email = body.email?.trim().toLowerCase()
      const password = body.password

      if (!email || !password) {
        return reject(config, 400, '이메일과 비밀번호를 입력해주세요.')
      }

      const user = mockUsers.find(
        (item) => item.email === email && item.password === password,
      )

      if (!user) {
        return reject(config, 401, '이메일 또는 비밀번호가 올바르지 않습니다.')
      }

      const accessToken = await createAccessToken(user)

      return response(config, 200, {
        message: '로그인에 성공했습니다.',
        tokenType: 'Bearer',
        accessToken,
        expiresIn: tokenTtlSeconds,
        user: toPublicUser(user),
      })
    }

    if (method === 'GET' && pathname === '/auth/me') {
      const user = await authenticateRequest(config)
      return response(config, 200, user)
    }

    if (method === 'GET' && pathname === '/auth/protected-message') {
      const user = await authenticateRequest(config)
      return response(config, 200, {
        message: `${user.name}님, JWT 인증이 필요한 API 호출에 성공했습니다.`,
        role: user.role,
        requestedAt: new Date().toISOString(),
      })
    }

    return reject(config, 404, '존재하지 않는 브라우저 Mock API 경로입니다.')
  } catch (error) {
    return reject(config, error.status ?? 500, error.message)
  }
}
