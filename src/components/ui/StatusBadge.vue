<script setup>
defineProps({
  label: { type: String, required: true },
  className: { type: String, default: 'bg-dcelup-cream text-dcelup-text border-dcelup-border' }
})
</script>

<template>
  <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold" :class="className">
    {{ label }}
  </span>
</template>
