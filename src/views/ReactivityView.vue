<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="count++">증가</button>
  </div>
</template>


