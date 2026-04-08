// RevenueCat SDK initialization — runs on both native and web.
// Native: configures Capacitor plugin, then identifies user
// Web: configures JS SDK with user ID (or anonymous)

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const apiKey = config.public.revenueCatApiKey as string
  if (!apiKey) {
    console.warn('[RevenueCat] No API key configured — skipping SDK init')
    return
  }

  const supaUser = useSupabaseUser()
  const { configure, login } = useRevenueCat()

  // Configure with the user's ID if already logged in, or anonymous for web
  await configure(apiKey, supaUser.value?.id ?? undefined)

  // If user is logged in, identify them with RevenueCat
  if (supaUser.value?.id) {
    await login(supaUser.value.id, supaUser.value.email ?? null)
  }
})
