<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  error: { type: [String, Array], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  min: { type: [String, Number], default: null },
  step: { type: [String, Number], default: null }
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-semibold text-dcelup-text">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :min="min"
      :step="step"
      class="min-h-11 w-full rounded-xl border border-dcelup-border bg-white px-3 py-2 text-dcelup-text outline-none transition focus:border-dcelup-red focus:ring-2 focus:ring-dcelup-red/20"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <span v-if="Array.isArray(error) ? error.length : error" class="mt-1 block text-sm text-red-600">
      {{ Array.isArray(error) ? error[0] : error }}
    </span>
  </label>
</template>
