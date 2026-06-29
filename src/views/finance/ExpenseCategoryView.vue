<script setup>
import { onMounted, reactive, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { expenseCategoryApi } from '@/api/expenseCategoryApi'
import { unwrapList } from '@/utils/normalizer'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'

const uiStore = useUiStore()
const { extractMessage } = useApiError()
const categories = ref([])
const form = reactive({ name: '', is_active: true })
onMounted(fetchCategories)

// BUG-06: Tambah try/catch ke semua fungsi — sebelumnya tidak ada error handling
async function fetchCategories() {
  try {
    categories.value = unwrapList(await expenseCategoryApi.getAll({ per_page: 100 }))
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}

async function createCategory() {
  try {
    await expenseCategoryApi.create(form)
    uiStore.showToast('success', 'Kategori ditambahkan')
    form.name = ''
    await fetchCategories()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}

async function deactivate(id) {
  if (!confirm('Nonaktifkan kategori?')) return
  try {
    await expenseCategoryApi.deactivate(id)
    uiStore.showToast('success', 'Kategori dinonaktifkan')
    await fetchCategories()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}
</script>

<template>
  <DashboardLayout>
    <h1 class="text-2xl font-black">Kategori Pengeluaran</h1>
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <div class="flex gap-2"><BaseInput v-model="form.name" label="Nama kategori" /><BaseButton class="self-end" @click="createCategory">Simpan</BaseButton></div>
      <div class="mt-4 space-y-2">
        <div v-for="c in categories" :key="c.id" class="flex items-center justify-between rounded-xl bg-white p-3"><span class="font-bold">{{ c.name }}</span><BaseButton v-if="!c.is_default" variant="secondary" @click="deactivate(c.id)">Nonaktifkan</BaseButton><span v-else class="text-xs font-bold text-dcelup-textSoft">Default</span></div>
      </div>
    </section>
  </DashboardLayout>
</template>
