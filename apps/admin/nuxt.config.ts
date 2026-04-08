// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  future: {
    compatibilityVersion: 4,
  },

  nitro: {
    preset: 'cloudflare-pages',
  },

  devtools: { enabled: true },

  app: {
    head: {
      title: 'Tu Potencial — Admin',
      htmlAttrs: { lang: 'es-MX' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Tu Potencial Admin Panel' },
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
    '~/assets/css/admin.css',
    '~/assets/css/datepicker-overrides.css',
  ],

  site: {
    url: 'https://admin.tupotencial.app',
  },

  modules: ['@nuxt/icon', '@nuxtjs/supabase', '@nuxtjs/robots', '@nuxtjs/sitemap'],

  robots: {
    disallow: ['/'],
  },

  sitemap: {
    enabled: false,
  },

  supabase: {
    redirect: false,
    cookiePrefix: 'sb-admin',
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax' as const,
      secure: true,
    },
  },

  runtimeConfig: {
    public: {},
  },

  typescript: {
    strict: true,
  },
})