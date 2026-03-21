import { Capacitor } from '@capacitor/core'

/**
 * Auto-register for push notifications on native platforms.
 * Runs after auth is initialized (client-side only).
 */
export default defineNuxtPlugin(() => {
  if (!Capacitor.isNativePlatform()) return

  const { user } = useAuth()
  const { register } = usePushNotifications()

  // Watch for user login — register once user is available
  watch(
    () => user.value?.id,
    async (uid) => {
      if (uid) {
        await register()
      }
    },
    { immediate: true },
  )
})
