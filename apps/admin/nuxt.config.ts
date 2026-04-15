// https://nuxt.com/docs/api/configuration/nuxt-config
const isLocalDev = process.env.NODE_ENV !== 'production'
const defaultAdminAppUrl = isLocalDev ? 'http://localhost:3001' : 'https://admin.tupotencial.app'
const defaultAdminAllowedOrigins = [
  defaultAdminAppUrl,
  'http://localhost:3001',
  'http://127.0.0.1:3001',
]

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  future: {
    compatibilityVersion: 4,
  },

  nitro: {
    preset: 'cloudflare-module',
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
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Tu Potencial Admin' },
        { property: 'og:title', content: 'Tu Potencial — Admin' },
        { property: 'og:description', content: 'Tu Potencial Admin Panel' },
        { property: 'og:url', content: 'https://admin.tupotencial.app' },
        { property: 'og:image', content: 'https://admin.tupotencial.app/og-admin.jpg' },
        { property: 'og:image:secure_url', content: 'https://admin.tupotencial.app/og-admin.jpg' },
        { property: 'og:image:type', content: 'image/jpeg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Tu Potencial — Admin' },
        { property: 'og:locale', content: 'es_MX' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Tu Potencial — Admin' },
        { name: 'twitter:description', content: 'Tu Potencial Admin Panel' },
        { name: 'twitter:image', content: 'https://admin.tupotencial.app/og-admin.jpg' },
        { name: 'twitter:image:alt', content: 'Tu Potencial — Admin' },
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
    vimeoToken: '',
    adminAppUrl: process.env.NUXT_ADMIN_APP_URL || defaultAdminAppUrl,
    adminAllowedOrigins: process.env.NUXT_ADMIN_ALLOWED_ORIGINS
      ?.split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
      || defaultAdminAllowedOrigins,
    public: {},
  },

  typescript: {
    strict: true,
  },
})
