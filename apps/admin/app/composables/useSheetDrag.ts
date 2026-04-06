import { ref, type Ref } from 'vue'

const CLOSE_THRESHOLD = 120
const VELOCITY_THRESHOLD = 0.5

export function useSheetDrag(sheetEl: Ref<HTMLElement | null>, onClose: () => void) {
  const translateY = ref(0)
  const isDragging = ref(false)

  let startY = 0
  let startTime = 0
  let currentY = 0

  function onTouchStart(e: TouchEvent) {
    // Only allow drag when sheet is scrolled to top
    const el = sheetEl.value
    if (el && el.scrollTop > 0) return

    isDragging.value = true
    startY = e.touches[0].clientY
    startTime = Date.now()
    currentY = 0
    translateY.value = 0
  }

  function onTouchMove(e: TouchEvent) {
    if (!isDragging.value) return

    const deltaY = e.touches[0].clientY - startY
    currentY = deltaY

    if (deltaY > 0) {
      // Apply resistance as user drags further
      translateY.value = deltaY * 0.6
      // Prevent scrolling while dragging down
      e.preventDefault()
    } else {
      // User is scrolling up, stop drag tracking
      isDragging.value = false
      translateY.value = 0
    }
  }

  function onTouchEnd() {
    if (!isDragging.value) return
    isDragging.value = false

    const elapsed = Date.now() - startTime
    const velocity = currentY / elapsed // px/ms

    if (translateY.value > CLOSE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      // Animate out then close
      translateY.value = window.innerHeight
      setTimeout(() => {
        onClose()
        translateY.value = 0
      }, 200)
    } else {
      translateY.value = 0
    }
  }

  return {
    translateY,
    isDragging,
    dragListeners: {
      touchstart: onTouchStart,
      touchmove: onTouchMove,
      touchend: onTouchEnd,
    },
  }
}
