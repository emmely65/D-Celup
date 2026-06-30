<script setup>
import { reactive, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { reportApi } from '@/api/reportApi'
import { downloadBlob } from '@/utils/fileDownload'
import { formatRupiah } from '@/utils/currency'
import { LABEL_SELISIH_KAS, LABEL_PEMASUKAN, LABEL_PENGELUARAN } from '@/constants/labels'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'

const uiStore = useUiStore()
const { extractMessage } = useApiError()
const filters = reactive({ date_from: new Date().toISOString().slice(0, 10), date_to: new Date().toISOString().slice(0, 10) })
const report = ref(null)
const isLoading = ref(false)

async function fetchCustom() {
  isLoading.value = true
  try { report.value = (await reportApi.custom(filters)).data.data }
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
  </DashboardLayout>
</template>
