<script setup>
import { computed } from 'vue'
import { useUiStore } from '@/stores/uiStore'

const uiStore = useUiStore()

const typeClass = computed(() => ({
  success: 'border-green-200 bg-green-50 text-green-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700'
}))
</script>

<template>
  <div class="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
    <div
      v-for="toast in uiStore.toastQueue"
      :key="toast.id"
      class="rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg"
      :class="typeClass[toast.type] ?? typeClass.info"
    >
      {{ toast.message }}
    </div>
  </div>
</template>
