<template>
  <div class="admin-layout">
    <aside :class="['admin-layout__sidebar', { 'admin-layout__sidebar--open': sidebarOpen }]">
      <nav class="sidebar-nav">
        <div class="sidebar-nav__logo">
          <img src="/logo-icon/logo-icon-blue.png" alt="Tu Potencial" />
        </div>

        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="['sidebar-nav__item', { 'sidebar-nav__item--active': isActive(item.to) }]"
          @click="sidebarOpen = false"
        >
          <svg class="sidebar-nav__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path :d="item.icon" />
          </svg>
          {{ item.label }}
        </NuxtLink>

        <div class="sidebar-nav__divider" />

        <NuxtLink
          v-for="item in secondaryNav"
          :key="item.to"
          :to="item.to"
          :class="['sidebar-nav__item', { 'sidebar-nav__item--active': isActive(item.to) }]"
          @click="sidebarOpen = false"
        >
          <svg class="sidebar-nav__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path :d="item.icon" />
          </svg>
          {{ item.label }}
        </NuxtLink>

        <div class="sidebar-nav__divider" />

        <button class="sidebar-nav__item" @click="logout">
          <svg class="sidebar-nav__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3M14 14l3-3m0 0l-3-3m3 3H7" />
          </svg>
          Cerrar sesion
        </button>
      </nav>
    </aside>

    <div class="admin-layout__main">
      <header class="admin-layout__header">
        <button class="admin-layout__menu-btn" @click="sidebarOpen = !sidebarOpen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <div class="admin-layout__header-user">
          <span class="admin-layout__header-name">{{ adminUser?.full_name ?? 'Admin' }}</span>
          <span class="admin-layout__header-role eyebrow">{{ adminUser?.role ?? 'admin' }}</span>
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

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'M3 10l7-7 7 7M5 8v8a2 2 0 002 2h6a2 2 0 002-2V8' },
  { to: '/admin/content', label: 'Contenido', icon: 'M4 4h12v12H4zM8 4v12M4 8h12' },
  { to: '/admin/categories', label: 'Categorias', icon: 'M3 7h4v4H3zM3 13h4v4H3zM9 8h8M9 14h8' },
  { to: '/admin/programs', label: 'Programas', icon: 'M4 6h12M4 10h12M4 14h8M16 13l2 2 3-3' },
  { to: '/admin/hoy', label: 'Hoy', icon: 'M6 2v2M14 2v2M3 6h14a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1zM2 10h16' },
  { to: '/admin/community', label: 'Comunidad', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-1l-3 3v-3H8a2 2 0 01-2-2v-1M13 3H5a2 2 0 00-2 2v6a2 2 0 002 2h1l3 3v-3h4a2 2 0 002-2V5a2 2 0 00-2-2z' },
  { to: '/admin/events', label: 'Eventos', icon: 'M8 2v2M16 2v2M3 6h18v13a1 1 0 01-1 1H4a1 1 0 01-1-1V6zM3 10h18M10 14h4' },
  { to: '/admin/benefits', label: 'Beneficios', icon: 'M12 2l2.09 6.26L20 9.27l-4.91 3.82L16.18 20 12 16.77 7.82 20l1.09-6.91L4 9.27l5.91-1.01L12 2z' },
  { to: '/admin/addons', label: 'Add-ons', icon: 'M12 4v16M4 12h16' },
]

const secondaryNav = [
  { to: '/admin/users', label: 'Usuarios', icon: 'M16 14v1a3 3 0 01-3 3H7a3 3 0 01-3-3v-1M13 7a3 3 0 11-6 0 3 3 0 016 0zM17 8l2 2-2 2M15 10h4' },
  { to: '/admin/roles', label: 'Roles', icon: 'M9 12l2 2 4-4M5 3h10a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z' },
  { to: '/admin/settings', label: 'Configuracion', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V19a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005 13.18a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 7.08a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H19a2 2 0 010 4h-.09c-.658.003-1.25.396-1.51 1z' },
]

function isActive(to: string): boolean {
  if (to === '/admin') {
    return route.path === '/admin' || route.path === '/admin/'
  }
  return route.path.startsWith(to)
}
</script>

<style scoped>
.admin-layout__menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  padding: var(--space-2);
}

.admin-layout__header-user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: auto;
}

.admin-layout__header-name {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.admin-layout__header-role {
  font-size: var(--eyebrow-sm);
}

@media (max-width: 1023px) {
  .admin-layout__menu-btn {
    display: flex;
  }
}
</style>
