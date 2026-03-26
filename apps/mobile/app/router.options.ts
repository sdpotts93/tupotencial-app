import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(_to, _from, savedPosition) {
    // Wait for the page transition to finish before scrolling
    return new Promise((resolve) => {
      const nuxtApp = useNuxtApp()
      nuxtApp.hooks.hookOnce('page:transition:finish', () => {
        resolve(savedPosition || { top: 0 })
      })
    })
  },
}
