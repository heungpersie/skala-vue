<script setup>
/* ── [과제3-3] SearchBar.vue ──
   - 부모로부터 검색어(query)를 props로 전달받아 표시
   - 입력이 발생하면 update-query 이벤트로 검색어를 부모에게 전달 (emits)
   - 자식은 props를 직접 수정하지 않는다(단방향 데이터 흐름 유지)
   Element Plus <el-input>을 사용하는 버전. 순수 HTML <input> 버전은
   src/components/exercise/SearchBar.vue 참고 (둘 다 props/emits 패턴은 동일). */
import { Search } from '@element-plus/icons-vue'

// query: 부모(WeatherParent)가 들고 있는 검색어 상태를 그대로 내려받아 화면에 표시
defineProps({
  query: { type: String, default: '' },
})

// update-query: 입력값이 바뀔 때 부모에게 새 검색어를 알리기 위한 이벤트
const emit = defineEmits(['update-query'])

/* el-input의 @input은 (IME 조합 완료 후) 최종 문자열 값을 그대로 전달한다 */
const onInput = (value) => {
  emit('update-query', value)
}
</script>

<template>
  <div class="search-bar">
    <el-input
      placeholder="검색할 도시 이름 입력"
      :model-value="query"
      clearable
      @input="onInput"
      @clear="() => onInput('')"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
    <p class="search-status">
      검색 중인 도시: <b>{{ query || '(없음)' }}</b>
    </p>
  </div>
</template>

<style scoped>
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
