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
  let currentPage = 0

  async function reset() {
    loading.value = true
    currentPage = 0
    const data = await fetchFn({ from: 0, to: PAGE_SIZE - 1 })
    rows.value = data
    hasMore.value = data.length >= PAGE_SIZE
    loading.value = false
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

  // Initial load via useAsyncData for SSR hydration
  const { data: initial } = await useAsyncData(key, () => fetchFn({ from: 0, to: PAGE_SIZE - 1 }))
  rows.value = initial.value ?? []
  hasMore.value = rows.value.length >= PAGE_SIZE

  // Watch filter changes → reset to first page
  if (watchSources.length) {
    watch(watchSources, () => reset())
  }

  return { rows, hasMore, loading, loadingMore, loadMore, refresh: reset }
}
