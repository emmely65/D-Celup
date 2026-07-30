<script setup>
import { computed, onMounted, ref } from 'vue'
import { Search, ShoppingBag, Info, CheckCircle2 } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ProductVariantCard from '@/components/transactions/ProductVariantCard.vue'
import CartPanel from '@/components/transactions/CartPanel.vue'
import PaymentSummary from '@/components/transactions/PaymentSummary.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { productVariantApi } from '@/api/productVariantApi'
import { transactionApi } from '@/api/transactionApi'
import { useDebounce } from '@/composables/useDebounce'
import { useApiError } from '@/composables/useApiError'
import { unwrapList } from '@/utils/normalizer'

const cartStore = useCartStore()
const uiStore = useUiStore()
const dashboardStore = useDashboardStore()
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
    dashboardStore.fetchTopProducts()
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
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-dcelup-red/10 text-dcelup-red">
          <ShoppingBag class="h-4 w-4" />
        </div>
        <div>
          <h1 class="truncate text-lg font-black tracking-tight text-dcelup-text">Kasir POS</h1>
          <p class="truncate text-xs font-medium text-dcelup-textSoft hidden sm:block">Pilih varian menu, tentukan jumlah, dan proses transaksi.</p>
        </div>
      </div>
    </template>
    <template #header-actions>
      <span class="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-dcelup-text border border-dcelup-border/80 shadow-xs">
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
        {{ filteredVariants.length }} Varian Menu
      </span>
    </template>

    <!-- Info banner -->
    <div class="mb-4 flex items-center gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 text-xs font-semibold text-amber-900 shadow-xs">
      <Info class="h-4 w-4 shrink-0 text-amber-600" />
      <span>Catatan: Stok bahan dikelola terpisah oleh Admin dan tidak berkurang otomatis per item transaksi.</span>
    </div>

    <!-- Success banner for last transaction -->
    <div v-if="lastTransaction" class="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-xs">
      <div class="flex items-center gap-3">
        <CheckCircle2 class="h-5 w-5 text-emerald-600 shrink-0" />
        <div>
          <p class="font-bold text-sm">Transaksi Terakhir Berhasil!</p>
          <p class="text-xs text-emerald-700">Kode TRX: <span class="font-mono font-bold">{{ lastTransaction.trx_code ?? lastTransaction.code ?? '-' }}</span></p>
        </div>
      </div>
      <button class="text-xs font-bold text-emerald-700 underline hover:text-emerald-900" @click="lastTransaction = null">
        Tutup
      </button>
    </div>

    <!-- Search bar with icon -->
    <div class="relative mb-5">
      <Search class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dcelup-textSoft/60 pointer-events-none" />
      <input
        v-model="search"
        class="min-h-12 w-full rounded-2xl border border-dcelup-border/80 bg-white pl-11 pr-4 text-sm font-semibold text-dcelup-text placeholder:text-dcelup-textSoft/50 outline-none transition-all focus:border-dcelup-red focus:ring-4 focus:ring-dcelup-red/10 shadow-xs"
        placeholder="Cari varian saus, tipe produk..."
      />
    </div>

    <LoadingBlock v-if="isLoading" />
    <EmptyState v-else-if="!filteredVariants.length" title="Menu belum tersedia" description="Varian produk belum ditemukan untuk pencarian ini." />
    <div v-else class="pb-24">
      <div v-for="group in groupedVariants" :key="group.name" class="mb-8">
        <div class="flex items-center gap-2 mb-3.5">
          <span class="h-3 w-1 rounded-full bg-dcelup-red"></span>
          <h2 class="text-base font-black tracking-tight text-dcelup-text">{{ group.name }}</h2>
          <span class="text-xs font-bold text-dcelup-textSoft/70">({{ group.variants.length }})</span>
        </div>

        <div class="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <ProductVariantCard v-for="variant in group.variants" :key="variant.id" :variant="variant" />
        </div>
      </div>
    </div>

    <CartPanel @checkout="showPayment = true" />
    <PaymentSummary :open="showPayment" :loading="isSubmitting" @close="showPayment = false" @submit="submitTransaction" />
  </DashboardLayout>
</template>

