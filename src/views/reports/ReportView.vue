<script setup>
import { reactive, ref, onMounted } from 'vue'
import { BarChart3, Calendar, FileText, FileSpreadsheet, Filter } from 'lucide-vue-next'
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

onMounted(() => {
  fetchCustom()
})
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-dcelup-red/10 text-dcelup-red">
          <BarChart3 class="h-5 w-5" />
        </span>
        <div>
          <h1 class="truncate text-lg font-black text-dcelup-text">Laporan Keuangan</h1>
          <p class="truncate text-xs font-semibold text-dcelup-textSoft hidden sm:block">Ringkasan arus kas, ekspor laporan, dan perincian data.</p>
        </div>
      </div>
    </template>

    <!-- FILTER & EXPORT SECTION -->
    <section class="mt-4 rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 items-end">
        <div>
          <label class="mb-1 block text-xs font-extrabold text-dcelup-text uppercase tracking-wider">Dari Tanggal</label>
          <input v-model="filters.date_from" type="date" class="h-11 w-full rounded-xl border border-dcelup-border/70 bg-dcelup-creamSoft/40 px-3.5 text-sm font-bold text-dcelup-text outline-none focus:border-dcelup-red focus:bg-white transition-all" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-extrabold text-dcelup-text uppercase tracking-wider">Sampai Tanggal</label>
          <input v-model="filters.date_to" type="date" class="h-11 w-full rounded-xl border border-dcelup-border/70 bg-dcelup-creamSoft/40 px-3.5 text-sm font-bold text-dcelup-text outline-none focus:border-dcelup-red focus:bg-white transition-all" />
        </div>
        <BaseButton class="h-11" :loading="isLoading" @click="fetchCustom">
          <Filter class="h-4 w-4 mr-1.5" />
          Tampilkan
        </BaseButton>
        <div class="grid grid-cols-2 gap-2">
          <BaseButton variant="secondary" class="h-11 !px-2 text-xs" @click="download('pdf')">
            <FileText class="h-4 w-4 mr-1 text-dcelup-red" />
            Export PDF
          </BaseButton>
          <BaseButton variant="accent" class="h-11 !px-2 text-xs" @click="download('excel')">
            <FileSpreadsheet class="h-4 w-4 mr-1 text-emerald-800" />
            Export Excel
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- KPI CARDS -->
    <div class="mt-5 grid gap-4 md:grid-cols-3">
      <KpiCard :title="LABEL_PEMASUKAN" :value="formatRupiah(report?.summary?.total_income ?? report?.summary?.total_sales ?? 0)" tone="emerald" caption="Total transaksi lunas" />
      <KpiCard :title="LABEL_PENGELUARAN" :value="formatRupiah(report?.summary?.total_expense ?? report?.summary?.total_expenses ?? 0)" tone="rose" caption="Total pengeluaran tercatat" />
      <KpiCard :title="LABEL_SELISIH_KAS" :value="formatRupiah(report?.summary?.cash_difference ?? report?.summary?.estimated_cash_difference ?? 0)" tone="amber" caption="Bukan laporan laba bersih formal" />
    </div>

    <!-- DETAIL PEMASUKAN & PENGELUARAN -->
    <div v-if="report" class="mt-6 grid gap-6 xl:grid-cols-2">
      <!-- Pemasukan -->
      <div class="rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between mb-4 border-b border-dcelup-border/50 pb-3">
          <h2 class="font-black text-dcelup-text text-base flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              ✓
            </span>
            Detail Pemasukan ({{ transactions.length }})
          </h2>
        </div>
        <div class="max-h-[400px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
          <div v-if="!transactions.length" class="text-sm font-semibold text-dcelup-textSoft py-6 text-center">Tidak ada pemasukan di periode ini.</div>
          <div v-for="trx in transactions" :key="trx.id" class="flex items-center justify-between rounded-xl border border-dcelup-border/40 bg-dcelup-creamSoft/30 p-3 hover:bg-dcelup-creamSoft/60 transition-colors">
            <div>
              <p class="font-black text-sm text-dcelup-text">{{ trx.trx_code ?? `#${trx.id}` }}</p>
              <p class="text-xs font-semibold text-dcelup-textSoft mt-0.5">{{ formatDateTime(trx.created_at ?? trx.trx_date) }}</p>
            </div>
            <div class="text-right">
              <p class="font-black text-dcelup-redDark">{{ formatRupiah(trx.total_amount) }}</p>
              <span class="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1" 
                 :class="trx.status === 'paid' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300/50' : 'bg-rose-100 text-rose-700 border border-rose-300/50'">
                {{ trx.status === 'paid' ? 'Lunas' : trx.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pengeluaran -->
      <div class="rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between mb-4 border-b border-dcelup-border/50 pb-3">
          <h2 class="font-black text-dcelup-text text-base flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              ↓
            </span>
            Detail Pengeluaran ({{ expenses.length }})
          </h2>
        </div>
        <div class="max-h-[400px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
          <div v-if="!expenses.length" class="text-sm font-semibold text-dcelup-textSoft py-6 text-center">Tidak ada pengeluaran di periode ini.</div>
          <div v-for="exp in expenses" :key="exp.id" class="flex items-center justify-between rounded-xl border border-dcelup-border/40 bg-dcelup-creamSoft/30 p-3 hover:bg-dcelup-creamSoft/60 transition-colors">
            <div>
              <p class="font-black text-sm text-dcelup-text">{{ exp.item_name ?? exp.description }}</p>
              <p class="text-xs font-semibold text-dcelup-textSoft mt-0.5">{{ exp.category?.name ?? exp.expense_category?.name ?? '-' }} · {{ formatDate(exp.expense_date) }}</p>
            </div>
            <p class="font-black text-dcelup-redDark">{{ formatRupiah(exp.amount) }}</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
