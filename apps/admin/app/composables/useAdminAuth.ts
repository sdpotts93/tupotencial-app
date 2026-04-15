// Admin auth composable — powered by @nuxtjs/supabase

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'editor' | 'read_only'
  avatar_url?: string
}

function clearClientSessionArtifacts() {
  clearNuxtData()
  clearNuxtState(['admin-user', 'admin-is-authenticated', 'admin-is-profile-hydrated', 'admin-is-loading'])

  if (!import.meta.client) return

  try {
    const runtimeConfig = useRuntimeConfig()
    const supabaseCookiePrefix = runtimeConfig.public.supabase.cookiePrefix
    const shouldRemoveStorageKey = (key: string) => key.startsWith(supabaseCookiePrefix)

    const localStorageKeys = Object.keys(window.localStorage).filter(shouldRemoveStorageKey)
    const sessionStorageKeys = Object.keys(window.sessionStorage).filter(shouldRemoveStorageKey)

    for (const key of localStorageKeys) window.localStorage.removeItem(key)
    for (const key of sessionStorageKeys) window.sessionStorage.removeItem(key)

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

export function useAdminAuth() {
  const adminUser = useState<AdminUser | null>('admin-user', () => null)
  const isAuthenticated = useState('admin-is-authenticated', () => false)
  // Tracks whether the profile (display_name, avatar_url) has been loaded
  // on the client. On SSR we skip the profile query for speed, so we need
  // a separate flag to trigger the client-side fetch after hydration.
  const isProfileHydrated = useState('admin-is-profile-hydrated', () => false)
  const isLoading = useState('admin-is-loading', () => false)
  const client = useSupabaseClient()
  const supaUser = useSupabaseUser()

  // After signInWithPassword, @nuxtjs/supabase's plugin hydrates supaUser
  // asynchronously via getClaims(). The middleware reads supaUser on the
  // next navigation and will bounce back to /iniciar-sesion if it hasn't
  // populated yet. Wait for supaUser to match before letting the caller
  // navigate.
  async function waitForSupaUser(targetUid: string, timeoutMs = 3000): Promise<boolean> {
    const currentUid = () => supaUser.value?.id ?? (supaUser.value as any)?.sub as string | undefined
    if (currentUid() === targetUid) return true

    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 50))
      if (currentUid() === targetUid) return true
    }
    return false
  }

  type LoginResult =
    | { ok: true }
    | { ok: false; reason: 'invalid_credentials' | 'not_admin' | 'unknown' }

  async function login(email: string, password: string): Promise<LoginResult> {
    isLoading.value = true
    try {
      const { data: authData, error: authError } = await client.auth.signInWithPassword({ email, password })
      if (authError || !authData.user) {
        return { ok: false, reason: 'invalid_credentials' }
      }

      // Verify user is an admin
      const { data: adminRow, error: adminError } = await client
        .from('admin_users')
        .select('role')
        .eq('user_id', authData.user.id)
        .single()

      if (adminError || !adminRow) {
        // Valid supabase account but no admin_users row — sign them out of
        // this app and let the caller explain why they can't proceed.
        await client.auth.signOut()
        return { ok: false, reason: 'not_admin' }
      }

      // Get profile info (display_name, avatar_url)
      const { data: profile } = await client
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', authData.user.id)
        .single()

      adminUser.value = {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: profile?.display_name ?? 'Administrador',
        role: adminRow.role as AdminUser['role'],
        avatar_url: profile?.avatar_url ?? undefined,
      }
      isAuthenticated.value = true
      isProfileHydrated.value = true

      // Block until the @nuxtjs/supabase plugin finishes hydrating supaUser
      // so the middleware on the next navigation finds a valid session.
      await waitForSupaUser(authData.user.id)
      return { ok: true }
    } catch {
      return { ok: false, reason: 'unknown' }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await client.auth.signOut()
    } finally {
      adminUser.value = null
      isAuthenticated.value = false
      isProfileHydrated.value = false
      clearClientSessionArtifacts()
    }
    await navigateTo('/iniciar-sesion', { replace: true })
  }

  // Restore admin state from an existing supabase session.
  // useSupabaseUser() is already hydrated by the @nuxtjs/supabase module
  // on both server (useSsrCookies) and client (onAuthStateChange).
  //
  // On SSR we fast-path without the profiles query, then on client we
  // run a follow-up fetch to hydrate display_name / avatar_url. Callers
  // should invoke restore() on every middleware pass — the guards below
  // make repeat calls cheap.
  async function restore() {
    const alreadyComplete = isAuthenticated.value
      && (import.meta.server || isProfileHydrated.value)
    if (alreadyComplete) return

    // On server, useSupabaseUser() returns JWT claims (has .sub).
    // On client, it returns a User object (has .id).
    const uid = supaUser.value?.id ?? (supaUser.value as any)?.sub
    if (!uid) return

    isLoading.value = true
    try {
      // Role lookup — skip if we already verified this session on SSR.
      let role: AdminUser['role'] | null = isAuthenticated.value
        ? (adminUser.value?.role ?? null)
        : null

      if (!role) {
        const { data: adminRow } = await client
          .from('admin_users')
          .select('role')
          .eq('user_id', uid)
          .single()

        if (!adminRow) {
          adminUser.value = null
          isAuthenticated.value = false
          isProfileHydrated.value = false
          return
        }
        role = adminRow.role as AdminUser['role']
      }

      const email = supaUser.value?.email ?? ''

      // On server, skip the profile query to keep SSR fast. The client
      // will hydrate display_name / avatar_url on the next restore() call.
      if (import.meta.server) {
        adminUser.value = {
          id: uid,
          email,
          full_name: adminUser.value?.full_name ?? 'Administrador',
          role,
          avatar_url: adminUser.value?.avatar_url,
        }
        isAuthenticated.value = true
        return
      }

      const { data: profile } = await client
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', uid)
        .single()

      adminUser.value = {
        id: uid,
        email,
        full_name: profile?.display_name ?? 'Administrador',
        role,
        avatar_url: profile?.avatar_url ?? undefined,
      }
      isAuthenticated.value = true
      isProfileHydrated.value = true
    } finally {
      isLoading.value = false
    }
  }

  // ── Role-based permission helpers ──
  // admin: full access
  // editor: CRUD content, programs, events, etc. — but NOT roles/admin management
  // read_only: view only, no create/edit/delete
  const canReadAdmin = computed(() => {
    return Boolean(adminUser.value)
  })

  const canWriteAdmin = computed(() => {
    const role = adminUser.value?.role
    return role === 'admin' || role === 'editor'
  })

  const canManageRoles = computed(() => {
    return adminUser.value?.role === 'admin'
  })

  return {
    adminUser: readonly(adminUser),
    isAuthenticated: readonly(isAuthenticated),
    isProfileHydrated: readonly(isProfileHydrated),
    isLoading: readonly(isLoading),
    canReadAdmin,
    canWriteAdmin,
    canEdit: canWriteAdmin,
    canManageRoles,
    login,
    logout,
    restore,
  }
}
