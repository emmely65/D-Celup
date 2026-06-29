<script setup>
import { onMounted, reactive, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { rawMaterialApi } from '@/api/rawMaterialApi'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'
import { unwrapList } from '@/utils/normalizer'
import { getStockStatus } from '@/constants/status'

const authStore = useAuthStore()
const uiStore = useUiStore()
const { extractMessage } = useApiError()
const materials = ref([])
const form = reactive({ name: '', unit: 'kg', current_stock: 0, min_stock: 0, is_active: true })

onMounted(fetchMaterials)
async function fetchMaterials() {
  try { materials.value = unwrapList(await rawMaterialApi.getAll({ per_page: 100 })) }
  catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
async function createMaterial() {
  try {
    await rawMaterialApi.create({ ...form, current_stock: Number(form.current_stock), min_stock: Number(form.min_stock) })
    uiStore.showToast('success', 'Bahan baku berhasil ditambahkan')
    Object.assign(form, { name: '', unit: 'kg', current_stock: 0, min_stock: 0, is_active: true })
    await fetchMaterials()
  } catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
async function deactivate(id) {
  if (!confirm('Nonaktifkan bahan ini?')) return
  try { await rawMaterialApi.deactivate(id); uiStore.showToast('success', 'Bahan dinonaktifkan'); await fetchMaterials() }
  catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
</script>

<template>
  <DashboardLayout>
    <h1 class="text-2xl font-black">Stok Bahan</h1>
    <p class="text-sm text-dcelup-textSoft">Kasir hanya melihat stok. Admin dapat menambah dan menonaktifkan bahan.</p>

    <section v-if="authStore.isAdmin" class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black">Tambah Bahan</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <BaseInput v-model="form.name" label="Nama" />
        <BaseInput v-model="form.unit" label="Unit" />
        <BaseInput v-model="form.current_stock" type="number" label="Stok awal" />
        <BaseInput v-model="form.min_stock" type="number" label="Min stok" />
        <BaseButton class="self-end" @click="createMaterial">Simpan</BaseButton>
      </div>
    </section>

    <section class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <EmptyState v-if="!materials.length" title="Bahan belum ada" />
      <article v-for="item in materials" :key="item.id" class="rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
        <div class="flex items-start justify-between gap-3">
          <div><p class="font-black">{{ item.name }}</p><p class="text-sm text-dcelup-textSoft">{{ item.current_stock }} {{ item.unit }} · Min {{ item.min_stock }}</p></div>
          <span class="rounded-full border px-2 py-1 text-xs font-bold" :class="getStockStatus(item.current_stock, item.min_stock).class">{{ getStockStatus(item.current_stock, item.min_stock).label }}</span>
        </div>
        <BaseButton v-if="authStore.isAdmin" class="mt-3" variant="secondary" @click="deactivate(item.id)">Nonaktifkan</BaseButton>
      </article>
    </section>
  </DashboardLayout>
</template>
