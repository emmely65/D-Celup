<script setup>
import { onMounted, ref, reactive } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { stockMovementApi } from '@/api/stockMovementApi'
import { rawMaterialApi } from '@/api/rawMaterialApi'
import { unwrapList } from '@/utils/normalizer'
import { formatDateTime } from '@/utils/date'
import { formatRupiah } from '@/utils/currency'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'

const uiStore = useUiStore()
const { extractMessage } = useApiError()
const movements = ref([])
const materials = ref([])
const form = reactive({ material_id: '', actual_stock: 0, movement_date: new Date().toISOString().slice(0, 10), note: 'Update Harian' })
const isLoading = ref(false)
const isSubmitting = ref(false)

async function fetchMovements() {
  isLoading.value = true
  try {
    movements.value = unwrapList(await stockMovementApi.getAll({ per_page: 100 }))
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  } finally {
    isLoading.value = false
  }
}

async function submitUpdate() {
  if (!form.material_id) return uiStore.showToast('warning', 'Pilih bahan terlebih dahulu.')
  if (Number(form.actual_stock) < 0) return uiStore.showToast('warning', 'Saldo baru tidak boleh negatif.')

  isSubmitting.value = true
  try {
    const payload = { ...form, actual_stock: Number(form.actual_stock) }
    await stockMovementApi.adjustment(payload)
    uiStore.showToast('success', 'Update stok berhasil dicatat')
    Object.assign(form, { material_id: '', actual_stock: 0, movement_date: new Date().toISOString().slice(0, 10), note: 'Update Harian' })
    await fetchMovements()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await fetchMovements()
  materials.value = unwrapList(await rawMaterialApi.getAll({ per_page: 100 }))
})
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Update Stok</h1>
    </template>
    
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-extrabold mb-3">Update Stok Harian</h2>
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5 items-end">
        <label class="block xl:col-span-2"><span class="mb-1 block text-sm font-bold">Bahan</span><select v-model="form.material_id" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3"><option value="">Pilih bahan</option><option v-for="m in materials" :key="m.id" :value="m.id">{{ m.name }} (Stok Saat Ini: {{ m.current_stock }} {{ m.unit }})</option></select></label>
        <BaseInput v-model="form.actual_stock" type="number" label="Sisa Stok Asli" min="0" step="0.001" />
        <BaseInput v-model="form.movement_date" type="date" label="Tanggal" />
        <BaseButton class="w-full" :loading="isSubmitting" @click="submitUpdate">Simpan</BaseButton>
      </div>
    </section>

    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-extrabold mb-3">Riwayat Update</h2>
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
