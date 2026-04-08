// RevenueCat SDK initialization — runs once on native app boot.
// Configures the SDK and identifies the current user if logged in.

import { Capacitor } from '@capacitor/core'

export default defineNuxtPlugin(async () => {
  if (!Capacitor.isNativePlatform()) return

  const config = useRuntimeConfig()
  const apiKey = config.public.revenueCatApiKey as string
  if (!apiKey) {
    console.warn('[RevenueCat] No API key configured — skipping SDK init')
    return
  }

  const { configure, login } = useRevenueCat()
  await configure(apiKey)

  // If the user is already logged in, identify them with RevenueCat
  const supaUser = useSupabaseUser()
  if (supaUser.value?.id) {
    await login(supaUser.value.id)
  }
})
