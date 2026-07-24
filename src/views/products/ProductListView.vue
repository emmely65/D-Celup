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
import { PRODUCT_TYPES, getProductTypeLabel } from '@/constants/productTypes'

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
  if (!form.name) return uiStore.showToast('warning', 'Nama produk wajib diisi.')
  try {
    if (editingId.value) {
      await productApi.update(editingId.value, form)
      uiStore.showToast('success', 'Master data produk berhasil diupdate')
    } else {
      await productApi.create(form)
      uiStore.showToast('success', 'Master data produk berhasil ditambahkan')
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
  if (!confirm('Hapus master data produk ini?')) return
  try { await productApi.deactivate(id); uiStore.showToast('success', 'Master data produk berhasil dihapus'); await fetchProducts() }
  catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Master Data Produk</h1>
      <p class="truncate text-sm text-dcelup-textSoft hidden sm:block">Kelola master nama produk, kategori, dan pilihan saus.</p>
    </template>
    
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black">{{ editingId ? 'Edit Master Data Produk' : 'Tambah Master Data Produk' }}</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <BaseInput v-model="form.name" label="Nama Produk" placeholder="misal: Sempol Ayam Original" />
        <label class="block">
          <span class="mb-1 block text-sm font-bold">Kategori</span>
          <select v-model="form.category" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3 bg-white">
            <option v-for="t in PRODUCT_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </label>
        <BaseInput v-model="form.description" label="Saus" placeholder="misal: Saus Teriyaki, Saus Kacang, Saus Sadis" />
        <div class="flex items-end gap-2 lg:col-span-3">
          <BaseButton class="min-w-32" @click="saveProduct">{{ editingId ? 'Update' : 'Simpan' }}</BaseButton>
          <BaseButton v-if="editingId" variant="secondary" @click="cancelEdit">Batal</BaseButton>
        </div>
      </div>
    </section>

    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <EmptyState v-if="!products.length" title="Master Data Produk kosong" />
      <div v-for="product in products" :key="product.id" class="flex flex-wrap items-center justify-between gap-3 border-b border-dcelup-border py-3 last:border-0 hover:bg-white rounded-lg px-2 transition-colors">
        <div>
          <p class="font-black text-dcelup-text">{{ product.name }}</p>
          <p class="text-sm text-dcelup-textSoft">
            <span class="font-semibold text-dcelup-red">Kategori:</span> {{ getProductTypeLabel(product.category) }}
            <span v-if="product.description" class="ml-2 font-semibold text-dcelup-textSoft">· <span class="font-semibold text-dcelup-red">Saus:</span> {{ product.description }}</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton variant="secondary" class="!px-3 !py-1 text-xs" @click="editProduct(product)">Edit</BaseButton>
          <BaseButton variant="danger" class="!px-3 !py-1 text-xs" @click="deactivate(product.id)">Hapus</BaseButton>
        </div>
      </div>
    </section>
  </DashboardLayout>
</template>
