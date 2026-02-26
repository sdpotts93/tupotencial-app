<template>
  <div class="screen">
    <div class="screen__content">
      <!-- Standard header -->
      <header class="settings__header">
        <button class="settings__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="settings__header-title">Configuración</h1>
      </header>

      <UiList>
        <UiListItem label="Notificaciones" description="Gestionar permisos y preferencias" clickable>
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </template>
        </UiListItem>
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

      <p class="settings__version">Tu Potencial v1.0.0 (MVP)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })
</script>

<style scoped>
/* ─── Header (standard) ─── */
.settings__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.settings__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.settings__back {
  position: absolute;
  left: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-inverse);
  cursor: pointer;
  border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}
.settings__back:hover { background: rgba(0, 0, 0, 0.04); }

.settings__version {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-4);
}
</style>
