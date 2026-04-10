<template>
  <div ref="stageRef" class="animated-blob-stage" aria-hidden="true">
    <svg
      class="animated-blob-stage__svg"
      viewBox="0 0 2040 3357"
      :preserveAspectRatio="props.stagePreserveAspectRatio"
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

      <image
        :href="props.imageSrc"
        x="0"
        y="0"
        width="2040"
        height="3357"
        preserveAspectRatio="none"
        :opacity="stageReady ? baseOpacity : 0"
      />
      <image
        :href="props.imageSrc"
        x="0"
        y="0"
        width="2040"
        height="3357"
        preserveAspectRatio="none"
        :opacity="stageReady ? 1 - entranceProgress : 0"
      />
      <image
        :href="props.imageSrc"
        x="0"
        y="0"
        width="2040"
        height="3357"
        preserveAspectRatio="none"
        :opacity="stageReady ? entranceProgress : 0"
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
  STAGE_HEIGHT,
  STAGE_WIDTH,
  computeBlobStageMetrics,
} from '~/composables/useBlobStageMetrics'

const emit = defineEmits<{
  maskVisible: []
  entranceAlmostComplete: []
  entranceComplete: []
}>()

const props = withDefaults(defineProps<{
  baseOpacity?: number
  imageSrc?: string
  maskCenterXRatio?: number
  maskCenterYOffsetRatio?: number
  maskViewportMaxRatio?: number
  stagePreserveAspectRatio?: string
  stageAlignY?: 'center' | 'top' | 'bottom'
}>(), {
  baseOpacity: 0.075,
  imageSrc: '/complete-layout-mobile.webp',
  maskCenterXRatio: DEFAULT_MASK_CENTER_X_RATIO,
  maskCenterYOffsetRatio: DEFAULT_MASK_CENTER_Y_OFFSET_RATIO,
  maskViewportMaxRatio: DEFAULT_MASK_VIEWPORT_MAX_RATIO,
  stagePreserveAspectRatio: 'xMidYMid slice',
  stageAlignY: 'center',
})

const SX = 1 / MASK_SOURCE_WIDTH
const SY = 1 / MASK_SOURCE_HEIGHT
const SHRINK = 0.9

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
const stageRef = ref<HTMLElement | null>(null)
const measured = ref(false)
const imageReady = ref(false)
const entranceProgress = ref(0)
const containerWidth = ref(import.meta.client ? Math.round(window.visualViewport?.width ?? window.innerWidth) : 390)
const containerHeight = ref(import.meta.client ? Math.round(window.visualViewport?.height ?? window.innerHeight) : 844)
const ENTRANCE_DURATION_MS = 900
const ENTRANCE_START_WIDTH_ART = Math.max(STAGE_WIDTH, STAGE_HEIGHT * (MASK_SOURCE_WIDTH / MASK_SOURCE_HEIGHT)) * 2.2
const MASK_VISIBLE_PROGRESS = 0.18
const ENTRANCE_ALMOST_COMPLETE_PROGRESS = 0.72
let entranceRaf = 0
let hasEmittedMaskVisible = false
let hasEmittedEntranceAlmostComplete = false
let hasEmittedEntranceComplete = false
let stageObserver: ResizeObserver | null = null
const stageReady = computed(() => measured.value && imageReady.value)

function updateContainerSize() {
  const el = stageRef.value
  if (!el) return

  const nextWidth = Math.round(el.clientWidth)
  const nextHeight = Math.round(el.clientHeight)
  if (!nextWidth || !nextHeight) return

  containerWidth.value = nextWidth
  containerHeight.value = nextHeight
  measured.value = true
}

onMounted(() => {
  updateContainerSize()
  stageObserver = new ResizeObserver(updateContainerSize)
  if (stageRef.value) stageObserver.observe(stageRef.value)

  const image = new Image()
  image.src = props.imageSrc

  const markImageReady = () => {
    imageReady.value = true
  }

  if (image.complete) {
    if (typeof image.decode === 'function') {
      image.decode().then(markImageReady).catch(markImageReady)
    } else {
      markImageReady()
    }
  } else {
    image.addEventListener('load', markImageReady, { once: true })
    image.addEventListener('error', markImageReady, { once: true })
  }

})

onBeforeUnmount(() => {
  cancelAnimationFrame(entranceRaf)
  stageObserver?.disconnect()
  stageObserver = null
})

const blobMetrics = computed(() => {
  return computeBlobStageMetrics(containerWidth.value, containerHeight.value, {
    maskCenterXRatio: props.maskCenterXRatio,
    maskCenterYOffsetRatio: props.maskCenterYOffsetRatio,
    maskViewportMaxRatio: props.maskViewportMaxRatio,
    stageAlignY: props.stageAlignY,
  })
})

const blobTransform = computed(() => {
  const target = blobMetrics.value
  const easedProgress = 1 - ((1 - entranceProgress.value) ** 3)
  const startWidthArt = ENTRANCE_START_WIDTH_ART
  const startHeightArt = startWidthArt * (MASK_SOURCE_HEIGHT / MASK_SOURCE_WIDTH)
  const startCenterXArt = STAGE_WIDTH / 2
  const startCenterYArt = STAGE_HEIGHT / 2
  const widthArt = startWidthArt + ((target.maskWidthArt - startWidthArt) * easedProgress)
  const heightArt = startHeightArt + ((target.maskHeightArt - startHeightArt) * easedProgress)
  const centerXArt = startCenterXArt + ((target.maskCenterXArt - startCenterXArt) * easedProgress)
  const centerYArt = startCenterYArt + ((target.maskCenterYArt - startCenterYArt) * easedProgress)
  const leftArt = centerXArt - (widthArt / 2)
  const topArt = centerYArt - (heightArt / 2)

  return `translate(${leftArt} ${topArt}) scale(${widthArt} ${heightArt})`
})

useOrgBlob(pathRef)

watch(measured, (isMeasured) => {
  if (!isMeasured || !imageReady.value) return

  cancelAnimationFrame(entranceRaf)
  entranceProgress.value = 0
  hasEmittedMaskVisible = false
  hasEmittedEntranceAlmostComplete = false
  hasEmittedEntranceComplete = false

  const start = performance.now()
  const tick = (now: number) => {
    const linearProgress = Math.min((now - start) / ENTRANCE_DURATION_MS, 1)
    entranceProgress.value = linearProgress

    if (!hasEmittedMaskVisible && linearProgress >= MASK_VISIBLE_PROGRESS) {
      hasEmittedMaskVisible = true
      emit('maskVisible')
    }

    if (!hasEmittedEntranceAlmostComplete && linearProgress >= ENTRANCE_ALMOST_COMPLETE_PROGRESS) {
      hasEmittedEntranceAlmostComplete = true
      emit('entranceAlmostComplete')
    }

    if (!hasEmittedEntranceComplete && linearProgress >= 1) {
      hasEmittedEntranceComplete = true
      emit('entranceComplete')
    }

    if (linearProgress < 1) {
      entranceRaf = requestAnimationFrame(tick)
    }
  }

  entranceRaf = requestAnimationFrame(tick)
}, { once: true })

watch(imageReady, (isReady) => {
  if (!isReady || !measured.value) return

  cancelAnimationFrame(entranceRaf)
  entranceProgress.value = 0
  hasEmittedMaskVisible = false
  hasEmittedEntranceAlmostComplete = false
  hasEmittedEntranceComplete = false

  const start = performance.now()
  const tick = (now: number) => {
    const linearProgress = Math.min((now - start) / ENTRANCE_DURATION_MS, 1)
    entranceProgress.value = linearProgress

    if (!hasEmittedMaskVisible && linearProgress >= MASK_VISIBLE_PROGRESS) {
      hasEmittedMaskVisible = true
      emit('maskVisible')
    }

    if (!hasEmittedEntranceAlmostComplete && linearProgress >= ENTRANCE_ALMOST_COMPLETE_PROGRESS) {
      hasEmittedEntranceAlmostComplete = true
      emit('entranceAlmostComplete')
    }

    if (!hasEmittedEntranceComplete && linearProgress >= 1) {
      hasEmittedEntranceComplete = true
      emit('entranceComplete')
    }

    if (linearProgress < 1) {
      entranceRaf = requestAnimationFrame(tick)
    }
  }

  entranceRaf = requestAnimationFrame(tick)
}, { once: true })

useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: props.imageSrc,
      fetchpriority: 'high',
    },
  ],
})
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
