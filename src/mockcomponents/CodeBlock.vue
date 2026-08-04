<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="code-block">
    <div class="code-block__label">{{ label }}</div>
    <code>{{ value || '값이 없습니다.' }}</code>
  </div>
</template>

<style scoped>
.code-block {
  padding: 0.75rem 1rem;
  background: var(--magpie-black);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow-x: auto;
}

.code-block__label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(250, 250, 250, 0.55);
  margin-bottom: 0.5rem;
}

.code-block code {
  display: block;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Fira Code', ui-monospace, monospace;
  font-size: 0.8rem;
  line-height: 1.55;
  color: var(--magpie-white);
}
</style>
