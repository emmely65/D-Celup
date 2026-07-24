<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { productApi } from '@/api/productApi'
import { productVariantApi } from '@/api/productVariantApi'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'
import { unwrapList } from '@/utils/normalizer'
import { formatRupiah } from '@/utils/currency'
import { PRODUCT_TYPES, getProductTypeLabel } from '@/constants/productTypes'

const DEFAULT_SAUCES = [
  'Saus Teriyaki',
  'Saus Kacang',
  'Saus Sadis',
  'Saus Lada Hitam',
  'Saus Barbeque Spicy',
  'Saus BBQ Spicy + Mentai',
  'Saus BBQ Spicy + Carbonara',
  'Saus BBQ Spicy + Mayo',
  'Saus BBQ Spicy + Garlic',
  'Saus Teriyaki + Saus Kacang',
  'Saus Lada Hitam + Saus Sadis',
  'Saus BBQ Spicy + Saus Kacang',
  'Saus Sadis + Lada Hitam'
]

import { useMasterDataStore } from '@/stores/masterDataStore'

const uiStore = useUiStore()
const masterStore = useMasterDataStore()
const { extractMessage } = useApiError()
const products = ref([])
const variants = ref([])
const form = reactive({ product_id: '', sauce_name: '', type: 'original', price: 6000, qty_per_pack: 4, is_active: true })

const editId = ref(null)
const editForm = reactive({ sauce_name: '', price: 0, qty_per_pack: 0 })

onMounted(async () => { await Promise.all([fetchProducts(), fetchVariants()]) })
async function fetchProducts() { products.value = unwrapList(await productApi.getAll({ per_page: 100 })) }
async function fetchVariants() { variants.value = unwrapList(await productVariantApi.getAll({ per_page: 100 })) }

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
  } catch (e) { uiStore.showToast('error', extractMessage(e)) }
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
  try { await productVariantApi.deactivate(id); uiStore.showToast('success', 'Varian berhasil dihapus'); await fetchVariants() }
  catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Varian Produk</h1>
    </template>

    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black">Tambah Varian</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <label class="block">
          <span class="mb-1 block text-sm font-bold">Nama Produk</span>
          <select v-model="form.product_id" @change="onProductChange" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3 bg-white">
            <option value="">Pilih Produk</option>
            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </label>
        
        <label class="block">
          <span class="mb-1 block text-sm font-bold">Kategori</span>
          <select v-model="form.type" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3 bg-white">
            <option v-for="t in masterStore.categories" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-bold">Saus</span>
          <select v-model="form.sauce_name" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3 bg-white">
            <option value="">Pilih Saus</option>
            <option v-for="s in availableSauces" :key="s" :value="s">{{ s }}</option>
          </select>
        </label>

        <BaseInput v-model="form.price" type="number" label="Harga" />
        <BaseInput v-model="form.qty_per_pack" type="number" label="Qty/pack" />
        <BaseButton class="self-end" @click="createVariant">Simpan</BaseButton>
      </div>
    </section>

    <section class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <EmptyState v-if="!variants.length" title="Varian kosong" />
      <article v-for="variant in variants" :key="variant.id" class="rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
        
        <div v-if="editId === variant.id" class="space-y-3">
          <label class="block">
            <span class="mb-1 block text-sm font-bold">Saus</span>
            <select v-model="editForm.sauce_name" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3 bg-white">
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

        <div v-else>
          <p class="font-black text-dcelup-red">{{ variant.sauce_name }}</p>
          <p class="text-sm text-dcelup-textSoft">{{ variant.product?.name }} · {{ getProductTypeLabel(variant.type) }} · {{ variant.qty_per_pack }} pcs</p>
          <div class="mt-3 flex items-center justify-between gap-2">
            <span class="rounded-full bg-dcelup-yellow px-3 py-1 font-black">{{ formatRupiah(variant.price) }}</span>
            <div class="flex gap-2">
              <BaseButton variant="accent" @click="startEdit(variant)">Edit</BaseButton>
              <BaseButton variant="secondary" @click="deactivate(variant.id)">Hapus</BaseButton>
            </div>
          </div>
        </div>

      </article>
    </section>
  </DashboardLayout>
</template>
