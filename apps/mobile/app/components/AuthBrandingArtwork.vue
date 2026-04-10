<template>
  <div ref="brandingRef" class="auth-branding-artwork" :style="brandingMetricsReady ? brandingLayoutVars : undefined">
    <AnimatedBlobStage
      v-if="isDesktop"
      class="auth-branding-artwork__stage"
      image-src="/complete-layout-desktop.webp"
      stage-preserve-aspect-ratio="xMidYMin slice"
      stage-align-y="top"
      :mask-center-y-offset-ratio="brandingMaskCenterYOffsetRatio"
      :mask-viewport-max-ratio="BRANDING_MASK_VIEWPORT_MAX_RATIO"
    />
    <div
      class="auth-branding-artwork__content"
      :class="{ 'auth-branding-artwork__content--ready': brandingMetricsReady }"
    >
      <div class="auth-branding-artwork__logo-slot" aria-hidden="true" />
      <p ref="taglineRef" class="auth-branding-artwork__tagline">Un espacio seguro para tu crecimiento integral.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  MASK_SOURCE_HEIGHT,
  MASK_SOURCE_WIDTH,
  STAGE_ASPECT,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  computeBlobStageMetrics,
} from '~/composables/useBlobStageMetrics'

const { isDesktop } = useDesktopBreakpoint()
const BRANDING_MASK_VIEWPORT_MAX_RATIO = 0.4
const SLOT_TAGLINE_GAP_PX = 8
const FALLBACK_TAGLINE_HEIGHT_PX = 120
const brandingRef = ref<HTMLElement | null>(null)
const taglineRef = ref<HTMLElement | null>(null)
const brandingWidth = ref(0)
const brandingHeight = ref(0)
const brandingMetricsReady = ref(false)
const taglineHeight = ref(FALLBACK_TAGLINE_HEIGHT_PX)
let brandingObserver: ResizeObserver | null = null
let taglineObserver: ResizeObserver | null = null

function updateBrandingSize() {
  const el = brandingRef.value
  if (!el) return

  brandingWidth.value = el.clientWidth
  brandingHeight.value = el.clientHeight
  brandingMetricsReady.value = brandingWidth.value > 0 && brandingHeight.value > 0
}

function updateTaglineHeight() {
  const el = taglineRef.value
  if (!el) return
  taglineHeight.value = el.offsetHeight || FALLBACK_TAGLINE_HEIGHT_PX
}

onMounted(() => {
  updateBrandingSize()
  brandingObserver = new ResizeObserver(updateBrandingSize)
  if (brandingRef.value) brandingObserver.observe(brandingRef.value)

  updateTaglineHeight()
  taglineObserver = new ResizeObserver(updateTaglineHeight)
  if (taglineRef.value) taglineObserver.observe(taglineRef.value)
})

onBeforeUnmount(() => {
  brandingObserver?.disconnect()
  brandingObserver = null
  taglineObserver?.disconnect()
  taglineObserver = null
})

const brandingMaskCenterYOffsetRatio = computed(() => {
  if (!brandingWidth.value || !brandingHeight.value) return -0.08

  const stageRenderWidth = Math.max(brandingWidth.value, brandingHeight.value * STAGE_ASPECT)
  const stageScale = stageRenderWidth / STAGE_WIDTH
  const maskWidthPx = Math.min(brandingWidth.value, brandingHeight.value) * BRANDING_MASK_VIEWPORT_MAX_RATIO
  const maskHeightPx = maskWidthPx * (MASK_SOURCE_HEIGHT / MASK_SOURCE_WIDTH)
  const groupHeight = maskHeightPx + SLOT_TAGLINE_GAP_PX + taglineHeight.value
  const maskTopPx = (brandingHeight.value - groupHeight) / 2
  const maskHeightArt = maskHeightPx / stageScale
  const maskTopArt = maskTopPx / stageScale
  const maskCenterYArt = maskTopArt + (maskHeightArt / 2)

  return (maskCenterYArt - (STAGE_HEIGHT / 2)) / STAGE_HEIGHT
})

const brandingLayoutVars = computed(() => {
  const metrics = computeBlobStageMetrics(brandingWidth.value, brandingHeight.value, {
    maskCenterYOffsetRatio: brandingMaskCenterYOffsetRatio.value,
    maskViewportMaxRatio: BRANDING_MASK_VIEWPORT_MAX_RATIO,
    stageAlignY: 'top',
  })

  return {
    '--auth-branding-blob-left': `${metrics.maskCenterXPx}px`,
    '--auth-branding-blob-top': `${metrics.maskTopPx}px`,
    '--auth-branding-blob-width': `${metrics.maskWidthPx}px`,
    '--auth-branding-blob-height': `${metrics.maskHeightPx}px`,
    '--auth-branding-tagline-top': `${metrics.maskBottomPx + SLOT_TAGLINE_GAP_PX}px`,
  }
})
</script>

<style scoped>
.auth-branding-artwork {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-branding-artwork__stage {
  z-index: 0;
}

.auth-branding-artwork__content {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.auth-branding-artwork__content--ready {
  opacity: 1;
}

.auth-branding-artwork__tagline {
  position: absolute;
  top: var(--auth-branding-tagline-top);
  left: 50%;
  width: max-content;
  max-width: 20ch;
  transform: translateX(-50%);
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  text-align: center;
  line-height: var(--leading-snug);
}

.auth-branding-artwork__logo-slot {
  position: absolute;
  top: var(--auth-branding-blob-top);
  left: var(--auth-branding-blob-left);
  width: var(--auth-branding-blob-width);
  height: var(--auth-branding-blob-height);
  transform: translateX(-50%);
}
</style>
