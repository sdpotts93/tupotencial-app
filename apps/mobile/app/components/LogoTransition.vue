<template>
  <div v-if="phase !== 'idle'" class="logo-transition">
    <!--
      Cover: logo-fire.png ring scales up + shifts upward.
      The thick bottom band sweeps across the viewport to cover it.
    -->
    <svg
      v-show="phase === 'cover' || phase === 'hold'"
      class="logo-transition__svg"
      aria-hidden="true"
    >
      <image
        ref="coverImageRef"
        href="/logo-icon/logo-fire.png"
        x="50%"
        y="50%"
        width="0"
        height="0"
      />
    </svg>

    <!--
      Reveal: logo-icon-black.png ring continues growing + shifting upward
      as an inverted mask. Black rect = page visible. White ring (via filter) = orange visible.
      As the ring moves further up, the orange band sweeps away, revealing the page from below.
    -->
    <svg
      v-show="phase === 'reveal'"
      class="logo-transition__svg"
      aria-hidden="true"
    >
      <defs>
        <filter id="to-white">
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/>
        </filter>
        <mask id="logo-reveal-mask" maskUnits="userSpaceOnUse"
              x="0" y="0" width="100%" height="100%">
          <rect width="100%" height="100%" fill="black" />
          <image
            ref="revealMaskRef"
            href="/logo-icon/logo-icon-black.png"
            filter="url(#to-white)"
            x="50%"
            y="50%"
            width="0"
            height="0"
          />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="#c8825a"
        mask="url(#logo-reveal-mask)"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
const { phase, isTransitioning } = usePageTransition()
const coverImageRef = ref<SVGImageElement | null>(null)
const revealMaskRef = ref<SVGImageElement | null>(null)

watch(phase, (val) => {
  if (val === 'cover') {
    nextTick(() => animateCover())
  } else if (val === 'reveal') {
    nextTick(() => animateReveal())
  }
})

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

// Shared sizing constants (computed per-animation based on viewport)
function getLayoutParams() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const maxDim = Math.max(vw, vh)
  return {
    vw,
    vh,
    // Cover: small → large with upward offset so bottom band covers viewport
    coverStartSize: 120,
    coverEndSize: maxDim * 8,
    coverEndOffsetY: -maxDim * 8 * 0.42,
    // Reveal: continues from cover end → even larger/further up so band clears viewport
    revealEndSize: maxDim * 16,
    revealEndOffsetY: -maxDim * 16 * 0.55,
  }
}

function setSvgImage(el: SVGImageElement, vw: number, vh: number, size: number, offsetY: number) {
  const x = (vw / 2) - (size / 2)
  const y = (vh / 2) - (size / 2) + offsetY
  el.setAttribute('x', String(x))
  el.setAttribute('y', String(y))
  el.setAttribute('width', String(size))
  el.setAttribute('height', String(size))
}

function animateCover() {
  const img = coverImageRef.value
  if (!img) return

  const { vw, vh, coverStartSize, coverEndSize, coverEndOffsetY } = getLayoutParams()
  const duration = 2000
  let startTime: number | null = null

  function step(ts: number) {
    if (!startTime) startTime = ts
    const progress = Math.min((ts - startTime) / duration, 1)
    const eased = easeOutCubic(progress)

    const size = coverStartSize + eased * (coverEndSize - coverStartSize)
    const offsetY = eased * coverEndOffsetY

    setSvgImage(img!, vw, vh, size, offsetY)

    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      phase.value = 'hold'
      setTimeout(() => {
        phase.value = 'reveal'
      }, 800)
    }
  }

  requestAnimationFrame(step)
}

function animateReveal() {
  const maskImg = revealMaskRef.value
  if (!maskImg) return

  const { vw, vh, coverEndSize, coverEndOffsetY, revealEndSize, revealEndOffsetY } = getLayoutParams()
  const duration = 2000
  let startTime: number | null = null

  function step(ts: number) {
    if (!startTime) startTime = ts
    const progress = Math.min((ts - startTime) / duration, 1)
    const eased = easeOutCubic(progress)

    // Continue from cover end position → reveal end position
    const size = coverEndSize + eased * (revealEndSize - coverEndSize)
    const offsetY = coverEndOffsetY + eased * (revealEndOffsetY - coverEndOffsetY)

    setSvgImage(maskImg!, vw, vh, size, offsetY)

    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      phase.value = 'idle'
      isTransitioning.value = false
    }
  }

  requestAnimationFrame(step)
}
</script>

<style scoped>
.logo-transition {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: all;
}

.logo-transition__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .logo-transition {
    display: none !important;
  }
}
</style>
