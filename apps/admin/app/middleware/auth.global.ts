// Global route middleware — protects admin routes.
// Uses useSupabaseUser() which is hydrated by @nuxtjs/supabase on both
// server (via useSsrCookies) and client (via onAuthStateChange).

export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/iniciar-sesion', '/confirmacion', '/restablecer-contrasena', '/nueva-contrasena']
  if (publicRoutes.some(r => to.path === r || to.path.startsWith(r + '/'))) return

  const user = useSupabaseUser()

  // No supabase session → always redirect to login.
  if (!user.value) {
    return navigateTo('/iniciar-sesion')
  }

  // Has a session. Ensure admin role AND profile are loaded before routing.
  // On SSR restore() fast-paths without the profiles query; on client we
  // run it again to hydrate display_name/avatar_url. The guards inside
  // restore() make repeat calls cheap.
  const { isAuthenticated, isProfileHydrated, restore } = useAdminAuth()
  if (!isAuthenticated.value || (import.meta.client && !isProfileHydrated.value)) {
    await restore()
  }

  // Session but no admin role → send to login rather than deeper admin
  // routes. Applies to the root redirect too, so a non-admin supabase user
  // hitting `/` doesn't bounce through /admin/hoy first.
  if (!isAuthenticated.value) {
    return navigateTo('/iniciar-sesion')
  }

  // Root redirect: authed admin → dashboard.
  if (to.path === '/') {
    return navigateTo('/admin/hoy')
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
