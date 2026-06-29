<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.fetchMe()
})
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>
