<script setup>
import { onMounted, ref, reactive, computed } from 'vue'
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
import { formatNumber } from '@/utils/number'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'

const uiStore = useUiStore()
const { extractMessage } = useApiError()
const movements = ref([])
const materials = ref([])
const form = reactive({ material_id: '', actual_stock: 0, movement_date: new Date().toISOString().slice(0, 10), note: 'Update Harian' })
const isLoading = ref(false)
const isSubmitting = ref(false)

const selectedMaterialMax = computed(() => {
  const m = materials.value.find(x => x.id === form.material_id)
  return m ? m.current_stock : 0
})

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
  
  if (Number(form.actual_stock) > selectedMaterialMax.value) {
    return uiStore.showToast('warning', 'Sisa stok tidak boleh lebih besar dari stok saat ini. Untuk menambah stok, gunakan menu Stok Bahan.')
  }

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
        <label class="block xl:col-span-2"><span class="mb-1 block text-sm font-bold">Bahan</span><select v-model="form.material_id" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3"><option value="">Pilih bahan</option><option v-for="m in materials" :key="m.id" :value="m.id">{{ m.name }} (Stok Saat Ini: {{ formatNumber(m.current_stock) }} {{ m.unit }})</option></select></label>
        <BaseInput v-model="form.actual_stock" type="number" label="Sisa Stok Asli" min="0" :max="selectedMaterialMax" step="0.001" />
        <BaseInput v-model="form.movement_date" type="date" label="Tanggal" />
        <BaseButton class="w-full" :loading="isSubmitting" @click="submitUpdate">Simpan</BaseButton>
      </div>
    </section>

    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-extrabold mb-3">Riwayat Update</h2>
      <LoadingBlock v-if="isLoading" />
      <template v-else>
        <EmptyState v-if="!movements.length" title="Belum ada mutasi stok" />
        <div v-else>
          <div class="hidden grid-cols-6 gap-2 border-b border-dcelup-border pb-2 text-sm font-black text-dcelup-redDark xl:grid">
            <span>Bahan</span>
            <span>Petugas</span>
            <span>Jumlah Mutasi</span>
            <span>Perubahan Stok</span>
            <span>Catatan</span>
            <span>Waktu</span>
          </div>
          <div v-for="m in movements" :key="m.id" class="grid gap-2 border-b border-dcelup-border py-3 last:border-0 xl:grid-cols-6 xl:items-center">
            <span class="font-black">{{ m.raw_material?.name ?? m.material?.name ?? '-' }}</span>
            <span class="text-sm font-semibold text-dcelup-textSoft">Oleh: {{ m.creator?.name ?? m.user?.name ?? 'Sistem' }}</span>
            <span>Qty {{ formatNumber(m.qty) }}</span>
            <span>{{ formatNumber(m.balance_before) }} → {{ formatNumber(m.balance_after) }}</span>
            <span class="truncate text-sm text-dcelup-textSoft" :title="m.note">{{ m.note || '-' }}</span>
            <span class="text-sm text-dcelup-textSoft">{{ formatDateTime(m.created_at ?? m.movement_date) }}</span>
          </div>
        </div>
      </template>
    </section>
  </DashboardLayout>
</template>
