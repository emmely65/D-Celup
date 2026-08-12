import { ref, watch, onUnmounted } from 'vue'

export function useDebounce(source, delay = 300) {
  const debounced = ref(source.value)
  let timeoutId = null

  watch(source, (value) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  // Bersihkan timer saat komponen unmount agar tidak terjadi memory leak
  onUnmounted(() => clearTimeout(timeoutId))

  return debounced
}
