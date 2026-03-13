// Route protection middleware (global)
// Ensures only authenticated admin users can access protected routes

export default defineNuxtRouteMiddleware(async (to) => {
  const supaUser = useSupabaseUser()
  const { isAuthenticated, restore } = useAdminAuth()

  const path = to.path

  // ---- Public routes (no auth required) ----
  const publicRoutes = ['/', '/iniciar-sesion', '/confirm']
  if (publicRoutes.some(r => path === r || path.startsWith(r + '/'))) return

  // ---- No session → login ----
  if (!supaUser.value) {
    return navigateTo('/iniciar-sesion')
  }

  // ---- Has session but admin state not hydrated → restore ----
  if (!isAuthenticated.value) {
    await restore()
  }

  // ---- Still not authenticated (user is not an admin) → sign out ----
  if (!isAuthenticated.value) {
    const client = useSupabaseClient()
    await client.auth.signOut()
    return navigateTo('/iniciar-sesion')
  }
})
