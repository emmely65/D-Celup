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
const showPassword = ref(false)

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
        <BaseInput v-model="form.login" label="Username / Email" />
        
        <label class="block relative">
          <span class="mb-1 block text-sm font-semibold text-dcelup-text">Password</span>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="min-h-11 w-full rounded-xl border border-dcelup-border bg-white px-3 py-2 pr-10 text-dcelup-text outline-none transition focus:border-dcelup-red focus:ring-2 focus:ring-dcelup-red/20"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            </button>
          </div>
        </label>

        <p v-if="errorMessage" class="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{{ errorMessage }}</p>
        <BaseButton type="submit" class="w-full" :loading="authStore.isLoading">Login</BaseButton>
      </form>
    </section>
  </AuthLayout>
</template>
