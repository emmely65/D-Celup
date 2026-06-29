<script setup>
defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
    :class="{
      'bg-dcelup-red text-white hover:bg-dcelup-redDark': variant === 'primary',
      'border border-dcelup-red bg-dcelup-creamSoft text-dcelup-red hover:bg-dcelup-cream': variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
      'bg-dcelup-yellow text-dcelup-text hover:brightness-95': variant === 'accent',
      'bg-white text-dcelup-text border border-dcelup-border hover:bg-dcelup-creamSoft': variant === 'ghost'
    }"
  >
    <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
    <slot />
  </button>
</template>
