<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="practice-section">
    <h2>반응성(Reactivity) 기초</h2>
    <p>
      count: <strong>{{ count }}</strong>
    </p>
    <button @click="count++">증가</button>
  </div>
</template>


