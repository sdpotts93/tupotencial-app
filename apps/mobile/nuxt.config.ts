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
    preset: isCapacitor ? 'static' : 'cloudflare-pages',
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
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'fade', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
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
    public: {
      isNative: isCapacitor,
      stripeWorkerUrl: process.env.STRIPE_WORKER_URL || '',
    },
  },

  typescript: {
    strict: true,
  },
})