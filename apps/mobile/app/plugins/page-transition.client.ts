export default defineNuxtPlugin(() => {
  const router = useRouter()
  const root = document.documentElement
  let currentHistoryPosition = Number(window.history.state?.position ?? 0)

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

  function accountPageTransition() {
    return { name: 'account-route' as const }
  }

  function defaultLayoutTransition() {
    return { name: 'layout', mode: 'out-in' as const }
  }

  function stackTransition(direction: 'back' | 'forward' = 'forward') {
    return { name: direction === 'back' ? 'account-stack-back' : 'account-stack' }
  }

  function serializeTransition(transition: unknown) {
    if (transition === false) return false
    if (!transition || typeof transition !== 'object') return transition ?? null

    const value = transition as { name?: string; mode?: string }
    return {
      name: value.name ?? null,
      mode: value.mode ?? null,
    }
  }

  function setAccountPageTransition(kind: 'fade' | 'account-stack' | 'account-stack-back' | 'none') {
    root.dataset.accountPageTransition = kind
  }

  router.beforeEach((to, from) => {
    if (!from.name) return

    const fromPath = normalizePath(from.path)
    const toPath = normalizePath(to.path)

    if (fromPath === toPath) return

    const fromOnboarding = onboardingPaths.includes(fromPath)
    const toOnboarding = onboardingPaths.includes(toPath)
    if (fromOnboarding && toOnboarding) {
      setAccountPageTransition('none')
      to.meta.pageTransition = { name: 'slide-left', mode: 'out-in' }
      from.meta.pageTransition = { name: 'slide-left', mode: 'out-in' }
      to.meta.layoutTransition = defaultLayoutTransition()
      from.meta.layoutTransition = defaultLayoutTransition()
      console.log('[page-transition][beforeEach]', {
        from: fromPath,
        to: toPath,
        branch: 'onboarding',
        history: {
          current: currentHistoryPosition,
          next: Number(window.history.state?.position ?? currentHistoryPosition),
        },
        pageTransition: {
          to: serializeTransition(to.meta.pageTransition),
          from: serializeTransition(from.meta.pageTransition),
        },
        layoutTransition: {
          to: serializeTransition(to.meta.layoutTransition),
          from: serializeTransition(from.meta.layoutTransition),
        },
      })
      return
    }

    const fromAccount = isAccountPath(fromPath)
    const toAccount = isAccountPath(toPath)
    const betweenMainTabs = accountTabPaths.has(fromPath) && accountTabPaths.has(toPath)

    if (fromAccount && toAccount && betweenMainTabs) {
      setAccountPageTransition('fade')
      to.meta.pageTransition = accountPageTransition()
      from.meta.pageTransition = accountPageTransition()
      to.meta.layoutTransition = false
      from.meta.layoutTransition = false
      console.log('[page-transition][beforeEach]', {
        from: fromPath,
        to: toPath,
        branch: 'between-main-tabs-account-route',
        history: {
          current: currentHistoryPosition,
          next: Number(window.history.state?.position ?? currentHistoryPosition),
        },
        pageTransition: {
          to: serializeTransition(to.meta.pageTransition),
          from: serializeTransition(from.meta.pageTransition),
        },
        layoutTransition: {
          to: serializeTransition(to.meta.layoutTransition),
          from: serializeTransition(from.meta.layoutTransition),
        },
        accountPageTransition: root.dataset.accountPageTransition ?? null,
      })
      return
    }

    if (!fromAccount || !toAccount) {
      setAccountPageTransition('none')
      to.meta.pageTransition = defaultPageTransition()
      from.meta.pageTransition = defaultPageTransition()
      to.meta.layoutTransition = defaultLayoutTransition()
      from.meta.layoutTransition = defaultLayoutTransition()
      console.log('[page-transition][beforeEach]', {
        from: fromPath,
        to: toPath,
        branch: betweenMainTabs ? 'between-main-tabs' : 'default',
        history: {
          current: currentHistoryPosition,
          next: Number(window.history.state?.position ?? currentHistoryPosition),
        },
        pageTransition: {
          to: serializeTransition(to.meta.pageTransition),
          from: serializeTransition(from.meta.pageTransition),
        },
        layoutTransition: {
          to: serializeTransition(to.meta.layoutTransition),
          from: serializeTransition(from.meta.layoutTransition),
        },
        accountPageTransition: root.dataset.accountPageTransition ?? null,
      })
      return
    }

    const layoutChanged = resolveLayout(from.meta) !== resolveLayout(to.meta)
    const nextHistoryPosition = Number(window.history.state?.position ?? currentHistoryPosition)
    const stackDirection = nextHistoryPosition < currentHistoryPosition ? 'back' : 'forward'

    if (layoutChanged) {
      setAccountPageTransition('none')
      to.meta.pageTransition = false
      from.meta.pageTransition = false
      to.meta.layoutTransition = stackTransition(stackDirection)
      from.meta.layoutTransition = stackTransition(stackDirection)
      console.log('[page-transition][beforeEach]', {
        from: fromPath,
        to: toPath,
        branch: 'layout-changed-account-stack',
        layoutChanged,
        stackDirection,
        history: {
          current: currentHistoryPosition,
          next: nextHistoryPosition,
        },
        pageTransition: {
          to: serializeTransition(to.meta.pageTransition),
          from: serializeTransition(from.meta.pageTransition),
        },
        layoutTransition: {
          to: serializeTransition(to.meta.layoutTransition),
          from: serializeTransition(from.meta.layoutTransition),
        },
        accountPageTransition: root.dataset.accountPageTransition ?? null,
      })
      return
    }

    setAccountPageTransition(stackDirection === 'back' ? 'account-stack-back' : 'account-stack')
    to.meta.pageTransition = accountPageTransition()
    from.meta.pageTransition = accountPageTransition()
    to.meta.layoutTransition = false
    from.meta.layoutTransition = false
    console.log('[page-transition][beforeEach]', {
      from: fromPath,
      to: toPath,
      branch: 'account-stack-account-route',
      layoutChanged,
      stackDirection,
      history: {
        current: currentHistoryPosition,
        next: nextHistoryPosition,
      },
      pageTransition: {
        to: serializeTransition(to.meta.pageTransition),
        from: serializeTransition(from.meta.pageTransition),
      },
      layoutTransition: {
        to: serializeTransition(to.meta.layoutTransition),
        from: serializeTransition(from.meta.layoutTransition),
      },
      accountPageTransition: root.dataset.accountPageTransition ?? null,
    })
  })

  router.afterEach((to, from) => {
    currentHistoryPosition = Number(window.history.state?.position ?? currentHistoryPosition)
    console.log('[page-transition][afterEach]', {
      from: normalizePath(from.path),
      to: normalizePath(to.path),
      historyPosition: currentHistoryPosition,
      pageTransition: serializeTransition(to.meta.pageTransition),
      layoutTransition: serializeTransition(to.meta.layoutTransition),
      accountPageTransition: root.dataset.accountPageTransition ?? null,
    })
  })
})
