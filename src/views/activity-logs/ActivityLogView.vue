<script setup>
import { onMounted, ref, computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { activityLogApi } from '@/api/activityLogApi'
import { unwrapList, unwrapMeta } from '@/utils/normalizer'
import { formatDateTime } from '@/utils/date'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'
import { Plus, Edit2, Trash2, Activity, User, Package, ShoppingCart, Wallet, ScrollText, ChevronDown } from 'lucide-vue-next'

const uiStore = useUiStore()
const { extractMessage } = useApiError()

const logs = ref([])
const meta = ref(null)
const isLoading = ref(false)
const isLoadingMore = ref(false)

const filters = ref({
  module: '',
  action: ''
})

const MODULES = [
  { value: '', label: 'Semua Modul' },
  { value: 'auth', label: 'Autentikasi' },
  { value: 'users', label: 'Pengguna' },
  { value: 'products', label: 'Produk' },
  { value: 'product_variants', label: 'Varian Produk' },
  { value: 'stocks', label: 'Stok Bahan' },
  { value: 'expenses', label: 'Pengeluaran' },
  { value: 'transactions', label: 'Transaksi' }
]

const ACTIONS = [
  { value: '', label: 'Semua Aksi' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'create', label: 'Tambah' },
  { value: 'update', label: 'Ubah' },
  { value: 'delete', label: 'Hapus' },
  { value: 'deactivate', label: 'Nonaktifkan' }
]

const getActionDetails = (action) => {
  const map = {
    create: { icon: Plus, color: 'text-green-600', bg: 'bg-green-100', label: 'Menambahkan' },
    update: { icon: Edit2, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Memperbarui' },
    delete: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100', label: 'Menghapus' },
    deactivate: { icon: Trash2, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Menonaktifkan' },
    login: { icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Login' },
    logout: { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Logout' }
  }
  return map[action] || { icon: Activity, color: 'text-dcelup-text', bg: 'bg-dcelup-border', label: action }
}

const formatDetail = (detailStr) => {
  if (!detailStr) return null
  try {
    return JSON.stringify(JSON.parse(detailStr), null, 2)
  } catch (e) {
    return detailStr
  }
}

async function fetchLogs(page = 1, append = false) {
  if (append) isLoadingMore.value = true
  else isLoading.value = true

  try {
    const payload = { 
      page, 
      per_page: 20, 
      ...(filters.value.module && { module: filters.value.module }),
      ...(filters.value.action && { action: filters.value.action })
    }
    const response = await activityLogApi.getAll(payload)
    
    if (append) {
      logs.value = [...logs.value, ...unwrapList(response)]
    } else {
      logs.value = unwrapList(response)
    }
    meta.value = unwrapMeta(response)
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

function applyFilters() {
  fetchLogs(1, false)
}

function loadMore() {
  if (meta.value && meta.value.current_page < meta.value.last_page) {
    fetchLogs(meta.value.current_page + 1, true)
  }
}

onMounted(() => fetchLogs(1))
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Log Aktivitas</h1>
      <p class="truncate text-sm text-dcelup-textSoft hidden sm:block">Pantau jejak perubahan data di sistem.</p>
    </template>

    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="relative">
        <select v-model="filters.module" @change="applyFilters" class="w-full appearance-none rounded-xl border border-dcelup-border bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-dcelup-red">
          <option v-for="mod in MODULES" :key="mod.value" :value="mod.value">{{ mod.label }}</option>
        </select>
        <ChevronDown class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dcelup-textSoft" />
      </div>
      <div class="relative">
        <select v-model="filters.action" @change="applyFilters" class="w-full appearance-none rounded-xl border border-dcelup-border bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-dcelup-red">
          <option v-for="act in ACTIONS" :key="act.value" :value="act.value">{{ act.label }}</option>
        </select>
        <ChevronDown class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dcelup-textSoft" />
      </div>
    </div>

    <section class="rounded-xl border border-dcelup-border bg-white p-4 sm:p-6">
      <LoadingBlock v-if="isLoading" />
      <template v-else>
        <EmptyState v-if="!logs.length" title="Belum ada aktivitas" description="Ganti filter atau tunggu hingga ada aktivitas tercatat." />
        
        <div v-else class="relative space-y-6 before:absolute before:inset-y-0 before:left-5 before:w-0.5 before:bg-dcelup-cream">
          <div v-for="log in logs" :key="log.id" class="relative pl-12">
            <!-- Timeline Icon -->
            <div :class="['absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white', getActionDetails(log.action).bg, getActionDetails(log.action).color]">
              <component :is="getActionDetails(log.action).icon" class="h-5 w-5" />
            </div>

            <div class="rounded-xl border border-dcelup-creamSoft bg-dcelup-creamSoft/30 p-4 transition hover:bg-dcelup-creamSoft/70">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p class="text-sm font-black text-dcelup-text">
                    <span class="text-dcelup-red">{{ log.user?.name ?? 'Sistem' }}</span> 
                    {{ getActionDetails(log.action).label.toLowerCase() }} data 
                    <span class="capitalize text-dcelup-redDark">{{ log.module.replace('_', ' ') }}</span>
                  </p>
                  <p class="mt-1 text-xs font-semibold text-dcelup-textSoft">
                    {{ formatDateTime(log.created_at) }}
                  </p>
                </div>
              </div>

              <!-- Collapsible Raw Data -->
              <details v-if="log.detail && log.detail !== '[]' && log.detail !== '{}'" class="group mt-3">
                <summary class="cursor-pointer text-xs font-bold text-dcelup-red hover:underline">
                  Lihat Detail Perubahan
                </summary>
                <div class="mt-2 overflow-x-auto rounded-lg bg-gray-900 p-3">
                  <pre class="text-[11px] leading-relaxed text-green-400">{{ formatDetail(log.detail) }}</pre>
                </div>
              </details>
            </div>
          </div>
        </div>

        <div v-if="meta && meta.current_page < meta.last_page" class="mt-8 text-center">
          <BaseButton :disabled="isLoadingMore" @click="loadMore" class="w-full sm:w-auto">
            {{ isLoadingMore ? 'Memuat...' : 'Muat Lebih Banyak' }}
          </BaseButton>
        </div>
      </template>
    </section>
  </DashboardLayout>
</template>

