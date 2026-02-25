// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  app: {
    head: {
      title: 'Tu Potencial',
      htmlAttrs: { lang: 'es-MX' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Tu sistema de acompañamiento diario para transformar cuerpo, mente y propósito' },
        { name: 'theme-color', content: '#282828' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/fonts.css',
    '~/assets/css/global.css',
    '~/assets/css/transitions.css',
  ],

  modules: ['@nuxt/icon'],

  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseKey: '',
      isNative: false,
      devMode: true,
    },
  },

  typescript: {
    strict: true,
  },
})