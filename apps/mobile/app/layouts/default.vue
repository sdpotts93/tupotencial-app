<template>
  <div class="app-layout">
    <UiBottomNav :items="navItems" :sections="desktopSections" :bottom-items="desktopBottomItems" />

    <!-- Desktop top bar -->
    <header class="app-topbar">
      <div class="app-topbar__left">
        <h1 class="app-topbar__title">{{ pageTitle }}</h1>
      </div>
      <div class="app-topbar__right">
        <NuxtLink to="/hoy/progress" class="app-topbar__streak">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffaa32" stroke-width="2"><path d="M12 2c.3 3.5-1.1 5.8-2.3 7.6C8.5 11.5 9.7 14 12 14c2.8 0 4.7-2.3 5-5 .4 3.2-1.3 8-5 11-3.7-3-5.4-7.8-5-11 .3 2.7 2.2 5 5 5 2.3 0 3.5-2.5 2.3-4.4C13.1 7.8 11.7 5.5 12 2z"/></svg>
          <span>{{ streak }}</span>
        </NuxtLink>
        <div class="app-topbar__avatar" @click="navigateTo('/more')">
          {{ initials }}
        </div>
      </div>
    </header>

    <slot />
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const route = useRoute()

const streak = ref(7)

const initials = computed(() => {
  const name = user.value?.display_name || '?'
  return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
})

const pageTitle = computed(() => {
  const path = route.path
  if (path.startsWith('/hoy')) return 'Inicio'
  if (path.startsWith('/library')) return 'Biblioteca'
  if (path.startsWith('/retos')) return 'Programas'
  if (path.startsWith('/community')) return 'Comunidad'
  if (path.startsWith('/ai')) return 'Coach IA'
  if (path.startsWith('/events')) return 'Eventos'
  if (path.startsWith('/addons')) return 'VIP'
  if (path.startsWith('/benefits')) return 'Beneficios'
  if (path.startsWith('/profile')) return 'Mi Perfil'
  if (path.startsWith('/settings')) return 'Configuración'
  if (path.startsWith('/more')) return 'Cuenta'
  if (path.startsWith('/content')) return 'Contenido'
  if (path.startsWith('/billing')) return 'Facturación'
  return 'Tu Potencial'
})

const navItems = [
  {
    label: 'Biblioteca',
    to: '/library',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
  },
  {
    label: 'Programas',
    to: '/retos',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
  },
  {
    label: 'Hoy',
    to: '/hoy',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  },
  {
    label: 'Comunidad',
    to: '/community',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
  },
  {
    label: 'Perfil',
    to: '/more',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  },
]

const desktopSections = [
  {
    title: 'Herramientas',
    items: [
      {
        label: 'Coach IA',
        to: '/ai',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>',
      },
      {
        label: 'Eventos',
        to: '/events',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      },
    ],
  },
  {
    title: 'Premium',
    items: [
      {
        label: 'VIP',
        to: '/addons',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      },
      {
        label: 'Beneficios',
        to: '/benefits',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
      },
    ],
  },
]

const desktopBottomItems = [
  {
    label: 'Configuración',
    to: '/settings',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  },
]
</script>

<style scoped>
.app-layout {
  min-height: 100dvh;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  background: #FFFFFF;
}

/* Desktop top bar: hidden on mobile */
.app-topbar {
  display: none;
}

/* ─── Desktop: SaaS shell ─── */
@media (min-width: 1024px) {
  .app-layout {
    padding-bottom: 0;
    padding-left: var(--sidebar-width);
    background: var(--color-desktop-bg);
  }

  /* ─── Top bar ─── */
  .app-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--topbar-height);
    padding: 0 var(--space-8);
    background: var(--color-desktop-bg);
    border-bottom: 1px solid var(--color-desktop-border);
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
  }

  .app-topbar__left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .app-topbar__title {
    font-family: var(--font-body);
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    color: var(--color-text);
    margin: 0;
  }

  .app-topbar__right {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .app-topbar__streak {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px var(--space-3);
    background: rgba(255, 170, 50, 0.1);
    border-radius: var(--radius-full);
    text-decoration: none;
    font-family: var(--font-eyebrow);
    font-size: var(--text-sm);
    font-weight: var(--weight-bold);
    color: #d4940a;
    transition: background var(--transition-fast);
  }

  .app-topbar__streak:hover {
    background: rgba(255, 170, 50, 0.18);
    text-decoration: none;
  }

  .app-topbar__avatar {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-full);
    background: var(--color-sand);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    color: var(--color-dark);
    cursor: pointer;
    transition: box-shadow var(--transition-fast);
  }

  .app-topbar__avatar:hover {
    box-shadow: 0 0 0 2px var(--color-desktop-border);
  }
}
</style>
