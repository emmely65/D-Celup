<script setup>
import { onMounted, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { activityLogApi } from '@/api/activityLogApi'
import { unwrapList } from '@/utils/normalizer'
import { formatDateTime } from '@/utils/date'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'

const uiStore = useUiStore()
const { extractMessage } = useApiError()
const logs = ref([])
const isLoading = ref(false)

// BUG-07a: Tambah try/catch — sebelumnya error ditelan silently dan hanya tampil EmptyState
onMounted(async () => {
  isLoading.value = true
  try {
    logs.value = unwrapList(await activityLogApi.getAll({ per_page: 100 }))
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Activity Log</h1>
    </template>
    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <LoadingBlock v-if="isLoading" />
      <template v-else>
        <EmptyState v-if="!logs.length" title="Log kosong" />
        <div v-for="log in logs" :key="log.id" class="border-b border-dcelup-border py-3 last:border-0"><p class="font-black">{{ log.action }} · {{ log.module }}</p><p class="text-sm text-dcelup-textSoft">{{ log.user?.name ?? '-' }} · {{ formatDateTime(log.created_at) }}</p><pre class="mt-2 overflow-auto rounded-xl bg-white p-2 text-xs">{{ log.detail }}</pre></div>
      </template>
    </section>
  </DashboardLayout>
</template>

