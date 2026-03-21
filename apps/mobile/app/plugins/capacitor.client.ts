import { Capacitor } from '@capacitor/core'

export default defineNuxtPlugin(async () => {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) return

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
})
