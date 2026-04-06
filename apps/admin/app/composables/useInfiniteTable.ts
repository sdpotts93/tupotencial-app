import type { Ref, WatchSource } from 'vue'

const PAGE_SIZE = 20

export async function useInfiniteTable<T>(
  key: string,
  fetchFn: (range: { from: number; to: number }) => Promise<T[]>,
  watchSources: WatchSource[] = [],
) {
  const rows = ref<T[]>([]) as Ref<T[]>
  const hasMore = ref(true)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<Error | null>(null)
  let currentPage = 0

  async function reset() {
    loading.value = true
    error.value = null
    currentPage = 0
    try {
      const data = await fetchFn({ from: 0, to: PAGE_SIZE - 1 })
      rows.value = data
      hasMore.value = data.length >= PAGE_SIZE
    } catch (e: any) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    currentPage++
    const from = currentPage * PAGE_SIZE
    const data = await fetchFn({ from, to: from + PAGE_SIZE - 1 })
    rows.value = [...rows.value, ...data]
    hasMore.value = data.length >= PAGE_SIZE
    loadingMore.value = false
  }

  // Initial load via useAsyncData (lazy for instant navigation)
  const { data: initial, status: asyncStatus, error: asyncError } = useAsyncData(key, () => fetchFn({ from: 0, to: PAGE_SIZE - 1 }), { lazy: true })
  const initialLoading = computed(() => asyncStatus.value === 'pending')
  watch(initial, (val) => {
    if (val) {
      rows.value = val
      hasMore.value = val.length >= PAGE_SIZE
    }
  }, { immediate: true })

  // Watch filter changes → reset to first page
  if (watchSources.length) {
    watch(watchSources, () => reset())
  }

  // status tracks only the initial load — not subsequent reloads from filters/search
  // Use this for skeleton/error states. Use `loading` for the DataTable progress bar.
  const combinedStatus = computed(() => {
    if (asyncStatus.value === 'pending') return 'pending' as const
    if (asyncError.value || (error.value && !rows.value.length)) return 'error' as const
    return 'success' as const
  })

  return { rows, hasMore, loading: computed(() => loading.value || initialLoading.value), loadingMore, loadMore, refresh: reset, status: combinedStatus }
}
