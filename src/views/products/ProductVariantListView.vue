<script setup>
import { onMounted, reactive, ref } from 'vue'
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
import { PRODUCT_TYPES } from '@/constants/productTypes'

const uiStore = useUiStore()
const { extractMessage } = useApiError()
const products = ref([])
const variants = ref([])
const form = reactive({ product_id: '', sauce_name: '', type: 'original', price: 6000, qty_per_pack: 4, is_active: true })

const editId = ref(null)
const editForm = reactive({ sauce_name: '', price: 0, qty_per_pack: 0 })

onMounted(async () => { await Promise.all([fetchProducts(), fetchVariants()]) })
async function fetchProducts() { products.value = unwrapList(await productApi.getAll({ per_page: 100 })) }
async function fetchVariants() { variants.value = unwrapList(await productVariantApi.getAll({ per_page: 100 })) }
async function createVariant() {
  try {
    await productVariantApi.create({ ...form, price: Number(form.price), qty_per_pack: Number(form.qty_per_pack) })
    uiStore.showToast('success', 'Varian berhasil ditambahkan')
    // BUG-13: Reset form setelah berhasil — sebelumnya field tetap berisi data lama
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
        <label class="block"><span class="mb-1 block text-sm font-bold">Produk</span><select v-model="form.product_id" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3"><option value="">Pilih</option><option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option></select></label>
        <BaseInput v-model="form.sauce_name" label="Saus" />
        <label class="block"><span class="mb-1 block text-sm font-bold">Tipe</span><select v-model="form.type" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3"><option v-for="t in PRODUCT_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option></select></label>
        <BaseInput v-model="form.price" type="number" label="Harga" />
        <BaseInput v-model="form.qty_per_pack" type="number" label="Qty/pack" />
        <BaseButton class="self-end" @click="createVariant">Simpan</BaseButton>
      </div>
    </section>
    <section class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <EmptyState v-if="!variants.length" title="Varian kosong" />
      <article v-for="variant in variants" :key="variant.id" class="rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
        
        <div v-if="editId === variant.id" class="space-y-3">
          <BaseInput v-model="editForm.sauce_name" label="Saus" />
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
          <p class="text-sm text-dcelup-textSoft">{{ variant.product?.name }} · {{ variant.type }} · {{ variant.qty_per_pack }} pcs</p>
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
