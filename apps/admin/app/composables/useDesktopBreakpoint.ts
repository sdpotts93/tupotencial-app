export function useDesktopBreakpoint(minWidth = 1024) {
  const isDesktop = ref(import.meta.client ? window.innerWidth >= minWidth : false)
  let mediaQuery: MediaQueryList | null = null

  const update = () => {
    isDesktop.value = mediaQuery?.matches ?? (window.innerWidth >= minWidth)
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`)
    update()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update)
    } else {
      mediaQuery.addListener(update)
    }
  })

  onBeforeUnmount(() => {
    if (!mediaQuery) return

    if (typeof mediaQuery.removeEventListener === 'function') {
      mediaQuery.removeEventListener('change', update)
    } else {
      mediaQuery.removeListener(update)
    }
  })

  return { isDesktop }
}
