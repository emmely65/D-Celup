<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Users, UserPlus, Edit2, Shield, UserX, KeyRound } from 'lucide-vue-next'
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
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-dcelup-red/10 text-dcelup-red">
          <Users class="h-5 w-5" />
        </span>
        <div>
          <h1 class="truncate text-lg font-black text-dcelup-text">Manajemen Pengguna</h1>
          <p class="truncate text-xs font-semibold text-dcelup-textSoft hidden sm:block">Kelola akses akun admin dan kasir toko.</p>
        </div>
      </div>
    </template>

    <!-- FORM CREATE -->
    <section v-if="authStore.isAdmin" class="mt-4 rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
      <h2 class="font-black text-base text-dcelup-text flex items-center gap-2 mb-3">
        <UserPlus class="h-4 w-4 text-dcelup-red" />
        Tambah Pengguna Baru
      </h2>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-6 items-end">
        <BaseInput v-model="form.name" label="Nama Lengkap" placeholder="misal: Budi Santoso" />
        <BaseInput v-model="form.username" label="Username" placeholder="budi123" />
        <BaseInput v-model="form.email" label="Email" placeholder="budi@dcelup.com" />
        <BaseInput v-model="form.password" type="password" label="Password" />
        <label class="block">
          <span class="mb-1 block text-xs font-extrabold text-dcelup-text uppercase tracking-wider">Role Hak Akses</span>
          <select v-model="form.role" class="h-11 w-full rounded-xl border border-dcelup-border/70 bg-dcelup-creamSoft/40 px-3.5 text-sm font-bold text-dcelup-text outline-none focus:border-dcelup-red focus:bg-white transition-all">
            <option value="admin">Admin System</option>
            <option value="kasir">Kasir POS</option>
          </select>
        </label>
        <BaseButton class="h-11 w-full" @click="createUser">Simpan</BaseButton>
      </div>
    </section>

    <!-- LIST USERS TABLE -->
    <section class="mt-5 rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
      <h2 class="font-black text-base text-dcelup-text mb-4">Daftar Akun Pengguna</h2>
      
      <div class="overflow-x-auto rounded-xl border border-dcelup-border/60">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-dcelup-cream/70 border-b border-dcelup-border/80 text-dcelup-redDark text-xs font-black uppercase tracking-wider">
              <th class="py-3.5 px-4 text-left">Pengguna</th>
              <th class="py-3.5 px-4 text-left">Username</th>
              <th class="py-3.5 px-4 text-left">Email</th>
              <th class="py-3.5 px-4 text-center">Role</th>
              <th v-if="authStore.isAdmin" class="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dcelup-border/40">
            <tr v-for="u in users" :key="u.id" class="hover:bg-dcelup-creamSoft/60 transition-colors">
              <td class="py-3.5 px-4 align-middle whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-dcelup-red/10 font-black text-dcelup-red text-sm uppercase">
                    {{ u.name.charAt(0) }}
                  </div>
                  <span class="font-extrabold text-dcelup-text text-sm">{{ u.name }}</span>
                </div>
              </td>
              <td class="py-3.5 px-4 align-middle whitespace-nowrap text-xs font-bold text-dcelup-textSoft">
                @{{ u.username }}
              </td>
              <td class="py-3.5 px-4 align-middle whitespace-nowrap text-xs font-semibold text-dcelup-textSoft">
                {{ u.email }}
              </td>
              <td class="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                  :class="u.role === 'admin' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-300'">
                  <Shield class="h-3 w-3 mr-1" />
                  {{ u.role }}
                </span>
              </td>
              <td v-if="authStore.isAdmin" class="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                <div class="inline-flex items-center justify-end gap-2">
                  <BaseButton variant="secondary" class="!px-3 !py-1.5 text-xs" @click="openEdit(u)">
                    <Edit2 class="h-3.5 w-3.5 mr-1" />
                    Edit
                  </BaseButton>
                  <BaseButton variant="danger" class="!px-3 !py-1.5 text-xs" @click="deactivate(u.id)">
                    <UserX class="h-3.5 w-3.5 mr-1" />
                    Nonaktifkan
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- EDIT MODAL -->
    <div v-if="editTarget" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" @click.self="closeEdit">
      <section class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-dcelup-border/80">
        <div class="mb-5 flex items-center gap-3 border-b border-dcelup-border/50 pb-4">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-dcelup-red/10 text-dcelup-red">
            <KeyRound class="h-5 w-5" />
          </span>
          <div>
            <h2 class="text-lg font-black text-dcelup-text">Edit Akun Pengguna</h2>
            <p class="text-xs font-semibold text-dcelup-textSoft">Kosongkan password jika tidak ingin diubah.</p>
          </div>
        </div>

        <div class="space-y-3">
          <BaseInput v-model="editForm.name" label="Nama Lengkap" />
          <BaseInput v-model="editForm.username" label="Username" />
          <BaseInput v-model="editForm.email" label="Email" />
          <BaseInput v-model="editForm.password" type="password" label="Password Baru (Opsional)" />
        </div>

        <div class="mt-6 flex justify-end gap-2.5 pt-2">
          <BaseButton variant="secondary" class="h-11" @click="closeEdit">Batal</BaseButton>
          <BaseButton class="h-11" :loading="editLoading" @click="updateUser">Simpan Perubahan</BaseButton>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>
