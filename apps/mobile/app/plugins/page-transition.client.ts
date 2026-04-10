export default defineNuxtPlugin(() => {
  const router = useRouter()

  const onboardingPaths = ['/configurar-perfil', '/cuenta/bienvenida/segmento']
  const accountTabPaths = new Set([
    '/cuenta/hoy',
    '/cuenta/biblioteca',
    '/cuenta/retos',
    '/cuenta/comunidad',
    '/cuenta/mas',
  ])

  function normalizePath(path: string) {
    if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
    return path
  }

  function isAccountPath(path: string) {
    return path === '/cuenta' || path.startsWith('/cuenta/')
  }

  function resolveLayout(meta: Record<string, any>) {
    if (meta.layout === false) return false
    return typeof meta.layout === 'string' ? meta.layout : 'default'
  }

  function defaultPageTransition() {
    return { name: 'fade', mode: 'out-in' as const }
  }

  function defaultLayoutTransition() {
    return { name: 'layout', mode: 'out-in' as const }
  }

  function stackTransition() {
    return { name: 'account-stack' }
  }

  router.beforeEach((to, from) => {
    if (!from.name) return

    const fromPath = normalizePath(from.path)
    const toPath = normalizePath(to.path)

    if (fromPath === toPath) return

    const fromOnboarding = onboardingPaths.includes(fromPath)
    const toOnboarding = onboardingPaths.includes(toPath)

    if (fromOnboarding && toOnboarding) {
      to.meta.pageTransition = { name: 'slide-left', mode: 'out-in' }
      from.meta.pageTransition = { name: 'slide-left', mode: 'out-in' }
      to.meta.layoutTransition = defaultLayoutTransition()
      from.meta.layoutTransition = defaultLayoutTransition()
      return
    }

    const fromAccount = isAccountPath(fromPath)
    const toAccount = isAccountPath(toPath)
    const betweenMainTabs = accountTabPaths.has(fromPath) && accountTabPaths.has(toPath)

    if (!fromAccount || !toAccount || betweenMainTabs) {
      to.meta.pageTransition = defaultPageTransition()
      from.meta.pageTransition = defaultPageTransition()
      to.meta.layoutTransition = defaultLayoutTransition()
      from.meta.layoutTransition = defaultLayoutTransition()
      return
    }

    const layoutChanged = resolveLayout(from.meta) !== resolveLayout(to.meta)

    if (layoutChanged) {
      to.meta.pageTransition = false
      from.meta.pageTransition = false
      to.meta.layoutTransition = stackTransition()
      from.meta.layoutTransition = stackTransition()
      return
    }

    to.meta.pageTransition = stackTransition()
    from.meta.pageTransition = stackTransition()
    to.meta.layoutTransition = false
    from.meta.layoutTransition = false
  })
})
