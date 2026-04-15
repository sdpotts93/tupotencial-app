<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="modal-backdrop" @click.self="close">
        <div
          ref="sheetRef"
          class="modal"
          role="dialog"
          :aria-label="title"
          :style="sheetStyle"
          v-on="dragListeners"
        >
          <div class="modal__header">
            <div class="modal__handle" />
            <button v-if="showClose" class="modal__close" aria-label="Cerrar" @click="close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <h2 v-if="title" class="modal__title">{{ title }}</h2>
          <div class="modal__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  showClose?: boolean
}

withDefaults(defineProps<Props>(), {
  showClose: true,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

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
</script>

<style scoped>
/* ─── Overlay ─── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(var(--tint-rgb), 0.4);
  z-index: var(--z-modal-backdrop);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* ─── Sheet (mobile-first) ─── */
.modal {
  background: var(--color-accent);
  color: var(--color-text);
  width: 100%;
  max-height: 85dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--space-2) var(--space-6) var(--space-10);
}

/* ─── Mobile slide-up transition ─── */
.sheet-enter-active {
  transition: background 0.3s ease;
}
.sheet-enter-active .modal {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-leave-active {
  transition: background 0.2s ease;
}
.sheet-leave-active .modal {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  background: rgba(var(--tint-rgb), 0);
}
.sheet-enter-from .modal,
.sheet-leave-to .modal {
  transform: translateY(100%);
}

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-8);
}

.modal__handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin-top: var(--space-2);
}

.modal__close {
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
  .modal__close:hover {
    background: var(--color-border-light);
  }
}

.modal__title {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin: var(--space-10) 0 var(--space-2);
  font-weight: 100;
}

.modal__body { padding: 0; }
.modal__footer { padding: 0; margin-top: var(--space-4); }

@media (prefers-reduced-motion: reduce) {
  .modal-backdrop,
  .modal {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}

/* ─── Desktop: centered modal instead of bottom sheet ─── */
@media (min-width: 1024px) {
  .modal-backdrop {
    align-items: center;
    justify-content: center;
  }

  .modal {
    border-radius: var(--radius-xl);
    max-width: 480px;
    width: 100%;
    max-height: 80dvh;
  }

  .sheet-enter-active .modal {
    transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;
  }
  .sheet-leave-active .modal {
    transition: transform 0.2s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease;
  }
  .sheet-enter-from .modal,
  .sheet-leave-to .modal {
    transform: scale(0.95);
    opacity: 0;
  }

  .modal__handle {
    display: none;
  }
}
</style>
