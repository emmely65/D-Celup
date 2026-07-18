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
const editingId = ref(null)

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
    const allCategories = unwrapList(await expenseCategoryApi.getAll({ per_page: 100 }))
    // Sesuai permintaan: tetapkan pilihan hanya 2, yaitu Bahan baku & Operasional
    categories.value = allCategories
      .filter(c => c.name.toLowerCase().includes('bahan baku') || c.name.toLowerCase().includes('operasional'))
      .map(c => ({
        ...c,
        name: c.name.toLowerCase().includes('bahan baku') ? 'Bahan baku' : 'Operasional'
      }))
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}
async function saveExpense() {
  try {
    const finalDescription = form.item_name 
      ? (form.description ? `${form.item_name} - ${form.description}` : form.item_name)
      : form.description

    const payload = { ...form, description: finalDescription, amount: Number(form.amount) }

    if (editingId.value) {
      await expenseApi.update(editingId.value, payload)
      uiStore.showToast('success', 'Pengeluaran berhasil diupdate')
    } else {
      await expenseApi.create(payload)
      uiStore.showToast('success', 'Pengeluaran berhasil dicatat')
    }
    cancelEdit()
    await fetchExpenses()
  } catch (e) { uiStore.showToast('error', extractMessage(e)) }
}

function editExpense(e) {
  editingId.value = e.id
  form.category_id = e.category_id ?? e.expense_category?.id ?? ''
  form.amount = e.amount
  form.expense_date = e.expense_date ? e.expense_date.split('T')[0] : new Date().toISOString().slice(0, 10)
  form.item_name = e.item_name ?? e.description ?? ''
  form.description = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editingId.value = null
  Object.assign(form, { category_id: '', amount: 0, expense_date: new Date().toISOString().slice(0, 10), description: '', item_name: '' })
}

async function deleteExpense(id) {
  if (!confirm('Yakin ingin menghapus pengeluaran ini?')) return
  try {
    await expenseApi.delete(id)
    uiStore.showToast('success', 'Pengeluaran berhasil dihapus')
    if (editingId.value === id) cancelEdit()
    await fetchExpenses()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Pengeluaran</h1>
    </template>
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black">{{ editingId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Manual' }}</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label class="block"><span class="mb-1 block text-sm font-bold">Kategori</span><select v-model="form.category_id" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3"><option value="">Pilih</option><option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option></select></label>
        <BaseInput v-model="form.item_name" label="Nama Barang" />
        <BaseInput v-model="form.amount" type="number" label="Harga Barang" />
        <BaseInput v-model="form.expense_date" type="date" label="Tanggal" />
        <div class="flex items-end gap-2">
          <BaseButton class="w-full" @click="saveExpense">{{ editingId ? 'Update' : 'Simpan' }}</BaseButton>
          <BaseButton v-if="editingId" variant="secondary" @click="cancelEdit">Batal</BaseButton>
        </div>
      </div>
    </section>

    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <EmptyState v-if="!expenses.length" title="Belum ada pengeluaran" />
      <div v-for="e in expenses" :key="e.id" class="flex flex-wrap items-center justify-between gap-3 border-b border-dcelup-border py-3 last:border-0">
        <div class="flex-1">
          <p class="font-black">{{ e.description }}</p>
          <p class="text-sm text-dcelup-textSoft">{{ e.category?.name ?? e.expense_category?.name ?? '-' }} · {{ formatDate(e.expense_date) }}</p>
          <p v-if="e.source_type === 'auto_stock'" class="mt-1 text-xs font-bold text-amber-700">Otomatis dari barang masuk · read-only</p>
        </div>
        <div class="flex items-center gap-4">
          <p class="font-black text-dcelup-redDark">{{ formatRupiah(e.amount) }}</p>
          <div v-if="e.source_type !== 'auto_stock'" class="flex gap-2">
            <BaseButton variant="secondary" class="!px-3 !py-1 text-xs" @click="editExpense(e)">Edit</BaseButton>
            <BaseButton variant="danger" class="!px-3 !py-1 text-xs" @click="deleteExpense(e.id)">Hapus</BaseButton>
          </div>
        </div>
      </div>
    </section>
  </DashboardLayout>
</template>
