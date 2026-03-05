// Route protection middleware (global)
// Implements: Public / Authed / Onboarded / Subscriber / Entitled guards
// Per AGENTS.md section 9.6

export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, isOnboarded, isSubscriber } = useAuth()

  // Dev mode: allow direct access to all routes for QA (section 0.0)
  const runtimeConfig = useRuntimeConfig()
  if (runtimeConfig.public.devMode) return

  const path = to.path

  // ---- Public routes (no auth required) ----
  const publicRoutes = ['/login', '/register', '/pricing']
  if (publicRoutes.some(r => path === r || path.startsWith(r + '/'))) return

  // ---- Root redirect ----
  if (path === '/') {
    if (!isLoggedIn.value) return navigateTo('/login')
    if (!isOnboarded.value) return navigateTo('/account/onboarding/segment')
    return navigateTo('/account/hoy')
  }

  // ---- Authed routes ----
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }

  // ---- Authed-only routes (don't need onboarding) ----
  const authedOnlyRoutes = ['/profile-setup', '/account/billing/return']
  if (authedOnlyRoutes.some(r => path === r || path.startsWith(r + '/'))) return

  // ---- Onboarding redirect ----
  if (path === '/account/onboarding/segment') {
    if (isOnboarded.value) return navigateTo('/account/hoy')
    return
  }

  // ---- Onboarded routes ----
  if (!isOnboarded.value) {
    return navigateTo('/account/onboarding/segment')
  }

  // ---- Subscriber-only routes ----
  const subscriberRoutes = ['/account/community', '/account/events']
  const isSubscriberRoute = subscriberRoutes.some(r => path === r || path.startsWith(r + '/'))

  // /account/events/[id]/watch is subscriber-only
  if (path.match(/^\/account\/events\/[^/]+\/watch$/)) {
    if (!isSubscriber.value) {
      const eventId = path.split('/')[3]
      return navigateTo(`/account/events/${eventId}`)
    }
  }

  // Community is subscriber-only
  if (path.startsWith('/account/community') && !isSubscriber.value) {
    // Show locked state by allowing the page to render with gating
    // (handled in the component)
  }

  // ---- Entitlement-gated routes ----
  if (path.startsWith('/account/vip')) {
    const { hasEntitlement } = useAuth()
    if (!hasEntitlement('vip')) {
      return navigateTo('/account/addons')
    }
  }
})
