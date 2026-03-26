const phase = ref<'idle' | 'cover' | 'hold' | 'reveal'>('idle')
const isTransitioning = ref(false)

export function usePageTransition() {
  return { phase, isTransitioning }
}
