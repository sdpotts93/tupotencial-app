// Auth composable — powered by @nuxtjs/supabase
import { useState, navigateTo, watch, computed } from '#imports'

export interface AuthUser {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  community_segment: 'gabriel' | 'carlotta' | 'conjunta' | null
  is_subscriber: boolean
  subscription_status: string | null
  entitlements: string[]
  is_admin: boolean
}

// Track whether the watcher has been registered to prevent duplicates.
// Each call to useAuth() in middleware/pages/layouts would otherwise
// register a new watcher, causing racing fetchProfile calls.
const watcherRegistered = ref(false)

export function useAuth() {
  const client = useSupabaseClient()
  const supaUser = useSupabaseUser()
  const user = useState<AuthUser | null>('auth-user', () => null)
  const loading = useState('auth-loading', () => false)

  async function fetchProfile(uid: string): Promise<boolean> {
    // Ensure the client has a fresh access token before querying.
    // On SSR, the server plugin refreshes the token in a separate client
    // instance, but useSupabaseClient() may still hold an expired JWT.
    await client.auth.getSession()

    const [profileRes, subRes, entRes, adminRes] = await Promise.all([
      client.from('profiles').select('display_name, avatar_url, community_segment').eq('id', uid).single(),
      client.from('subscriptions').select('status').eq('user_id', uid).maybeSingle(),
      client.from('user_entitlements').select('entitlement_key').eq('user_id', uid),
      client.from('admin_users').select('role').eq('user_id', uid).maybeSingle(),
    ])
    if (profileRes.error || !profileRes.data) return false
    user.value = {
      id: uid,
      email: supaUser.value?.email ?? '',
      display_name: profileRes.data?.display_name ?? '',
      avatar_url: profileRes.data?.avatar_url ?? null,
      community_segment: (profileRes.data?.community_segment as AuthUser['community_segment']) ?? null,
      is_subscriber: subRes.data?.status === 'active' || subRes.data?.status === 'trialing',
      subscription_status: subRes.data?.status ?? null,
      entitlements: (entRes.data ?? []).map(e => e.entitlement_key),
      is_admin: !!adminRes.data,
    }
    return true
  }

  // Register the supaUser watcher ONCE across all useAuth() calls.
  // The page:start hook in @nuxtjs/supabase can temporarily null out
  // supaUser during navigation (cookie read race). We ignore transient
  // nulls when we already have user state to avoid spurious logouts.
  if (!watcherRegistered.value) {
    watcherRegistered.value = true
    watch(supaUser, async (u) => {
      if (!u) {
        // Only clear user state if we don't already have a loaded profile.
        // The page:start hook can briefly null supaUser while cookies
        // are still being written — clearing here would cause a logout loop.
        if (!user.value) return
        // If supaUser becomes null and stays null, the next middleware run
        // will redirect to login. Don't proactively sign out.
        return
      }
      const uid = u.id ?? (u as any).sub as string | undefined
      if (!uid) return // guard against incomplete user object
      if (user.value?.id === uid) return // already loaded
      if (loading.value) return // fetch already in-flight — skip duplicate
      loading.value = true
      try {
        const ok = await fetchProfile(uid)
        if (!ok) {
          // No profile row for this user — stale session after DB reset
          // or deleted account. Sign out to force a clean login.
          await client.auth.signOut()
          user.value = null
          navigateTo('/iniciar-sesion')
        }
      } finally {
        loading.value = false
      }
    }, { immediate: true })
  }

  const isLoggedIn = computed(() => !!user.value)
  const isOnboarded = computed(() => !!user.value?.community_segment)
  const isSubscriber = computed(() => !!user.value?.is_subscriber)

  function hasEntitlement(key: string) {
    return user.value?.entitlements.includes(key) ?? false
  }

  async function login(email: string, password: string) {
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function register(email: string, password: string) {
    const { data, error } = await client.auth.signUp({ email, password })
    if (error) throw error

    // Create the profiles row for the new user
    if (data.user) {
      const { error: profileError } = await client.from('profiles').insert({
        id: data.user.id,
        display_name: '',
      })
      if (profileError) console.error('Profile insert error:', profileError)

      // Load profile into state so middleware sees the user as logged in
      await fetchProfile(data.user.id)
    }
  }

  async function requestPasswordReset(email: string) {
    const redirectTo = `${window.location.origin}/nueva-contrasena`
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) throw error
  }

  async function updatePassword(newPassword: string) {
    const { error } = await client.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  async function logout() {
    // Clean up push tokens before signing out (native only)
    try {
      const { unregister } = usePushNotifications()
      await unregister()
    } catch { /* non-critical */ }

    await client.auth.signOut()
    user.value = null
    navigateTo('/iniciar-sesion')
  }

  async function setSegment(segment: 'gabriel' | 'carlotta' | 'conjunta') {
    if (!user.value) return
    await client.from('profiles').update({ community_segment: segment }).eq('id', user.value.id)
    user.value = { ...user.value, community_segment: segment }
  }

  async function updateProfile(data: { display_name?: string; avatar_url?: string | null }) {
    if (!user.value) return
    await client.from('profiles').update(data).eq('id', user.value.id)
    user.value = { ...user.value, ...data }
  }

  return {
    user,
    isLoggedIn,
    isOnboarded,
    isSubscriber,
    hasEntitlement,
    login,
    register,
    requestPasswordReset,
    updatePassword,
    logout,
    setSegment,
    updateProfile,
  }
}
