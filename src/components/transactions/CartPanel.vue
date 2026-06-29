<script setup>
import { ShoppingCart } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'
import { formatRupiah } from '@/utils/currency'

defineEmits(['checkout'])
const cartStore = useCartStore()
</script>

<template>
  <button
    v-if="!cartStore.isEmpty"
    class="fixed bottom-20 left-3 right-3 z-20 flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-dcelup-red px-4 py-3 text-white shadow-xl sm:left-4 sm:right-4 md:bottom-6 md:left-auto md:right-6 md:w-[360px] lg:right-8 lg:w-[420px]"
    @click="$emit('checkout')"
  >
    <span class="flex shrink-0 items-center gap-2 font-bold"><ShoppingCart class="h-5 w-5" /> {{ cartStore.totalItems }} item</span>
    <span class="min-w-0 truncate text-right font-black">{{ formatRupiah(cartStore.totalAmount) }} - BAYAR</span>
  </button>
</template>
