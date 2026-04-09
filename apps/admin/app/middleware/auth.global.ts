// Global route middleware — protects admin routes.
// Uses useSupabaseUser() which is hydrated by @nuxtjs/supabase on both
// server (via useSsrCookies) and client (via onAuthStateChange).

export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/iniciar-sesion', '/confirmacion', '/restablecer-contrasena', '/nueva-contrasena']
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

  // ── Role-based route guards ──
  const { canWriteAdmin, canManageRoles } = useAdminAuth()

  // /admin/roles — admin only
  if (to.path.startsWith('/admin/roles') && !canManageRoles.value) {
    return navigateTo('/admin')
  }

  // These sections are operational editors/configuration screens, not read-only views.
  const writeOnlyPrefixes = ['/admin/hoy', '/admin/categorias', '/admin/objetivos', '/admin/imagenes']
  if (writeOnlyPrefixes.some(prefix => to.path === prefix || to.path.startsWith(prefix + '/')) && !canWriteAdmin.value) {
    return navigateTo('/admin')
  }

  // Deep admin routes are edit/detail screens by default. Keep only customer detail readable for read_only.
  const isDeepAdminRoute = /^\/admin\/[^/]+\/[^/]+$/.test(to.path)
  const isReadonlyAllowedDetail = /^\/admin\/usuarios\/[0-9a-f-]{36}$/.test(to.path)
  if (isDeepAdminRoute && !isReadonlyAllowedDetail && !canWriteAdmin.value) {
    const parentPath = to.path.split('/').slice(0, -1).join('/') || '/admin'
    return navigateTo(parentPath)
  }
})
