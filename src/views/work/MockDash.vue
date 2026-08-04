<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import CodeBlock from '@/mockcomponents/CodeBlock.vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const router = useRouter()

// storeToRefs를 사용하면 구조분해 후에도 Store의 반응성을 유지합니다.
const {
  user,
  accessToken,
  tokenPayload,
  authorizationHeader,
  protectedMessage,
  isLoading,
  errorMessage,
} = storeToRefs(authStore)

const formattedPayload = computed(() =>
  tokenPayload.value ? JSON.stringify(tokenPayload.value, null, 2) : '',
)

const formattedUser = computed(() =>
  user.value ? JSON.stringify(user.value, null, 2) : '',
)

function formatDate(dateText) {
  if (!dateText) return ''
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(dateText))
}

async function verifyProtectedApi() {
  const succeeded = await authStore.fetchProtectedMessage()
  if (!succeeded && !authStore.isLoggedIn) {
    await router.replace('/login')
  }
}

async function logout() {
  authStore.logout()
  await router.replace('/login')
}

// 새로고침 후에도 저장된 JWT가 실제로 유효한지 서버의 /auth/me로 확인합니다.
onMounted(async () => {
  try {
    await authStore.fetchMyProfile()
  } catch {
    await router.replace('/login')
  }
})
</script>

<template>
  <section class="dashboard-page">
    <div class="dashboard-hero">
      <div>
        <span class="success-badge">인증 성공</span>
        <h1>{{ user?.name }}님, 반갑습니다.</h1>
        <p>Mock API가 발급한 JWT와 Pinia에 저장된 인증 상태를 확인할 수 있습니다.</p>
      </div>
      <button class="secondary-button secondary-button--light" @click="logout">
        로그아웃
      </button>
    </div>

    <div class="dashboard-grid">
      <article class="info-card profile-card">
        <div class="card-heading">
          <div>
            <span class="method-label method-label--get">GET</span>
            <h2>사용자 프로필</h2>
          </div>
          <code>/api/auth/me</code>
        </div>

        <dl class="profile-list">
          <div><dt>회원번호</dt><dd>{{ user?.id }}</dd></div>
          <div><dt>이름</dt><dd>{{ user?.name }}</dd></div>
          <div><dt>이메일</dt><dd>{{ user?.email }}</dd></div>
          <div><dt>권한</dt><dd><span class="role-chip">{{ user?.role }}</span></dd></div>
          <div><dt>소속</dt><dd>{{ user?.department }}</dd></div>
        </dl>

        <CodeBlock label="서버 응답 프로필 객체" :value="formattedUser" />
      </article>

      <article class="info-card token-card">
        <div class="card-heading">
          <div>
            <span class="token-icon">JWT</span>
            <h2>Access Token</h2>
          </div>
          <span class="expiry">15분 유효</span>
        </div>

        <CodeBlock label="Raw Token" :value="accessToken" />
        <CodeBlock label="Decoded Payload" :value="formattedPayload" />

        <p class="security-note">
          Payload는 누구나 디코딩할 수 있으므로 비밀번호 같은 비밀정보를 넣으면 안 됩니다.
        </p>
      </article>

      <article class="info-card protected-card">
        <div class="card-heading">
          <div>
            <span class="method-label method-label--get">GET</span>
            <h2>보호 API 호출</h2>
          </div>
          <code>/api/auth/protected-message</code>
        </div>

        <p>
          버튼을 누르면 Axios 인터셉터가 Store의 토큰을 Authorization 헤더에 자동으로 추가합니다.
        </p>

        <CodeBlock label="자동 생성되는 요청 헤더" :value="authorizationHeader" />

        <button class="primary-button primary-button--fit" :disabled="isLoading" @click="verifyProtectedApi">
          <span v-if="isLoading" class="spinner"></span>
          보호 API 요청하기
        </button>

        <p v-if="errorMessage" class="error-message" role="alert">
          {{ errorMessage }}
        </p>

        <div v-if="protectedMessage" class="protected-result">
          <strong>{{ protectedMessage.message }}</strong>
          <span>요청 권한: {{ protectedMessage.role }}</span>
          <time :datetime="protectedMessage.requestedAt">
            {{ formatDate(protectedMessage.requestedAt) }}
          </time>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.dashboard-page {
  max-width: 1100px;
  margin: 0 auto;
}

.dashboard-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-hero h1 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: var(--color-heading);
  margin: 0.5rem 0;
}

.dashboard-hero p {
  color: var(--color-text);
  opacity: 0.85;
}

.success-badge {
  display: inline-flex;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
  font-size: 0.75rem;
  font-weight: 700;
}

.secondary-button {
  flex-shrink: 0;
  margin: 0;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-heading);
  font-weight: 600;
}

.secondary-button:hover {
  border-color: var(--magpie-accent);
  color: var(--magpie-accent);
  background: var(--magpie-accent-soft);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.info-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 1.5rem;
}

.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--magpie-gradient);
}

.card-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.card-heading h2 {
  font-size: 1.05rem;
  color: var(--color-heading);
  margin-top: 0.25rem;
}

.card-heading code {
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

.method-label--get {
  background: var(--magpie-blue);
}

.token-icon {
  display: inline-flex;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  background: var(--magpie-violet);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.expiry {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.6;
  white-space: nowrap;
}

.profile-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.profile-list div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--color-border);
}

.profile-list div:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.profile-list dt {
  color: var(--color-text);
  opacity: 0.65;
}

.profile-list dd {
  color: var(--color-heading);
  font-weight: 600;
  text-align: right;
}

.role-chip {
  display: inline-flex;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: var(--magpie-accent-soft);
  color: var(--magpie-accent);
  font-size: 0.75rem;
  font-weight: 700;
}

.security-note {
  font-size: 0.78rem;
  color: var(--color-text);
  opacity: 0.65;
  line-height: 1.6;
}

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin: 0;
  padding: 0.65rem 1rem;
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

.primary-button--fit {
  width: auto;
  align-self: flex-start;
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

.error-message {
  color: #c0392b;
  background: #fdecea;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.protected-result {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.75rem 0.9rem;
  background: var(--magpie-accent-soft);
  border-radius: 8px;
  font-size: 0.85rem;
}

.protected-result strong {
  color: var(--magpie-accent);
}

.protected-result span {
  color: var(--color-text);
}

.protected-result time {
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.6;
}

@media (max-width: 720px) {
  .dashboard-hero {
    flex-direction: column;
  }
}
</style>
