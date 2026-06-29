<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import logo from '@/assets/logo-dcelup.jpeg'

const router = useRouter()
const authStore = useAuthStore()
const form = reactive({ login: '', password: '' })
const errorMessage = ref('')

async function submit() {
  errorMessage.value = ''
  const result = await authStore.login(form)
  if (!result.success) {
    errorMessage.value = result.message
    return
  }
  router.push('/dashboard')
}
</script>

<template>
  <AuthLayout>
    <section class="w-full rounded-3xl border border-dcelup-border bg-dcelup-creamSoft p-6 shadow-xl">
      <div class="text-center">
        <img :src="logo" alt="Logo D'Celup" class="mx-auto h-24 w-24 rounded-full bg-white object-cover shadow" />
        <h1 class="mt-4 text-2xl font-black text-dcelup-red">D'Celup Sempol Ayam</h1>
        <p class="text-sm text-dcelup-textSoft">Masuk untuk mengelola transaksi dan stok.</p>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <BaseInput v-model="form.login" label="Username / Email" placeholder="admin" />
        <BaseInput v-model="form.password" label="Password" type="password" placeholder="password123" />
        <p v-if="errorMessage" class="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{{ errorMessage }}</p>
        <BaseButton type="submit" class="w-full" :loading="authStore.isLoading">Login</BaseButton>
      </form>

      <p class="mt-5 rounded-xl bg-dcelup-cream p-3 text-xs text-dcelup-textSoft">
        Default lokal: <strong>admin</strong> / <strong>password123</strong>
      </p>
    </section>
  </AuthLayout>
</template>
