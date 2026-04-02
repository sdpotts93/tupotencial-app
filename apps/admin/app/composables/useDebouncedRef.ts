import type { Ref } from 'vue'

export function useDebouncedRef<T>(initialValue: T, delay = 2000) {
  const input = ref(initialValue) as Ref<T>
  const debounced = ref(initialValue) as Ref<T>
  const pending = ref(false)
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(input, (val) => {
    pending.value = true
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      debounced.value = val
      pending.value = false
    }, delay)
  })

  return { input, debounced, pending }
}
