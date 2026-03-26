export default defineNuxtPlugin(() => {
  const router = useRouter()

  const onboardingPaths = ['/configurar-perfil', '/cuenta/bienvenida/segmento']

  router.beforeEach((to, from) => {
    if (!from.name) return

    const fromOnboarding = onboardingPaths.includes(from.path)
    const toOnboarding = onboardingPaths.includes(to.path)

    if (fromOnboarding && toOnboarding) {
      to.meta.pageTransition = { name: 'slide-left', mode: 'out-in' }
      from.meta.pageTransition = { name: 'slide-left', mode: 'out-in' }
    }
  })
})
