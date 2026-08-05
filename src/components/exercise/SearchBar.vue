<script setup>
/* ── [Router 실습] SearchBar.vue ──
   - 부모로부터 검색어(query)를 props로 전달받아 표시
   - 입력이 발생하면 update-query 이벤트로 검색어를 부모에게 전달 (emits)
   - 자식은 props를 직접 수정하지 않는다(단방향 데이터 흐름 유지)
   순수 HTML <input>으로 구현한 버전. Element Plus <el-input> 버전은
   src/views/work/SearchBar.vue 참고 (둘 다 props/emits 패턴은 동일). */
// query: 부모가 들고 있는 검색어 상태를 그대로 내려받아 화면에 표시
defineProps({
  query: { type: String, default: '' },
})

// update-query: 입력값이 바뀔 때 부모에게 새 검색어를 알리기 위한 이벤트
const emit = defineEmits(['update-query'])

/* 한글 즉시 동기화: v-model 대신 :value + @input 조합
   (v-model은 한글 조합 중(IME) 값이 늦게 반영되기 때문) */
const onInput = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-bar">
    <input type="text" placeholder="검색할 도시 이름 입력" :value="query" @input="onInput" />
    <p class="search-status">
      검색 중인 도시: <b>{{ query || '(없음)' }}</b>
    </p>
  </div>
</template>

<style scoped>
input[type='text'] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: var(--color-background);
  color: var(--color-text);
  box-sizing: border-box;
}
input[type='text']:focus {
  border-color: var(--magpie-accent);
}
.search-status {
  margin-top: 8px;
  margin-bottom: 0;
  font-size: 13px;
  color: var(--color-text);
  opacity: 0.75;
}
.search-status b {
  color: var(--color-heading);
  opacity: 1;
}
</style>
