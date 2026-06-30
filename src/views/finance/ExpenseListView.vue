<script setup>
import { onMounted, reactive, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { expenseApi } from '@/api/expenseApi'
import { expenseCategoryApi } from '@/api/expenseCategoryApi'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'
import { unwrapList } from '@/utils/normalizer'
import { formatRupiah } from '@/utils/currency'
import { formatDate } from '@/utils/date'

const uiStore = useUiStore()
const { extractMessage } = useApiError()
const expenses = ref([])
const categories = ref([])
const isLoading = ref(false)
const form = reactive({
  category_id: '',
  amount: 0,
  expense_date: new Date().toISOString().slice(0, 10),
  description: '',
  item_name: ''
})

onMounted(async () => { await Promise.all([fetchExpenses(), fetchCategories()]) })
// BUG-08: Tambah try/catch — sebelumnya fetch tanpa error handling
async function fetchExpenses() {
  isLoading.value = true
  try {
    expenses.value = unwrapList(await expenseApi.getAll({ per_page: 50 }))
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  } finally {
    isLoading.value = false
  }
}

async function fetchCategories() {
  try {
    categories.value = unwrapList(await expenseCategoryApi.getAll({ per_page: 100 }))
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}
async function createExpense() {
  try {
    const finalDescription = form.item_name 
      ? (form.description ? `${form.item_name} - ${form.description}` : form.item_name)
      : form.description

    await expenseApi.create({ ...form, description: finalDescription, amount: Number(form.amount) })
    uiStore.showToast('success', 'Pengeluaran berhasil dicatat')
    Object.assign(form, { category_id: '', amount: 0, expense_date: new Date().toISOString().slice(0, 10), description: '', item_name: '' })
    await fetchExpenses()
  } catch (e) { uiStore.showToast('error', extractMessage(e)) }
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Pengeluaran</h1>
    </template>
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black">Tambah Pengeluaran Manual</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <label class="block"><span class="mb-1 block text-sm font-bold">Kategori</span><select v-model="form.category_id" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3"><option value="">Pilih</option><option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option></select></label>
        <BaseInput v-model="form.item_name" label="Nama Barang" />
        <BaseInput v-model="form.amount" type="number" label="Harga Barang" />
        <BaseInput v-model="form.expense_date" type="date" label="Tanggal" />
        <BaseInput v-model="form.description" label="Deskripsi" />
        <BaseButton class="self-end" @click="createExpense">Simpan</BaseButton>
      </div>
    </section>

    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <EmptyState v-if="!expenses.length" title="Belum ada pengeluaran" />
      <div v-for="e in expenses" :key="e.id" class="flex flex-wrap items-center justify-between gap-3 border-b border-dcelup-border py-3 last:border-0">
        <div>
          <p class="font-black">{{ e.description }}</p>
          <p class="text-sm text-dcelup-textSoft">{{ e.category?.name ?? e.expense_category?.name ?? '-' }} · {{ formatDate(e.expense_date) }}</p>
          <p v-if="e.source_type === 'auto_stock'" class="mt-1 text-xs font-bold text-amber-700">Otomatis dari barang masuk · read-only</p>
        </div>
        <p class="font-black text-dcelup-redDark">{{ formatRupiah(e.amount) }}</p>
      </div>
    </section>
  </DashboardLayout>
</template>
