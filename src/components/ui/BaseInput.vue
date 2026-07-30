<script setup>
import { ref, computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  error: { type: [String, Array], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  min: { type: [String, Number], default: null },
  step: { type: [String, Number], default: null },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-dcelup-textSoft/90">{{ label }}</span>
    <div class="relative">
      <input
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :min="min"
        :step="step"
        :disabled="disabled"
        :class="[
          'min-h-[44px] w-full rounded-xl border border-dcelup-border/80 bg-white px-3.5 py-2 text-sm font-semibold text-dcelup-text placeholder:text-dcelup-textSoft/40 outline-none transition-all focus:border-dcelup-red focus:ring-4 focus:ring-dcelup-red/10 shadow-2xs disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
          type === 'password' ? 'pr-10' : ''
        ]"
        @input="emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="type === 'password'"
        type="button"
        tabindex="-1"
        :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
        :title="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
        @click.prevent="showPassword = !showPassword"
      >
        <EyeOff v-if="showPassword" class="h-4 w-4 text-dcelup-textSoft/60" />
        <Eye v-else class="h-4 w-4 text-dcelup-textSoft/60" />
      </button>
    </div>
    <span v-if="Array.isArray(error) ? error.length : error" class="mt-1 block text-xs font-bold text-rose-600">
      {{ Array.isArray(error) ? error[0] : error }}
    </span>
  </label>
</template>

