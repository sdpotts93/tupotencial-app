import { Capacitor } from '@capacitor/core'
import type { PermissionStatus, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications'

/**
 * Push notification registration and handling for native (iOS/Android).
 * On web this is a no-op — web push is not in MVP scope.
 *
 * Usage:
 *   const { register, permissionStatus } = usePushNotifications()
 *   await register()  // requests permission + stores token in Supabase
 */
export function usePushNotifications() {
  const client = useSupabaseClient()
  const { user } = useAuth()
  const permissionStatus = ref<PermissionStatus['receive']>('prompt')
  const token = ref<string | null>(null)

  /**
   * Register for push notifications on native platforms.
   * 1. Check / request permission
   * 2. Register with APNs (iOS) or FCM (Android)
   * 3. Store the token in Supabase push_tokens table
   */
  async function register() {
    if (!Capacitor.isNativePlatform()) return
    if (!user.value) return

    const { PushNotifications } = await import('@capacitor/push-notifications')

    // Check current permission status
    const status = await PushNotifications.checkPermissions()
    permissionStatus.value = status.receive

    // Request permission if not yet granted
    if (status.receive === 'prompt' || status.receive === 'prompt-with-rationale') {
      const requestResult = await PushNotifications.requestPermissions()
      permissionStatus.value = requestResult.receive
      if (requestResult.receive !== 'granted') return
    } else if (status.receive !== 'granted') {
      return
    }

    // Listen for registration success
    await PushNotifications.addListener('registration', async (t: Token) => {
      token.value = t.value
      await saveToken(t.value)
    })

    // Listen for registration errors
    await PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error:', err)
    })

    // Listen for incoming notifications while app is in foreground
    await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      // For MVP: log it. Could show an in-app toast in the future.
      console.log('Push received in foreground:', notification)
    })

    // Listen for notification tap (app opened from notification)
    await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      const data = action.notification.data
      // Deep link based on notification data
      if (data?.route) {
        navigateTo(data.route)
      }
    })

    // Register with the native push service (APNs / FCM)
    await PushNotifications.register()
  }

  /**
   * Save the push token to Supabase. Uses upsert to handle token refresh.
   */
  async function saveToken(pushToken: string) {
    if (!user.value) return

    const platform = Capacitor.getPlatform() as 'ios' | 'android'

    await (client.from as any)('push_tokens')
      .upsert(
        {
          user_id: user.value.id,
          token: pushToken,
          platform,
        },
        { onConflict: 'user_id,token' },
      )
  }

  /**
   * Remove all push tokens for the current user (call on logout).
   */
  async function unregister() {
    if (!Capacitor.isNativePlatform()) return
    if (!user.value) return

    await (client.from as any)('push_tokens')
      .delete()
      .eq('user_id', user.value.id)

    token.value = null
  }

  return {
    register,
    unregister,
    permissionStatus,
    token,
  }
}
