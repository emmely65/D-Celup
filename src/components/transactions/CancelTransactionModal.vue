<script setup>
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({ open: { type: Boolean, default: false }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'submit'])
const reason = ref('')

// BUG-03: Reset reason setiap modal dibuka agar alasan lama tidak terbawa ke pembatalan berikutnya
// BUG-02: Watcher self-assignment sebelumnya (reason.value = val) sudah dihapus — tidak berguna
watch(() => props.open, (isOpen) => {
  if (isOpen) reason.value = ''
})

function submit() {
  if (!reason.value.trim()) return
  emit('submit', { cancel_reason: reason.value.trim() })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4" @click.self="$emit('close')">
    <section class="w-full max-w-md rounded-2xl bg-dcelup-creamSoft p-5 shadow-2xl">
      <h2 class="text-xl font-black text-dcelup-text">Batalkan Transaksi</h2>
      <p class="mt-1 text-sm text-dcelup-textSoft">Alasan wajib diisi. Semua pembatalan akan tercatat di audit log.</p>
      <textarea v-model="reason" rows="4" class="mt-4 w-full rounded-xl border border-dcelup-border p-3 outline-none focus:border-dcelup-red" placeholder="Contoh: salah input jumlah item"></textarea>
      <div class="mt-4 flex justify-end gap-2">
        <BaseButton variant="secondary" @click="$emit('close')">Tutup</BaseButton>
        <BaseButton variant="danger" :loading="loading" :disabled="!reason.trim()" @click="submit">Batalkan</BaseButton>
      </div>
    </section>
  </div>
</template>
