<script setup>
/* ── [Router 실습] NotFoundView.vue ──
   Catch-all Route(path: '/:pathMatch(.*)*', 라우터 설정의 마지막 항목)가 정의되지 않은
   경로 접근 시 렌더링한다. 즉 어떤 라우트에도 매칭되지 않을 때의 기본 화면(fallback)이다. */
import { useRoute, useRouter } from 'vue-router'

// useRoute(): 현재 활성화된 라우트의 정보(경로 fullPath, 동적 세그먼트 params, 쿼리스트링 query 등)를
//   읽기 전용으로 돌려주는 컴포저블. 여기서는 사용자가 어떤 잘못된 주소로 들어왔는지 보여주는 데 쓴다.
// useRouter(): router.push/back 등 "코드로 페이지를 이동시키는" 프로그래매틱 내비게이션을 위한
//   라우터 인스턴스. <RouterLink>가 아니라 버튼 클릭 같은 이벤트 안에서 이동해야 할 때 사용한다.
const route = useRoute()
const router = useRouter()

// 404는 앱 어디서든 올 수 있으므로 특정 섹션으로 고정하지 않고, 바로 이전 페이지로 되돌아간다.
const goHome = () => {
  router.back()
}
</script>

<template>
  <div class="not-found-panel">
    <p class="code">404</p>
    <p class="message">
      요청하신 경로 <code>{{ route.fullPath }}</code
      >를 찾을 수 없습니다.
    </p>
    <p class="message">404 좌표밖의 지점 404 New Era Era</p>
    <button class="home-btn" @click="goHome">← 메인 대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.not-found-panel {
  position: relative;
  overflow: hidden;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 640px;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 48px 28px;
  text-align: center;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  box-sizing: border-box;
}
.not-found-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--magpie-gradient);
}
.code {
  font-size: 56px;
  font-weight: 800;
  background: var(--magpie-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0 0 8px 0;
}
.message {
  color: var(--color-text);
  margin: 0 0 24px 0;
  line-height: 1.6;
  word-break: break-all;
}
.message code {
  background: var(--color-background-mute);
  padding: 2px 8px;
  border-radius: 6px;
  color: var(--color-heading);
}
.home-btn {
  background: var(--magpie-gradient);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.home-btn:hover {
  filter: brightness(1.08);
}
</style>
