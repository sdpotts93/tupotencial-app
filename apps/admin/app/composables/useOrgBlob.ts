// ─── Organic blob: morph the actual logo SVG path vertices with noise ───
// The logo clipPath is inline in the template (CSS clips from first paint).
// This composable displaces each vertex with simplex noise every frame.

import type { Ref } from 'vue'

/* ── SVG path parser/rebuilder ── */
interface Segment { cmd: string; vals: number[]; axes: (0 | 1)[] }

function parsePath(d: string): Segment[] {
  const segs: Segment[] = []
  const re = /([MmCcSsQqTtAaLlHhVvZz])|(-?\d*\.?\d+(?:e[+-]?\d+)?)/gi
  let cmd = ''
  let nums: number[] = []

  function flush() {
    if (!cmd) return
    const c = cmd.toUpperCase()
    // Map each number to axis: 0=x, 1=y
    let axes: (0 | 1)[] = []
    if (c === 'M' || c === 'L' || c === 'T') {
      axes = nums.map((_, i) => (i % 2 === 0 ? 0 : 1) as 0 | 1)
    } else if (c === 'C') {
      axes = nums.map((_, i) => (i % 2 === 0 ? 0 : 1) as 0 | 1)
    } else if (c === 'S' || c === 'Q') {
      axes = nums.map((_, i) => (i % 2 === 0 ? 0 : 1) as 0 | 1)
    } else if (c === 'H') {
      axes = nums.map(() => 0 as 0 | 1)
    } else if (c === 'V') {
      axes = nums.map(() => 1 as 0 | 1)
    } else if (c === 'Z') {
      axes = []
    }
    segs.push({ cmd, vals: [...nums], axes })
    nums = []
  }

  let m: RegExpExecArray | null
  while ((m = re.exec(d)) !== null) {
    if (m[1]) { // command letter
      flush()
      cmd = m[1]
      nums = []
    } else if (m[2] !== undefined) {
      nums.push(parseFloat(m[2]))
    }
  }
  flush()
  return segs
}

function buildPath(segs: Segment[], offsets: Float64Array): string {
  let d = ''
  let idx = 0
  for (const seg of segs) {
    d += seg.cmd
    for (let i = 0; i < seg.vals.length; i++) {
      const displaced = seg.vals[i]! + offsets[idx]!
      d += (i > 0 ? ' ' : '') + displaced.toFixed(6)
      idx++
    }
  }
  return d
}

/* ── Inline 3D simplex noise ── */
const F3 = 1 / 3
const G3 = 1 / 6
const grad3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
]

function buildPerm(): Uint8Array {
  const p = new Uint8Array(512)
  const src = new Uint8Array(256)
  for (let i = 0; i < 256; i++) src[i] = i
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = src[i]!
    src[i] = src[j]!
    src[j] = tmp
  }
  for (let i = 0; i < 512; i++) p[i] = src[i & 255]!
  return p
}

function createNoise3D() {
  const perm = buildPerm()
  const permMod12 = new Uint8Array(512)
  for (let i = 0; i < 512; i++) permMod12[i] = perm[i]! % 12

  return function noise3D(x: number, y: number, z: number): number {
    const s = (x + y + z) * F3
    const i = Math.floor(x + s)
    const j = Math.floor(y + s)
    const k = Math.floor(z + s)
    const t = (i + j + k) * G3
    const X0 = i - t, Y0 = j - t, Z0 = k - t
    const x0 = x - X0, y0 = y - Y0, z0 = z - Z0

    let i1: number, j1: number, k1: number
    let i2: number, j2: number, k2: number

    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0 }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1 }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1 }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1 }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1 }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0 }
    }

    const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3
    const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3
    const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3
    const ii = i & 255, jj = j & 255, kk = k & 255

    const contrib = (tx: number, ty: number, tz: number, gi: number) => {
      let v = 0.6 - tx * tx - ty * ty - tz * tz
      if (v < 0) return 0
      v *= v
      const g = grad3[gi]!
      return v * v * (g[0]! * tx + g[1]! * ty + g[2]! * tz)
    }

    const n0 = contrib(x0, y0, z0, permMod12[ii + perm[jj + perm[kk]!]!]!)
    const n1 = contrib(x1, y1, z1, permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]!]!]!)
    const n2 = contrib(x2, y2, z2, permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]!]!]!)
    const n3 = contrib(x3, y3, z3, permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]!]!]!)

    return 32 * (n0 + n1 + n2 + n3)
  }
}

/* ── Composable ── */

// Displacement amplitude in objectBoundingBox units (0–1)
const AMP = 0.025

/**
 * Pass a ref to the <path> element inside the inline SVG clipPath.
 * Reads its original `d`, then displaces every vertex with spatially-
 * correlated noise each frame (nearby points move together).
 */
export function useOrgBlob(pathRef: Ref<SVGPathElement | null>) {
  onMounted(() => {
    const pathEl = pathRef.value
    if (!pathEl) return

    const originalD = pathEl.getAttribute('d')!
    const segs = parsePath(originalD)

    // Count total numeric values and store original values for spatial lookup
    let totalNums = 0
    for (const seg of segs) totalNums += seg.vals.length

    // Build spatial coordinates: use original x,y values as noise input
    // so nearby path points get correlated displacement
    const origVals = new Float64Array(totalNums)
    let idx = 0
    for (const seg of segs) {
      for (const v of seg.vals) {
        origVals[idx++] = v
      }
    }

    const offsets = new Float64Array(totalNums)
    const smoothed = new Float64Array(totalNums)
    const noise = createNoise3D()
    const SMOOTH = 0.88

    let raf: number
    const start = performance.now()

    function tick() {
      const t = (performance.now() - start) / 1000

      for (let i = 0; i < totalNums; i++) {
        // Use the original coordinate value * a spread factor as spatial input
        // This means points at similar positions get similar displacement
        const spatial = origVals[i]! * 3
        const target = noise(spatial, spatial * 0.7, t * 0.3) * AMP
        smoothed[i] = smoothed[i]! * SMOOTH + target * (1 - SMOOTH)
        offsets[i] = smoothed[i]!
      }

      pathEl!.setAttribute('d', buildPath(segs, offsets))
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    onBeforeUnmount(() => cancelAnimationFrame(raf))
  })
}
