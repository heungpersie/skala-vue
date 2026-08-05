<script setup>
// ─────────────────────────────────────────────────────────────
// [SignUpView] /signup 라우트에서 사용하는 회원가입 화면입니다.
// - el-form의 rules로 이름/이메일/비밀번호/비밀번호 확인을 검증하고,
//   authApi.register()로 회원가입 API를 호출합니다(Pinia 스토어를 거치지 않는 단발성 요청).
// - 가입 성공 시에는 자동 로그인시키지 않고, 방금 입력한 이메일과 함께
//   /login으로 이동시켜 사용자가 직접 로그인하도록 유도합니다(LoginView의 justRegistered 배너 참고).
// ─────────────────────────────────────────────────────────────
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, Message, User } from '@element-plus/icons-vue'

import { authApi } from '@/api/authApi.js'

const router = useRouter()

// el-form 인스턴스를 참조해 validate()를 수동 호출하기 위한 템플릿 ref입니다.
const formRef = ref()
// API 호출 중 버튼을 비활성화/로딩 표시하기 위한 상태입니다.
const isSubmitting = ref(false)
// 서버에서 반환된 에러 메시지를 화면에 보여주기 위한 상태입니다.
const errorMessage = ref('')

// reactive로 폼 전체를 하나의 객체로 묶어 v-model / el-form :model에 바인딩합니다.
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// el-form :rules에 전달되는 필드별 유효성 검사 규칙입니다.
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
  // confirmPassword는 단순 required뿐 아니라, 커스텀 validator로 password 필드와
  // 값이 같은지도 함께 검사합니다. callback(new Error(...))을 호출하면 검증 실패로 처리됩니다.
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

// 회원가입 폼 제출 핸들러입니다.
// 1) el-form validate()로 클라이언트 측 검증을 먼저 통과시키고
// 2) authApi.register()로 서버에 가입 요청을 보낸 뒤
// 3) 성공하면 로그인 화면으로 이동, 실패하면 서버 에러 메시지를 그대로 노출합니다.
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
    // registered=1과 email 쿼리를 함께 넘겨, LoginView가 완료 배너를 띄우고
    // 이메일 입력칸을 미리 채워주도록 합니다.
    await router.push({
      name: 'login',
      query: { registered: '1', email: form.email.trim() },
    })
  } catch (error) {
    // 예: 이미 가입된 이메일 등 서버 측 검증 실패 메시지를 그대로 사용자에게 보여줍니다.
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
