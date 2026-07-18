<script setup>
import { onMounted, reactive, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { productApi } from '@/api/productApi'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'
import { unwrapList } from '@/utils/normalizer'

const uiStore = useUiStore()
const { extractMessage } = useApiError()
const products = ref([])
const isLoading = ref(false)
const form = reactive({ name: '', category: 'original', description: '', is_active: true })
const editingId = ref(null)

onMounted(fetchProducts)
async function fetchProducts() {
  isLoading.value = true
  try { products.value = unwrapList(await productApi.getAll({ per_page: 100 })) }
  catch (e) { uiStore.showToast('error', extractMessage(e)) }
  finally { isLoading.value = false }
}
async function saveProduct() {
  try {
    if (editingId.value) {
      await productApi.update(editingId.value, form)
      uiStore.showToast('success', 'Produk berhasil diupdate')
    } else {
      await productApi.create(form)
      uiStore.showToast('success', 'Produk berhasil ditambahkan')
    }
    cancelEdit()
    await fetchProducts()
  } catch (e) { uiStore.showToast('error', extractMessage(e)) }
}

function editProduct(product) {
  editingId.value = product.id
  form.name = product.name
  form.category = product.category
  form.description = product.description || ''
  form.is_active = product.is_active !== undefined ? product.is_active : true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editingId.value = null
  Object.assign(form, { name: '', category: 'original', description: '', is_active: true })
}
async function deactivate(id) {
  if (!confirm('Hapus produk ini?')) return
  try { await productApi.deactivate(id); uiStore.showToast('success', 'Produk berhasil dihapus'); await fetchProducts() }
  catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Produk</h1>
    </template>
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black">{{ editingId ? 'Edit Produk' : 'Tambah Produk' }}</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <BaseInput v-model="form.name" label="Nama" />
        <BaseInput v-model="form.category" label="Kategori" />
        <div class="flex items-end gap-2">
          <BaseButton class="w-full" @click="saveProduct">{{ editingId ? 'Update' : 'Simpan' }}</BaseButton>
          <BaseButton v-if="editingId" variant="secondary" @click="cancelEdit">Batal</BaseButton>
        </div>
      </div>
    </section>
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <EmptyState v-if="!products.length" title="Produk kosong" />
      <div v-for="product in products" :key="product.id" class="flex flex-wrap items-center justify-between gap-3 border-b border-dcelup-border py-3 last:border-0 hover:bg-white rounded-lg px-2 transition-colors">
        <div><p class="font-black">{{ product.name }}</p><p class="text-sm text-dcelup-textSoft">{{ product.category }}</p></div>
        <div class="flex items-center gap-2">
          <BaseButton variant="secondary" class="!px-3 !py-1 text-xs" @click="editProduct(product)">Edit</BaseButton>
          <BaseButton variant="danger" class="!px-3 !py-1 text-xs" @click="deactivate(product.id)">Hapus</BaseButton>
        </div>
      </div>
    </section>
  </DashboardLayout>
</template>
