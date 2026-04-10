<template>
  <div class="animated-blob-stage" aria-hidden="true">
    <svg
      class="animated-blob-stage__svg"
      viewBox="0 0 2040 3357"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <clipPath :id="clipId" clipPathUnits="userSpaceOnUse">
          <path
            ref="pathRef"
            fill-rule="evenodd"
            clip-rule="evenodd"
            :d="initialD"
            :transform="blobTransform"
          />
        </clipPath>
      </defs>

      <image href="/complete-layout.jpg" x="0" y="0" width="2040" height="3357" preserveAspectRatio="none" :opacity="baseOpacity" />
      <image
        href="/complete-layout.jpg"
        x="0"
        y="0"
        width="2040"
        height="3357"
        preserveAspectRatio="none"
        :opacity="measured ? 1 : 0"
        :clip-path="`url(#${clipId})`"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import {
  BLOB_RAW_D,
  DEFAULT_MASK_CENTER_X_RATIO,
  DEFAULT_MASK_CENTER_Y_OFFSET_RATIO,
  DEFAULT_MASK_VIEWPORT_MAX_RATIO,
  MASK_SOURCE_HEIGHT,
  MASK_SOURCE_WIDTH,
  computeBlobStageMetrics,
} from '~/composables/useBlobStageMetrics'

const props = withDefaults(defineProps<{
  baseOpacity?: number
  maskCenterXRatio?: number
  maskCenterYOffsetRatio?: number
  maskViewportMaxRatio?: number
}>(), {
  baseOpacity: 0.075,
  maskCenterXRatio: DEFAULT_MASK_CENTER_X_RATIO,
  maskCenterYOffsetRatio: DEFAULT_MASK_CENTER_Y_OFFSET_RATIO,
  maskViewportMaxRatio: DEFAULT_MASK_VIEWPORT_MAX_RATIO,
})

const SX = 1 / MASK_SOURCE_WIDTH
const SY = 1 / MASK_SOURCE_HEIGHT
const SHRINK = 0.85

function scalePathD(d: string, sx: number, sy: number) {
  const re = /([MmCcSsQqTtAaLlHhVvZz])|(-?\d*\.?\d+(?:e[+-]?\d+)?)/gi
  let result = ''
  let cmd = ''
  let numIdx = 0

  let match: RegExpExecArray | null
  while ((match = re.exec(d)) !== null) {
    if (match[1]) {
      cmd = match[1].toUpperCase()
      numIdx = 0
      result += match[1]
    } else if (match[2] !== undefined) {
      const value = parseFloat(match[2])
      let scaled: number

      if (cmd === 'V') {
        scaled = value * sy
        scaled = 0.5 + (scaled - 0.5) * SHRINK
      } else if (cmd === 'H') {
        scaled = value * sx
        scaled = 0.5 + (scaled - 0.5) * SHRINK
      } else if (numIdx % 2 === 0) {
        scaled = value * sx
        scaled = 0.5 + (scaled - 0.5) * SHRINK
      } else {
        scaled = value * sy
        scaled = 0.5 + (scaled - 0.5) * SHRINK
      }

      result += `${scaled.toFixed(6)} `
      numIdx++
    }
  }

  return result.trim()
}

const initialD = scalePathD(BLOB_RAW_D, SX, SY)
const clipId = `animated-blob-clip-${useId()}`
const pathRef = ref<SVGPathElement | null>(null)
const measured = ref(false)
const containerWidth = ref(import.meta.client ? Math.round(window.visualViewport?.width ?? window.innerWidth) : 390)
const containerHeight = ref(import.meta.client ? Math.round(window.visualViewport?.height ?? window.innerHeight) : 844)
const VIEWPORT_HEIGHT_WOBBLE_PX = 120
let viewportMeasurementRaf = 0
let viewportMeasurementTimeout: ReturnType<typeof setTimeout> | null = null

function updateContainerSize() {
  const nextWidth = Math.round(window.visualViewport?.width ?? window.innerWidth)
  const nextHeight = Math.round(window.visualViewport?.height ?? window.innerHeight)
  const widthChanged = nextWidth !== containerWidth.value
  const heightDelta = Math.abs(nextHeight - containerHeight.value)

  containerWidth.value = nextWidth
  if (widthChanged || heightDelta > VIEWPORT_HEIGHT_WOBBLE_PX) {
    containerHeight.value = nextHeight
  }
}

function scheduleContainerMeasurement() {
  cancelAnimationFrame(viewportMeasurementRaf)
  viewportMeasurementRaf = requestAnimationFrame(() => {
    viewportMeasurementRaf = requestAnimationFrame(() => {
      updateContainerSize()
      measured.value = true
    })
  })
}

onMounted(() => {
  scheduleContainerMeasurement()
  viewportMeasurementTimeout = setTimeout(() => {
    updateContainerSize()
    measured.value = true
  }, 150)
  window.addEventListener('resize', scheduleContainerMeasurement, { passive: true })
  window.visualViewport?.addEventListener('resize', scheduleContainerMeasurement, { passive: true })
  window.visualViewport?.addEventListener('scroll', scheduleContainerMeasurement, { passive: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(viewportMeasurementRaf)
  if (viewportMeasurementTimeout) clearTimeout(viewportMeasurementTimeout)
  window.removeEventListener('resize', scheduleContainerMeasurement)
  window.visualViewport?.removeEventListener('resize', scheduleContainerMeasurement)
  window.visualViewport?.removeEventListener('scroll', scheduleContainerMeasurement)
})

const blobTransform = computed(() => {
  return computeBlobStageMetrics(containerWidth.value, containerHeight.value, {
    maskCenterXRatio: props.maskCenterXRatio,
    maskCenterYOffsetRatio: props.maskCenterYOffsetRatio,
    maskViewportMaxRatio: props.maskViewportMaxRatio,
  }).blobTransform
})

useOrgBlob(pathRef)
</script>

<style scoped>
.animated-blob-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.animated-blob-stage__svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
