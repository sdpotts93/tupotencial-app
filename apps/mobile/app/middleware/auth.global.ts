// Route protection middleware (global)
// Implements: Public / Authed / Onboarded / Subscriber / Entitled guards
// Per AGENTS.md section 9.6

export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, isOnboarded, isSubscriber } = useAuth()
  const supaUser = useSupabaseUser()

  const path = to.path

  // Use both app state and supabase session to determine auth
  const hasSession = !!supaUser.value

  // ---- Public routes (no auth required) ----
  const publicRoutes = ['/iniciar-sesion', '/registro', '/precios']
  if (publicRoutes.some(r => path === r || path.startsWith(r + '/'))) return

  // ---- Root redirect ----
  if (path === '/') {
    if (!isLoggedIn.value && !hasSession) return navigateTo('/iniciar-sesion')
    if (!isOnboarded.value && isLoggedIn.value) return navigateTo('/cuenta/bienvenida/segmento')
    return navigateTo('/cuenta/hoy')
  }

  // ---- Authed routes ----
  if (!isLoggedIn.value && !hasSession) {
    return navigateTo('/iniciar-sesion')
  }

  // ---- Authed-only routes (don't need onboarding) ----
  const authedOnlyRoutes = ['/configurar-perfil', '/cuenta/facturacion/retorno']
  if (authedOnlyRoutes.some(r => path === r || path.startsWith(r + '/'))) return

  // ---- Onboarding redirect ----
  if (path === '/cuenta/bienvenida/segmento') {
    if (isOnboarded.value) return navigateTo('/cuenta/hoy')
    return
  }

  // ---- Onboarded routes ----
  // If we have a supabase session but profile hasn't loaded yet, don't redirect —
  // the profile watcher will hydrate state shortly after mount.
  if (!isOnboarded.value && isLoggedIn.value) {
    return navigateTo('/cuenta/bienvenida/segmento')
  }

  // ---- Subscriber-only routes ----
  const subscriberRoutes = ['/cuenta/comunidad', '/cuenta/eventos']
  const isSubscriberRoute = subscriberRoutes.some(r => path === r || path.startsWith(r + '/'))

  // /cuenta/eventos/[id]/ver is subscriber-only
  if (path.match(/^\/cuenta\/eventos\/[^/]+\/ver$/)) {
    if (!isSubscriber.value) {
      const eventId = path.split('/')[3]
      return navigateTo(`/cuenta/eventos/${eventId}`)
    }
  }

  // Community is subscriber-only
  if (path.startsWith('/cuenta/comunidad') && !isSubscriber.value) {
    // Show locked state by allowing the page to render with gating
    // (handled in the component)
  }

  // ---- Entitlement-gated routes ----
  if (path.startsWith('/cuenta/vip')) {
    const { hasEntitlement } = useAuth()
    if (!hasEntitlement('vip')) {
      return navigateTo('/cuenta/complementos')
    }
  }
})
