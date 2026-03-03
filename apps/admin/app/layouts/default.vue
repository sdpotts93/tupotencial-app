<template>
  <div class="admin-layout">
    <aside :class="['admin-layout__sidebar', { 'admin-layout__sidebar--open': sidebarOpen }]">
      <div class="sidebar-nav__logo">
        <img src="/logo-word/logo-word-black.png" alt="Tu Potencial" />
      </div>

      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="['sidebar-nav__item', { 'sidebar-nav__item--active': isActive(item.to) }]"
        @click="sidebarOpen = false"
      >
        <span class="sidebar-nav__icon" v-html="item.icon" />
        <span class="sidebar-nav__label">{{ item.label }}</span>
      </NuxtLink>

      <template v-for="section in sections" :key="section.title">
        <div class="sidebar-nav__section">
          <span class="sidebar-nav__section-title">{{ section.title }}</span>
          <NuxtLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            :class="['sidebar-nav__item', { 'sidebar-nav__item--active': isActive(item.to) }]"
            @click="sidebarOpen = false"
          >
            <span class="sidebar-nav__icon" v-html="item.icon" />
            <span class="sidebar-nav__label">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </template>

      <div class="sidebar-nav__spacer" />

      <div class="sidebar-nav__bottom">
        <button class="sidebar-nav__item" @click="logout">
          <span class="sidebar-nav__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </span>
          <span class="sidebar-nav__label">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Mobile overlay for sidebar -->
    <div
      v-if="sidebarOpen"
      class="admin-layout__overlay"
      @click="sidebarOpen = false"
    />

    <div class="admin-layout__main">
      <header class="admin-layout__topbar">
        <div class="admin-layout__topbar-left">
          <button class="admin-layout__menu-btn" @click="sidebarOpen = !sidebarOpen">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <h1 class="admin-layout__topbar-title">{{ pageTitle }}</h1>
        </div>
        <div class="admin-layout__topbar-right">
          <div class="admin-layout__avatar">
            {{ initials }}
          </div>
        </div>
      </header>

      <main class="admin-layout__body">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { adminUser, logout } = useAdminAuth()
const sidebarOpen = ref(false)

const initials = computed(() => {
  const name = adminUser.value?.full_name || 'Admin'
  return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
})

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/admin' || path === '/admin/') return 'Dashboard'
  if (path.startsWith('/admin/content')) return 'Contenido'
  if (path.startsWith('/admin/categories')) return 'Categorías'
  if (path.startsWith('/admin/programs')) return 'Programas'
  if (path.startsWith('/admin/hoy')) return 'Hoy'
  if (path.startsWith('/admin/community')) return 'Comunidad'
  if (path.startsWith('/admin/events')) return 'Eventos'
  if (path.startsWith('/admin/benefits')) return 'Beneficios'
  if (path.startsWith('/admin/addons')) return 'Add-ons'
  if (path.startsWith('/admin/users')) return 'Usuarios'
  if (path.startsWith('/admin/roles')) return 'Roles'
  if (path.startsWith('/admin/settings')) return 'Configuración'
  return 'Tu Potencial'
})

interface NavItem {
  label: string
  to: string
  icon: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/admin',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  },
  {
    label: 'Contenido',
    to: '/admin/content',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 4v16"/><path d="M4 8h16"/></svg>',
  },
  {
    label: 'Categorías',
    to: '/admin/categories',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><line x1="14" y1="6.5" x2="21" y2="6.5"/><line x1="14" y1="17.5" x2="21" y2="17.5"/></svg>',
  },
  {
    label: 'Programas',
    to: '/admin/programs',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
  },
  {
    label: 'Hoy',
    to: '/admin/hoy',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  },
  {
    label: 'Comunidad',
    to: '/admin/community',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
  },
]

const sections: NavSection[] = [
  {
    title: 'Marketplace',
    items: [
      {
        label: 'Eventos',
        to: '/admin/events',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      },
      {
        label: 'Beneficios',
        to: '/admin/benefits',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
      },
      {
        label: 'Add-ons',
        to: '/admin/addons',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        label: 'Usuarios',
        to: '/admin/users',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      },
      {
        label: 'Roles',
        to: '/admin/roles',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      },
      {
        label: 'Configuración',
        to: '/admin/settings',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
      },
    ],
  },
]

function isActive(to: string): boolean {
  if (to === '/admin') {
    return route.path === '/admin' || route.path === '/admin/'
  }
  return route.path.startsWith(to)
}
</script>

<style scoped>
/* ─── Mobile: overlay sidebar ─── */
.admin-layout {
  display: flex;
  min-height: 100dvh;
}

.admin-layout__sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  z-index: var(--z-modal);
  background: var(--color-desktop-card);
  border-right: 1px solid var(--color-desktop-border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  transform: translateX(-100%);
  transition: transform var(--transition-base);
}

.admin-layout__sidebar::-webkit-scrollbar {
  display: none;
}

.admin-layout__sidebar--open {
  transform: translateX(0);
}

.admin-layout__overlay {
  position: fixed;
  inset: 0;
  background: rgba(var(--tint-rgb), 0.4);
  z-index: calc(var(--z-modal) - 1);
}

.admin-layout__main {
  flex: 1;
  min-height: 100dvh;
  background: var(--color-white);
}

/* ─── Topbar ─── */
.admin-layout__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--topbar-height);
  padding: 0 var(--space-5);
  background: var(--color-white);
  border-bottom: 1px solid var(--color-desktop-border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.admin-layout__topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.admin-layout__topbar-title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.admin-layout__topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.admin-layout__menu-btn {
  display: flex;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  padding: var(--space-2);
}

.admin-layout__avatar {
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

.admin-layout__avatar:hover {
  box-shadow: 0 0 0 2px var(--color-desktop-border);
}

.admin-layout__body {
  padding: var(--space-6);
}

/* ─── Sidebar nav items ─── */
.sidebar-nav__logo {
  display: flex;
  align-items: center;
  padding: var(--space-5) var(--space-6) var(--space-6);
  flex-shrink: 0;
}

.sidebar-nav__logo img {
  height: 20px;
  width: auto;
}

.sidebar-nav__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 9px var(--space-5);
  border-radius: var(--radius-md);
  margin: 1px var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  width: calc(100% - var(--space-3) * 2);
  text-align: left;
  border-left: 3px solid transparent;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}

.sidebar-nav__item:hover {
  background: rgba(var(--tint-rgb), 0.04);
  color: var(--color-text);
  text-decoration: none;
}

.sidebar-nav__item--active {
  background: rgba(var(--tint-rgb), 0.06);
  color: var(--color-text);
  border-left-color: var(--color-primary);
}

.sidebar-nav__item--active .sidebar-nav__label {
  font-weight: var(--weight-semibold);
}

.sidebar-nav__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.sidebar-nav__icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.sidebar-nav__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── Section titles ─── */
.sidebar-nav__section {
  display: flex;
  flex-direction: column;
  padding-top: var(--space-4);
  margin-top: var(--space-2);
  border-top: 1px solid var(--color-desktop-border);
}

.sidebar-nav__section-title {
  display: block;
  font-family: var(--font-eyebrow);
  font-size: 10px;
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
  padding: 0 var(--space-6) var(--space-2);
}

/* ─── Spacer + bottom items ─── */
.sidebar-nav__spacer {
  flex: 1;
}

.sidebar-nav__bottom {
  display: flex;
  flex-direction: column;
  padding-top: var(--space-3);
  padding-bottom: var(--space-4);
  margin-top: var(--space-2);
  border-top: 1px solid var(--color-desktop-border);
  flex-shrink: 0;
}

.sidebar-nav__bottom .sidebar-nav__item {
  color: var(--color-muted);
}

.sidebar-nav__bottom .sidebar-nav__item:hover {
  color: var(--color-text-secondary);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .admin-layout__sidebar {
    transform: translateX(0);
    z-index: var(--z-sticky);
  }

  .admin-layout__overlay {
    display: none;
  }

  .admin-layout__main {
    margin-left: var(--sidebar-width);
    background: var(--color-desktop-bg);
  }

  .admin-layout__topbar {
    padding: 0 var(--space-8);
    background: var(--color-desktop-bg);
  }

  .admin-layout__menu-btn {
    display: none;
  }

  .admin-layout__body {
    padding: var(--space-6) var(--space-8);
  }
}
</style>
