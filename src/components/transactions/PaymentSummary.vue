<script setup>
import { computed, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'
import { PAYMENT_METHODS } from '@/constants/paymentMethods'
import { formatRupiah } from '@/utils/currency'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({ open: { type: Boolean, default: false }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'submit'])
const cartStore = useCartStore()
const localPaidAmount = ref(cartStore.paidAmount || cartStore.totalAmount)

watch(() => props.open, (isOpen) => {
  if (isOpen) localPaidAmount.value = cartStore.paidAmount || cartStore.totalAmount
})

watch(() => cartStore.totalAmount, (newTotal) => {
  if (props.open && Number(localPaidAmount.value) < newTotal) {
    localPaidAmount.value = newTotal
  }
})

const canSubmit = computed(() => !cartStore.isEmpty && Number(localPaidAmount.value) >= cartStore.totalAmount)

function submit() {
  cartStore.setPayment({ paidAmount: Number(localPaidAmount.value) })
  emit('submit')
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 bg-black/40" @click.self="$emit('close')">
    <section class="absolute bottom-0 left-0 right-0 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-dcelup-creamSoft p-4 shadow-2xl md:bottom-auto md:left-1/2 md:top-1/2 md:w-[min(720px,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:p-5">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-xl font-black text-dcelup-text">Pembayaran</h2>
        <button class="shrink-0 rounded-xl bg-dcelup-cream p-2" @click="$emit('close')"><X class="h-5 w-5" /></button>
      </div>

      <div class="max-h-52 space-y-2 overflow-y-auto pr-1 md:max-h-64">
        <div v-for="item in cartStore.items" :key="item.product_variant_id" class="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2">
          <div class="min-w-0">
            <p class="font-bold">{{ item.product_name }} - {{ item.sauce_name }}</p>
            <p class="text-xs text-dcelup-textSoft">{{ item.type }} - {{ item.qty }} x {{ formatRupiah(item.price) }}</p>
          </div>
          <p class="shrink-0 font-black text-dcelup-redDark">{{ formatRupiah(item.subtotal) }}</p>
        </div>
      </div>

      <div class="mt-4 rounded-xl bg-dcelup-cream p-3">
        <label class="mb-2 block text-sm font-bold">Nama pelanggan</label>
        <input v-model="cartStore.customerName" placeholder="Pembeli Umum" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3 outline-none focus:border-dcelup-red" />

        <label class="mb-2 mt-3 block text-sm font-bold">Metode bayar</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="method in PAYMENT_METHODS"
            :key="method.value"
            class="min-h-11 rounded-xl border text-sm font-bold"
            :class="cartStore.paymentMethod === method.value ? 'border-dcelup-red bg-dcelup-red text-white' : 'border-dcelup-border bg-white text-dcelup-text'"
            @click="cartStore.setPayment({ paymentMethod: method.value })"
          >
            {{ method.label }}
          </button>
        </div>

        <label class="mb-2 mt-3 block text-sm font-bold">Nominal bayar</label>
        <input v-model="localPaidAmount" type="number" min="0" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3 text-lg font-bold outline-none focus:border-dcelup-red" />
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-xl bg-white p-3">
          <p class="text-xs font-semibold text-dcelup-textSoft">Total Estimasi</p>
          <p class="break-words text-lg font-black text-dcelup-redDark sm:text-xl">{{ formatRupiah(cartStore.totalAmount) }}</p>
        </div>
        <div class="rounded-xl bg-dcelup-yellow p-3">
          <p class="text-xs font-semibold text-dcelup-text">Kembalian</p>
          <p class="break-words text-lg font-black text-dcelup-text sm:text-xl">{{ formatRupiah(Math.max(0, Number(localPaidAmount || 0) - cartStore.totalAmount)) }}</p>
        </div>
      </div>

      <p v-if="Number(localPaidAmount || 0) < cartStore.totalAmount" class="mt-3 text-sm font-semibold text-red-600">Nominal bayar belum cukup.</p>

      <BaseButton class="mt-4 w-full" :loading="loading" :disabled="!canSubmit" @click="submit">
        SIMPAN TRANSAKSI
      </BaseButton>
    </section>
  </div>
</template>
