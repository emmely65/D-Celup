<script setup>
import { computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import LowStockWidget from '@/components/dashboard/LowStockWidget.vue'
import WeeklySalesChart from '@/components/dashboard/WeeklySalesChart.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/authStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { formatRupiah } from '@/utils/currency'
import { LABEL_SELISIH_KAS, LABEL_PEMASUKAN, LABEL_PENGELUARAN } from '@/constants/labels'

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

onMounted(() => refreshDashboard())

async function refreshDashboard() {
  if (authStore.isAdmin) await dashboardStore.fetchAdminDashboard()
  else await dashboardStore.fetchCashierDashboard()
}

const adminSummary = computed(() => dashboardStore.adminSummary ?? {})
const cashierSummary = computed(() => dashboardStore.cashierSummary ?? {})
</script>

<template>
  <DashboardLayout>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-black text-dcelup-text">Dashboard</h1>
        <p class="text-sm text-dcelup-textSoft">Ringkasan usaha D'Celup hari ini.</p>
      </div>
      <BaseButton variant="secondary" :loading="dashboardStore.isLoading" @click="refreshDashboard">Refresh</BaseButton>
    </div>

    <div v-if="authStore.isAdmin" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard title="Pemasukan Hari Ini" :value="formatRupiah(adminSummary.total_income ?? adminSummary.total_sales ?? 0)" :caption="LABEL_PEMASUKAN" />
      <KpiCard title="Pengeluaran Hari Ini" :value="formatRupiah(adminSummary.total_expense ?? adminSummary.total_expenses ?? 0)" :caption="LABEL_PENGELUARAN" tone="yellow" />
      <KpiCard :title="LABEL_SELISIH_KAS" :value="formatRupiah(adminSummary.cash_difference ?? adminSummary.estimated_cash_difference ?? 0)" caption="Bukan laba bersih formal" />
      <KpiCard title="Transaksi" :value="adminSummary.total_transactions ?? 0" caption="Hari ini" />
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <KpiCard title="Transaksi Hari Ini" :value="cashierSummary.total_transactions ?? 0" caption="Data kasir" />
      <KpiCard title="Pemasukan Hari Ini" :value="formatRupiah(cashierSummary.total_sales ?? cashierSummary.total_income ?? 0)" caption="Dari transaksi" />
    </div>

    <div class="mt-5 grid gap-4 xl:grid-cols-[2fr_1fr]">
      <WeeklySalesChart :items="dashboardStore.weeklySales" />
      <LowStockWidget :materials="dashboardStore.lowStockMaterials" />
    </div>

    <section v-if="authStore.isAdmin" class="mt-5 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-extrabold">Top Produk</h2>
      <div class="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="item in dashboardStore.topProducts" :key="item.product_variant_id ?? item.id" class="rounded-xl bg-white p-3">
          <p class="font-bold">{{ item.name ?? item.sauce_name ?? 'Produk' }}</p>
          <p class="text-sm text-dcelup-textSoft">Terjual: {{ item.total_qty ?? item.qty ?? 0 }}</p>
        </div>
        <p v-if="!dashboardStore.topProducts.length" class="text-sm text-dcelup-textSoft">Belum ada data produk terlaris.</p>
      </div>
    </section>
  </DashboardLayout>
</template>
