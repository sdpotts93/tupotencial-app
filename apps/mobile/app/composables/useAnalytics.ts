import { Capacitor } from '@capacitor/core'

/**
 * Analytics composable — wraps Firebase Analytics for native, no-ops on web.
 *
 * Usage:
 *   const { logEvent, setUserId, setScreen } = useAnalytics()
 *   logEvent('purchase_completed', { addon_id: '...' })
 */
export function useAnalytics() {
  const isNative = Capacitor.isNativePlatform()

  async function getFirebaseAnalytics() {
    if (!isNative) return null
    const { FirebaseAnalytics } = await import('@capacitor-firebase/analytics')
    return FirebaseAnalytics
  }

  async function logEvent(name: string, params?: Record<string, unknown>) {
    const fa = await getFirebaseAnalytics()
    if (!fa) return
    await fa.logEvent({ name, params: params ?? {} }).catch(() => {})
  }

  async function setUserId(userId: string | null) {
    const fa = await getFirebaseAnalytics()
    if (!fa) return
    await fa.setUserId({ userId }).catch(() => {})
  }

  async function setScreen(screenName: string) {
    const fa = await getFirebaseAnalytics()
    if (!fa) return
    await fa.setCurrentScreen({ screenName }).catch(() => {})
  }

  async function setUserProperty(key: string, value: string) {
    const fa = await getFirebaseAnalytics()
    if (!fa) return
    await fa.setUserProperty({ key, value }).catch(() => {})
  }

  return {
    logEvent,
    setUserId,
    setScreen,
    setUserProperty,
  }
}
