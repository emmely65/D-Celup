<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { transactionApi } from '@/api/transactionApi'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'
import { formatRupiah } from '@/utils/currency'
import { formatDateTime } from '@/utils/date'
import { TRANSACTION_STATUS_CONFIG } from '@/constants/status'

const route = useRoute()
const uiStore = useUiStore()
const { extractMessage } = useApiError()
const transaction = ref(null)
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    const res = await transactionApi.getById(route.params.id)
    transaction.value = res.data.data
  } catch (error) {
    // BUG-04: Catch sebelumnya tidak ada — user hanya melihat layar kosong saat API gagal
    uiStore.showToast('error', extractMessage(error))
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-red">{{ transaction?.trx_code ?? `#${transaction?.id}` }}</h1>
      <p class="truncate text-sm text-dcelup-textSoft hidden sm:block" v-if="transaction">{{ formatDateTime(transaction.created_at ?? transaction.trx_date) }}</p>
    </template>
    <LoadingBlock v-if="isLoading" />
    <section v-else-if="transaction" class="rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-5">
      <div class="flex flex-wrap items-start justify-end gap-3">
        <span class="rounded-full border px-3 py-1 text-sm font-bold" :class="TRANSACTION_STATUS_CONFIG[transaction.status]?.class">
          {{ TRANSACTION_STATUS_CONFIG[transaction.status]?.label ?? transaction.status }}
        </span>
      </div>

      <div class="mt-5 grid gap-3 md:grid-cols-3">
        <div class="rounded-xl bg-white p-3"><p class="text-xs text-dcelup-textSoft">Customer</p><p class="font-bold">{{ transaction.customer_name ?? 'Pembeli Umum' }}</p></div>
        <div class="rounded-xl bg-white p-3"><p class="text-xs text-dcelup-textSoft">Metode</p><p class="font-bold uppercase">{{ transaction.payment_method }}</p></div>
        <div class="rounded-xl bg-dcelup-yellow p-3"><p class="text-xs text-dcelup-text">Total</p><p class="font-black">{{ formatRupiah(transaction.total_amount) }}</p></div>
      </div>

      <h2 class="mt-6 font-black">Item</h2>
      <div class="mt-3 space-y-2">
        <div v-for="item in transaction.items ?? transaction.transaction_items ?? []" :key="item.id" class="flex justify-between rounded-xl bg-white p-3">
          <div>
            <p class="font-bold">{{ item.product_variant?.sauce_name ?? item.variant?.sauce_name ?? 'Item' }}</p>
            <p class="text-xs text-dcelup-textSoft">Qty {{ item.qty }} x {{ formatRupiah(item.unit_price) }}</p>
          </div>
          <p class="font-black">{{ formatRupiah(item.subtotal) }}</p>
        </div>
      </div>
    </section>
  </DashboardLayout>
</template>
