<template>
  <div class="screen">
    <div class="screen__content">
      <!-- Profile header -->
      <div class="more__profile">
        <div class="more__avatar"><span>{{ initials }}</span></div>
        <div class="more__info">
          <h2 class="more__name">{{ user?.display_name }}</h2>
          <UiTag v-if="isSubscriber" variant="accent" size="sm">Miembro Core</UiTag>
          <UiTag v-else variant="default" size="sm">Gratis</UiTag>
        </div>
      </div>

      <!-- Menu (inspired by inspiration-settings) -->
      <UiList>
        <UiListItem label="Eventos y Lives" description="Sesiones en vivo semanales con Gabriel y Carlotta" to="/events">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Beneficios" description="Alianzas y descuentos exclusivos para miembros" to="/benefits">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Add-ons / VIP" description="Mentorías, retiros y experiencias premium" to="/addons">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Coach IA" description="Acompañamiento diario personalizado por IA" to="/ai">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </template>
        </UiListItem>
      </UiList>

      <div style="height: var(--space-4);" />

      <UiList>
        <UiListItem label="Mi perfil" description="Edita tu nombre, foto y segmento" to="/profile">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Configuración" description="Notificaciones y preferencias" to="/settings">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </template>
        </UiListItem>
      </UiList>

      <div class="more__logout">
        <UiButton variant="ghost" block @click="handleLogout">
          Cerrar sesión
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isSubscriber, logout } = useAuth()

const initials = computed(() => {
  const name = user.value?.display_name || '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})

function handleLogout() {
  logout()
}
</script>

<style scoped>
.more__profile {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding: var(--space-4) 0;
}

.more__avatar {
  width: 56px; height: 56px; border-radius: 50%; background: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-primary-contrast); font-size: var(--text-lg); font-weight: var(--weight-semibold);
}

.more__info { display: flex; flex-direction: column; gap: var(--space-1); }
.more__name { font-size: var(--text-lg); font-weight: var(--weight-semibold); }

.more__logout { margin-top: var(--space-8); }
</style>
