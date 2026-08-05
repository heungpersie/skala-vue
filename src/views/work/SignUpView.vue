<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, Message, User } from '@element-plus/icons-vue'

import { authApi } from '@/api/authApi.js'

const router = useRouter()

const formRef = ref()
const isSubmitting = ref(false)
const errorMessage = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const rules = {
  name: [{ required: true, message: '이름을 입력해주세요.', trigger: 'blur' }],
  email: [
    { required: true, message: '이메일을 입력해주세요.', trigger: 'blur' },
    { type: 'email', message: '올바른 이메일 형식이 아닙니다.', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: '비밀번호를 입력해주세요.', trigger: 'blur' },
    { min: 4, message: '비밀번호는 4자 이상이어야 합니다.', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '비밀번호를 한 번 더 입력해주세요.', trigger: 'blur' },
    {
      validator(_rule, value, callback) {
        if (value !== form.password) {
          callback(new Error('비밀번호가 일치하지 않습니다.'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
}

async function submitSignUp() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await authApi.register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    })

    ElMessage.success('회원가입이 완료되었습니다. 로그인해주세요.')
    await router.push({
      name: 'login',
      query: { registered: '1', email: form.email.trim() },
    })
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="signup-page">
    <div class="intro-panel">
      <div class="eyebrow">SKALA VUE</div>
      <h1>몇 초면<br />가입이 끝나요</h1>
      <p>
        이름과 이메일만 있으면 바로 시작할 수 있어요. 가입 후에는 날씨 대시보드,
        까치 이야기, 영화 기록 기능을 모두 이용할 수 있습니다.
      </p>

      <ul class="feature-list">
        <li>
          <span>🌤️</span>
          <div>
            <strong>날씨 대시보드</strong>
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
      </ul>
    </div>

    <div class="signup-card-wrap">
      <el-card class="signup-card" shadow="hover">
        <div class="signup-card__header">
          <h2>회원가입</h2>
          <p>새 계정을 만들어 보세요.</p>
        </div>

        <el-form
          ref="formRef"
          class="signup-form"
          label-position="top"
          :model="form"
          :rules="rules"
          @submit.prevent="submitSignUp"
        >
          <el-form-item label="이름" prop="name">
            <el-input
              v-model.trim="form.name"
              :prefix-icon="User"
              autocomplete="name"
              placeholder="홍길동"
            />
          </el-form-item>

          <el-form-item label="이메일" prop="email">
            <el-input
              v-model.trim="form.email"
              type="email"
              :prefix-icon="Message"
              autocomplete="username"
              placeholder="you@example.com"
            />
          </el-form-item>

          <el-form-item label="비밀번호" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              :prefix-icon="Lock"
              autocomplete="new-password"
              show-password
              placeholder="비밀번호"
            />
          </el-form-item>

          <el-form-item label="비밀번호 확인" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              :prefix-icon="Lock"
              autocomplete="new-password"
              show-password
              placeholder="비밀번호 확인"
            />
          </el-form-item>

          <el-alert
            v-if="errorMessage"
            class="error-message"
            :title="errorMessage"
            type="error"
            show-icon
            :closable="false"
          />

          <el-button
            class="primary-button"
            type="primary"
            native-type="submit"
            :loading="isSubmitting"
          >
            {{ isSubmitting ? '가입 처리 중…' : '회원가입' }}
          </el-button>
        </el-form>

        <div class="signin-link">
          이미 계정이 있으신가요?
          <RouterLink to="/login">로그인</RouterLink>
        </div>
      </el-card>
    </div>
  </section>
</template>

<style scoped>
.signup-page {
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

.signup-card-wrap {
  display: flex;
  justify-content: center;
}

.signup-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  border-radius: 18px;
  animation: card-in 0.35s ease-out;
}

.signup-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--magpie-gradient);
  z-index: 1;
}

.signup-card__header {
  margin-bottom: 1.3rem;
}

.signup-card__header h2 {
  font-size: 1.3rem;
  color: var(--color-heading);
  margin-bottom: 0.3rem;
}

.signup-card__header p {
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.7;
}

.signup-form :deep(.el-form-item) {
  margin-bottom: 1.1rem;
}

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

.signin-link {
  margin-top: 1.1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.85;
}

.signin-link a {
  color: var(--magpie-accent);
  font-weight: 600;
  text-decoration: none;
}

.signin-link a:hover {
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
  .signup-page {
    grid-template-columns: 1fr;
  }
}
</style>
