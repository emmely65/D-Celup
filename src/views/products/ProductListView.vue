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

onMounted(fetchProducts)
async function fetchProducts() {
  isLoading.value = true
  try { products.value = unwrapList(await productApi.getAll({ per_page: 100 })) }
  catch (e) { uiStore.showToast('error', extractMessage(e)) }
  finally { isLoading.value = false }
}
async function createProduct() {
  try {
    await productApi.create(form)
    uiStore.showToast('success', 'Produk berhasil ditambahkan')
    Object.assign(form, { name: '', category: 'original', description: '', is_active: true })
    await fetchProducts()
  } catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
async function deactivate(id) {
  if (!confirm('Nonaktifkan produk ini?')) return
  try { await productApi.deactivate(id); uiStore.showToast('success', 'Produk dinonaktifkan'); await fetchProducts() }
  catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
</script>

<template>
  <DashboardLayout>
    <h1 class="text-2xl font-black">Produk</h1>
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black">Tambah Produk</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <BaseInput v-model="form.name" label="Nama" />
        <BaseInput v-model="form.category" label="Kategori" />
        <BaseInput v-model="form.description" label="Deskripsi" />
        <BaseButton class="self-end" @click="createProduct">Simpan</BaseButton>
      </div>
    </section>
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <EmptyState v-if="!products.length" title="Produk kosong" />
      <div v-for="product in products" :key="product.id" class="flex flex-wrap items-center justify-between gap-3 border-b border-dcelup-border py-3 last:border-0">
        <div><p class="font-black">{{ product.name }}</p><p class="text-sm text-dcelup-textSoft">{{ product.category }} · {{ product.description }}</p></div>
        <BaseButton variant="secondary" @click="deactivate(product.id)">Nonaktifkan</BaseButton>
      </div>
    </section>
  </DashboardLayout>
</template>
