import { Capacitor } from '@capacitor/core'

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default defineNuxtPlugin(async () => {
  const bootReady = useState<boolean>('app-boot-ready', () => false)
  const keepBootShellVisible = true
  const minimumBootShellMs = 10000

  if (keepBootShellVisible) {
    return
  }

  if (!Capacitor.isNativePlatform()) {
    await wait(minimumBootShellMs)
    bootReady.value = true
    return
  }

  // ── Screen orientation: lock to portrait ──
  const { ScreenOrientation } = await import('@capacitor/screen-orientation')
  await ScreenOrientation.lock({ orientation: 'portrait' }).catch(() => {})

  // ── Status bar: dark background, light text ──
  const { StatusBar, Style } = await import('@capacitor/status-bar')
  await StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
  if (Capacitor.getPlatform() === 'android') {
    await StatusBar.setBackgroundColor({ color: '#282828' }).catch(() => {})
  }

  // ── Splash screen: auto-hide after content loads ──
  const { SplashScreen } = await import('@capacitor/splash-screen')
  await SplashScreen.hide().catch(() => {})
  await wait(minimumBootShellMs)
  bootReady.value = true
})
