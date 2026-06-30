<script setup>
import { onMounted, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import CancelTransactionModal from '@/components/transactions/CancelTransactionModal.vue'
import { transactionApi } from '@/api/transactionApi'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useApiError } from '@/composables/useApiError'
import { unwrapList, unwrapMeta } from '@/utils/normalizer'
import { formatRupiah } from '@/utils/currency'
import { formatDateTime, isWithinOneHourFromServerCreatedAt } from '@/utils/date'
import { TRANSACTION_STATUS_CONFIG } from '@/constants/status'

const uiStore = useUiStore()
const authStore = useAuthStore()
const { extractMessage } = useApiError()
const transactions = ref([])
const meta = ref(null)
const isLoading = ref(false)
const cancelLoading = ref(false)
const cancelTarget = ref(null)
const filters = ref({ date_from: '', date_to: '' })

onMounted(fetchTransactions)

async function fetchTransactions(page = 1) {
  isLoading.value = true
  try {
    const response = await transactionApi.getAll({ ...filters.value, page })
    transactions.value = unwrapList(response)
    meta.value = unwrapMeta(response)
  } catch (error) {
    uiStore.showToast('error', extractMessage(error))
  } finally {
    isLoading.value = false
  }
}

function canCancel(transaction) {
  if (transaction.status !== 'paid') return false
  if (authStore.isAdmin) return true
  const ownerId = transaction.user_id ?? transaction.user?.id
  return Number(ownerId) === Number(authStore.user?.id) && isWithinOneHourFromServerCreatedAt(transaction.created_at)
}

async function submitCancel(payload) {
  cancelLoading.value = true
  try {
    await transactionApi.cancel(cancelTarget.value.id, payload)
    uiStore.showToast('success', 'Transaksi berhasil dibatalkan')
    cancelTarget.value = null
    await fetchTransactions(meta.value?.current_page ?? 1)
  } catch (error) {
    uiStore.showToast('error', extractMessage(error))
  } finally {
    cancelLoading.value = false
  }
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Riwayat Transaksi</h1>
      <p class="truncate text-sm text-dcelup-textSoft hidden sm:block">Pantau transaksi dan pembatalan.</p>
    </template>
    
    <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div class="grid w-full gap-2 sm:grid-cols-[1fr_1fr_auto] lg:w-auto">
        <input v-model="filters.date_from" type="date" class="min-h-11 rounded-xl border border-dcelup-border px-3" />
        <input v-model="filters.date_to" type="date" class="min-h-11 rounded-xl border border-dcelup-border px-3" />
        <BaseButton class="w-full" @click="fetchTransactions(1)">Filter</BaseButton>
      </div>
    </div>

    <!-- BUG-11: LoadingBlock ditambahkan — isLoading sudah ada tapi tidak pernah ditampilkan di template -->
    <LoadingBlock v-if="isLoading" />

    <div v-else class="overflow-hidden rounded-xl border border-dcelup-border bg-dcelup-creamSoft">
      <div class="hidden grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] gap-3 bg-dcelup-cream px-4 py-3 text-sm font-black text-dcelup-redDark xl:grid">
        <span>Kode</span><span>Tanggal</span><span>Kasir</span><span>Total</span><span>Status</span><span>Aksi</span>
      </div>
      <EmptyState v-if="!transactions.length" title="Belum ada transaksi" />
      <div v-for="trx in transactions" :key="trx.id" class="grid gap-2 border-t border-dcelup-border px-4 py-3 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] xl:items-center">
        <RouterLink :to="`/transactions/${trx.id}`" class="font-black text-dcelup-red">{{ trx.trx_code ?? `#${trx.id}` }}</RouterLink>
        <span class="text-sm">{{ formatDateTime(trx.created_at ?? trx.trx_date) }}</span>
        <span class="text-sm">{{ trx.user?.name ?? '-' }}</span>
        <span class="font-black">{{ formatRupiah(trx.total_amount) }}</span>
        <span class="w-fit rounded-full border px-2 py-1 text-xs font-bold" :class="TRANSACTION_STATUS_CONFIG[trx.status]?.class">
          {{ TRANSACTION_STATUS_CONFIG[trx.status]?.label ?? trx.status }}
        </span>
        <BaseButton v-if="canCancel(trx)" variant="danger" @click="cancelTarget = trx">Batalkan</BaseButton>
      </div>
    </div>

    <CancelTransactionModal :open="!!cancelTarget" :loading="cancelLoading" @close="cancelTarget = null" @submit="submitCancel" />
  </DashboardLayout>
</template>
