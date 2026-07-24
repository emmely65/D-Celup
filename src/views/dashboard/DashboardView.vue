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
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Dashboard</h1>
      <p class="truncate text-sm text-dcelup-textSoft hidden sm:block">Ringkasan usaha D'Celup hari ini.</p>
    </template>
    <template #header-actions>
      <BaseButton variant="secondary" :loading="dashboardStore.isLoading" @click="refreshDashboard">Refresh</BaseButton>
    </template>

    <!-- ADMIN SUMMARY CARDS -->
    <div v-if="authStore.isAdmin" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard title="Pemasukan Hari Ini" :value="formatRupiah(adminSummary.total_income ?? adminSummary.total_sales ?? 0)" :caption="LABEL_PEMASUKAN" />
      <KpiCard title="Pengeluaran Hari Ini" :value="formatRupiah(adminSummary.total_expense ?? adminSummary.total_expenses ?? 0)" :caption="LABEL_PENGELUARAN" tone="yellow" />
      <KpiCard :title="LABEL_SELISIH_KAS" :value="formatRupiah(adminSummary.cash_difference ?? adminSummary.estimated_cash_difference ?? 0)" caption="Bukan laba bersih formal" />
      <KpiCard title="Transaksi" :value="adminSummary.total_transactions ?? adminSummary.transaction_count ?? 0" caption="Hari ini" />
    </div>

    <!-- CASHIER SUMMARY CARDS -->
    <div v-else class="grid gap-4 md:grid-cols-2">
      <KpiCard title="Transaksi Hari Ini" :value="cashierSummary.my_transaction_count ?? cashierSummary.total_transactions ?? cashierSummary.transaction_count ?? 0" caption="Data kasir" />
      <KpiCard title="Pemasukan Hari Ini" :value="formatRupiah(cashierSummary.my_total_sales ?? cashierSummary.total_sales ?? cashierSummary.total_income ?? 0)" caption="Dari transaksi" />
    </div>

    <!-- CHARTS & LOW STOCK WIDGET -->
    <div class="mt-5 grid gap-4 xl:grid-cols-[2fr_1fr]">
      <WeeklySalesChart />
      <LowStockWidget :materials="dashboardStore.lowStockMaterials" />
    </div>

    <!-- TOP PRODUCTS SECTION -->
    <section class="mt-5 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4 shadow-sm">
      <div class="flex items-center justify-between mb-3 border-b border-dcelup-border pb-2">
        <h2 class="font-black text-lg text-dcelup-redDark flex items-center gap-2">
          <span>🔥</span> Top Produk Terlaris
        </h2>
        <span class="text-xs font-bold text-dcelup-textSoft">Berdasarkan Total Terjual</span>
      </div>

      <div v-if="dashboardStore.topProducts.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div
          v-for="(item, idx) in dashboardStore.topProducts"
          :key="item.id ?? idx"
          class="rounded-xl border border-dcelup-border bg-white p-3.5 shadow-sm transition-all hover:shadow-md"
        >
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="rounded-full bg-dcelup-yellow px-2.5 py-0.5 text-xs font-black text-dcelup-text">
              #{{ idx + 1 }}
            </span>
            <span class="text-xs font-bold text-dcelup-red">
              {{ formatRupiah(item.total_revenue ?? 0) }}
            </span>
          </div>

          <p class="font-black text-dcelup-text text-sm truncate" :title="item.product_name">
            {{ item.product_name }}
          </p>
          
          <p class="text-xs font-semibold text-dcelup-textSoft truncate" :title="item.variant_name || item.sauce_name">
            {{ item.variant_name || item.sauce_name || '-' }}
          </p>

          <div class="mt-3 flex items-center justify-between border-t border-dcelup-border/60 pt-2 text-xs">
            <span class="text-dcelup-textSoft font-semibold">Terjual</span>
            <span class="font-extrabold text-dcelup-redDark text-sm">
              {{ item.total_qty ?? item.qty ?? 0 }} pcs
            </span>
          </div>
        </div>
      </div>

      <p v-else class="text-sm text-dcelup-textSoft py-2">Belum ada data produk terlaris dari transaksi.</p>
    </section>
  </DashboardLayout>
</template>
