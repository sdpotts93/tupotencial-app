// https://nuxt.com/docs/api/configuration/nuxt-config

// When building for Capacitor (native), use SPA mode (no SSR).
// Set CAPACITOR=true in env to trigger this.
const isCapacitor = process.env.CAPACITOR === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  future: {
    compatibilityVersion: 4,
  },

  // Capacitor requires a static SPA build; web uses SSR
  ssr: !isCapacitor,
  nitro: {
    preset: isCapacitor ? 'static' : 'cloudflare-module',
  },

  devtools: { enabled: !isCapacitor },

  app: {
    head: {
      title: 'Tu Potencial',
      htmlAttrs: { lang: 'es-MX' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Tu sistema de acompañamiento diario para transformar cuerpo, mente y propósito' },
        { name: 'theme-color', content: '#282828' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Tu Potencial' },
        { property: 'og:title', content: 'Tu Potencial' },
        { property: 'og:description', content: 'Tu sistema de acompañamiento diario para transformar cuerpo, mente y propósito' },
        { property: 'og:url', content: 'https://tupotencial.app' },
        { property: 'og:image', content: 'https://tupotencial.app/og-mobile.jpg' },
        { property: 'og:image:secure_url', content: 'https://tupotencial.app/og-mobile.jpg' },
        { property: 'og:image:type', content: 'image/jpeg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Tu Potencial' },
        { property: 'og:locale', content: 'es_MX' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Tu Potencial' },
        { name: 'twitter:description', content: 'Tu sistema de acompañamiento diario para transformar cuerpo, mente y propósito' },
        { name: 'twitter:image', content: 'https://tupotencial.app/og-mobile.jpg' },
        { name: 'twitter:image:alt', content: 'Tu Potencial' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'fade' },
    layoutTransition: { name: 'layout' },
  },

  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/fonts.css',
    '~/assets/css/global.css',
    '~/assets/css/transitions.css',
  ],

  site: {
    url: 'https://tupotencial.app',
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
    cookiePrefix: 'sb-app',
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax' as const,
      secure: true,
    },
  },

  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    vimeoToken: process.env.NUXT_VIMEO_TOKEN,
    public: {
      isNative: isCapacitor,
      revenueCatApiKey: process.env.REVENUECAT_API_KEY || '',
    },
  },

  typescript: {
    strict: true,
  },
})
