<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, Message } from '@element-plus/icons-vue'

import { isRememberMeEnabled } from '@/api/tokenStorage.js'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const formRef = ref()

const credentials = reactive({
  email: '',
  password: '',
})

// 회원가입 직후 넘어온 경우 방금 만든 이메일을 채워주고, 비밀번호는 직접 입력하게 비워둡니다.
if (typeof route.query.email === 'string') {
  credentials.email = route.query.email
}

const justRegistered = route.query.registered === '1'
const rememberMe = ref(isRememberMeEnabled())

const loginMode = ref('normal')

const mockAccounts = [
  {
    email: 'student@skala.com',
    password: '1234',
    name: 'SKALA 수강생',
    roleLabel: '수강생',
  },
  {
    email: 'admin@skala.com',
    password: 'admin1234',
    name: '실습 관리자',
    roleLabel: '관리자',
  },
]

const rules = {
  email: [
    { required: true, message: '이메일을 입력해주세요.', trigger: 'blur' },
    { type: 'email', message: '올바른 이메일 형식이 아닙니다.', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: '비밀번호를 입력해주세요.', trigger: 'blur' },
    { min: 4, message: '비밀번호는 4자 이상이어야 합니다.', trigger: 'blur' },
  ],
}

// ── 로그인 실패 횟수 잠금: 무차별 대입 공격을 막는 흔한 UX 패턴입니다. ──
const MAX_ATTEMPTS = 5
const LOCKOUT_SECONDS = 20

const failedAttempts = ref(0)
const lockoutRemaining = ref(0)
let lockoutTimer = null

const isLockedOut = computed(() => lockoutRemaining.value > 0)
const attemptsLeft = computed(() => Math.max(MAX_ATTEMPTS - failedAttempts.value, 0))

function startLockout() {
  lockoutRemaining.value = LOCKOUT_SECONDS

  lockoutTimer = setInterval(() => {
    lockoutRemaining.value -= 1

    if (lockoutRemaining.value <= 0) {
      clearInterval(lockoutTimer)
      lockoutTimer = null
      failedAttempts.value = 0
    }
  }, 1000)
}

onBeforeUnmount(() => {
  if (lockoutTimer) clearInterval(lockoutTimer)
})

const loginErrorText = computed(() => {
  if (!authStore.errorMessage) return ''
  if (failedAttempts.value > 0 && attemptsLeft.value > 0) {
    return `${authStore.errorMessage} (남은 시도 ${attemptsLeft.value}회)`
  }
  return authStore.errorMessage
})

async function submitLogin() {
  if (isLockedOut.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const succeeded = await authStore.login(
    credentials.email,
    credentials.password,
    rememberMe.value,
  )

  if (succeeded) {
    failedAttempts.value = 0
    ElMessage.success('로그인되었습니다.')

    // 보호 페이지에서 로그인 화면으로 이동했다면 원래 목적지로 돌아갑니다.
    const redirect =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : '/dashboard'

    await router.replace(redirect)
    return
  }

  failedAttempts.value += 1
  if (failedAttempts.value >= MAX_ATTEMPTS) startLockout()
}

async function loginWithMockAccount(account) {
  const succeeded = await authStore.login(account.email, account.password, rememberMe.value)
  if (!succeeded) return

  ElMessage.success(`${account.name} 계정으로 로그인되었습니다.`)

  const redirect =
    typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'

  await router.replace(redirect)
}
</script>

<template>
  <section class="login-page">
    <div class="intro-panel">
      <div class="eyebrow">SKALA VUE</div>
      <h1>날씨, 까치 이야기,<br />영화 기록까지 한 곳에서</h1>
      <p>
        로그인하면 즐겨찾는 도시의 날씨와 저장한 영화 목록을 이어서 확인하고,
        나만의 대시보드를 바로 열어볼 수 있어요.
      </p>

      <ul class="feature-list">
        <li>
          <span>🌤️</span>
          <div>
            <strong>날씨 알려주는 까치</strong>
            <small>관심 도시를 등록하고 실시간 날씨를 확인하세요</small>
          </div>
        </li>
        <li>
          <span>🐦‍⬛</span>
          <div>
            <strong>흥부와 까치</strong>
            <small>까치를 치료하고 오늘의 소식을 받아보세요</small>
          </div>
        </li>
        <li>
          <span>🎬</span>
          <div>
            <strong>영화 기록</strong>
            <small>본 영화를 검색하고 평점과 함께 저장하세요</small>
          </div>
        </li>
        <li>
          <span>📚</span>
          <div>
            <strong>까치의 서재</strong>
            <small>관심 있는 책을 검색하고 저장하세요 그리고 추천 받으세요</small>
          </div>
        </li>
      </ul>
    </div>

    <div class="login-card-wrap">
      <el-card class="login-card" shadow="hover">
        <div class="login-card__header">
          <h2>로그인</h2>
          <p>계정 정보를 입력해 주세요.</p>
        </div>

        <el-alert
          v-if="justRegistered"
          class="registered-banner"
          title="회원가입이 완료되었습니다. 비밀번호를 입력해 로그인해보세요."
          type="success"
          show-icon
          :closable="false"
        />

        <div class="mode-toggle" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="loginMode === 'normal'"
            :class="{ active: loginMode === 'normal' }"
            @click="loginMode = 'normal'"
          >
            일반 로그인
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="loginMode === 'mock'"
            :class="{ active: loginMode === 'mock' }"
            @click="loginMode = 'mock'"
          >
            테스트 계정으로 체험
          </button>
        </div>

        <el-form
          v-if="loginMode === 'normal'"
          ref="formRef"
          class="login-form"
          label-position="top"
          :model="credentials"
          :rules="rules"
          @submit.prevent="submitLogin"
        >
          <el-form-item label="이메일" prop="email">
            <el-input
              v-model.trim="credentials.email"
              type="email"
              :prefix-icon="Message"
              autocomplete="username"
              placeholder="you@example.com"
            />
          </el-form-item>

          <el-form-item label="비밀번호" prop="password">
            <el-input
              v-model="credentials.password"
              type="password"
              :prefix-icon="Lock"
              autocomplete="current-password"
              show-password
              placeholder="비밀번호"
            />
          </el-form-item>

          <div class="form-row">
            <el-checkbox v-model="rememberMe">로그인 상태 유지</el-checkbox>
          </div>

          <el-alert
            v-if="isLockedOut"
            class="lockout-alert"
            :title="`로그인 시도가 너무 많습니다. ${lockoutRemaining}초 후 다시 시도해주세요.`"
            type="warning"
            show-icon
            :closable="false"
          />
          <el-alert
            v-else-if="authStore.errorMessage"
            class="error-message"
            :title="loginErrorText"
            type="error"
            show-icon
            :closable="false"
          />

          <el-button
            class="primary-button"
            type="primary"
            native-type="submit"
            :loading="authStore.isLoading"
            :disabled="isLockedOut"
          >
            {{ authStore.isLoading ? '로그인 중…' : '로그인' }}
          </el-button>
        </el-form>

        <div v-else class="mock-login">
          <p class="mock-login__hint">
            가입 없이 테스트 계정으로 바로 둘러볼 수 있어요.
          </p>

          <div class="mock-account" v-for="account in mockAccounts" :key="account.email">
            <div class="mock-account__avatar">{{ account.name.slice(0, 1) }}</div>
            <div class="mock-account__info">
              <strong>{{ account.name }}</strong>
              <small>{{ account.email }}</small>
            </div>
            <el-tag size="small" :type="account.roleLabel === '관리자' ? 'warning' : 'success'">
              {{ account.roleLabel }}
            </el-tag>
            <el-button
              size="small"
              type="primary"
              :loading="authStore.isLoading"
              @click="loginWithMockAccount(account)"
            >
              시작하기
            </el-button>
          </div>

          <el-alert
            v-if="authStore.errorMessage"
            class="error-message"
            :title="authStore.errorMessage"
            type="error"
            show-icon
            :closable="false"
          />
        </div>

        <div class="signup-link">
          계정이 없으신가요?
          <RouterLink to="/signup">회원가입</RouterLink>
        </div>
      </el-card>
    </div>
  </section>
</template>

<style scoped>
.login-page {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: start;
  gap: 2.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.eyebrow {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--magpie-accent);
  margin-bottom: 0.75rem;
}

.intro-panel h1 {
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  line-height: 1.3;
  color: var(--color-heading);
  margin-bottom: 0.9rem;
}

.intro-panel > p {
  color: var(--color-text);
  opacity: 0.85;
  line-height: 1.75;
  max-width: 480px;
}

.feature-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 0;
  margin: 1.75rem 0 0;
}

.feature-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.feature-list li > span {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--magpie-accent-soft);
  font-size: 1.2rem;
}

.feature-list li > div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-top: 0.3rem;
}

.feature-list strong {
  color: var(--color-heading);
  font-size: 0.92rem;
}

.feature-list small {
  color: var(--color-text);
  opacity: 0.7;
  font-size: 0.8rem;
}

.login-card-wrap {
  display: flex;
  justify-content: center;
}

.login-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  border-radius: 18px;
  animation: card-in 0.35s ease-out;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--magpie-gradient);
  z-index: 1;
}

.login-card__header {
  margin-bottom: 1.3rem;
}

.login-card__header h2 {
  font-size: 1.3rem;
  color: var(--color-heading);
  margin-bottom: 0.3rem;
}

.login-card__header p {
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.7;
}

.registered-banner {
  margin-bottom: 1.1rem;
}

.mode-toggle {
  display: flex;
  gap: 0.35rem;
  padding: 0.3rem;
  margin-bottom: 1.3rem;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 999px;
}

.mode-toggle button {
  flex: 1;
  padding: 0.45rem 0.6rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--color-text);
  opacity: 0.7;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    opacity 0.18s ease;
}

.mode-toggle button:hover {
  opacity: 1;
}

.mode-toggle button.active {
  background: var(--magpie-gradient);
  color: #fff;
  opacity: 1;
}

.mock-login__hint {
  font-size: 0.82rem;
  color: var(--color-text);
  opacity: 0.75;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.mock-account {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  margin-bottom: 0.75rem;
}

.mock-account__avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--magpie-gradient);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
}

.mock-account__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.mock-account__info strong {
  font-size: 0.85rem;
  color: var(--color-heading);
}

.mock-account__info small {
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.65;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 1.1rem;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.lockout-alert,
.error-message {
  margin-bottom: 1.1rem;
}

.primary-button {
  width: 100%;
  background: var(--magpie-gradient);
  border: none;
  box-shadow: 0 6px 16px var(--magpie-accent-strong);
}

.primary-button:hover {
  filter: brightness(1.08);
}

.primary-button.is-disabled {
  opacity: 0.6;
  box-shadow: none;
}

.signup-link {
  margin-top: 1.1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.85;
}

.signup-link a {
  color: var(--magpie-accent);
  font-weight: 600;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 860px) {
  .login-page {
    grid-template-columns: 1fr;
  }
}
</style>
