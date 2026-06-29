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

  // BUG-15: Bersihkan timer saat komponen unmount agar tidak terjadi
  // state update pada komponen yang sudah tidak ada (memory leak)
  onUnmounted(() => clearTimeout(timeoutId))

  return debounced
}
