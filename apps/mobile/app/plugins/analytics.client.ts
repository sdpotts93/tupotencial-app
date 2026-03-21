import { Capacitor } from '@capacitor/core'

/**
 * Auto-initialize Firebase Analytics on native platforms.
 * Sets user ID when authenticated and tracks screen views on route changes.
 */
export default defineNuxtPlugin(() => {
  if (!Capacitor.isNativePlatform()) return

  const { user } = useAuth()
  const router = useRouter()
  const { setUserId, setScreen, setUserProperty, logEvent } = useAnalytics()

  // Set user ID + properties when auth state changes
  watch(
    () => user.value,
    async (u) => {
      if (u) {
        await setUserId(u.id)
        if (u.community_segment) {
          await setUserProperty('community_segment', u.community_segment)
        }
        await setUserProperty('is_subscriber', u.is_subscriber ? 'true' : 'false')
      } else {
        await setUserId(null)
      }
    },
    { immediate: true },
  )

  // Track screen views on route navigation
  router.afterEach((to) => {
    // Use the route name or path as screen name
    const screenName = (to.name as string) ?? to.path
    setScreen(screenName)
  })

  // Log app_open event
  logEvent('app_open')
})
