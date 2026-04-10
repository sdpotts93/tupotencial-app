<template>
  <div class="auth-mobile-hero" :style="heroMetricsReady ? heroLayoutVars : undefined">
    <AuthHeroArtwork @entrance-almost-complete="heroContentReady = true" />

    <div class="auth-mobile-hero__content">
      <img
        src="/logo-word/logo-word-black.png"
        alt="Tu Potencial"
        class="auth-mobile-hero__wordmark"
        :class="{ 'auth-mobile-hero__wordmark--ready': heroMetricsReady }"
      />
      <div
        class="auth-mobile-hero__logo-slot"
        :class="{ 'auth-mobile-hero__logo-slot--ready': heroContentReady }"
        aria-hidden="true"
      />
      <p
        v-if="showTagline && tagline"
        class="auth-mobile-hero__tagline"
        :class="{ 'auth-mobile-hero__tagline--ready': heroContentReady }"
      >
        {{ tagline }}
      </p>
    </div>

    <div
      v-if="hasCtaSlot"
      class="auth-mobile-hero__cta-area"
      :class="{ 'auth-mobile-hero__cta-area--ready': heroContentReady }"
    >
      <slot name="cta" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DEFAULT_MASK_CENTER_X_RATIO,
  DEFAULT_MASK_CENTER_Y_OFFSET_RATIO,
  DEFAULT_MASK_VIEWPORT_MAX_RATIO,
  computeBlobStageMetrics,
} from '~/composables/useBlobStageMetrics'

const props = withDefaults(defineProps<{
  tagline?: string
  showTagline?: boolean
}>(), {
  tagline: 'Panel de administración',
  showTagline: true,
})

const slots = useSlots()
const hasCtaSlot = computed(() => Boolean(slots.cta))
const heroWidth = ref(import.meta.client ? Math.round(window.visualViewport?.width ?? window.innerWidth) : 390)
const heroHeight = ref(import.meta.client ? Math.round(window.visualViewport?.height ?? window.innerHeight) : 844)
const VIEWPORT_HEIGHT_WOBBLE_PX = 120
let heroMeasurementRaf = 0
let heroMeasurementTimeout: ReturnType<typeof setTimeout> | null = null
const heroMetricsReady = ref(false)
const heroContentReady = ref(false)

function updateHeroSize() {
  const nextWidth = Math.round(window.visualViewport?.width ?? window.innerWidth)
  const nextHeight = Math.round(window.visualViewport?.height ?? window.innerHeight)
  const widthChanged = nextWidth !== heroWidth.value
  const heightDelta = Math.abs(nextHeight - heroHeight.value)

  heroWidth.value = nextWidth
  if (widthChanged || heightDelta > VIEWPORT_HEIGHT_WOBBLE_PX) {
    heroHeight.value = nextHeight
  }
}

function scheduleHeroMeasurement() {
  cancelAnimationFrame(heroMeasurementRaf)
  heroMeasurementRaf = requestAnimationFrame(() => {
    heroMeasurementRaf = requestAnimationFrame(() => {
      updateHeroSize()
      heroMetricsReady.value = true
    })
  })
}

onMounted(() => {
  scheduleHeroMeasurement()
  heroMeasurementTimeout = setTimeout(() => {
    updateHeroSize()
    heroMetricsReady.value = true
  }, 150)
  window.addEventListener('resize', scheduleHeroMeasurement, { passive: true })
  window.visualViewport?.addEventListener('resize', scheduleHeroMeasurement, { passive: true })
  window.visualViewport?.addEventListener('scroll', scheduleHeroMeasurement, { passive: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(heroMeasurementRaf)
  if (heroMeasurementTimeout) clearTimeout(heroMeasurementTimeout)
  window.removeEventListener('resize', scheduleHeroMeasurement)
  window.visualViewport?.removeEventListener('resize', scheduleHeroMeasurement)
  window.visualViewport?.removeEventListener('scroll', scheduleHeroMeasurement)
})

const heroLayoutVars = computed(() => {
  const metrics = computeBlobStageMetrics(heroWidth.value, heroHeight.value, {
    maskCenterXRatio: DEFAULT_MASK_CENTER_X_RATIO,
    maskCenterYOffsetRatio: DEFAULT_MASK_CENTER_Y_OFFSET_RATIO,
    maskViewportMaxRatio: DEFAULT_MASK_VIEWPORT_MAX_RATIO,
  })

  const wordmarkHeight = 18
  const blobGap = 32
  const wordmarkGap = 40

  return {
    '--auth-mobile-hero-blob-left': `${metrics.maskCenterXPx}px`,
    '--auth-mobile-hero-blob-top': `${metrics.maskTopPx}px`,
    '--auth-mobile-hero-blob-width': `${metrics.maskWidthPx}px`,
    '--auth-mobile-hero-blob-height': `${metrics.maskHeightPx}px`,
    '--auth-mobile-hero-wordmark-top': `${metrics.maskTopPx - wordmarkHeight - wordmarkGap}px`,
    '--auth-mobile-hero-tagline-top': `${metrics.maskBottomPx + blobGap}px`,
  }
})
</script>

<style scoped>
.auth-mobile-hero {
  flex: 1;
  position: relative;
  min-height: 100svh;
}

.auth-mobile-hero__content {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.auth-mobile-hero__wordmark {
  position: absolute;
  top: var(--auth-mobile-hero-wordmark-top);
  left: var(--auth-mobile-hero-blob-left);
  transform: translateX(-50%);
  height: 18px;
  width: auto;
  display: block;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.auth-mobile-hero__wordmark--ready {
  opacity: 1;
}

.auth-mobile-hero__logo-slot {
  position: absolute;
  top: var(--auth-mobile-hero-blob-top);
  left: var(--auth-mobile-hero-blob-left);
  width: var(--auth-mobile-hero-blob-width);
  height: var(--auth-mobile-hero-blob-height);
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.auth-mobile-hero__logo-slot--ready {
  opacity: 1;
}

.auth-mobile-hero__tagline {
  position: absolute;
  top: var(--auth-mobile-hero-tagline-top);
  left: 50%;
  width: max-content;
  max-width: calc(100% - (var(--space-6) * 2));
  transform: translateX(-50%);
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  text-align: center;
  line-height: var(--leading-snug);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.auth-mobile-hero__tagline--ready {
  opacity: 1;
}

.auth-mobile-hero__cta-area {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  padding: 0 var(--space-6) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.auth-mobile-hero__cta-area--ready {
  opacity: 1;
}

@media (min-width: 1024px) {
  .auth-mobile-hero {
    display: none;
  }
}
</style>
