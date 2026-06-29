<script setup>
import { getStockStatus } from '@/constants/status'
defineProps({ materials: { type: Array, default: () => [] } })
</script>

<template>
  <section class="rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="font-extrabold text-dcelup-text">Stok Menipis</h2>
      <RouterLink to="/raw-materials" class="text-sm font-semibold text-dcelup-red">Lihat stok</RouterLink>
    </div>
    <div v-if="materials.length" class="space-y-2">
      <div v-for="item in materials" :key="item.id" class="flex items-center justify-between rounded-xl bg-white px-3 py-2">
        <div>
          <p class="font-bold">{{ item.name }}</p>
          <p class="text-xs text-dcelup-textSoft">{{ item.current_stock }} {{ item.unit }} · Min {{ item.min_stock }}</p>
        </div>
        <span class="rounded-full border px-2 py-1 text-xs font-bold" :class="getStockStatus(item.current_stock, item.min_stock).class">
          {{ getStockStatus(item.current_stock, item.min_stock).label }}
        </span>
      </div>
    </div>
    <p v-else class="rounded-xl bg-white p-3 text-sm text-dcelup-textSoft">Tidak ada bahan menipis.</p>
  </section>
</template>
