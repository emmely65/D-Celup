<script setup>
import { AlertTriangle, ChevronRight, PackageCheck } from 'lucide-vue-next'
import { getStockStatus } from '@/constants/status'
import { formatNumber } from '@/utils/number'
defineProps({ materials: { type: Array, default: () => [] } })
</script>

<template>
  <section class="rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs flex flex-col justify-between">
    <div>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-black text-base text-dcelup-text flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <AlertTriangle class="h-4 w-4" />
          </span>
          Stok Menipis
        </h2>
        <RouterLink
          to="/raw-materials"
          class="inline-flex items-center gap-1 text-xs font-bold text-dcelup-red hover:underline"
        >
          <span>Lihat Semua</span>
          <ChevronRight class="h-3.5 w-3.5" />
        </RouterLink>
      </div>

      <div v-if="materials.length" class="space-y-2.5">
        <div
          v-for="item in materials"
          :key="item.id"
          class="flex items-center justify-between rounded-xl bg-dcelup-creamSoft/60 border border-dcelup-border/50 p-3 transition-all hover:bg-dcelup-creamSoft"
        >
          <div class="min-w-0 pr-2">
            <p class="font-black text-sm text-dcelup-text truncate">{{ item.name }}</p>
            <p class="text-xs font-medium text-dcelup-textSoft mt-0.5">
              Stok: <span class="font-bold text-dcelup-red">{{ formatNumber(item.current_stock) }} {{ item.unit }}</span>
              <span class="text-dcelup-textSoft/60"> (Min: {{ formatNumber(item.min_stock) }})</span>
            </p>
          </div>
          <span
            class="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold"
            :class="getStockStatus(item.current_stock, item.min_stock).class"
          >
            {{ getStockStatus(item.current_stock, item.min_stock).label }}
          </span>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-6 text-center rounded-xl bg-emerald-50/50 border border-emerald-100 p-4">
        <PackageCheck class="h-8 w-8 text-emerald-500 mb-2" />
        <p class="font-bold text-sm text-emerald-900">Semua Stok Aman</p>
        <p class="text-xs text-emerald-700 mt-0.5">Tidak ada bahan baku yang berada di bawah stok minimal.</p>
      </div>
    </div>
  </section>
</template>

