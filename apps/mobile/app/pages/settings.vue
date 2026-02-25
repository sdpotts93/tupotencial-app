<template>
  <div class="screen">
    <UiTopNav title="Configuración" show-back @back="navigateTo('/more')" />
    <div class="screen__content">
      <UiList>
        <UiListItem label="Notificaciones" description="Gestionar permisos y preferencias" clickable>
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Idioma" description="Español (México)">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Apariencia" description="Claro">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          </template>
        </UiListItem>
      </UiList>

      <div style="height: var(--space-4);" />

      <UiList>
        <UiListItem label="Términos y condiciones" clickable>
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Política de privacidad" clickable>
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Soporte" description="soporte@tupotencial.app">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </template>
        </UiListItem>
      </UiList>

      <div class="settings__logout">
        <UiButton variant="danger" block @click="handleLogout">Cerrar sesión</UiButton>
      </div>

      <p class="settings__version">Tu Potencial v1.0.0 (MVP)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const { logout } = useAuth()

function handleLogout() { logout() }
</script>

<style scoped>
.settings__logout { margin-top: var(--space-8); }
.settings__version {
  text-align: center; font-size: var(--text-xs); color: var(--color-muted);
  margin-top: var(--space-4);
}
</style>
