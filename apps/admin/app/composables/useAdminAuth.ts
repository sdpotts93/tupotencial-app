// Admin auth composable — powered by @nuxtjs/supabase

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'editor' | 'read_only'
  avatar_url?: string
}

export function useAdminAuth() {
  const adminUser = useState<AdminUser | null>('admin-user', () => null)
  const isAuthenticated = useState('admin-is-authenticated', () => false)
  const isLoading = useState('admin-is-loading', () => false)
  const client = useSupabaseClient()
  const supaUser = useSupabaseUser()

  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true
    try {
      const { data: authData, error: authError } = await client.auth.signInWithPassword({ email, password })
      if (authError || !authData.user) return false

      // Verify user is an admin
      const { data: adminRow, error: adminError } = await client
        .from('admin_users')
        .select('role')
        .eq('user_id', authData.user.id)
        .single()

      if (adminError || !adminRow) {
        await client.auth.signOut()
        return false
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
      return true
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    await client.auth.signOut()
    adminUser.value = null
    isAuthenticated.value = false
    navigateTo('/iniciar-sesion')
  }

  // Restore admin state from an existing supabase session.
  // useSupabaseUser() is already hydrated by the @nuxtjs/supabase module
  // on both server (useSsrCookies) and client (onAuthStateChange).
  async function restore() {
    if (isAuthenticated.value) return

    // On server, useSupabaseUser() returns JWT claims (has .sub).
    // On client, it returns a User object (has .id).
    const uid = supaUser.value?.id ?? (supaUser.value as any)?.sub
    if (!uid) return

    isLoading.value = true
    try {
      const { data: adminRow } = await client
        .from('admin_users')
        .select('role')
        .eq('user_id', uid)
        .single()

      if (!adminRow) {
        adminUser.value = null
        isAuthenticated.value = false
        return
      }

      const email = supaUser.value?.email ?? ''

      // On server, skip the profile query to keep SSR fast
      if (import.meta.server) {
        adminUser.value = {
          id: uid,
          email,
          full_name: 'Administrador',
          role: adminRow.role as AdminUser['role'],
          avatar_url: undefined,
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
        role: adminRow.role as AdminUser['role'],
        avatar_url: profile?.avatar_url ?? undefined,
      }
      isAuthenticated.value = true
    } finally {
      isLoading.value = false
    }
  }

  return {
    adminUser: readonly(adminUser),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    login,
    logout,
    restore,
  }
}
