<script setup>
import { onMounted, reactive, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { userApi } from '@/api/userApi'
import { unwrapList } from '@/utils/normalizer'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useApiError } from '@/composables/useApiError'

const authStore = useAuthStore()
const uiStore = useUiStore()
const { extractMessage } = useApiError()
const users = ref([])
const editTarget = ref(null)
const editLoading = ref(false)

const form = reactive({ name: '', username: '', email: '', password: '', role: 'kasir', is_active: true })
const editForm = reactive({ name: '', username: '', email: '', password: '' })

onMounted(fetchUsers)

async function fetchUsers() {
  try {
    users.value = unwrapList(await userApi.getAll({ per_page: 100 }))
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}

async function createUser() {
  if (!authStore.isAdmin) return uiStore.showToast('warning', 'Hanya admin yang dapat membuat user.')

  try {
    await userApi.create(form)
    uiStore.showToast('success', 'User berhasil dibuat')
    Object.assign(form, { name: '', username: '', email: '', password: '', role: 'kasir', is_active: true })
    await fetchUsers()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}

function openEdit(user) {
  if (!authStore.isAdmin) return uiStore.showToast('warning', 'Hanya admin yang dapat mengedit user.')

  editTarget.value = user
  Object.assign(editForm, {
    name: user.name ?? '',
    username: user.username ?? '',
    email: user.email ?? '',
    password: ''
  })
}

function closeEdit() {
  editTarget.value = null
  Object.assign(editForm, { name: '', username: '', email: '', password: '' })
}

async function updateUser() {
  if (!authStore.isAdmin) return uiStore.showToast('warning', 'Hanya admin yang dapat mengedit user.')
  if (!editTarget.value) return

  editLoading.value = true
  try {
    const payload = {
      name: editForm.name,
      username: editForm.username,
      email: editForm.email,
      role: editTarget.value.role,
      is_active: editTarget.value.is_active
    }

    await userApi.update(editTarget.value.id, payload)

    if (editForm.password.trim()) {
      await userApi.resetPassword(editTarget.value.id, { password: editForm.password })
    }

    if (Number(editTarget.value.id) === Number(authStore.user?.id)) {
      await authStore.fetchMe()
    }

    uiStore.showToast('success', 'User berhasil diperbarui')
    closeEdit()
    await fetchUsers()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  } finally {
    editLoading.value = false
  }
}

async function deactivate(id) {
  if (!authStore.isAdmin) return uiStore.showToast('warning', 'Hanya admin yang dapat menonaktifkan user.')
  if (!confirm('Nonaktifkan user?')) return

  try {
    await userApi.deactivate(id)
    uiStore.showToast('success', 'User dinonaktifkan')
    await fetchUsers()
  } catch (e) {
    uiStore.showToast('error', extractMessage(e))
  }
}
</script>

<template>
  <DashboardLayout>
    <template #header-text>
      <h1 class="truncate text-lg font-extrabold text-dcelup-text">Manajemen User</h1>
      <p class="truncate text-sm text-dcelup-textSoft hidden sm:block">Admin dapat membuat, mengedit, dan menonaktifkan user.</p>
    </template>

    <section v-if="authStore.isAdmin" class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <h2 class="font-black">Tambah User</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <BaseInput v-model="form.name" label="Nama" />
        <BaseInput v-model="form.username" label="Username" />
        <BaseInput v-model="form.email" label="Email" />
        <BaseInput v-model="form.password" type="password" label="Password" />
        <label>
          <span class="mb-1 block text-sm font-bold">Role</span>
          <select v-model="form.role" class="min-h-11 w-full rounded-xl border border-dcelup-border px-3">
            <option value="admin">Admin</option>
            <option value="kasir">Kasir</option>
          </select>
        </label>
        <BaseButton class="self-end" @click="createUser">Simpan</BaseButton>
      </div>
    </section>

    <section class="mt-4 rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
      <div v-for="u in users" :key="u.id" class="flex flex-wrap items-center justify-between gap-3 border-b border-dcelup-border py-3 last:border-0">
        <div class="min-w-0">
          <p class="font-black">{{ u.name }}</p>
          <p class="break-words text-sm text-dcelup-textSoft">{{ u.username }} - {{ u.email }} - {{ u.role }}</p>
        </div>
        <div v-if="authStore.isAdmin" class="flex flex-wrap gap-2">
          <BaseButton variant="ghost" @click="openEdit(u)">Edit</BaseButton>
          <BaseButton variant="secondary" @click="deactivate(u.id)">Nonaktifkan</BaseButton>
        </div>
      </div>
    </section>

    <div v-if="editTarget" class="fixed inset-0 z-50 bg-black/40 px-4" @click.self="closeEdit">
      <section class="absolute left-1/2 top-1/2 w-[min(520px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-dcelup-creamSoft p-5 shadow-2xl">
        <div class="mb-4">
          <h2 class="text-xl font-black">Edit User</h2>
          <p class="text-sm text-dcelup-textSoft">Password boleh dikosongkan jika tidak ingin diganti.</p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <BaseInput v-model="editForm.name" label="Nama" />
          <BaseInput v-model="editForm.username" label="Username" />
          <BaseInput v-model="editForm.email" label="Email" class="sm:col-span-2" />
          <BaseInput v-model="editForm.password" type="password" label="Password baru" class="sm:col-span-2" />
        </div>

        <div class="mt-5 flex flex-wrap justify-end gap-2">
          <BaseButton variant="secondary" @click="closeEdit">Batal</BaseButton>
          <BaseButton :loading="editLoading" @click="updateUser">Simpan Perubahan</BaseButton>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>
