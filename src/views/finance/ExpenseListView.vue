<script setup>
import { onMounted, reactive, ref } from 'vue'
import { WalletCards, Plus, Edit2, Trash2, Calendar, Tag } from 'lucide-vue-next'
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
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
          <WalletCards class="h-5 w-5" />
        </span>
        <div>
          <h1 class="truncate text-lg font-black text-dcelup-text">Pengeluaran Operasional</h1>
          <p class="truncate text-xs font-semibold text-dcelup-textSoft hidden sm:block">Catat dan pantau beban pengeluaran warung.</p>
        </div>
      </div>
    </template>

    <!-- FORM CARD -->
    <section class="mt-4 rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
      <h2 class="font-black text-base text-dcelup-text flex items-center gap-2 mb-3">
        <Plus class="h-4 w-4 text-dcelup-red" />
        {{ editingId ? 'Edit Catatan Pengeluaran' : 'Tambah Pengeluaran Manual' }}
      </h2>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 items-end">
        <label class="block">
          <span class="mb-1 block text-xs font-extrabold text-dcelup-text uppercase tracking-wider">Kategori</span>
          <select v-model="form.category_id" class="h-11 w-full rounded-xl border border-dcelup-border/70 bg-dcelup-creamSoft/40 px-3.5 text-sm font-bold text-dcelup-text outline-none focus:border-dcelup-red focus:bg-white transition-all">
            <option value="">Pilih Kategori</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </label>
        <BaseInput v-model="form.item_name" label="Nama Barang" placeholder="misal: Minyak Goreng 2L" />
        <BaseInput v-model="form.amount" type="number" label="Harga (Rp)" />
        <BaseInput v-model="form.expense_date" type="date" label="Tanggal" />
        <div class="flex items-end gap-2">
          <BaseButton class="h-11 w-full" @click="saveExpense">{{ editingId ? 'Update' : 'Simpan' }}</BaseButton>
          <BaseButton v-if="editingId" variant="secondary" class="h-11" @click="cancelEdit">Batal</BaseButton>
        </div>
      </div>
    </section>

    <!-- LIST CARD -->
    <section class="mt-5 rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
      <h2 class="font-black text-base text-dcelup-text mb-4">Daftar Pengeluaran</h2>
      
      <EmptyState v-if="!expenses.length" title="Belum ada pengeluaran" description="Pengeluaran yang Anda catat akan muncul di sini." />
      
      <div v-else class="space-y-3">
        <div v-for="e in expenses" :key="e.id" class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dcelup-border/50 bg-dcelup-creamSoft/30 p-4 transition-all hover:bg-dcelup-creamSoft/60 hover:shadow-xs">
          <div class="flex-1 min-w-[200px]">
            <p class="font-black text-base text-dcelup-text">{{ e.description }}</p>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-dcelup-textSoft">
              <span class="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 font-bold text-amber-700">
                <Tag class="h-3 w-3" />
                {{ e.category?.name ?? e.expense_category?.name ?? '-' }}
              </span>
              <span>•</span>
              <span class="inline-flex items-center gap-1">
                <Calendar class="h-3 w-3" />
                {{ formatDate(e.expense_date) }}
              </span>
            </div>
            <p v-if="e.source_type === 'auto_stock'" class="mt-1.5 text-[11px] font-bold text-amber-700 bg-amber-500/10 rounded-md px-2 py-0.5 w-fit">
              Otomatis dari barang masuk (Read-only)
            </p>
          </div>

          <div class="flex items-center gap-4">
            <p class="font-black text-lg text-dcelup-redDark">{{ formatRupiah(e.amount) }}</p>
            <div v-if="e.source_type !== 'auto_stock'" class="flex gap-2">
              <BaseButton variant="secondary" class="!px-3 !py-1.5 text-xs" @click="editExpense(e)">
                <Edit2 class="h-3.5 w-3.5 mr-1" />
                Edit
              </BaseButton>
              <BaseButton variant="danger" class="!px-3 !py-1.5 text-xs" @click="deleteExpense(e.id)">
                <Trash2 class="h-3.5 w-3.5 mr-1" />
                Hapus
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  </DashboardLayout>
</template>
