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
  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true
    try {
      // Mock: simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // Mock credentials for dev
      if (email === 'admin@tupotencial.app' && password === 'admin123') {
        adminUser.value = {
          id: 'adm-001',
          email: 'admin@tupotencial.app',
          full_name: 'Ana Garcia',
          role: 'admin',
          avatar_url: undefined,
        }
        isAuthenticated.value = true
        return true
      }

      // Accept any email/password in dev mode for convenience
      adminUser.value = {
        id: 'adm-002',
        email,
        full_name: 'Administrador',
        role: 'admin',
        avatar_url: undefined,
      }
      isAuthenticated.value = true
      return true
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    adminUser.value = null
    isAuthenticated.value = false
    navigateTo('/iniciar-sesion')
  }

  function requireAuth() {
    if (!isAuthenticated.value) {
      navigateTo('/iniciar-sesion')
    }
  }

  return {
    adminUser: readonly(adminUser),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    login,
    logout,
    requireAuth,
  }
}
