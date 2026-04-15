/**
 * Tracks whether a hero/cover element has scrolled out of view. Used by
 * detail pages (retos, beneficios, complementos, eventos, contenido) to toggle
 * their floating back-button nav between a transparent "on hero" state and a
 * translucent-blurred "pinned" state once the hero is no longer visible.
 *
 * Usage:
 *   const heroEl = ref<HTMLElement | null>(null)
 *   const scrolled = useHeroScrolled(heroEl)
 *   <div ref="heroEl" class="detail__media">...</div>
 *   <div :class="['detail__nav', { 'detail__nav--scrolled': scrolled }]">...</div>
 */
export function useHeroScrolled(
  target: Ref<HTMLElement | null>,
  options: { rootMargin?: string } = {},
) {
  const scrolled = ref(false)
  let observer: IntersectionObserver | null = null

  const attach = (el: HTMLElement) => {
    observer?.disconnect()
    observer = new IntersectionObserver(
      ([entry]) => {
        // Treat the hero as "out of view" once less than ~20% is visible.
        // That triggers the pinned state slightly before the hero fully leaves.
        scrolled.value = !entry || entry.intersectionRatio < 0.2
      },
      { threshold: [0, 0.2, 1], rootMargin: options.rootMargin ?? '0px' },
    )
    observer.observe(el)
  }

  onMounted(() => {
    if (target.value) attach(target.value)
  })

  watch(target, (el) => {
    if (el) attach(el)
    else {
      observer?.disconnect()
      scrolled.value = false
    }
  })

  onBeforeUnmount(() => observer?.disconnect())

  return scrolled
}
