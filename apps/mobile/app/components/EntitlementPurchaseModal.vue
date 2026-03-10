<template>
  <div
    class="ent__overlay"
    :class="{ 'ent__overlay--active': modelValue }"
    @click.self="close"
  >
    <div class="ent__sheet">
      <div class="ent__sheet-header">
        <div class="ent__sheet-handle" />
        <button class="ent__sheet-close" aria-label="Cerrar" @click="close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="ent__body">
        <div class="ent__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>

        <h1 class="ent__sheet-title">Contenido exclusivo</h1>
        <p class="ent__sheet-subtitle">
          {{ addon?.description ?? 'Este contenido requiere un complemento para acceder.' }}
        </p>

        <div v-if="addon" class="ent__addon-card">
          <span class="ent__addon-name">{{ addon.title }}</span>
        </div>

        <UiButton block variant="secondary" @click="goToAddon">Ver complemento</UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AddonInfo {
  id: string
  title: string
  description: string | null
}

const props = defineProps<{
  modelValue: boolean
  addon: AddonInfo | null
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function close() {
  emit('update:modelValue', false)
}

function goToAddon() {
  emit('update:modelValue', false)
  if (props.addon) {
    navigateTo(`/cuenta/complementos/${props.addon.id}`)
  } else {
    navigateTo('/cuenta/complementos')
  }
}
</script>

<style scoped>
/* ─── Overlay ─── */
.ent__overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(var(--tint-rgb), 0);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  pointer-events: none;
  transition: background var(--transition-base);
}

.ent__overlay--active {
  background: rgba(var(--tint-rgb), 0.4);
  pointer-events: auto;
}

/* ─── Sheet ─── */
.ent__sheet {
  background: var(--color-accent);
  color: var(--color-text);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--space-2) var(--space-6) var(--space-10);
  max-height: 85dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.ent__overlay--active .ent__sheet {
  transform: translateY(0);
}

/* ─── Header ─── */
.ent__sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.ent__sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin-top: var(--space-2);
}

.ent__sheet-close {
  position: absolute;
  right: 0;
  top: 10px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.ent__sheet-close:hover {
  background: var(--color-border-light);
}

/* ─── Body ─── */
.ent__body {
  text-align: center;
}

.ent__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-full);
  margin: var(--space-4) auto var(--space-6);
  color: var(--color-muted);
}

.ent__sheet-title {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-2);
  font-weight: 100;
}

.ent__sheet-subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-6);
}

.ent__addon-card {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-6);
}

.ent__addon-name {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

/* ─── Desktop: centered modal ─── */
@media (min-width: 1024px) {
  .ent__overlay {
    justify-content: center;
    align-items: center;
  }

  .ent__sheet {
    border-radius: var(--radius-xl);
    max-width: 480px;
    width: 100%;
    max-height: 80dvh;
    transform: scale(0.95);
    opacity: 0;
    transition: transform 0.25s ease, opacity 0.25s ease;
  }

  .ent__overlay--active .ent__sheet {
    transform: scale(1);
    opacity: 1;
  }

  .ent__sheet-handle {
    display: none;
  }
}
</style>
