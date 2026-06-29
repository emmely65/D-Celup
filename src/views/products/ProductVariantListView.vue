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
async function deactivate(id) {
  if (!confirm('Nonaktifkan varian ini?')) return
  try { await productVariantApi.deactivate(id); uiStore.showToast('success', 'Varian dinonaktifkan'); await fetchVariants() }
  catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
</script>

<template>
  <DashboardLayout>
    <h1 class="text-2xl font-black">Varian Produk</h1>
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
        <p class="font-black text-dcelup-red">{{ variant.sauce_name }}</p>
        <p class="text-sm text-dcelup-textSoft">{{ variant.product?.name }} · {{ variant.type }} · {{ variant.qty_per_pack }} pcs</p>
        <div class="mt-3 flex items-center justify-between"><span class="rounded-full bg-dcelup-yellow px-3 py-1 font-black">{{ formatRupiah(variant.price) }}</span><BaseButton variant="secondary" @click="deactivate(variant.id)">Nonaktifkan</BaseButton></div>
      </article>
    </section>
  </DashboardLayout>
</template>
