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
    class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 active:scale-97 disabled:cursor-not-allowed disabled:opacity-60 shadow-2xs"
    :class="{
      'bg-dcelup-red text-white hover:bg-dcelup-redDark shadow-dcelup-red/15 hover:shadow-md': variant === 'primary',
      'border border-dcelup-border bg-white text-dcelup-text hover:bg-dcelup-creamSoft hover:border-dcelup-red/40': variant === 'secondary',
      'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/15': variant === 'danger',
      'bg-amber-400 text-amber-950 hover:bg-amber-500 font-black shadow-amber-400/20': variant === 'accent',
      'bg-white text-dcelup-text border border-dcelup-border/80 hover:bg-dcelup-creamSoft': variant === 'ghost'
    }"
  >
    <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
    <slot />
  </button>
</template>

