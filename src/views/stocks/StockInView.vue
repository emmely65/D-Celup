<script setup>
import { onMounted, reactive, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { rawMaterialApi } from '@/api/rawMaterialApi'
import { stockMovementApi } from '@/api/stockMovementApi'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'
import { unwrapList } from '@/utils/normalizer'

const uiStore = useUiStore()
const { extractMessage } = useApiError()
const materials = ref([])
const form = reactive({ material_id: '', qty: 1, price_per_unit: 0, movement_date: new Date().toISOString().slice(0, 10), note: '' })
const isLoading = ref(false)

onMounted(async () => { materials.value = unwrapList(await rawMaterialApi.getAll({ per_page: 100 })) })

async function submit() {
  // BUG-12a: Validasi client-side sebelum submit
  if (!form.material_id) return uiStore.showToast('warning', 'Pilih bahan terlebih dahulu.')
  if (Number(form.qty) <= 0) return uiStore.showToast('warning', 'Qty harus lebih dari 0.')

  isLoading.value = true
  try {
    const payload = { ...form, qty: Number(form.qty), price_per_unit: Number(form.price_per_unit || 0) }
    await stockMovementApi.stockIn(payload)
    uiStore.showToast('success', 'Barang masuk berhasil dicatat')
    Object.assign(form, { material_id: '', qty: 1, price_per_unit: 0, movement_date: new Date().toISOString().slice(0, 10), note: '' })
  } catch (e) { uiStore.showToast('error', extractMessage(e)) }
  finally { isLoading.value = false }
}
</script>

<template>
  <DashboardLayout>
    <h1 class="text-2xl font-black">Barang Masuk</h1>
    <section class="mt-4 max-w-2xl rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <div class="grid gap-3 md:grid-cols-2">
        <label class="block md:col-span-2"><span class="mb-1 block text-sm font-bold">Bahan</span><select v-model="form.material_id" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3"><option value="">Pilih bahan</option><option v-for="m in materials" :key="m.id" :value="m.id">{{ m.name }} ({{ m.current_stock }} {{ m.unit }})</option></select></label>
        <BaseInput v-model="form.qty" type="number" label="Qty" min="0" step="0.001" />
        <BaseInput v-model="form.price_per_unit" type="number" label="Harga/unit" min="0" />
        <BaseInput v-model="form.movement_date" type="date" label="Tanggal" />
        <BaseInput v-model="form.note" label="Catatan" />
      </div>
      <BaseButton class="mt-4 w-full" :loading="isLoading" @click="submit">Simpan</BaseButton>
    </section>
  </DashboardLayout>
</template>
