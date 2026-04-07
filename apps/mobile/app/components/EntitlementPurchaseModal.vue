<template>
  <Transition name="ent">
    <div
      v-if="modelValue"
      class="ent__overlay"
      @click.self="close"
    >
      <div ref="sheetRef" class="ent__sheet" :style="sheetStyle" v-on="dragListeners">
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
          <template v-if="isSubscriptionGate">
            Este contenido requiere la suscripción <strong>{{ addon?.title }}</strong> para acceder.
          </template>
          <template v-else-if="addon">
            Este contenido requiere el complemento <strong>{{ addon.title }}</strong> para acceder.
          </template>
          <template v-else>
            Este contenido requiere un complemento para acceder.
          </template>
        </p>

        <div v-if="addon" class="ent__addon-tag">
          <UiTag v-if="isSubscriptionGate" variant="accent" size="sm">Core</UiTag>
          <UiTag v-else variant="default" size="sm">{{ addon.title }}</UiTag>
        </div>

        <UiButton block variant="secondary" @click="goToAddon">
          {{ isSubscriptionGate ? 'Ver suscripción' : 'Ver complemento' }}
        </UiButton>
      </div>
    </div>
  </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

const isSubscriptionGate = computed(() => props.addon?.id === 'core' || props.addon?.id === 'free')

const sheetRef = ref<HTMLElement | null>(null)

function close() {
  emit('update:modelValue', false)
}

const { translateY, isDragging, dragListeners } = useSheetDrag(sheetRef, close)

const sheetStyle = computed(() => {
  if (translateY.value === 0) return {}
  return {
    transform: `translateY(${translateY.value}px)`,
    transition: isDragging.value ? 'none' : 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
  }
})

function goToAddon() {
  emit('update:modelValue', false)
  if (props.addon) {
    if (isSubscriptionGate.value) {
      navigateTo('/cuenta/suscripcion')
    } else {
      navigateTo(`/cuenta/complementos/${props.addon.id}`)
    }
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
  background: rgba(var(--tint-rgb), 0.4);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
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
}

/* ─── Slide-up transition ─── */
.ent-enter-active {
  transition: background 0.3s ease;
}
.ent-enter-active .ent__sheet {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.ent-leave-active {
  transition: background 0.2s ease;
}
.ent-leave-active .ent__sheet {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.ent-enter-from,
.ent-leave-to {
  background: rgba(var(--tint-rgb), 0);
}
.ent-enter-from .ent__sheet,
.ent-leave-to .ent__sheet {
  transform: translateY(100%);
}

/* ─── Header ─── */
.ent__sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-8);
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
@media (hover: hover) {
  .ent__sheet-close:hover {
    background: var(--color-border-light);
  }
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

.ent__addon-tag {
  margin-bottom: var(--space-6);
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
  }

  .ent-enter-active .ent__sheet {
    transition: transform 0.25s ease, opacity 0.25s ease;
  }
  .ent-leave-active .ent__sheet {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  .ent-enter-from .ent__sheet,
  .ent-leave-to .ent__sheet {
    transform: scale(0.95);
    opacity: 0;
  }

  .ent__sheet-handle {
    display: none;
  }
}
</style>
