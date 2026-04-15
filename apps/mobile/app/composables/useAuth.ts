// Auth composable — powered by @nuxtjs/supabase
// Integrates with RevenueCat for subscription entitlements (native IAP + web)
import { useState, navigateTo, watch, computed, clearNuxtData, clearNuxtState, useRuntimeConfig } from '#imports'

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
const authMutationMode = ref<'idle' | 'register' | 'logout'>('idle')
const pendingProfileBootstrapUserId = ref<string | null>(null)
const activeProfileLoadUid = ref<string | null>(null)

// Result of a profile load attempt:
//  - 'loaded'  → profile is in state
//  - 'missing' → DB confirmed there is no profile row for this uid
//  - 'error'   → transient failure (network/RLS/etc.). Retry later; do NOT sign out.
type ProfileLoadResult = 'loaded' | 'missing' | 'error'

let activeProfileLoadPromise: Promise<ProfileLoadResult> | null = null

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForRegisterBootstrap(
  uid: string,
  getCurrentUserId: () => string | undefined,
  timeoutMs = 2000,
) {
  const start = Date.now()

  while (
    authMutationMode.value === 'register'
    && pendingProfileBootstrapUserId.value === uid
    && getCurrentUserId() !== uid
    && Date.now() - start < timeoutMs
  ) {
    await sleep(50)
  }
}

async function hydrateProfileWithRetry(
  fetchProfile: (uid: string) => Promise<ProfileLoadResult>,
  uid: string,
  attempts = 4,
  delayMs = 150,
): Promise<ProfileLoadResult> {
  let last: ProfileLoadResult = 'error'
  for (let attempt = 0; attempt < attempts; attempt++) {
    last = await fetchProfile(uid)
    if (last === 'loaded') return last
    // On 'missing' during bootstrap the trigger may not have fired yet —
    // keep retrying. On 'error' we also retry (transient).
    if (attempt < attempts - 1) {
      await sleep(delayMs)
    }
  }

  return last
}

function clearClientSessionArtifacts() {
  clearNuxtData()
  clearNuxtState(['auth-user', 'auth-loading', 'library-tab'])

  if (!import.meta.client) return

  try {
    const runtimeConfig = useRuntimeConfig()
    const supabaseCookiePrefix = runtimeConfig.public.supabase.cookiePrefix
    const shouldRemoveStorageKey = (key: string) =>
      key.startsWith('hoy-ai-done-')
      || key.startsWith('hoy-content-done-')
      || key.startsWith(supabaseCookiePrefix)

    const localStorageKeys = Object.keys(window.localStorage).filter(shouldRemoveStorageKey)
    const sessionStorageKeys = Object.keys(window.sessionStorage).filter(shouldRemoveStorageKey)

    for (const key of localStorageKeys) {
      window.localStorage.removeItem(key)
    }

    for (const key of sessionStorageKeys) {
      window.sessionStorage.removeItem(key)
    }

    const cookieNames = document.cookie
      .split(';')
      .map(part => part.trim().split('=')[0] ?? '')
      .filter(Boolean)
      .filter(name => name.startsWith(supabaseCookiePrefix))

    for (const name of cookieNames) {
      document.cookie = `${name}=; Max-Age=0; path=/`
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  } catch {
    // Ignore storage cleanup errors; sign-out should still succeed.
  }
}

export function useAuth() {
  const client = useSupabaseClient()
  const supaUser = useSupabaseUser()
  const user = useState<AuthUser | null>('auth-user', () => null)
  const loading = useState('auth-loading', () => false)

  async function fetchProfile(uid: string): Promise<ProfileLoadResult> {
    // Ensure the client has a fresh access token before querying.
    // On SSR, the server plugin refreshes the token in a separate client
    // instance, but useSupabaseClient() may still hold an expired JWT.
    const { data: { session } } = await client.auth.getSession()
    const sessionUid = session?.user?.id
    if (authMutationMode.value === 'logout') return 'error'
    if (sessionUid && sessionUid !== uid) return 'error'

    const normalizedEmail = supaUser.value?.email?.trim().toLowerCase() ?? null
    const [profileRes, subRes, entRes, adminRes, effectiveSubscriberRes] = await Promise.all([
      client.from('profiles').select('display_name, avatar_url, community_segment, email').eq('id', uid).maybeSingle(),
      client.from('subscriptions').select('status').eq('user_id', uid).maybeSingle(),
      client.from('user_entitlements').select('entitlement_key').eq('user_id', uid),
      client.from('admin_users').select('role').eq('user_id', uid).maybeSingle(),
      client.rpc('user_is_subscriber'),
    ])
    // Distinguish transient failures from a genuinely absent profile.
    // Only 'missing' (confirmed no row) justifies signing the user out.
    if (profileRes.error) return 'error'
    if (!profileRes.data) return 'missing'
    const hasActiveSubscription = subRes.data?.status === 'active' || subRes.data?.status === 'trialing'
    let isSubscriber = effectiveSubscriberRes.error
      ? hasActiveSubscription
      : effectiveSubscriberRes.data === true
    const entitlements = Array.from(new Set((entRes.data ?? []).map(e => e.entitlement_key)))

    // Identify the signed-in user with RevenueCat, but keep Supabase as the
    // access source of truth for the app.
    try {
      const { login: rcLogin } = useRevenueCat()
      await rcLogin(uid, normalizedEmail)
    } catch { /* RevenueCat not configured yet — non-critical */ }

    if (import.meta.client && !isSubscriber) {
      try {
        const { configured, getCustomerInfo } = useRevenueCat()
        if (configured.value) {
          const customerInfo = await getCustomerInfo()
          if (customerInfo?.entitlements?.active?.core) {
            isSubscriber = true
          }
        }
      } catch { /* RevenueCat sync can lag or be unavailable — non-critical */ }
    }

    if (normalizedEmail && profileRes.data?.email !== normalizedEmail) {
      await client.from('profiles').update({ email: normalizedEmail }).eq('id', uid)
    }

    user.value = {
      id: uid,
      email: normalizedEmail ?? '',
      display_name: profileRes.data?.display_name ?? '',
      avatar_url: profileRes.data?.avatar_url ?? null,
      community_segment: (profileRes.data?.community_segment as AuthUser['community_segment']) ?? null,
      is_subscriber: isSubscriber,
      subscription_status: isSubscriber
        ? (subRes.data?.status ?? 'active')
        : (subRes.data?.status ?? null),
      entitlements,
      is_admin: !!adminRes.data,
    }
    return 'loaded'
  }

  async function loadProfile(uid: string, options?: { retryOnBootstrap?: boolean }): Promise<ProfileLoadResult> {
    if (activeProfileLoadPromise) {
      if (activeProfileLoadUid.value === uid) {
        return await activeProfileLoadPromise
      }

      await activeProfileLoadPromise.catch(() => 'error' as ProfileLoadResult)

      if (user.value?.id === uid) {
        return 'loaded'
      }
    }

    loading.value = true
    activeProfileLoadUid.value = uid

    const task = (async (): Promise<ProfileLoadResult> => {
      let result = await fetchProfile(uid)

      if (result !== 'loaded' && options?.retryOnBootstrap) {
        const registerBootstrapPending =
          authMutationMode.value === 'register'
          || pendingProfileBootstrapUserId.value === uid

        if (registerBootstrapPending) {
          result = await hydrateProfileWithRetry(fetchProfile, uid, 6, 200)
        }
      }

      return result
    })()

    activeProfileLoadPromise = task.finally(() => {
      if (activeProfileLoadUid.value === uid) {
        activeProfileLoadUid.value = null
        activeProfileLoadPromise = null
        loading.value = false
      }
    })

    return await task
  }

  async function refreshProfile(): Promise<boolean> {
    const uid = supaUser.value?.id ?? (supaUser.value as any)?.sub as string | undefined
    if (!uid) {
      user.value = null
      return false
    }

    const result = await loadProfile(uid, { retryOnBootstrap: true })
    return result === 'loaded'
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
      if (authMutationMode.value === 'register' && pendingProfileBootstrapUserId.value === uid) {
        await waitForRegisterBootstrap(uid, () => user.value?.id)
        if (user.value?.id === uid) return
      }
      const result = await loadProfile(uid, { retryOnBootstrap: true })
      if (result === 'missing') {
        // DB confirmed there is no profile row for this user — stale session
        // after DB reset or deleted account. Sign out to force a clean login.
        await client.auth.signOut()
        user.value = null
        await navigateTo('/iniciar-sesion')
      }
      // result === 'error' → transient; leave user state as-is, the next
      // middleware pass or refreshProfile() call will retry.
    }, { immediate: true })
  }

  const isLoggedIn = computed(() => !!user.value)
  const isOnboarded = computed(() => !!user.value?.community_segment)
  const isSubscriber = computed(() => !!user.value?.is_subscriber)

  function hasEntitlement(key: string) {
    return user.value?.entitlements.includes(key) ?? false
  }

  // After signInWithPassword, @nuxtjs/supabase's plugin hydrates supaUser
  // asynchronously via getClaims(). Navigating before that completes makes
  // the next page:start hook see empty claims and bounce to /iniciar-sesion.
  // Wait for supaUser to match the authenticated uid before continuing.
  async function waitForSupaUser(targetUid: string, timeoutMs = 3000): Promise<boolean> {
    const currentUid = () => supaUser.value?.id ?? (supaUser.value as any)?.sub as string | undefined
    if (currentUid() === targetUid) return true

    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      await sleep(50)
      if (currentUid() === targetUid) return true
    }
    return false
  }

  async function login(email: string, password: string) {
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) {
      // Block until the @nuxtjs/supabase plugin finishes hydrating supaUser
      // so the caller can safely navigate without racing middleware.
      await waitForSupaUser(data.user.id)
    }
  }

  async function register(email: string, password: string) {
    authMutationMode.value = 'register'
    pendingProfileBootstrapUserId.value = null

    try {
      const { data, error } = await client.auth.signUp({ email, password })
      if (error) throw error
      if (!data.user) {
        throw new Error('Supabase no devolvió el usuario recién creado.')
      }

      // If the Supabase project requires email confirmation, signUp returns
      // no session. We can't proceed with the signed-in flow and the user
      // needs to confirm before logging in. Surface a typed error so the
      // caller can show the right message.
      if (!data.session) {
        throw Object.assign(
          new Error('Te enviamos un correo para confirmar tu cuenta. Ábrelo antes de iniciar sesión.'),
          { code: 'email_confirmation_required' },
        )
      }

      pendingProfileBootstrapUserId.value = data.user.id

      // The profile row is created by the `on_auth_user_created` trigger on
      // auth.users (see migration 20260414000000). We no longer upsert from
      // the client here because that call races with the trigger and is
      // blocked by RLS when signUp returns no session (e.g. email
      // confirmation flows). Hydration happens via fetchProfile below.

      user.value = {
        id: data.user.id,
        email: data.user.email?.trim().toLowerCase() ?? '',
        display_name: '',
        avatar_url: null,
        community_segment: null,
        is_subscriber: false,
        subscription_status: null,
        entitlements: [],
        is_admin: false,
      }

      try {
        const { login: rcLogin } = useRevenueCat()
        await rcLogin(data.user.id, data.user.email ?? null)
      } catch {
        // RevenueCat identity can safely lag behind initial signup state.
      }
    } finally {
      authMutationMode.value = 'idle'
      pendingProfileBootstrapUserId.value = null
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
    authMutationMode.value = 'logout'
    pendingProfileBootstrapUserId.value = null

    // Clean up push tokens before signing out (native only)
    try {
      const { unregister } = usePushNotifications()
      await unregister()
    } catch { /* non-critical */ }

    // Log out of RevenueCat
    try {
      const { logout: rcLogout } = useRevenueCat()
      await rcLogout()
    } catch { /* non-critical */ }

    try {
      await client.auth.signOut()
    } finally {
      user.value = null
      loading.value = false
      clearClientSessionArtifacts()
      authMutationMode.value = 'idle'
      activeProfileLoadUid.value = null
      activeProfileLoadPromise = null
    }

    await navigateTo('/iniciar-sesion', { replace: true })
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
    refreshProfile,
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
