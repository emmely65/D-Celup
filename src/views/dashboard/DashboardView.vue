<script setup>
import { computed, onMounted } from 'vue'
import { RefreshCw, Flame, LayoutDashboard } from 'lucide-vue-next'
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
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-dcelup-red/10 text-dcelup-red">
          <LayoutDashboard class="h-4 w-4" />
        </div>
        <div>
          <h1 class="truncate text-lg font-black tracking-tight text-dcelup-text">Dashboard</h1>
        </div>
      </div>
    </template>
    <template #header-actions>
      <button
        class="inline-flex items-center gap-2 rounded-xl border border-dcelup-border bg-white px-3.5 py-2 text-xs font-bold text-dcelup-text shadow-xs transition-all hover:bg-dcelup-creamSoft hover:border-dcelup-red/30 active:scale-95 disabled:opacity-50"
        :disabled="dashboardStore.isLoading"
        @click="refreshDashboard"
      >
        <RefreshCw class="h-3.5 w-3.5 text-dcelup-red" :class="{ 'animate-spin': dashboardStore.isLoading }" />
        <span>Segarkan</span>
      </button>
    </template>

    <!-- ADMIN SUMMARY CARDS -->
    <div v-if="authStore.isAdmin" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Pemasukan Hari Ini"
        :value="formatRupiah(adminSummary.total_income ?? adminSummary.total_sales ?? 0)"
        caption="Hari ini"
        tone="emerald"
      />
      <KpiCard
        title="Pengeluaran Hari Ini"
        :value="formatRupiah(adminSummary.total_expense ?? adminSummary.total_expenses ?? 0)"
        caption="Hari ini"
        tone="rose"
      />
      <KpiCard
        :title="LABEL_SELISIH_KAS"
        :value="formatRupiah(adminSummary.cash_difference ?? adminSummary.estimated_cash_difference ?? 0)"
        caption="Estimasi Kas"
        tone="amber"
      />
      <KpiCard
        title="Total Transaksi"
        :value="adminSummary.total_transactions ?? adminSummary.transaction_count ?? 0"
        caption="Hari ini"
        tone="indigo"
      />
    </div>

    <!-- CASHIER SUMMARY CARDS -->
    <div v-else class="grid gap-4 sm:grid-cols-2">
      <KpiCard
        title="Transaksi Hari Ini"
        :value="cashierSummary.my_transaction_count ?? cashierSummary.total_transactions ?? cashierSummary.transaction_count ?? 0"
        caption="Sesi Kasir"
        tone="indigo"
      />
      <KpiCard
        title="Pemasukan Hari Ini"
        :value="formatRupiah(cashierSummary.my_total_sales ?? cashierSummary.total_sales ?? cashierSummary.total_income ?? 0)"
        caption="Total Transaksi Kasir"
        tone="emerald"
      />
    </div>

    <!-- CHARTS & LOW STOCK WIDGET -->
    <div class="mt-6 grid gap-5 xl:grid-cols-[2.2fr_1fr]">
      <WeeklySalesChart />
      <LowStockWidget :materials="dashboardStore.lowStockMaterials" />
    </div>

    <!-- TOP PRODUCTS SECTION -->
    <section class="mt-6 rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
      <div class="flex items-center justify-between mb-4 border-b border-dcelup-border/60 pb-3">
        <h2 class="font-black text-base text-dcelup-red flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <Flame class="h-4 w-4 fill-orange-500" />
          </span>
          Top Produk Terlaris
        </h2>
      </div>

      <div v-if="dashboardStore.topProducts.length" class="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div
          v-for="(item, idx) in dashboardStore.topProducts"
          :key="item.id ?? idx"
          class="hover-lift rounded-xl border border-dcelup-border/70 bg-dcelup-creamSoft/40 p-4 transition-all duration-200"
        >
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="rounded-md bg-amber-400/20 text-amber-900 border border-amber-400/30 px-2 py-0.5 text-[11px] font-black">
              #{{ idx + 1 }}
            </span>
            <span class="text-xs font-extrabold text-dcelup-red">
              {{ formatRupiah(item.total_revenue ?? 0) }}
            </span>
          </div>

          <p class="font-black text-dcelup-text text-sm truncate" :title="item.product_name">
            {{ item.product_name }}
          </p>
          
          <p class="text-xs font-medium text-dcelup-textSoft truncate mt-0.5" :title="item.variant_name || item.sauce_name">
            {{ item.variant_name || item.sauce_name || '-' }}
          </p>

          <div class="mt-3 flex items-center justify-between border-t border-dcelup-border/50 pt-2 text-xs">
            <span class="text-dcelup-textSoft/80 font-medium">Terjual</span>
            <span class="font-black text-dcelup-redDark text-sm">
              {{ item.total_qty ?? item.qty ?? 0 }} pcs
            </span>
          </div>
        </div>
      </div>

      <p v-else class="text-sm text-dcelup-textSoft py-4 text-center bg-dcelup-creamSoft/30 rounded-xl border border-dashed border-dcelup-border">
        Belum ada data produk terlaris dari transaksi.
      </p>
    </section>
  </DashboardLayout>
</template>

