<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, Lock, User } from 'lucide-vue-next'
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
    <section class="w-full rounded-3xl border border-dcelup-border/80 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
      <div class="text-center">
        <div class="relative inline-block">
          <img :src="logo" alt="Logo D'Celup" class="mx-auto h-20 w-20 rounded-full bg-white object-cover shadow-xl ring-4 ring-dcelup-red/10" />
          <span class="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-dcelup-red text-white shadow-md">
            <Sparkles class="h-3.5 w-3.5" />
          </span>
        </div>
        
        <h1 class="mt-4 text-2xl font-black tracking-tight text-dcelup-text">D'Celup System</h1>
        <p class="mt-1 text-xs font-semibold text-dcelup-textSoft">Masuk ke akun Anda</p>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <BaseInput v-model="form.login" label="Username / Email" placeholder="Masukkan username atau email" />
        
        <BaseInput v-model="form.password" type="password" label="Password" placeholder="••••••••" />

        <div v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700 shadow-2xs">
          {{ errorMessage }}
        </div>

        <BaseButton type="submit" class="w-full font-bold shadow-md py-3 mt-2" :loading="authStore.isLoading">
          Masuk ke Dashboard
        </BaseButton>
      </form>
    </section>
  </AuthLayout>
</template>

