<script setup>
import { ref, reactive } from 'vue'

/* ---------- v-html / v-text ---------- */
// v-html: HTML 태그를 실제로 "해석"해서 렌더링함 (굵게, 색깔 등 적용됨)
const htmlContent = ref('<b style="color:#38bdf8">굵게 표시되는 텍스트</b>')

// v-html XSS 위험 예시: 사용자가 입력한 값을 그대로 v-html에 넣으면
// <script> 태그나 이벤트 핸들러(onerror 등)가 그대로 실행될 수 있음
// ⚠️ 실제 서비스에서는 사용자 입력을 v-html에 절대 그대로 넣지 말 것
const userInput = ref('<img src="x" onerror="alert(\'XSS 공격 예시! 쿠키 탈취 가능\')">')

// v-text: 무조건 순수 텍스트로만 표시 (태그가 그대로 문자로 보임, 안전함)
const textContent = ref('<b>이건 태그로 해석 안 됨</b>')

/* ---------- v-bind ---------- */
const imgUrl = ref('https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.21/logo.svg') // 예시 URL
const isActive = ref(true)
const hasError = ref(false)
const boxStyle = reactive({
  color: '#38bdf8',
  fontSize: '14px'
})

/* ---------- v-if / v-else-if / v-else / v-show ---------- */
const score = ref(85)
const isVisible = ref(true)

/* ---------- v-for ---------- */
const fruits = ref([
  { id: 1, name: '사과' },
  { id: 2, name: '바나나' },
  { id: 3, name: '포도' },
  { id: 4, name: '딸기' }
])

/* ---------- v-once ---------- */
const onceValue = ref('처음 렌더링된 값 그대로 고정됨')

/* ---------- v-memo ---------- */
// count가 바뀌어도 memoKey가 안 바뀌면 이 블록은 재렌더링을 건너뜀
const count = ref(0)
const memoKey = ref(0)
</script>

<template>
  <div class="wrap">

    <!-- ===== v-html / v-text ===== -->
    <section>
      <h3>v-html / v-text</h3>
      <p>v-html 결과: <span v-html="htmlContent"></span></p>
      <p>v-text 결과: <span v-text="textContent"></span></p>
      <p style="color:#f87171">
        ⚠️ v-html XSS 위험 예시 (아래는 실제 위험한 코드가 그대로 실행되는 걸 보여주기 위함):
      </p>
      <div v-html="userInput"></div>
    </section>

    <!-- ===== v-bind ===== -->
    <section>
      <h3>v-bind</h3>
      <!-- 기본 바인딩 -->
      <img v-bind:src="imgUrl" alt="로고" width="40" />
      <!-- 축약형 (Shorthand): v-bind: 생략하고 : 만 씀 -->
      <img :src="imgUrl" alt="로고 축약형" width="40" />

      <!-- 클래스 바인딩: 조건에 따라 클래스 on/off -->
      <button @click="isActive = !isActive; hasError = !hasError">Change</button>

      <p :class="{ active: isActive, error: hasError }">
        클래스 바인딩 (isActive=true → active 클래스 적용됨)
      </p>

      <!-- 스타일 바인딩: 객체를 그대로 style로 -->
      <p :style="boxStyle">스타일 바인딩 (색상, 글자크기 적용됨)</p>
    </section>

    <!-- ===== v-if / v-else-if / v-else / v-show ===== -->
    <section>
      <h3>v-if / v-else-if / v-else / v-show</h3>
       <!-- 입력창 추가 -->
      <input type="number" v-model="score" />
      <p>점수: {{ score }}</p>
      <p v-if="score >= 90">A등급</p>
      <p v-else-if="score >= 80">B등급</p>
      <p v-else-if="score >= 70">C등급</p>
      <p v-else>F등급</p>

      <!-- v-show: DOM에서 제거하지 않고 display:none으로 숨김 (v-if는 DOM 자체를 제거) -->
      <button @click="isVisible = !isVisible">v-show 토글</button>
      <p v-show="isVisible">v-show로 보이거나 숨겨지는 문장</p>
    </section>

    <!-- ===== v-for ===== -->
    <section>
      <h3>v-for</h3>
      <ul>
        <li v-for="fruit in fruits" :key="fruit.id">
          {{ fruit.id }}. {{ fruit.name }}
        </li>
      </ul>
    </section>

    <!-- ===== v-pre ===== -->
    <section>
      <h3>v-pre</h3>
      <!-- v-pre가 붙은 요소는 Vue 컴파일을 건너뛰어서 {{ }}가 그대로 문자로 출력됨 -->
      <p v-pre>{{ 이 문장은 컴파일되지 않고 그대로 출력됨 }}</p>
    </section>

    <!-- ===== v-cloak ===== -->
    <!-- v-cloak: Vue가 로딩되기 전 {{ }} 원본 텍스트가 잠깐 보이는 걸 CSS로 숨김 -->
    <section v-cloak>
      <h3>v-cloak</h3>
      <p>{{ '로딩 완료 후에만 보임 (CSS에서 [v-cloak]{display:none} 처리)' }}</p>
    </section>

    <!-- ===== v-once ===== -->
    <section>
      <h3>v-once</h3>
      <!-- v-once: 최초 렌더링 후 절대 다시 렌더링되지 않음 (성능 최적화용) -->
      <p v-once>{{ onceValue }}</p>
      <input v-model="onceValue" placeholder="입력해도 위 문장은 안 바뀜" />
    </section>

    <!-- ===== v-memo ===== -->
    <section>
      <h3>v-memo</h3>
      <button @click="count++">count 증가: {{ count }}</button>
      <button @click="memoKey++">memoKey 증가: {{ memoKey }}</button>
      <!-- memoKey가 안 바뀌면 count가 바뀌어도 아래 블록은 재렌더링 건너뜀 -->
      <div v-memo="[memoKey]">
        <p>이 블록은 memoKey가 바뀔 때만 갱신됨 (현재 count: {{ count }})</p>
      </div>
    </section>

  </div>
</template>

<style scoped>
.wrap {
  max-width: 520px;
  margin: 0 auto;
  padding: 1.75rem 2rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 14px;
}
section {
  border-bottom: 1px solid var(--color-border);
  padding: 16px 0;
}
section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
h3 {
  margin-bottom: 8px;
  color: var(--color-heading);
}
.active {
  font-weight: bold;
  color: var(--magpie-teal);
}
.error {
  color: #e85d5d;
}
[v-cloak] {
  display: none;
}
</style>