<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import FlowSteps from '@/mockcomponents/FlowSteps.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// 실행하자마자 테스트할 수 있도록 수강생 계정을 기본값으로 채웁니다.
const credentials = reactive({
  email: 'student@skala.com',
  password: '1234',
})

async function submitLogin() {
  const succeeded = await authStore.login(
    credentials.email,
    credentials.password,
  )

  if (succeeded) {
    // 보호 페이지에서 로그인 화면으로 이동했다면 원래 목적지로 돌아갑니다.
    const redirect =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : '/dashboard'

    await router.replace(redirect)
  }
}

function useAccount(type) {
  if (type === 'admin') {
    credentials.email = 'admin@skala.com'
    credentials.password = 'admin1234'
    return
  }

  credentials.email = 'student@skala.com'
  credentials.password = '1234'
}
</script>

<template>
  <section class="login-page">
    <div class="intro-panel">
      <div class="eyebrow">AUTHENTICATION PRACTICE</div>
      <h1>Pinia Store로<br />JWT 로그인 흐름 익히기</h1>
      <p>
        Vue는 인증정보만 전달하고, Mock API가 서명된 Access Token을 만들어
        사용자 프로필과 함께 응답합니다.
      </p>

      <FlowSteps />

      <div class="lab-note">
        <strong>실습 포인트</strong>
        <span>로그인 성공 후 개발자 도구의 Network와 Application 탭을 확인해보세요.</span>
      </div>
    </div>

    <div class="login-card-wrap">
      <form class="login-card" @submit.prevent="submitLogin">
        <div class="login-card__header">
          <span class="method-label">POST</span>
          <div>
            <h2>로그인</h2>
            <code>/api/auth/login</code>
          </div>
        </div>

        <div class="quick-accounts">
          <button type="button" @click="useAccount('student')">수강생 계정</button>
          <button type="button" @click="useAccount('admin')">관리자 계정</button>
        </div>

        <label class="field">
          <span>이메일</span>
          <input
            v-model.trim="credentials.email"
            type="email"
            autocomplete="username"
            required
          />
        </label>

        <label class="field">
          <span>비밀번호</span>
          <input
            v-model="credentials.password"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>

        <p v-if="authStore.errorMessage" class="error-message" role="alert">
          {{ authStore.errorMessage }}
        </p>

        <button class="primary-button" :disabled="authStore.isLoading">
          <span v-if="authStore.isLoading" class="spinner"></span>
          {{ authStore.isLoading ? '인증 요청 중…' : 'Mock API로 로그인' }}
        </button>

        <div class="test-credentials">
          <strong>기본 테스트 계정</strong>
          <code>student@skala.com / 1234</code>
        </div>
      </form>
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

.lab-note {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 1.5rem;
  padding: 0.9rem 1.1rem;
  background: var(--magpie-accent-soft);
  border: 1px solid var(--magpie-accent-strong);
  border-radius: 10px;
  font-size: 0.85rem;
}

.lab-note strong {
  color: var(--magpie-accent);
}

.lab-note span {
  color: var(--color-text);
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
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 1.75rem;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--magpie-gradient);
}

.login-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.login-card__header h2 {
  font-size: 1.15rem;
  color: var(--color-heading);
  margin-bottom: 0.15rem;
}

.login-card__header code {
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.7;
}

.method-label {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #fff;
  background: var(--magpie-violet);
}

.quick-accounts {
  display: flex;
  gap: 0.5rem;
}

.quick-accounts button {
  flex: 1;
  margin: 0;
  padding: 0.5rem 0.6rem;
  font-size: 0.8rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--color-text);
}

.field input {
  width: 100%;
}

.error-message {
  color: #c0392b;
  background: #fdecea;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.primary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin: 0;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 10px;
  background: var(--magpie-gradient);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 6px 16px var(--magpie-accent-strong);
}

.primary-button:hover {
  background: var(--magpie-gradient);
  color: #fff;
  filter: brightness(1.08);
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.test-credentials {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.75rem 0.9rem;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.8rem;
}

.test-credentials strong {
  color: var(--color-heading);
}

.test-credentials code {
  color: var(--magpie-accent);
}

@media (max-width: 860px) {
  .login-page {
    grid-template-columns: 1fr;
  }
}
</style>
