export const STAGE_WIDTH = 2040
export const STAGE_HEIGHT = 3357
export const MASK_SOURCE_WIDTH = 959
export const MASK_SOURCE_HEIGHT = 921
export const STAGE_ASPECT = STAGE_WIDTH / STAGE_HEIGHT
export const DEFAULT_MASK_CENTER_X_RATIO = 0.5
export const DEFAULT_MASK_CENTER_Y_OFFSET_RATIO = -0.2
export const DEFAULT_MASK_VIEWPORT_MAX_RATIO = 0.54
export const BLOB_RAW_D = 'M518.44 0C624.72 2.74 724.09 40.7 803.02 111.83C841.85 146.82 874.2 189.81 899.57 236.19C921.443 276.17 937.607 318.153 948.06 362.14C954.487 389.153 958.133 416.52 959 444.24V463.72C958.393 487.393 955.147 511.073 949.26 534.76C940.32 570.753 926.557 603.987 907.97 634.46C878.51 682.78 835.36 723.44 779.27 737.02C766.937 740.007 755.01 741.383 743.49 741.15C733.377 740.95 719.55 740.65 702.01 740.25C686.843 739.903 672.78 740.773 659.82 742.86C645 745.24 629.26 751.15 621.9 764.16C611.62 782.34 620.14 801.89 638.05 810.46C655.32 818.73 675.08 815.7 692.01 807.63C695.077 806.17 699.057 803.673 703.95 800.14C712.4 794.03 735.29 776.22 745.63 784.57C746.08 784.935 746.41 785.422 746.58 785.97C755.84 814.97 718.06 836.33 698.6 848.63C632.59 890.36 556.84 916.4 478.78 920.11C394.18 924.12 310.48 901.56 238.66 857.31C143.91 798.93 72.93 708.92 31.29 606.14C15.93 568.213 6.06 529.167 1.68 489C1.08667 483.62 0.526667 475.29 0 464.01V434.3C0.46 426.73 0.7 418.58 1.44 411.56C7.18 357.1 23.4233 306.037 50.17 258.37C114.45 143.82 227.87 61.48 352.31 23.3C398.11 9.24667 444.973 1.48 492.9 0H518.44ZM470.42 59.74C354.21 69.59 244.43 132.31 171.5 222.2C125.22 279.24 94.36 348.77 90.27 422.01C86.64 487.28 104.29 552.32 141.7 606.1C202.48 693.48 305.25 748.06 410.47 756.6C492.91 763.29 579.62 738.3 637.86 677.62C657.85 656.79 673.01 636.49 692.9 611.39C704.78 596.397 720.337 579.54 739.57 560.82C762.1 538.91 775.92 526.15 793.75 506.27C814.81 482.783 830.307 456.443 840.24 427.25C854.78 384.54 859.79 337.32 851.68 293.3C845.513 259.793 832.753 228.967 813.4 200.82C750.95 109.98 636.37 62.79 529.13 58.44C522.677 58.18 517.083 58.13 512.35 58.29C498.11 58.78 484.11 58.58 470.42 59.74Z'

export function computeBlobStageMetrics(
  containerWidth: number,
  containerHeight: number,
  options?: {
    maskCenterXRatio?: number
    maskCenterYOffsetRatio?: number
    maskViewportMaxRatio?: number
  },
) {
  const maskCenterXRatio = options?.maskCenterXRatio ?? DEFAULT_MASK_CENTER_X_RATIO
  const maskCenterYOffsetRatio = options?.maskCenterYOffsetRatio ?? DEFAULT_MASK_CENTER_Y_OFFSET_RATIO
  const maskViewportMaxRatio = options?.maskViewportMaxRatio ?? DEFAULT_MASK_VIEWPORT_MAX_RATIO

  const stageRenderWidth = Math.max(containerWidth, containerHeight * STAGE_ASPECT)
  const stageRenderHeight = Math.max(containerHeight, containerWidth / STAGE_ASPECT)
  const stageScale = stageRenderWidth / STAGE_WIDTH
  const desiredMaskViewportSize = Math.min(containerWidth, containerHeight) * maskViewportMaxRatio

  const maskWidthArt = desiredMaskViewportSize / stageScale
  const maskHeightArt = maskWidthArt * (MASK_SOURCE_HEIGHT / MASK_SOURCE_WIDTH)
  const maskCenterXArt = STAGE_WIDTH * maskCenterXRatio
  const maskCenterYArt = (STAGE_HEIGHT / 2) + (STAGE_HEIGHT * maskCenterYOffsetRatio)
  const maskLeftArt = maskCenterXArt - (maskWidthArt / 2)
  const maskTopArt = maskCenterYArt - (maskHeightArt / 2)

  const stageOffsetX = (containerWidth - stageRenderWidth) / 2
  const stageOffsetY = (containerHeight - stageRenderHeight) / 2
  const maskLeftPx = stageOffsetX + (maskLeftArt * stageScale)
  const maskTopPx = stageOffsetY + (maskTopArt * stageScale)
  const maskWidthPx = maskWidthArt * stageScale
  const maskHeightPx = maskHeightArt * stageScale

  return {
    maskLeftPx,
    maskTopPx,
    maskWidthPx,
    maskHeightPx,
    maskCenterXPx: maskLeftPx + (maskWidthPx / 2),
    maskBottomPx: maskTopPx + maskHeightPx,
    blobTransform: `translate(${maskLeftArt} ${maskTopArt}) scale(${maskWidthArt} ${maskHeightArt})`,
  }
}
