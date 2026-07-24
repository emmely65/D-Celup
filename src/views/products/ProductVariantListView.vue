<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { productApi } from '@/api/productApi'
import { productVariantApi } from '@/api/productVariantApi'
import { useUiStore } from '@/stores/uiStore'
import { useMasterDataStore } from '@/stores/masterDataStore'
import { useApiError } from '@/composables/useApiError'
import { unwrapList } from '@/utils/normalizer'
import { formatRupiah } from '@/utils/currency'
import { getProductTypeLabel } from '@/constants/productTypes'

const uiStore = useUiStore()
const masterStore = useMasterDataStore()
const { extractMessage } = useApiError()

const products = ref([])
const variants = ref([])
const form = reactive({ product_id: '', sauce_name: '', type: 'original', price: 6000, qty_per_pack: 4, is_active: true })

const editId = ref(null)
const editForm = reactive({ sauce_name: '', price: 0, qty_per_pack: 0 })

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchVariants()])
})

async function fetchProducts() {
  products.value = unwrapList(await productApi.getAll({ per_page: 100 }))
}

async function fetchVariants() {
  variants.value = unwrapList(await productVariantApi.getAll({ per_page: 100 }))
}

// Compute available sauces from master store + master products
const availableSauces = computed(() => {
  const set = new Set()
  
  // 1. Master Store Sauces
  masterStore.sauces.forEach(s => set.add(s))

  // 2. Sauces from selected product description
  const selectedProd = products.value.find(x => String(x.id) === String(form.product_id))
  if (selectedProd && selectedProd.description) {
    const list = selectedProd.description.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
    list.forEach(s => set.add(s))
  }
  
  // 3. Sauces from all master products
  products.value.forEach(item => {
    if (item.description) {
      const list = item.description.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
      list.forEach(s => set.add(s))
    }
  })

  if (editForm.sauce_name) set.add(editForm.sauce_name)

  return Array.from(set)
})

// Group variants by Product Name
const groupedVariants = computed(() => {
  const groupsMap = {}

  variants.value.forEach(v => {
    const productName = v.product?.name || 'Tanpa Produk'
    if (!groupsMap[productName]) {
      groupsMap[productName] = {
        name: productName,
        product: v.product,
        items: []
      }
    }
    groupsMap[productName].items.push(v)
  })

  return Object.values(groupsMap)
})

function onProductChange() {
  const selected = products.value.find(x => String(x.id) === String(form.product_id))
  if (selected && selected.category) {
    form.type = selected.category
  }
}

async function createVariant() {
  if (!form.product_id) return uiStore.showToast('warning', 'Pilih Nama Produk terlebih dahulu.')
  if (!form.sauce_name) return uiStore.showToast('warning', 'Pilih Saus terlebih dahulu.')
  try {
    await productVariantApi.create({ ...form, price: Number(form.price), qty_per_pack: Number(form.qty_per_pack) })
    uiStore.showToast('success', 'Varian berhasil ditambahkan')
    Object.assign(form, { product_id: '', sauce_name: '', type: 'original', price: 6000, qty_per_pack: 4, is_active: true })
    await fetchVariants()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}

function startEdit(variant) {
  editId.value = variant.id
  Object.assign(editForm, {
    sauce_name: variant.sauce_name,
    price: variant.price,
    qty_per_pack: variant.qty_per_pack
  })
}

function cancelEdit() {
  editId.value = null
}

async function updateVariant(id) {
  try {
    await productVariantApi.update(id, { ...editForm, price: Number(editForm.price), qty_per_pack: Number(editForm.qty_per_pack) })
    uiStore.showToast('success', 'Varian berhasil diupdate')
    editId.value = null
    await fetchVariants()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}

async function deactivate(id) {
  if (!confirm('Hapus varian ini?')) return
  try {
    await productVariantApi.deactivate(id)
    uiStore.showToast('success', 'Varian berhasil dihapus')
    await fetchVariants()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Varian Produk</h1>
      <p class="truncate text-sm text-dcelup-textSoft hidden sm:block">Kelola varian harga & saus yang dikelompokkan sesuai Nama Produk.</p>
    </template>

    <!-- FORM TAMBAH VARIAN -->
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black text-dcelup-text">Tambah Varian Baru</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <label class="block">
          <span class="mb-1 block text-sm font-bold text-dcelup-text">Nama Produk</span>
          <select v-model="form.product_id" @change="onProductChange" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3 bg-white font-semibold text-dcelup-text">
            <option value="">Pilih Produk</option>
            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </label>
        
        <label class="block">
          <span class="mb-1 block text-sm font-bold text-dcelup-text">Kategori</span>
          <select v-model="form.type" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3 bg-white font-semibold text-dcelup-text">
            <option v-for="t in masterStore.categories" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-bold text-dcelup-text">Saus</span>
          <select v-model="form.sauce_name" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3 bg-white font-semibold text-dcelup-text">
            <option value="">Pilih Saus</option>
            <option v-for="s in availableSauces" :key="s" :value="s">{{ s }}</option>
          </select>
        </label>

        <BaseInput v-model="form.price" type="number" label="Harga" />
        <BaseInput v-model="form.qty_per_pack" type="number" label="Qty/pack" />
        <BaseButton class="self-end" @click="createVariant">Simpan</BaseButton>
      </div>
    </section>

    <!-- DAFTAR VARIAN BERKELOMPOK PER NAMA PRODUK -->
    <section class="mt-6 space-y-6">
      <EmptyState v-if="!variants.length" title="Belum ada Varian Produk" />

      <div
        v-for="group in groupedVariants"
        :key="group.name"
        class="rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4 shadow-sm"
      >
        <!-- Group Title Header -->
        <div class="flex items-center justify-between border-b border-dcelup-border pb-3 mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">📦</span>
            <h2 class="text-lg font-black text-dcelup-redDark">{{ group.name }}</h2>
          </div>
          <span class="rounded-full bg-dcelup-red/10 px-3 py-1 text-xs font-bold text-dcelup-red">
            {{ group.items.length }} varian saus
          </span>
        </div>

        <!-- Group Items Grid -->
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="variant in group.items"
            :key="variant.id"
            class="rounded-xl border border-dcelup-border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <!-- Edit Form -->
            <div v-if="editId === variant.id" class="space-y-3">
              <label class="block">
                <span class="mb-1 block text-sm font-bold text-dcelup-text">Saus</span>
                <select v-model="editForm.sauce_name" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3 bg-white font-semibold text-dcelup-text">
                  <option value="">Pilih Saus</option>
                  <option v-for="s in availableSauces" :key="s" :value="s">{{ s }}</option>
                </select>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <BaseInput v-model="editForm.price" type="number" label="Harga" />
                <BaseInput v-model="editForm.qty_per_pack" type="number" label="Qty/pack" />
              </div>
              <div class="flex gap-2 pt-2">
                <BaseButton @click="updateVariant(variant.id)" class="flex-1">Simpan</BaseButton>
                <BaseButton variant="secondary" @click="cancelEdit" class="flex-1">Batal</BaseButton>
              </div>
            </div>

            <!-- View Display -->
            <div v-else>
              <div class="flex items-start justify-between gap-2">
                <p class="font-black text-base text-dcelup-red">{{ variant.sauce_name }}</p>
                <span class="rounded-full bg-dcelup-cream border border-dcelup-border px-2.5 py-0.5 text-xs font-bold text-dcelup-redDark">
                  {{ getProductTypeLabel(variant.type) }}
                </span>
              </div>

              <p class="mt-1 text-xs font-semibold text-dcelup-textSoft">
                Isi Kemasan: {{ variant.qty_per_pack }} pcs
              </p>

              <div class="mt-4 flex items-center justify-between gap-2 border-t border-dcelup-border/60 pt-3">
                <span class="rounded-full bg-dcelup-yellow px-3 py-1 text-sm font-black text-dcelup-text">
                  {{ formatRupiah(variant.price) }}
                </span>
                <div class="flex gap-2">
                  <BaseButton variant="accent" class="!px-3 !py-1 text-xs" @click="startEdit(variant)">Edit</BaseButton>
                  <BaseButton variant="danger" class="!px-3 !py-1 text-xs" @click="deactivate(variant.id)">Hapus</BaseButton>
                </div>
              </div>
            </div>

          </article>
        </div>

      </div>
    </section>
  </DashboardLayout>
</template>
