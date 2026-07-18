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

const authStore = useAuthStore()
const uiStore = useUiStore()
const { extractMessage } = useApiError()
const materials = ref([])
const form = reactive({ name: '', unit: '', current_stock: 0, min_stock: 0 })

const editId = ref(null)
const editForm = reactive({ name: '', unit: '', current_stock: 0, min_stock: 0 })

onMounted(fetchMaterials)

function getStockStatus(current, min) {
  const diff = Number(current) - Number(min)
  if (diff < 0) return { label: 'Stok Habis', class: 'bg-dcelup-redSoft text-dcelup-redDark border-dcelup-red' }
  if (diff <= 5) return { label: 'Hampir Habis', class: 'bg-dcelup-yellowSoft text-amber-700 border-dcelup-yellow' }
  return { label: 'Aman', class: 'bg-dcelup-greenSoft text-green-700 border-green-200' }
}

async function fetchMaterials() {
  try { materials.value = unwrapList(await rawMaterialApi.getAll({ per_page: 100 })) }
  catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
async function createMaterial() {
  try {
    await rawMaterialApi.create({ ...form, current_stock: Number(form.current_stock), min_stock: Number(form.min_stock) })
    uiStore.showToast('success', 'Bahan berhasil ditambah')
    Object.assign(form, { name: '', unit: '', current_stock: 0, min_stock: 0 })
    await fetchMaterials()
  } catch (e) { uiStore.showToast('error', extractMessage(e)) }
}

function startEdit(item) {
  editId.value = item.id
  Object.assign(editForm, {
    name: item.name,
    unit: item.unit,
    current_stock: item.current_stock,
    min_stock: item.min_stock
  })
}

function cancelEdit() {
  editId.value = null
}

async function updateMaterial(id) {
  try {
    await rawMaterialApi.update(id, { ...editForm, current_stock: Number(editForm.current_stock), min_stock: Number(editForm.min_stock) })
    uiStore.showToast('success', 'Bahan berhasil diupdate')
    editId.value = null
    await fetchMaterials()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}

async function deactivate(id) {
  if (!confirm('Hapus bahan ini?')) return
  try { await rawMaterialApi.deactivate(id); uiStore.showToast('success', 'Bahan berhasil dihapus'); await fetchMaterials() }
  catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Stok Bahan</h1>
      <p class="truncate text-sm text-dcelup-textSoft hidden sm:block">Kasir hanya melihat stok. Admin dapat menambah dan menghapus bahan.</p>
    </template>

    <section v-if="authStore.isAdmin" class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black">Tambah Bahan</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <BaseInput v-model="form.name" label="Nama" />
        <BaseInput v-model="form.unit" label="Satuan" />
        <BaseInput v-model="form.current_stock" type="number" label="Stok awal" />
        <BaseInput v-model="form.min_stock" type="number" label="Minimal Stok" />
        <BaseButton class="self-end" @click="createMaterial">Simpan</BaseButton>
      </div>
    </section>

    <section class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <EmptyState v-if="!materials.length" title="Bahan belum ada" />
      <article v-for="item in materials" :key="item.id" class="rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
        
        <div v-if="editId === item.id" class="space-y-3">
          <BaseInput v-model="editForm.name" label="Nama" />
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="editForm.current_stock" type="number" label="Stok Saat Ini" />
            <BaseInput v-model="editForm.min_stock" type="number" label="Minimal Stok" />
          </div>
          <BaseInput v-model="editForm.unit" label="Satuan" />
          <div class="flex gap-2 pt-2">
            <BaseButton @click="updateMaterial(item.id)" class="flex-1">Simpan</BaseButton>
            <BaseButton variant="secondary" @click="cancelEdit" class="flex-1">Batal</BaseButton>
          </div>
        </div>

        <div v-else>
          <div class="flex items-start justify-between gap-3">
            <div><p class="font-black">{{ item.name }}</p><p class="text-sm text-dcelup-textSoft">{{ item.current_stock }} {{ item.unit }} · Min {{ item.min_stock }}</p></div>
            <span class="rounded-full border px-2 py-1 text-xs font-bold whitespace-nowrap" :class="getStockStatus(item.current_stock, item.min_stock).class">{{ getStockStatus(item.current_stock, item.min_stock).label }}</span>
          </div>
          <div v-if="authStore.isAdmin" class="mt-3 flex gap-2">
            <BaseButton variant="accent" @click="startEdit(item)">Edit</BaseButton>
            <BaseButton variant="secondary" @click="deactivate(item.id)">Hapus</BaseButton>
          </div>
        </div>

      </article>
    </section>
  </DashboardLayout>
</template>
