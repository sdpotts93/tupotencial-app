// Admin auth composable — powered by @nuxtjs/supabase

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'editor' | 'read_only'
  avatar_url?: string
}

const adminUser = ref<AdminUser | null>(null)
const isAuthenticated = ref(false)
const isLoading = ref(false)

export function useAdminAuth() {
  const client = useSupabaseClient()

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

  // Restore session on page load if supabase has an active session
  async function restore() {
    const supaUser = useSupabaseUser()
    if (!supaUser.value || isAuthenticated.value) return

    isLoading.value = true
    try {
      const { data: adminRow } = await client
        .from('admin_users')
        .select('role')
        .eq('user_id', supaUser.value.id)
        .single()

      if (!adminRow) return

      const { data: profile } = await client
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', supaUser.value.id)
        .single()

      adminUser.value = {
        id: supaUser.value.id,
        email: supaUser.value.email!,
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
