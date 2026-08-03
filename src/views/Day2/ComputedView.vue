<script setup>
// block 1: computed() 캐싱 동작 비교
import { ref, computed } from 'vue'
const count = ref(0)
const dummy = ref(0) // computed와 무관한 변수

// 1. 일반 함수: 화면이 조금이라도 리렌더링되면 무조건 재실행
const getMethodResult = () => {
  console.log('❌ 일반 함수 실행됨!')
  return count.value * 2
}

// 2. Computed: count가 바뀔 때만 재연산 (dummy가 바뀔 땐 이전 값 재사용)
const doubleCount = computed(() => {
  console.log('✅ Computed 연산 실행됨!')
  return count.value * 2
})

// block 2: watch() 감시자
import { watch } from 'vue'
const currentCity = ref('서울')
const logMessage = ref('아직 감시 시스템이 작동하지 않았습니다.')
// currentCity 변수를 유심히 감시하는 watch 시스템 가동
watch(currentCity, (newValue, oldValue) => {
  //무조건 newValue, oldValue, 세번째 자리는 정리 함수를 등록하는 자리
  // 값이 바뀌는 순간, 바뀐 알맹이(값) 두 개가 자동으로 주입됩니다.
  logMessage.value = `📍 감시자 발동! [${oldValue}]에서 [${newValue}]로 변경됨.`
  // 실무 활용처 시뮬레이션
  console.log(`🤖 [서버 요청 완료] 기상청 서버에서 ${newValue}의 날씨 API를 다시 조회합니다...`)
})

// block 3: watch() 실무 활용 예시
const dateType = ref('오늘')
const apiStatus = ref('대기 중...')
const city = ref('서울')
// 두 개의 ref 변수를 배열[] 형태로 묶어 동시에 감시합니다.
watch([city, dateType], ([newCity, newDate], [oldCity, oldDate]) => {
  apiStatus.value = `[변경 감지] ${oldCity}(${oldDate}) ➡️ ${newCity}(${newDate})`
  // 실무 활용: 두 옵션 중 하나만 바뀌어도 통합 API 요청을 보냅니다.
  console.log(`🤖 [통합 API 호출] ${newCity}의 ${newDate} 날씨를 불러옵니다...`)
})

// block 4: watch() 객체 속성 감시
const user = ref({ name: '홍길동', age: 20 })
const logDeep = ref('아직 반응 없음')
const logTarget = ref('아직 반응 없음')
const newname = ref('')
const newage = ref(30)
// 실패하는 예시 (가장 많이 범하는 오류)
// watch(user, () => { console.log('이 로그는 영원히 안 찍힙니다.') })
// 해결책 1: deep 옵션을 켜서 객체 하위 속성 전체 감시하기
watch(
  user,
  (newVal) => {
    logDeep.value = `[deep 감지] 누군가 변경됨! 현재 이름: ${newVal.name}, 나이: ${newVal.age}`
  },
  { deep: true },
)
// 해결책 2: 화살표 함수로 특정 속성(age)만 콕 집어 감시하기 (★이전 값 추적 가능!)
watch(
  () => user.value.age,
  (newAge, oldAge) => {
    logTarget.value = `[타겟 감지] 나이가 ${oldAge}세 ➡️ ${newAge}세로 변경됨!`
  },
)

// block 5: watch() 객체 속성 감시 실무 활용 예시
import { reactive } from 'vue'
// reactive로 선언한 묶음 상품 데이터
const state = reactive({ productName: '노트북', price: 1000 })
const logAutoDeep = ref('대기 중...')
const logTarget2 = ref('대기 중...')
// 🟢 1) 변수명 그대로 감시 (자동 deep: true 작동)
watch(state, (newVal, oldVal) => {
  // newVal.price와 oldVal.price가 똑같이 2000으로 나옵니다!
  logAutoDeep.value = `[자동 deep] 가격 변동! 이전가격인척하는:${oldVal.price}원 ➡️ 현재가격:${newVal.price}원`
})
// 🟢 2) 화살표 함수로 특정 속성만 감시 (이전 값 추적 가능!)
watch(
  () => state.price,
  (newPrice, oldPrice) => {
    // 🔥 특정 알맹이 값만 추출했으므로 진짜 과거 가격(1000)이 정상 보존됩니다.
    logTarget2.value = `[타겟 조준] 가격이 진짜 올랐음! 옛날값:${oldPrice}원 ➡️ 바뀐값:${newPrice}원`
  },
)

// block 6: watchEffect() 실무 활용 예시
import { watchEffect } from 'vue'
const username = ref('홍길동')
const age = ref(20)
const logMessage2 = ref('대기 중...')
// watchEffect 가동: 감시 대상을 지정하는 파라미터가 없습니다!
watchEffect(() => {
  // Vue가 이 내부 코드를 읽고 'username'과 'age'를 자동으로 감시 리스트에 등록합니다.
  logMessage2.value = `[자동 감지] 이름: ${username.value} / 나이: ${age.value}세`
  // 화면이 처음 켜질 때 1등으로 즉시 실행되는 증거를 콘솔에서 확인합니다.
  console.log('🤖 watchEffect가 내부 변수 변경을 감지하여 실행되었습니다.')
})
</script>
<!-- block 1: computed() 캐싱 동작 비교 -->
<template>
  <div class="practice-section">
    <h1>Computed</h1>
    <h2>computed() 캐싱 동작 비교</h2>
    <p>count: {{ count }} | dummy: {{ dummy }}</p>
    <button @click="count++">count 증가 (의존성 변경)</button>
    <button @click="dummy++">dummy 증가 (무관한 변경)</button>
    <!-- dummy 버튼을 누를 때 콘솔 출력 차이를 확인-->
    <p>일반 함수 결과: {{ getMethodResult() }}</p>
    <p>Computed 결과: {{ doubleCount }}</p>
  </div>

  <!-- block 2: watch() 감시자 -->
  <div class="practice-section">
    <h1>Watch</h1>
    <h2>감시자 watch()의 원리와 실무 활용</h2>
    <h3>🏙️ 지역 선택 제어판</h3>
    <p>현재 선택된 도시: {{ currentCity }}</p>
    <button @click="currentCity = '서울'">서울 선택</button> &nbsp;
    <button @click="currentCity = '수원'">수원 선택</button> &nbsp;
    <button @click="currentCity = '부산'">부산 선택</button>
    <div class="monitor">
      <h3>👁️‍🗨️ 파수꾼(watch) 모니터링 시스템</h3>
      <p>{{ logMessage }}</p>
      <small style="color: gray">(버튼을 누른 후 브라우저 콘솔창 F12를 확인해 보세요)</small>
    </div>
  </div>

  <!-- block 3: watch() 실무 활용 예시 -->
  <div class="practice-section">
    <h1>Watch2</h1>
    <h2>여러 개의 변수 동시 감시 (watch)</h2>
    <h3>날씨 조건 설정</h3>
    <label>도시: </label>
    <select v-model="city">
      <option value="서울">서울</option>
      <option value="수원">수원</option>
      <option value="부산">부산</option>
    </select>
    <label>날짜: </label>
    <label><input type="radio" value="오늘" v-model="dateType" /> 오늘</label> &nbsp;
    <label><input type="radio" value="내일" v-model="dateType" /> 내일</label> &nbsp;
    <label><input type="radio" value="주간예보" v-model="dateType" /> 주간예보</label>
    <div class="monitor">
      <h3>통합 모니터링 로그</h3>
      <p>현재 상태: {{ apiStatus }}</p>
    </div>
  </div>

  <!-- block 4: watch() 객체 속성 감시 -->
  <div class="practice-section">
    <h1>Watch3</h1>
    <h2>ref 객체/배열 감시</h2>
    <h3>👨‍💻 회원 데이터 조작 panel</h3>
    <p>이름: {{ user.name }} / 나이: {{ user.age }}세</p>

    <p>이름 변경: <input v-model="newname" /> {{ newname }}</p>
    <p>나이 변경: <input v-model="newage" type="number" /> {{ newage }}세</p>

    <button @click="user.name = newname">이름만 변경</button> &nbsp;
    <button @click="user.age = newage">나이만 변경</button>

    <div class="monitor">
      <p>👁️‍🗨️ 1) deep: true 모니터 (전체 감시)</p>
      <p>{{ logDeep }}</p>
    </div>
    <div class="monitor target">
      <p>🎯 2) 화살표 함수 모니터 (나이만 타겟 감시)</p>
      <p>{{ logTarget }}</p>
    </div>
  </div>

  <!-- block 5: watch() 객체 속성 감시 실무 활용 예시 -->
  <div class="practice-section">
    <h1>Watch5</h1>
    <h2>reactive() 데이터 watch 감시 규칙</h2>
    <h3>🛒 상품 정보 관리 (reactive)</h3>
    <p>상품명: {{ state.productName }} / 가격: {{ state.price }}원</p>
    <button @click="state.price += 500">가격 500원 인상</button>
    <div class="monitor auto">
      <p>👁️‍🗨️ 1) state 변수 통째로 감시 (deep 자동화)</p>
      <p>{{ logAutoDeep }}</p>
      <small>※ 주의: 이전 값과 현재 값이 똑같이 찍힌다.</small>
    </div>
    <div class="monitor target">
      <p>🎯 2) () => state.price 콕 집어 감시 (과거 추적)</p>
      <p>{{ logTarget2 }}</p>
      <small>※ 성공: 과거의 원본 가격이 칼같이 보존된다.</small>
    </div>
  </div>

  <!-- block 6: watchEffect() 실무 활용 예시 -->
  <div class="practice-section">
    <h1>WatchEffect</h1>
    <h2>자동 감시자 watchEffect()</h2>
    <p>이름: {{ username }} / 나이: {{ age }}세</p>
    <button @click="username = '이순신'">이름을'이순신'으로 변경</button> &nbsp;
    <button @click="age++">나이 한 살 추가 (age++)</button>
    <div class="monitor">
      <h3>👁️‍🗨️ watchEffect 자동 모니터링 시스템</h3>
      <p>{{ logMessage2 }}</p>
      <small style="color: gray"
        >※ 새로고침하자마자 버튼을 안 눌러도 로그가 이미 찍혀있는 특징을 주목하세요!</small
      >
    </div>
  </div>
</template>
