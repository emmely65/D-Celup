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
  const res = await rawMaterialApi.getAll({ per_page: 100, is_active: 1 })
  materials.value = unwrapList(res).filter(m => m.is_active !== false && Number(m.is_active) !== 0)
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

    <section class="mt-5 rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
      <h2 class="font-black text-base text-dcelup-text mb-4">Riwayat Update Stok</h2>
      <LoadingBlock v-if="isLoading" />
      <template v-else>
        <EmptyState v-if="!movements.length" title="Belum ada mutasi stok" description="Riwayat penambahan dan pengurangan stok akan muncul di sini." />
        <div v-else class="overflow-x-auto rounded-xl border border-dcelup-border/60">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-dcelup-cream/70 border-b border-dcelup-border/80 text-dcelup-redDark text-xs font-black uppercase tracking-wider">
                <th class="py-3.5 px-4 text-left">Nama Bahan</th>
                <th class="py-3.5 px-4 text-left">Petugas</th>
                <th class="py-3.5 px-4 text-right">Jumlah Mutasi</th>
                <th class="py-3.5 px-4 text-center">Perubahan Stok</th>
                <th class="py-3.5 px-4 text-left">Catatan</th>
                <th class="py-3.5 px-4 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dcelup-border/40">
              <tr v-for="m in movements" :key="m.id" class="hover:bg-dcelup-creamSoft/60 transition-colors">
                <td class="py-3.5 px-4 align-middle whitespace-nowrap font-extrabold text-dcelup-text">
                  <span>{{ m.raw_material?.name ?? m.material?.name ?? '-' }}</span>
                  <span v-if="(m.raw_material && Number(m.raw_material.is_active) === 0) || (m.material && Number(m.material.is_active) === 0)" class="ml-2 rounded-md bg-gray-200/80 px-2 py-0.5 text-[10px] font-bold text-gray-600 border border-gray-300/50">
                    Dihapus
                  </span>
                </td>
                <td class="py-3.5 px-4 align-middle whitespace-nowrap text-xs font-bold text-dcelup-text">
                  {{ m.creator?.name ?? m.user?.name ?? 'Sistem' }}
                </td>
                <td class="py-3.5 px-4 align-middle whitespace-nowrap text-right font-black text-dcelup-redDark">
                  {{ formatNumber(m.qty) }}
                </td>
                <td class="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                  <span class="inline-flex items-center rounded-lg bg-dcelup-cream px-2.5 py-1 text-xs font-extrabold text-dcelup-textSoft">
                    {{ formatNumber(m.balance_before) }} → {{ formatNumber(m.balance_after) }}
                  </span>
                </td>
                <td class="py-3.5 px-4 align-middle text-xs font-semibold text-dcelup-textSoft max-w-xs truncate" :title="m.note">
                  {{ m.note || '-' }}
                </td>
                <td class="py-3.5 px-4 align-middle text-right whitespace-nowrap text-xs font-semibold text-dcelup-textSoft">
                  {{ formatDateTime(m.created_at ?? m.movement_date) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>
  </DashboardLayout>
</template>
