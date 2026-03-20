// Global route middleware — protects admin routes.
// Uses useSupabaseUser() which is hydrated by @nuxtjs/supabase on both
// server (via useSsrCookies) and client (via onAuthStateChange).

export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/iniciar-sesion', '/confirm']
  if (publicRoutes.some(r => to.path === r || to.path.startsWith(r + '/'))) return

  const user = useSupabaseUser()

  // Root redirect: logged in → dashboard, not logged in → login
  if (to.path === '/') {
    return navigateTo(user.value ? '/admin/hoy' : '/iniciar-sesion')
  }

  // No supabase session → redirect to login
  if (!user.value) {
    return navigateTo('/iniciar-sesion')
  }

  // Has session → ensure admin role is loaded
  const { isAuthenticated, restore } = useAdminAuth()
  if (!isAuthenticated.value) {
    await restore()
  }

  if (!isAuthenticated.value) {
    return navigateTo('/iniciar-sesion')
  }
})
