
<script setup>
import { onMounted, reactive, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { productApi } from '@/api/productApi'
import { useUiStore } from '@/stores/uiStore'
import { useMasterDataStore } from '@/stores/masterDataStore'
import { useApiError } from '@/composables/useApiError'
import { unwrapList } from '@/utils/normalizer'

const uiStore = useUiStore()
const masterStore = useMasterDataStore()
const { extractMessage } = useApiError()

const activeTab = ref('product') // 'product' | 'category' | 'sauce'
const products = ref([])
const isLoading = ref(false)

// Form States
const formProduct = reactive({ name: '', category: 'original', description: '', is_active: true })
const editingProductId = ref(null)

const categoryInput = ref('')
const sauceInput = ref('')

onMounted(fetchProducts)

async function fetchProducts() {
  isLoading.value = true
  try {
    products.value = unwrapList(await productApi.getAll({ per_page: 100, is_active: 1 }))
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  } finally {
    isLoading.value = false
  }
}

// 1. Handlers for Nama Produk
async function saveProduct() {
  if (!formProduct.name) return uiStore.showToast('warning', 'Nama produk wajib diisi.')
  try {
    if (editingProductId.value) {
      await productApi.update(editingProductId.value, formProduct)
      uiStore.showToast('success', 'Nama produk berhasil diupdate')
    } else {
      await productApi.create(formProduct)
      uiStore.showToast('success', 'Nama produk berhasil ditambahkan')
    }
    cancelEditProduct()
    await fetchProducts()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}

function editProduct(product) {
  activeTab.value = 'product'
  editingProductId.value = product.id
  formProduct.name = product.name
  formProduct.category = product.category || 'original'
  formProduct.description = product.description || ''
  formProduct.is_active = product.is_active !== undefined ? product.is_active : true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEditProduct() {
  editingProductId.value = null
  Object.assign(formProduct, { name: '', category: 'original', description: '', is_active: true })
}

async function deleteProduct(id) {
  if (!confirm('Hapus produk ini dari master data?')) return
  try {
    await productApi.deactivate(id)
    uiStore.showToast('success', 'Produk berhasil dihapus')
    await fetchProducts()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}

// 2. Handlers for Kategori
function saveCategory() {
  if (!categoryInput.value) return uiStore.showToast('warning', 'Nama kategori wajib diisi.')
  const ok = masterStore.addCategory(categoryInput.value)
  if (ok) {
    uiStore.showToast('success', 'Kategori berhasil ditambahkan')
    categoryInput.value = ''
  } else {
    uiStore.showToast('warning', 'Kategori sudah ada atau tidak valid.')
  }
}

function deleteCategory(value) {
  if (!confirm(`Hapus kategori "${value}" dari master data?`)) return
  masterStore.removeCategory(value)
  uiStore.showToast('success', 'Kategori berhasil dihapus')
}

// 3. Handlers for Saus
function saveSauce() {
  if (!sauceInput.value) return uiStore.showToast('warning', 'Nama saus wajib diisi.')
  const ok = masterStore.addSauce(sauceInput.value)
  if (ok) {
    uiStore.showToast('success', 'Saus berhasil ditambahkan')
    sauceInput.value = ''
  } else {
    uiStore.showToast('warning', 'Saus sudah ada atau tidak valid.')
  }
}

function deleteSauce(name) {
  if (!confirm(`Hapus saus "${name}" dari master data?`)) return
  masterStore.removeSauce(name)
  uiStore.showToast('success', 'Saus berhasil dihapus')
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Master Data Produk</h1>
      <p class="truncate text-sm text-dcelup-textSoft hidden sm:block">Kelola terpisah master Nama Produk, Kategori, dan Saus.</p>
    </template>

    <!-- Tab Selection for Form Input -->
    <div class="mt-4 flex flex-wrap gap-2 border-b border-dcelup-border pb-3">
      <button
        class="rounded-xl px-4 py-2.5 text-sm font-extrabold transition-all"
        :class="activeTab === 'product' ? 'bg-dcelup-red text-white shadow' : 'bg-white text-dcelup-text hover:bg-dcelup-creamSoft'"
        @click="activeTab = 'product'"
      >
        + Input Nama Produk
      </button>
      <button
        class="rounded-xl px-4 py-2.5 text-sm font-extrabold transition-all"
        :class="activeTab === 'category' ? 'bg-dcelup-red text-white shadow' : 'bg-white text-dcelup-text hover:bg-dcelup-creamSoft'"
        @click="activeTab = 'category'"
      >
        + Input Kategori
      </button>
      <button
        class="rounded-xl px-4 py-2.5 text-sm font-extrabold transition-all"
        :class="activeTab === 'sauce' ? 'bg-dcelup-red text-white shadow' : 'bg-white text-dcelup-text hover:bg-dcelup-creamSoft'"
        @click="activeTab = 'sauce'"
      >
        + Input Saus
      </button>
    </div>

    <!-- Form Section 1: Nama Produk -->
    <section v-if="activeTab === 'product'" class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black text-dcelup-text mb-3">{{ editingProductId ? 'Edit Nama Produk' : 'Tambah Nama Produk' }}</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-end">
        <BaseInput v-model="formProduct.name" label="Nama Produk" placeholder="misal: Sempol Ayam Original" />

        <div class="flex items-end gap-2">
          <BaseButton class="min-w-32" @click="saveProduct">{{ editingProductId ? 'Update Nama Produk' : 'Simpan Nama Produk' }}</BaseButton>
          <BaseButton v-if="editingProductId" variant="secondary" @click="cancelEditProduct">Batal</BaseButton>
        </div>
      </div>
    </section>

    <!-- Form Section 2: Kategori -->
    <section v-else-if="activeTab === 'category'" class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black text-dcelup-text mb-3">Tambah Kategori Baru</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-end">
        <BaseInput v-model="categoryInput" label="Nama Kategori" placeholder="misal: Crispy Special" />
        <BaseButton class="min-w-32" @click="saveCategory">Simpan Kategori</BaseButton>
      </div>
    </section>

    <!-- Form Section 3: Saus -->
    <section v-else-if="activeTab === 'sauce'" class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black text-dcelup-text mb-3">Tambah Saus Baru</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-end">
        <BaseInput v-model="sauceInput" label="Nama Saus" placeholder="misal: Saus Keju Melted" />
        <BaseButton class="min-w-32" @click="saveSauce">Simpan Saus</BaseButton>
      </div>
    </section>


    <!-- 3 TABLES SECTION BELOW -->
    <div class="mt-6 space-y-6">

      <!-- TABEL 1: NAMA PRODUK -->
      <section class="rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between mb-4 border-b border-dcelup-border/50 pb-3">
          <h2 class="font-black text-base text-dcelup-text flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-dcelup-red/10 text-dcelup-red text-sm">📦</span>
            1. Tabel Master Nama Produk
          </h2>
          <span class="rounded-full bg-dcelup-red/10 px-3 py-1 text-xs font-extrabold text-dcelup-red">{{ products.length }} item</span>
        </div>

        <EmptyState v-if="!products.length" title="Belum ada Nama Produk" />
        
        <div v-else class="overflow-x-auto rounded-xl border border-dcelup-border/60">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-dcelup-cream/70 border-b border-dcelup-border/80 text-dcelup-redDark text-xs font-black uppercase tracking-wider">
                <th class="py-3.5 px-4 w-16 text-center">No</th>
                <th class="py-3.5 px-4 text-left">Nama Produk</th>
                <th class="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dcelup-border/40">
              <tr v-for="(p, index) in products" :key="p.id" class="hover:bg-dcelup-creamSoft/60 transition-colors">
                <td class="py-3.5 px-4 align-middle text-center font-bold text-dcelup-textSoft text-xs">{{ index + 1 }}</td>
                <td class="py-3.5 px-4 align-middle font-extrabold text-dcelup-text">{{ p.name }}</td>
                <td class="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                  <div class="inline-flex items-center justify-end gap-2">
                    <BaseButton variant="secondary" class="!px-3 !py-1.5 text-xs" @click="editProduct(p)">Edit</BaseButton>
                    <BaseButton variant="danger" class="!px-3 !py-1.5 text-xs" @click="deleteProduct(p.id)">Hapus</BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- TABEL 2: KATEGORI -->
      <section class="rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between mb-4 border-b border-dcelup-border/50 pb-3">
          <h2 class="font-black text-base text-dcelup-text flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 text-sm">🏷️</span>
            2. Tabel Master Kategori
          </h2>
          <span class="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-700">{{ masterStore.categories.length }} item</span>
        </div>

        <EmptyState v-if="!masterStore.categories.length" title="Belum ada Kategori" />
        
        <div v-else class="overflow-x-auto rounded-xl border border-dcelup-border/60">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-dcelup-cream/70 border-b border-dcelup-border/80 text-dcelup-redDark text-xs font-black uppercase tracking-wider">
                <th class="py-3.5 px-4 w-16 text-center">No</th>
                <th class="py-3.5 px-4 text-left">Nama Kategori</th>
                <th class="py-3.5 px-4 text-left">Kode Kategori</th>
                <th class="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dcelup-border/40">
              <tr v-for="(cat, index) in masterStore.categories" :key="cat.value" class="hover:bg-dcelup-creamSoft/60 transition-colors">
                <td class="py-3.5 px-4 align-middle text-center font-bold text-dcelup-textSoft text-xs">{{ index + 1 }}</td>
                <td class="py-3.5 px-4 align-middle font-extrabold text-dcelup-text">{{ cat.label }}</td>
                <td class="py-3.5 px-4 align-middle font-mono text-xs font-bold text-dcelup-textSoft">{{ cat.value }}</td>
                <td class="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                  <BaseButton variant="danger" class="!px-3 !py-1.5 text-xs" @click="deleteCategory(cat.value)">Hapus</BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- TABEL 3: SAUS -->
      <section class="rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between mb-4 border-b border-dcelup-border/50 pb-3">
          <h2 class="font-black text-base text-dcelup-text flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 text-sm">🌶️</span>
            3. Tabel Master Saus
          </h2>
          <span class="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-extrabold text-rose-700">{{ masterStore.sauces.length }} item</span>
        </div>

        <EmptyState v-if="!masterStore.sauces.length" title="Belum ada Saus" />
        
        <div v-else class="overflow-x-auto rounded-xl border border-dcelup-border/60">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-dcelup-cream/70 border-b border-dcelup-border/80 text-dcelup-redDark text-xs font-black uppercase tracking-wider">
                <th class="py-3.5 px-4 w-16 text-center">No</th>
                <th class="py-3.5 px-4 text-left">Nama Saus</th>
                <th class="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dcelup-border/40">
              <tr v-for="(sauce, index) in masterStore.sauces" :key="sauce" class="hover:bg-dcelup-creamSoft/60 transition-colors">
                <td class="py-3.5 px-4 align-middle text-center font-bold text-dcelup-textSoft text-xs">{{ index + 1 }}</td>
                <td class="py-3.5 px-4 align-middle font-extrabold text-dcelup-text">{{ sauce }}</td>
                <td class="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                  <BaseButton variant="danger" class="!px-3 !py-1.5 text-xs" @click="deleteSauce(sauce)">Hapus</BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  </DashboardLayout>
</template>
