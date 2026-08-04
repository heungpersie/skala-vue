<template>
  <ol class="flow-steps" aria-label="JWT 로그인 처리 흐름">
    <li>
      <span>1</span>
      <div>
        <strong>인증정보 POST</strong>
        <small>이메일과 비밀번호 전송</small>
      </div>
    </li>
    <li>
      <span>2</span>
      <div>
        <strong>서버 인증·JWT 생성</strong>
        <small>HMAC SHA-256으로 서명</small>
      </div>
    </li>
    <li>
      <span>3</span>
      <div>
        <strong>토큰·프로필 응답</strong>
        <small>Pinia Store에 인증상태 저장</small>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.flow-steps {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 0;
  margin: 1.5rem 0;
}

.flow-steps li {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.flow-steps li:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 26px;
  left: 13px;
  bottom: -14px;
  width: 2px;
  background: var(--color-border);
}

.flow-steps li > span {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--magpie-gradient);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 1;
}

.flow-steps li > div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-top: 0.15rem;
}

.flow-steps strong {
  color: var(--color-heading);
  font-size: 0.9rem;
}

.flow-steps small {
  color: var(--color-text);
  opacity: 0.7;
  font-size: 0.78rem;
}
</style>
