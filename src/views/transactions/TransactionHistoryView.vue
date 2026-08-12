<script setup>
import { onMounted, ref } from 'vue'
import { ReceiptText, Calendar, Filter, Eye, Trash2 } from 'lucide-vue-next'
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
    const response = await transactionApi.getAll({ 
      ...filters.value, 
      page, 
      sort: 'desc', 
      sort_by: 'created_at', 
      sort_dir: 'desc', 
      order_by: 'created_at' 
    })
    
    const list = unwrapList(response)
    transactions.value = list.sort((a, b) => new Date(b.created_at || b.trx_date) - new Date(a.created_at || a.trx_date))
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
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-dcelup-red/10 text-dcelup-red">
          <ReceiptText class="h-5 w-5" />
        </span>
        <div>
          <h1 class="truncate text-lg font-black text-dcelup-text">Riwayat Pemasukan</h1>
        </div>
      </div>
    </template>
    
    <!-- FILTER BAR -->
    <section class="mt-4 rounded-2xl border border-dcelup-border/80 bg-white p-4 shadow-xs">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="grid w-full items-end gap-3 sm:grid-cols-2 lg:w-auto">
          <div>
            <label class="mb-1 block text-xs font-extrabold text-dcelup-text uppercase tracking-wider">Dari Tanggal</label>
            <input v-model="filters.date_from" type="date" class="h-11 w-full rounded-xl border border-dcelup-border/70 bg-dcelup-creamSoft/40 px-3.5 text-sm font-bold text-dcelup-text outline-none focus:border-dcelup-red focus:bg-white transition-all" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-extrabold text-dcelup-text uppercase tracking-wider">Sampai Tanggal</label>
            <input v-model="filters.date_to" type="date" class="h-11 w-full rounded-xl border border-dcelup-border/70 bg-dcelup-creamSoft/40 px-3.5 text-sm font-bold text-dcelup-text outline-none focus:border-dcelup-red focus:bg-white transition-all" />
          </div>
        </div>
        <BaseButton class="h-11 min-w-[130px]" @click="fetchTransactions(1)">
          <Filter class="h-4 w-4 mr-1.5" />
          Filter
        </BaseButton>
      </div>
    </section>

    <!-- LOADING & CONTENT -->
    <div class="mt-5">
      <LoadingBlock v-if="isLoading" />

      <div v-else class="overflow-hidden rounded-2xl border border-dcelup-border/80 bg-white shadow-xs">
        <EmptyState v-if="!transactions.length" title="Belum ada transaksi" description="Tidak ada transaksi yang sesuai dengan filter tanggal Anda." />
        
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-dcelup-cream/70 border-b border-dcelup-border/80 text-dcelup-redDark text-xs font-black uppercase tracking-wider">
                <th class="py-3.5 px-4 text-left">Kode Transaksi</th>
                <th class="py-3.5 px-4 text-left">Tanggal & Waktu</th>
                <th class="py-3.5 px-4 text-left">Kasir</th>
                <th class="py-3.5 px-4 text-right">Total Nilai</th>
                <th class="py-3.5 px-4 text-center">Status Pembayaran</th>
                <th class="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dcelup-border/40">
              <tr v-for="trx in transactions" :key="trx.id" class="hover:bg-dcelup-creamSoft/60 transition-colors">
                <td class="py-3.5 px-4 align-middle whitespace-nowrap">
                  <RouterLink :to="`/transactions/${trx.id}`" class="font-extrabold text-dcelup-red hover:underline inline-flex items-center gap-1.5">
                    <ReceiptText class="h-4 w-4 shrink-0 text-dcelup-red/70" />
                    <span>{{ trx.trx_code ?? `#${trx.id}` }}</span>
                  </RouterLink>
                </td>
                
                <td class="py-3.5 px-4 align-middle whitespace-nowrap text-xs font-semibold text-dcelup-textSoft">
                  {{ formatDateTime(trx.created_at ?? trx.trx_date) }}
                </td>
                
                <td class="py-3.5 px-4 align-middle whitespace-nowrap text-xs font-bold text-dcelup-text">
                  {{ trx.user?.name ?? '-' }}
                </td>
                
                <td class="py-3.5 px-4 align-middle whitespace-nowrap text-right text-sm font-black text-dcelup-redDark">
                  {{ formatRupiah(trx.total_amount) }}
                </td>
                
                <td class="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                  <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold" :class="TRANSACTION_STATUS_CONFIG[trx.status]?.class">
                    {{ TRANSACTION_STATUS_CONFIG[trx.status]?.label ?? trx.status }}
                  </span>
                </td>

                <td class="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                  <div class="inline-flex items-center justify-end gap-2">
                    <RouterLink :to="`/transactions/${trx.id}`" class="inline-flex items-center gap-1 rounded-xl bg-dcelup-cream px-3 py-1.5 text-xs font-bold text-dcelup-textSoft hover:bg-dcelup-cream/80 hover:text-dcelup-text transition-all">
                      <Eye class="h-3.5 w-3.5" />
                      <span>Detail</span>
                    </RouterLink>
                    <BaseButton v-if="canCancel(trx)" variant="danger" class="!px-3 !py-1.5 text-xs" @click="cancelTarget = trx">
                      <Trash2 class="h-3.5 w-3.5 mr-1" />
                      Batal
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <CancelTransactionModal :open="!!cancelTarget" :loading="cancelLoading" @close="cancelTarget = null" @submit="submitCancel" />
  </DashboardLayout>
</template>
