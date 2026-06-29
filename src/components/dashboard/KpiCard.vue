<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], default: '-' },
  caption: { type: String, default: '' },
  tone: { type: String, default: 'red' }
})
</script>

<template>
  <div class="rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4 shadow-sm">
    <p class="text-sm font-semibold text-dcelup-textSoft">{{ title }}</p>
    <p class="mt-2 text-2xl font-extrabold" :class="tone === 'yellow' ? 'text-dcelup-text' : 'text-dcelup-redDark'">{{ value }}</p>
    <p v-if="caption" class="mt-1 text-xs text-dcelup-textSoft">{{ caption }}</p>
  </div>
</template>
