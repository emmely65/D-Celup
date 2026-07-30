<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Package, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { rawMaterialApi } from '@/api/rawMaterialApi'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'
import { unwrapList } from '@/utils/normalizer'
import { formatNumber } from '@/utils/number'

const authStore = useAuthStore()
const uiStore = useUiStore()
const { extractMessage } = useApiError()
const materials = ref([])
const isSubmitting = ref(false)
const form = reactive({ name: '', unit: '', current_stock: 0, min_stock: 0 })

const editId = ref(null)
const editForm = reactive({ name: '', unit: '', current_stock: 0, min_stock: 0 })

onMounted(fetchMaterials)

function getStockStatus(current, min) {
  const c = Number(current)
  const m = Number(min)
  if (c <= 0) {
    return {
      label: 'Stok Habis',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      barClass: 'bg-rose-500',
      icon: AlertCircle,
      percent: 0
    }
  }
  if (c <= m) {
    const pct = Math.min(100, Math.round((c / (m || 1)) * 50))
    return {
      label: 'Stok Menipis',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      barClass: 'bg-amber-500',
      icon: AlertTriangle,
      percent: pct
    }
  }
  const pct = Math.min(100, Math.round((c / (m * 2 || 1)) * 100))
  return {
    label: 'Aman',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    barClass: 'bg-emerald-500',
    icon: CheckCircle2,
    percent: pct
  }
}

async function fetchMaterials() {
  try {
    materials.value = unwrapList(await rawMaterialApi.getAll({ per_page: 100, is_active: 1 }))
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}

async function createMaterial() {
  if (!form.name || !form.unit) {
    return uiStore.showToast('warning', 'Nama dan Satuan wajib diisi')
  }
  isSubmitting.value = true
  try {
    await rawMaterialApi.create({
      ...form,
      current_stock: Number(form.current_stock),
      min_stock: Number(form.min_stock)
    })
    uiStore.showToast('success', 'Bahan baku berhasil ditambahkan')
    Object.assign(form, { name: '', unit: '', current_stock: 0, min_stock: 0 })
    await fetchMaterials()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  } finally {
    isSubmitting.value = false
  }
}

function startEdit(item) {
  editId.value = item.id
  Object.assign(editForm, {
    name: item.name,
    unit: item.unit,
    current_stock: item.current_stock,
    min_stock: item.min_stock
  })
}

function cancelEdit() {
  editId.value = null
}

async function updateMaterial(id) {
  try {
    await rawMaterialApi.update(id, {
      ...editForm,
      current_stock: Number(editForm.current_stock),
      min_stock: Number(editForm.min_stock)
    })
    uiStore.showToast('success', 'Bahan berhasil diupdate')
    editId.value = null
    await fetchMaterials()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}

async function deactivate(id) {
  if (!confirm('Hapus bahan ini dari daftar aktif?')) return
  try {
    await rawMaterialApi.deactivate(id)
    uiStore.showToast('success', 'Bahan berhasil dihapus')
    await fetchMaterials()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-dcelup-red/10 text-dcelup-red">
          <Package class="h-4 w-4" />
        </div>
        <div>
          <h1 class="truncate text-lg font-black tracking-tight text-dcelup-text">Stok Bahan Baku</h1>
          <p class="truncate text-xs font-medium text-dcelup-textSoft hidden sm:block">Kelola persediaan bahan mentah dan batas stok minimal.</p>
        </div>
      </div>
    </template>

    <!-- FORM TAMBAH BAHAN (ADMIN) -->
    <section v-if="authStore.isAdmin" class="mt-4 rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
      <div class="flex items-center gap-2 mb-4">
        <span class="flex h-6 w-6 items-center justify-center rounded-full bg-dcelup-red/10 text-dcelup-red">
          <Plus class="h-3.5 w-3.5" />
        </span>
        <h2 class="font-black text-base text-dcelup-text">Tambah Bahan Baru</h2>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
        <BaseInput v-model="form.name" label="Nama Bahan" placeholder="Contoh: Tepung Tapioka" />
        <BaseInput v-model="form.unit" label="Satuan" placeholder="kg, pcs, liter, gr" />
        <BaseInput v-model="form.current_stock" type="number" label="Stok Awal" min="0" step="any" />
        <BaseInput v-model="form.min_stock" type="number" label="Minimal Stok" min="0" step="any" />
        <BaseButton class="w-full font-bold shadow-xs" :loading="isSubmitting" @click="createMaterial">
          Simpan Bahan
        </BaseButton>
      </div>
    </section>

    <!-- LIST BAHAN BAKU CARDS -->
    <section class="mt-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-black text-base text-dcelup-text">Daftar Bahan Baku ({{ materials.length }})</h3>
      </div>

      <EmptyState v-if="!materials.length" title="Belum Ada Bahan Baku" description="Bahan baku belum diinputkan oleh Admin." />

      <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="item in materials"
          :key="item.id"
          class="hover-lift rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs transition-all duration-300 flex flex-col justify-between"
        >
          <!-- MODE EDIT -->
          <div v-if="editId === item.id" class="space-y-3">
            <p class="font-black text-sm text-dcelup-red">Edit Data Bahan</p>
            <BaseInput v-model="editForm.name" label="Nama Bahan" />
            <div class="grid grid-cols-2 gap-3">
              <BaseInput v-model="editForm.current_stock" type="number" label="Stok Saat Ini" />
              <BaseInput v-model="editForm.min_stock" type="number" label="Minimal Stok" />
            </div>
            <BaseInput v-model="editForm.unit" label="Satuan" />
            <div class="flex gap-2 pt-2">
              <BaseButton @click="updateMaterial(item.id)" class="flex-1 text-xs">Simpan Update</BaseButton>
              <BaseButton variant="secondary" @click="cancelEdit" class="flex-1 text-xs">Batal</BaseButton>
            </div>
          </div>

          <!-- MODE VIEW -->
          <div v-else class="flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="min-w-0">
                  <h4 class="font-black text-base text-dcelup-text truncate" :title="item.name">{{ item.name }}</h4>
                  <p class="text-xs font-semibold text-dcelup-textSoft mt-0.5">
                    Satuan: <span class="font-bold text-dcelup-text">{{ item.unit }}</span>
                  </p>
                </div>
                
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold whitespace-nowrap shadow-2xs"
                  :class="getStockStatus(item.current_stock, item.min_stock).badgeClass"
                >
                  <component :is="getStockStatus(item.current_stock, item.min_stock).icon" class="h-3.5 w-3.5 shrink-0" />
                  <span>{{ getStockStatus(item.current_stock, item.min_stock).label }}</span>
                </span>
              </div>

              <!-- Stock Quantity Indicator -->
              <div class="mt-4 rounded-xl bg-dcelup-creamSoft/60 border border-dcelup-border/50 p-3">
                <div class="flex items-baseline justify-between">
                  <span class="text-xs font-semibold text-dcelup-textSoft">Stok Saat Ini</span>
                  <span class="text-xs font-semibold text-dcelup-textSoft">Min: {{ formatNumber(item.min_stock) }} {{ item.unit }}</span>
                </div>
                <p class="mt-1 text-xl font-black text-dcelup-text">
                  {{ formatNumber(item.current_stock) }} <span class="text-xs font-bold text-dcelup-textSoft">{{ item.unit }}</span>
                </p>

                <!-- Stock Visual Progress Bar -->
                <div class="mt-2.5 h-2 w-full rounded-full bg-dcelup-border/40 overflow-hidden">
                  <div
                    class="h-full transition-all duration-500 rounded-full"
                    :class="getStockStatus(item.current_stock, item.min_stock).barClass"
                    :style="{ width: `${getStockStatus(item.current_stock, item.min_stock).percent}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <div v-if="authStore.isAdmin" class="mt-4 flex items-center gap-2 border-t border-dcelup-border/40 pt-3">
              <button
                class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-dcelup-border bg-dcelup-creamSoft/50 px-3 py-1.5 text-xs font-bold text-dcelup-text transition-all hover:bg-white hover:border-dcelup-red/40 active:scale-95"
                @click="startEdit(item)"
              >
                <Edit2 class="h-3.5 w-3.5 text-dcelup-textSoft" />
                <span>Edit</span>
              </button>
              <button
                class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50/50 px-3 py-1.5 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 hover:border-rose-300 active:scale-95"
                @click="deactivate(item.id)"
              >
                <Trash2 class="h-3.5 w-3.5 text-rose-600" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  </DashboardLayout>
</template>

