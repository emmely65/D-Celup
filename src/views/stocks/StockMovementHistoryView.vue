<script setup>
import { onMounted, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { stockMovementApi } from '@/api/stockMovementApi'
import { unwrapList } from '@/utils/normalizer'
import { formatDateTime } from '@/utils/date'
import { formatRupiah } from '@/utils/currency'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'

const uiStore = useUiStore()
const { extractMessage } = useApiError()
const movements = ref([])
const isLoading = ref(false)

// BUG-07b: Tambah try/catch dan isLoading — sebelumnya tidak ada error handling atau loading indicator
onMounted(async () => {
  isLoading.value = true
  try {
    movements.value = unwrapList(await stockMovementApi.getAll({ per_page: 100 }))
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <DashboardLayout>
    <h1 class="text-2xl font-black">Riwayat Mutasi Stok</h1>
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <LoadingBlock v-if="isLoading" />
      <template v-else>
        <EmptyState v-if="!movements.length" title="Belum ada mutasi stok" />
        <div v-for="m in movements" :key="m.id" class="grid gap-2 border-b border-dcelup-border py-3 last:border-0 xl:grid-cols-6 xl:items-center">
          <span class="font-black">{{ m.raw_material?.name ?? m.material?.name ?? '-' }}</span>
          <span class="rounded-full bg-dcelup-cream px-2 py-1 text-xs font-bold uppercase">{{ m.type }}</span>
          <span>Qty {{ m.qty }}</span>
          <span>{{ m.balance_before }} → {{ m.balance_after }}</span>
          <span>{{ formatRupiah(m.total_price) }}</span>
          <span class="text-sm text-dcelup-textSoft">{{ formatDateTime(m.created_at ?? m.movement_date) }}</span>
        </div>
      </template>
    </section>
  </DashboardLayout>
</template>
