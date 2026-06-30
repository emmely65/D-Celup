<script setup>
import { computed, onMounted, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ProductVariantCard from '@/components/transactions/ProductVariantCard.vue'
import CartPanel from '@/components/transactions/CartPanel.vue'
import PaymentSummary from '@/components/transactions/PaymentSummary.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { productVariantApi } from '@/api/productVariantApi'
import { transactionApi } from '@/api/transactionApi'
import { useDebounce } from '@/composables/useDebounce'
import { useApiError } from '@/composables/useApiError'
import { unwrapList } from '@/utils/normalizer'

const cartStore = useCartStore()
const uiStore = useUiStore()
const { extractMessage } = useApiError()
const variants = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const showPayment = ref(false)
const search = ref('')
const debouncedSearch = useDebounce(search, 300)
const lastTransaction = ref(null)

const filteredVariants = computed(() => {
  const query = debouncedSearch.value.toLowerCase().trim()
  if (!query) return variants.value
  return variants.value.filter((variant) => [
    variant.product?.name,
    variant.sauce_name,
    variant.type
  ].join(' ').toLowerCase().includes(query))
})

const groupedVariants = computed(() => {
  const groups = {}
  filteredVariants.value.forEach((variant) => {
    const productName = variant.product?.name || 'Produk Lainnya'
    if (!groups[productName]) groups[productName] = []
    groups[productName].push(variant)
  })
  return Object.keys(groups).map((name) => ({ name, variants: groups[name] }))
})

onMounted(fetchVariants)
// BUG-01: watch(debouncedSearch, () => {}) dihapus — tidak berguna.
// filteredVariants sudah merupakan computed dari debouncedSearch sehingga otomatis reaktif.

async function fetchVariants() {
  isLoading.value = true
  try {
    const response = await productVariantApi.getAll({ per_page: 100, is_active: true })
    variants.value = unwrapList(response)
  } catch (error) {
    uiStore.showToast('error', extractMessage(error))
  } finally {
    isLoading.value = false
  }
}

async function submitTransaction() {
  if (cartStore.isEmpty) return uiStore.showToast('warning', 'Keranjang masih kosong.')
  if (Number(cartStore.paidAmount || 0) < cartStore.totalAmount) return uiStore.showToast('warning', 'Nominal bayar belum cukup.')

  isSubmitting.value = true
  try {
    const response = await transactionApi.create(cartStore.buildTransactionPayload())
    lastTransaction.value = response.data.data
    cartStore.clearCart()
    showPayment.value = false
    uiStore.showToast('success', 'Transaksi berhasil disimpan')
  } catch (error) {
    uiStore.showToast('error', extractMessage(error))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Kasir</h1>
      <p class="truncate text-sm text-dcelup-textSoft hidden sm:block">Target transaksi cepat: pilih menu, cek total, simpan.</p>
    </template>
    <template #header-actions>
      <span class="rounded-full bg-white px-3 py-1 text-xs font-bold text-dcelup-textSoft">{{ filteredVariants.length }} menu</span>
    </template>

    <div class="mb-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-3 text-sm font-semibold leading-relaxed text-dcelup-textSoft">
      Info: stok bahan tidak berkurang otomatis dari transaksi. Stok dikelola manual oleh admin.
    </div>

    <div v-if="lastTransaction" class="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
      <p class="font-black">Transaksi terakhir berhasil.</p>
      <p class="text-sm">Kode: {{ lastTransaction.trx_code ?? lastTransaction.code ?? '-' }}</p>
    </div>

    <input
      v-model="search"
      class="mb-4 min-h-12 w-full rounded-xl border border-dcelup-border bg-white px-4 text-base text-dcelup-text outline-none focus:border-dcelup-red focus:ring-2 focus:ring-dcelup-red/20"
      placeholder="Cari saus atau tipe menu..."
    />

    <LoadingBlock v-if="isLoading" />
    <EmptyState v-else-if="!filteredVariants.length" title="Menu belum tersedia" description="Data varian produk belum ditemukan." />
    <div v-else class="pb-20 md:pb-24">
      <div v-for="group in groupedVariants" :key="group.name" class="mb-6">
        <h2 class="mb-3 text-lg font-extrabold text-dcelup-red">{{ group.name }}</h2>
        <div class="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <ProductVariantCard v-for="variant in group.variants" :key="variant.id" :variant="variant" />
        </div>
      </div>
    </div>

    <CartPanel @checkout="showPayment = true" />
    <PaymentSummary :open="showPayment" :loading="isSubmitting" @close="showPayment = false" @submit="submitTransaction" />
  </DashboardLayout>
</template>
