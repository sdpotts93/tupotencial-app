import html2canvas from 'html2canvas'

export function useShareBadge() {
  const isCapturing = ref(false)
  const captureError = ref<string | null>(null)

  async function captureElement(el: HTMLElement): Promise<Blob> {
    // Wait for all fonts to load before capturing
    await document.fonts.ready

    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      width: el.offsetWidth,
      height: el.offsetHeight,
    })

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob returned null'))
        },
        'image/png',
        1.0,
      )
    })
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
    saveImage,
    shareImage,
  }
}
