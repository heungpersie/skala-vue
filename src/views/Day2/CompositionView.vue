<script setup>
// block 1
import { ref } from 'vue'
const count = ref(0)
const name = ref('홍길동')
const isActive = ref(true)
const items = ref(['사과', '배'])
const user = ref({ name: '이순신', age: 30 })
const fruit = ref('')
const increaseRef = () => {
  count.value++
}
const changeUserName = () => {
  user.value.name = name.value
}

// block 2
import { reactive } from 'vue'
const userReactive = reactive({ name: '이순신', age: 30 })
const celebrateReactive = () => {
  userReactive.age++
}
const reactiveItems = reactive(['사과', '바나나'])
const addItem = () => {
  reactiveItems.push(`과일 ${reactiveItems.length + 1}`)
}
const removeItem = (index) => {
  reactiveItems.splice(index, 1)
}
</script>

<template>
  <!-- block 1, ref -->
  <div class="practice-section">
    <h2>반응형 상태 ref() 기초</h2>
    <p>
      Ref 카운트: <strong>{{ count }}</strong>
    </p>
    <p>이름: <input v-model="name" />{{ name }}</p>
    <p>활성 상태: {{ isActive ? '활성' : '비활성' }}</p>
    <p>과일 목록: {{ items.join(', ') }}</p>
    <p>먹고 싶은 과일: <input v-model="fruit" />{{ fruit }}</p>
    <p>사용자 정보: 이름- {{ user.name }}, 나이- {{ user.age }}</p>
    <button @click="increaseRef">Ref 변수 증가</button>
    <button @click="isActive = !isActive">활성 버튼</button>
    <button @click="items.push(fruit)">과일 추가</button>
    <button @click="user.age++">사용자 나이 증가</button>
    <button @click="changeUserName">사용자 이름 변경</button>
  </div>

  <!-- block 2, reactive -->
  <div class="practice-section">
    <h2>반응형 상태 reactive() 특징 및 주의점</h2>
    <h3>1) 객체(Object) reactive</h3>
    <p>이름: {{ userReactive.name }} / 나이: {{ userReactive.age }}세</p>
    <button @click="celebrateReactive">reactive 나이 한 살 추가</button>
    <h3>2) 배열(Array) reactive</h3>
    <ul>
      <li v-for="(item, reactiveIndex) in reactiveItems" :key="reactiveIndex">
        {{ item }}
        <button @click="removeItem(reactiveIndex)" style="margin-left: 8px; padding: 2px 6px">
          삭제
        </button>
      </li>
    </ul>
    <button @click="addItem">과일 항목 추가</button>
  </div>
</template>
