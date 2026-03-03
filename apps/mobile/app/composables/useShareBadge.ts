import { toBlob } from 'html-to-image'

export function useShareBadge() {
  const isCapturing = ref(false)
  const captureError = ref<string | null>(null)

  async function captureElement(el: HTMLElement): Promise<Blob> {
    await document.fonts.ready

    const blob = await toBlob(el, {
      pixelRatio: 3,
      cacheBust: true,
      width: 360,
      height: 640,
      style: {
        transform: 'none',
        position: 'static',
        left: 'auto',
        top: 'auto',
      },
    })

    if (!blob) throw new Error('toBlob returned null')
    return blob
  }

  async function saveImage(el: HTMLElement, fileName?: string) {
    isCapturing.value = true
    captureError.value = null
    try {
      const blob = await captureElement(el)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName ?? `tu-potencial-${new Date().toISOString().split('T')[0]}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      captureError.value = (err as Error).message
      console.error('[useShareBadge] Save failed:', err)
    } finally {
      isCapturing.value = false
    }
  }

  async function shareImage(el: HTMLElement, shareText?: string) {
    isCapturing.value = true
    captureError.value = null
    try {
      const blob = await captureElement(el)
      const file = new File(
        [blob],
        `tu-potencial-${new Date().toISOString().split('T')[0]}.png`,
        { type: 'image/png' },
      )

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          text: shareText ?? 'Mi progreso en Tu Potencial',
          files: [file],
        })
      } else {
        // Fallback: trigger download
        await saveImage(el)
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        captureError.value = (err as Error).message
        console.error('[useShareBadge] Share failed:', err)
      }
    } finally {
      isCapturing.value = false
    }
  }

  return {
    isCapturing,
    captureError,
    captureElement,
    saveImage,
    shareImage,
  }
}
