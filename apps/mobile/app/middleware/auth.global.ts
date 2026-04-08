// Route protection middleware (global)
// Implements: Public / Authed / Onboarded / Subscriber / Entitled guards
// Per AGENTS.md section 9.6

export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn, isOnboarded, isSubscriber, hasEntitlement } = useAuth()
  const supaUser = useSupabaseUser()
  const client = useSupabaseClient()

  const path = to.path

  // Use both app state and verified supabase session to determine auth.
  const hasSession = !!supaUser.value
  const isAuthed = isLoggedIn.value || hasSession

  // ---- Public routes (no auth required) ----
  const publicRoutes = ['/iniciar-sesion', '/registro', '/precios', '/restablecer-contrasena', '/nueva-contrasena', '/terminos', '/privacidad']
  if (publicRoutes.some(r => path === r || path.startsWith(r + '/'))) return

  // ---- Root redirect ----
  if (path === '/') {
    if (!isAuthed) return navigateTo('/iniciar-sesion')
    if (!isOnboarded.value && isLoggedIn.value) return navigateTo('/cuenta/bienvenida/segmento')
    return navigateTo('/cuenta/hoy')
  }

  // ---- Authed routes ----
  if (!isAuthed) {
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

  // /cuenta/eventos/[id]/ver — gate handled by the event entitlement check below

  // Community is subscriber-only
  if (path.startsWith('/cuenta/comunidad') && !isSubscriber.value) {
    // Show locked state by allowing the page to render with gating
    // (handled in the component)
  }

  // ---- Entitlement-gated routes ----
  if (path.startsWith('/cuenta/vip')) {
    if (!hasEntitlement('vip')) {
      return navigateTo('/cuenta/complementos')
    }
  }

  // ---- Content entitlement gate ----
  // Block /cuenta/contenido/[id] routes if user lacks the required entitlement or plan
  const contentMatch = path.match(/^\/cuenta\/contenido\/([^/]+)/)
  if (contentMatch) {
    const contentId = contentMatch[1]!
    const { data } = await client
      .from('content_items')
      .select('entitlement_key, plan')
      .eq('id', contentId)
      .single()
    if (data?.entitlement_key && !hasEntitlement(data.entitlement_key)) {
      return navigateTo('/cuenta/biblioteca')
    }
    if (data?.plan === 'core' && !isSubscriber.value) {
      return navigateTo('/cuenta/biblioteca')
    }
  }

  // ---- Event entitlement gate ----
  // Block /cuenta/eventos/[id] routes if user lacks the required entitlement or plan
  const eventMatch = path.match(/^\/cuenta\/eventos\/([^/]+)/)
  if (eventMatch) {
    const eventId = eventMatch[1]!
    const { data } = await client
      .from('events')
      .select('entitlement_key, plan')
      .eq('id', eventId)
      .single()
    if (data?.entitlement_key && !hasEntitlement(data.entitlement_key)) {
      return navigateTo('/cuenta/biblioteca')
    }
    if (data?.plan === 'core' && !isSubscriber.value) {
      return navigateTo('/cuenta/biblioteca')
    }
  }
})
