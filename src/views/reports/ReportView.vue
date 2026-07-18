<script setup>
import { reactive, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { reportApi } from '@/api/reportApi'
import { transactionApi } from '@/api/transactionApi'
import { expenseApi } from '@/api/expenseApi'
import { downloadBlob } from '@/utils/fileDownload'
import { formatRupiah } from '@/utils/currency'
import { formatDate, formatDateTime } from '@/utils/date'
import { unwrapList } from '@/utils/normalizer'
import { LABEL_SELISIH_KAS, LABEL_PEMASUKAN, LABEL_PENGELUARAN } from '@/constants/labels'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'

const uiStore = useUiStore()
const { extractMessage } = useApiError()
const filters = reactive({ date_from: new Date().toISOString().slice(0, 10), date_to: new Date().toISOString().slice(0, 10) })
const report = ref(null)
const transactions = ref([])
const expenses = ref([])
const isLoading = ref(false)

async function fetchCustom() {
  isLoading.value = true
  try {
    const [reportRes, trxRes, expRes] = await Promise.all([
      reportApi.custom(filters),
      transactionApi.getAll({ ...filters, per_page: 500, sort_by: 'created_at', sort_dir: 'desc' }),
      expenseApi.getAll({ ...filters, per_page: 500 })
    ])
    report.value = reportRes.data.data
    
    const fromStr = filters.date_from
    const toStr = filters.date_to

    // Manual filter & sort untuk transaksi
    const trxList = unwrapList(trxRes).filter(trx => {
      const dateStr = (trx.created_at || trx.trx_date || '').substring(0, 10)
      return dateStr >= fromStr && dateStr <= toStr
    })
    transactions.value = trxList.sort((a, b) => new Date(b.created_at || b.trx_date) - new Date(a.created_at || a.trx_date))
    
    // Manual filter & sort untuk pengeluaran
    const expList = unwrapList(expRes).filter(exp => {
      const dateStr = (exp.expense_date || '').substring(0, 10)
      return dateStr >= fromStr && dateStr <= toStr
    })
    expenses.value = expList.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date))
  }
  catch (e) { uiStore.showToast('error', extractMessage(e)) }
  finally { isLoading.value = false }
}
async function download(type) {
  try {
    const response = type === 'pdf' ? await reportApi.customPdf(filters) : await reportApi.customExcel(filters)
    downloadBlob(response.data, `laporan-dcelup-${filters.date_from}-${filters.date_to}.${type === 'pdf' ? 'pdf' : 'xlsx'}`)
  } catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Laporan</h1>
      <p class="truncate text-sm text-dcelup-textSoft hidden sm:block">Gunakan label {{ LABEL_SELISIH_KAS }} untuk membaca laporan kas.</p>
    </template>
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label><span class="mb-1 block text-sm font-bold">Dari</span><input v-model="filters.date_from" type="date" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3" /></label>
        <label><span class="mb-1 block text-sm font-bold">Sampai</span><input v-model="filters.date_to" type="date" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3" /></label>
        <BaseButton class="self-end" :loading="isLoading" @click="fetchCustom">Tampilkan</BaseButton>
        <div class="grid grid-cols-2 gap-2 self-end"><BaseButton variant="secondary" @click="download('pdf')">PDF</BaseButton><BaseButton variant="accent" @click="download('excel')">Excel</BaseButton></div>
      </div>
    </section>
    <div class="mt-4 grid gap-4 md:grid-cols-3">
      <KpiCard :title="LABEL_PEMASUKAN" :value="formatRupiah(report?.total_income ?? report?.total_sales ?? 0)" />
      <KpiCard :title="LABEL_PENGELUARAN" :value="formatRupiah(report?.total_expense ?? report?.total_expenses ?? 0)" />
      <KpiCard :title="LABEL_SELISIH_KAS" :value="formatRupiah(report?.cash_difference ?? report?.estimated_cash_difference ?? 0)" caption="Bukan laporan laba rugi formal" />
    </div>

    <!-- Detail Pemasukan & Pengeluaran -->
    <div v-if="report" class="mt-6 grid gap-6 xl:grid-cols-2">
      <!-- Pemasukan -->
      <div class="rounded-xl border border-dcelup-border bg-white p-4 shadow-sm">
        <h2 class="mb-4 font-extrabold text-dcelup-text text-lg">Detail Pemasukan</h2>
        <div class="max-h-[400px] overflow-y-auto pr-2">
          <div v-if="!transactions.length" class="text-sm text-dcelup-textSoft py-2">Tidak ada pemasukan di periode ini.</div>
          <div v-for="trx in transactions" :key="trx.id" class="flex items-center justify-between border-b border-gray-100 py-3 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors">
            <div>
              <p class="font-bold text-sm">{{ trx.trx_code ?? `#${trx.id}` }}</p>
              <p class="text-xs text-dcelup-textSoft mt-0.5">{{ formatDateTime(trx.created_at ?? trx.trx_date) }}</p>
            </div>
            <div class="text-right">
              <p class="font-black text-dcelup-redDark">{{ formatRupiah(trx.total_amount) }}</p>
              <p class="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 w-fit ml-auto" 
                 :class="trx.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                {{ trx.status === 'paid' ? 'Lunas' : trx.status }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pengeluaran -->
      <div class="rounded-xl border border-dcelup-border bg-white p-4 shadow-sm">
        <h2 class="mb-4 font-extrabold text-dcelup-text text-lg">Detail Pengeluaran</h2>
        <div class="max-h-[400px] overflow-y-auto pr-2">
          <div v-if="!expenses.length" class="text-sm text-dcelup-textSoft py-2">Tidak ada pengeluaran di periode ini.</div>
          <div v-for="exp in expenses" :key="exp.id" class="flex items-center justify-between border-b border-gray-100 py-3 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors">
            <div>
              <p class="font-bold text-sm">{{ exp.item_name ?? exp.description }}</p>
              <p class="text-xs text-dcelup-textSoft mt-0.5">{{ exp.category?.name ?? exp.expense_category?.name ?? '-' }} · {{ formatDate(exp.expense_date) }}</p>
            </div>
            <p class="font-black text-dcelup-redDark">{{ formatRupiah(exp.amount) }}</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
