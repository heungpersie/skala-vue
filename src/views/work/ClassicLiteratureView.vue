<script setup>
// ─────────────────────────────────────────────────────────────
// [ClassicLiteratureView] /library/classics 라우트의 "책BTI" 소개 페이지입니다.
// 이 컴포넌트 자체는 상태나 로직 없이, 실제 퀴즈 로직을 담은 LibraryTest.vue를
// 자식 컴포넌트로 불러와 렌더링하는 얇은 레이아웃(부모) 역할만 합니다.
// (컴포넌트 조합/재사용을 보여주는 예시 — props/emits 없이 단순 포함만 사용)
// ─────────────────────────────────────────────────────────────
import LiteraryTest from './LibraryTest.vue'
</script>

<template>
  <div class="classics">
    <section class="hero">
      <h1 class="page-title">책BTI</h1>
      <p class="page-subtitle">
        까치의 서재가 엄선한 고전 문학을 소개합니다.
        시대를 넘어 사랑받아온 작품들을 만나보세요.
      </p>
    </section>

    <section class="literary-test-section">
      <LiteraryTest />
    </section>
  </div>
</template>

<style scoped>
.classics {
  display: flex;
  flex-direction: column;
  gap: 40px;
  width: 100%;
}

/* 제목 영역 */
.hero {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 페이지 제목 */
.page-title {
  width: 100%;
  margin: 0 0 12px;
  text-align: center;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--color-heading);
}

/* 설명 */
.page-subtitle {
  width: 100%;
  max-width: 560px;
  margin: 0;
  text-align: center;
  color: var(--color-text);
  opacity: 0.75;
  line-height: 1.7;
  font-size: 0.95rem;
}

/* 추천 테스트 영역 */
.literary-test-section {
  width: 100%;
  display: flex;
  justify-content: center;
}


/* 반응형 */
@media (max-width: 768px) {
  .classics {
    gap: 28px;
  }

  .page-subtitle {
    padding: 0 16px;
  }
}
</style>
