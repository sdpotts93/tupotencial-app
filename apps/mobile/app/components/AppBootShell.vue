<template>
  <div
    class="boot-shell"
    :class="{ 'boot-shell--hidden': !visible }"
    role="status"
    aria-live="polite"
    aria-label="Cargando Tu Potencial"
    :aria-hidden="visible ? 'false' : 'true'"
  >
    <div class="boot-shell__stage" aria-hidden="true">
      <svg class="boot-shell__svg" viewBox="0 0 2040 3357" preserveAspectRatio="xMidYMid meet">
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

        <image href="/complete-layout.jpg" x="0" y="0" width="2040" height="3357" preserveAspectRatio="xMidYMid slice" opacity="0.1" />
        <image
          href="/complete-layout.jpg"
          x="0"
          y="0"
          width="2040"
          height="3357"
          preserveAspectRatio="xMidYMid slice"
          :opacity="viewportMeasured ? 1 : 0"
          :clip-path="`url(#${clipId})`"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
const STAGE_WIDTH = 2040
const STAGE_HEIGHT = 3357
const MASK_SOURCE_WIDTH = 959
const MASK_SOURCE_HEIGHT = 921
const STAGE_ASPECT = STAGE_WIDTH / STAGE_HEIGHT

const MASK_CENTER_X_RATIO = 0.5
const MASK_CENTER_Y_OFFSET_RATIO = -0.2
const MASK_VIEWPORT_MAX_RATIO = 0.54

const SX = 1 / MASK_SOURCE_WIDTH
const SY = 1 / MASK_SOURCE_HEIGHT
const RAW_D = 'M518.44 0C624.72 2.74 724.09 40.7 803.02 111.83C841.85 146.82 874.2 189.81 899.57 236.19C921.443 276.17 937.607 318.153 948.06 362.14C954.487 389.153 958.133 416.52 959 444.24V463.72C958.393 487.393 955.147 511.073 949.26 534.76C940.32 570.753 926.557 603.987 907.97 634.46C878.51 682.78 835.36 723.44 779.27 737.02C766.937 740.007 755.01 741.383 743.49 741.15C733.377 740.95 719.55 740.65 702.01 740.25C686.843 739.903 672.78 740.773 659.82 742.86C645 745.24 629.26 751.15 621.9 764.16C611.62 782.34 620.14 801.89 638.05 810.46C655.32 818.73 675.08 815.7 692.01 807.63C695.077 806.17 699.057 803.673 703.95 800.14C712.4 794.03 735.29 776.22 745.63 784.57C746.08 784.935 746.41 785.422 746.58 785.97C755.84 814.97 718.06 836.33 698.6 848.63C632.59 890.36 556.84 916.4 478.78 920.11C394.18 924.12 310.48 901.56 238.66 857.31C143.91 798.93 72.93 708.92 31.29 606.14C15.93 568.213 6.06 529.167 1.68 489C1.08667 483.62 0.526667 475.29 0 464.01V434.3C0.46 426.73 0.7 418.58 1.44 411.56C7.18 357.1 23.4233 306.037 50.17 258.37C114.45 143.82 227.87 61.48 352.31 23.3C398.11 9.24667 444.973 1.48 492.9 0H518.44ZM470.42 59.74C354.21 69.59 244.43 132.31 171.5 222.2C125.22 279.24 94.36 348.77 90.27 422.01C86.64 487.28 104.29 552.32 141.7 606.1C202.48 693.48 305.25 748.06 410.47 756.6C492.91 763.29 579.62 738.3 637.86 677.62C657.85 656.79 673.01 636.49 692.9 611.39C704.78 596.397 720.337 579.54 739.57 560.82C762.1 538.91 775.92 526.15 793.75 506.27C814.81 482.783 830.307 456.443 840.24 427.25C854.78 384.54 859.79 337.32 851.68 293.3C845.513 259.793 832.753 228.967 813.4 200.82C750.95 109.98 636.37 62.79 529.13 58.44C522.677 58.18 517.083 58.13 512.35 58.29C498.11 58.78 484.11 58.58 470.42 59.74Z'
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

const initialD = scalePathD(RAW_D, SX, SY)
const clipId = `boot-blob-clip-${useId()}`
const pathRef = ref<SVGPathElement | null>(null)

const viewportMeasured = ref(false)
const viewportWidth = ref(import.meta.client ? window.innerWidth : 390)
const viewportHeight = ref(import.meta.client ? window.innerHeight : 844)

function updateViewportSize() {
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
}

onMounted(() => {
  updateViewportSize()
  requestAnimationFrame(() => {
    viewportMeasured.value = true
  })
  window.addEventListener('resize', updateViewportSize, { passive: true })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateViewportSize)
  })
})

const blobTransform = computed(() => {
  const stageRenderWidth = Math.max(viewportWidth.value, viewportHeight.value * STAGE_ASPECT)
  const stageScale = stageRenderWidth / STAGE_WIDTH
  const desiredMaskViewportSize = Math.min(viewportWidth.value, viewportHeight.value) * MASK_VIEWPORT_MAX_RATIO
  const maskWidth = desiredMaskViewportSize / stageScale
  const maskHeight = maskWidth * (MASK_SOURCE_HEIGHT / MASK_SOURCE_WIDTH)
  const maskLeft = STAGE_WIDTH * MASK_CENTER_X_RATIO - (maskWidth / 2)
  const maskCenterY = (STAGE_HEIGHT / 2) + (STAGE_HEIGHT * MASK_CENTER_Y_OFFSET_RATIO)
  const maskTop = maskCenterY - (maskHeight / 2)

  return `translate(${maskLeft} ${maskTop}) scale(${maskWidth} ${maskHeight})`
})

useOrgBlob(pathRef)

defineProps<{
  visible?: boolean
}>()
</script>

<style scoped>
.boot-shell {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--color-bg);
  opacity: 1;
  pointer-events: auto;
  transition: opacity 700ms ease;
}

.boot-shell--hidden {
  opacity: 0;
  pointer-events: none;
}

.boot-shell__stage {
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100vw, calc(100dvh * 2040 / 3357));
  height: max(100dvh, calc(100vw * 3357 / 2040));
  transform: translate(-50%, -50%);
  overflow: hidden;
  aspect-ratio: 2040 / 3357;
}

.boot-shell__svg {
  display: block;
  width: 100%;
  height: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .boot-shell {
    transition-duration: 0.01ms !important;
  }
}
</style>
