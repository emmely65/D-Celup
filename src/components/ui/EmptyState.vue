<script setup>
defineProps({
  title: { type: String, default: 'Belum ada data' },
  description: { type: String, default: 'Data akan muncul setelah tersedia.' }
})
</script>

<template>
  <div class="rounded-xl border border-dashed border-dcelup-border bg-dcelup-creamSoft p-8 text-center">
    <p class="text-lg font-bold text-dcelup-text">{{ title }}</p>
    <p class="mt-1 text-sm text-dcelup-textSoft">{{ description }}</p>
  </div>
</template>
