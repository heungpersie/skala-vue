<script setup>
import { ref } from 'vue'
const count = ref(0)
// 메서드 핸들러 함수 정의
const showAlert = () => {
alert('함수가 성공적으로 호출되었습니다!')
}
const position = ref('')
const tagName = ref('')
const getOnlyEvent = (e) => {
position.value =
`좌표: X=${e.clientX}, Y=${e.clientY}`
}
const getWithParam = (name, e) => {
tagName.value =
`대상: ${name} / 클릭된 태그: ${e.target.tagName}`
}
const handleLink = () => {
alert('수식어 덕분에 네이버로 이동하지 않고 함수만 실행됩니다!')
}
const handleBox = () => {
alert('부모 박스가 클릭되었습니다!')
}
const handleChild1 = () => {
  alert('1번 자식 클릭!')
}
const handleChild2 = () => {
  alert('2번 자식(나만 켜짐) 클릭!')
}

</script>


<template>
    <div class="practice-section">
        <h2>v-on 이벤트 핸들링 기초</h2>
        <h3>1) 인라인 연산 처리</h3>
        <p>현재 카운트: {{ count }}</p>
        <button @click="count++">1씩 증가</button>
        <br />
        <h3>2) 스크립트 함수 호출</h3>
        <button @click="showAlert">알림창 띄우기</button>
    </div>

    <div class="practice-section">
        <h2>v-on 이벤트 객체($event) 활용</h2>
        <p>좌표: {{ position }}</p>
        <p>태그: {{ tagName }}</p>
        <button @click="getOnlyEvent">클릭 좌표 알아내기</button>
        <button @click="getWithParam('회원A', $event)">회원 정보와 태그 확인</button>
    </div>
    
    <div class="practice-section">
        <h2>이벤트 수식어(Modifiers) 학습</h2>
        <h3>1) .prevent (기본 동작 막기)</h3>
        <a href="https://www.naver.com" @click.prevent="handleLink">네이버 링크</a>
        <br />
        <h3>2) .stop (이벤트 버블링 막기)</h3>
        <div @click="handleBox" style="padding: 20px; background-color: #eee">
            <p>부모 영역 (클릭 시 alert 발동)</p>
            <button @click="handleChild1">버블링 발생 버튼</button>
            <button @click.stop="handleChild2">버블링 차단 버튼</button>
        </div>
    </div>
</template>