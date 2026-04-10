import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  // scrollBehavior(to, _from, savedPosition) {
  //   const pageTransition = typeof to.meta.pageTransition === 'object' ? to.meta.pageTransition : null
  //   const layoutTransition = typeof to.meta.layoutTransition === 'object' ? to.meta.layoutTransition : null
  //   const usesAccountStack =
  //     pageTransition?.name === 'account-stack'
  //     || layoutTransition?.name === 'account-stack'

  //   if (usesAccountStack) {
  //     return savedPosition || { top: 0 }
  //   }

  //   return new Promise((resolve) => {
  //     const nuxtApp = useNuxtApp()
  //     nuxtApp.hooks.hookOnce('page:transition:finish', () => {
  //       resolve(savedPosition || { top: 0 })
  //     })
  //   })
  // },
}
