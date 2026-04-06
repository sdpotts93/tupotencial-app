<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div
        v-if="state.open"
        class="confirm-overlay"
        @click.self="handleCancel"
      >
        <div
          ref="sheetRef"
          class="confirm-sheet"
          :style="sheetStyle"
          v-on="dragListeners"
        >
          <div class="confirm-sheet__header">
            <div class="confirm-sheet__handle" />
            <button class="confirm-sheet__close" aria-label="Cerrar" @click="handleCancel">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="confirm-sheet__icon" :class="`confirm-sheet__icon--${state.variant}`">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <h2 class="confirm-sheet__title">{{ state.title }}</h2>
          <p class="confirm-sheet__message">{{ state.message }}</p>

          <div class="confirm-sheet__actions">
            <button class="confirm-sheet__btn confirm-sheet__btn--cancel" @click="handleCancel">
              {{ state.cancelLabel }}
            </button>
            <button
              class="confirm-sheet__btn"
              :class="`confirm-sheet__btn--${state.variant}`"
              @click="handleConfirm"
            >
              {{ state.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const state = useConfirmState()

const sheetRef = ref<HTMLElement | null>(null)

function handleConfirm() {
  state.resolve?.(true)
  state.open = false
  state.resolve = null
}

function handleCancel() {
  state.resolve?.(false)
  state.open = false
  state.resolve = null
}

const { translateY, isDragging, dragListeners } = useSheetDrag(sheetRef, handleCancel)

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
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(var(--tint-rgb), 0.4);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* ─── Sheet (mobile-first) ─── */
.confirm-sheet {
  background: var(--color-white, #fff);
  color: var(--color-text);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--space-2) var(--space-6) var(--space-8);
  max-height: 85dvh;
  overflow-y: auto;
  text-align: center;
}

/* ─── Mobile slide-up transition ─── */
.confirm-enter-active {
  transition: background 0.3s ease;
}
.confirm-enter-active .confirm-sheet {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.confirm-leave-active {
  transition: background 0.2s ease;
}
.confirm-leave-active .confirm-sheet {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.confirm-enter-from,
.confirm-leave-to {
  background: rgba(var(--tint-rgb), 0);
}
.confirm-enter-from .confirm-sheet,
.confirm-leave-to .confirm-sheet {
  transform: translateY(100%);
}

/* ─── Header ─── */
.confirm-sheet__header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-8);
}

.confirm-sheet__handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin-top: var(--space-2);
}

.confirm-sheet__close {
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
  .confirm-sheet__close:hover {
    background: var(--color-border-light);
  }
}

/* ─── Icon ─── */
.confirm-sheet__icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--space-2) auto var(--space-4);
}

.confirm-sheet__icon--danger {
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
}

.confirm-sheet__icon--warning {
  background: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
}

/* ─── Typography ─── */
.confirm-sheet__title {
  font-family: var(--font-title, var(--font-body));
  font-size: var(--text-xl, 1.25rem);
  font-weight: var(--weight-semibold, 600);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.confirm-sheet__message {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-6);
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

/* ─── Actions ─── */
.confirm-sheet__actions {
  display: flex;
  gap: var(--space-3);
}

.confirm-sheet__btn {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  border: none;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold, 600);
  cursor: pointer;
  transition: background var(--transition-fast), opacity var(--transition-fast);
}

.confirm-sheet__btn--cancel {
  background: var(--color-surface-alt);
  color: var(--color-text);
}

.confirm-sheet__btn--danger {
  background: #dc2626;
  color: #fff;
}

.confirm-sheet__btn--warning {
  background: #ca8a04;
  color: #fff;
}

@media (hover: hover) {
  .confirm-sheet__btn--cancel:hover { opacity: 0.8; }
  .confirm-sheet__btn--danger:hover { background: #b91c1c; }
  .confirm-sheet__btn--warning:hover { background: #a16207; }
}

/* ─── Desktop: centered modal instead of bottom sheet ─── */
@media (min-width: 1024px) {
  .confirm-overlay {
    align-items: center;
    justify-content: center;
  }

  .confirm-sheet {
    border-radius: var(--radius-2xl);
    max-width: 400px;
    width: 100%;
    padding: var(--space-2) var(--space-8) var(--space-8);
  }

  .confirm-enter-active .confirm-sheet {
    transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;
  }
  .confirm-leave-active .confirm-sheet {
    transition: transform 0.2s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease;
  }
  .confirm-enter-from .confirm-sheet,
  .confirm-leave-to .confirm-sheet {
    transform: scale(0.95);
    opacity: 0;
  }

  .confirm-sheet__handle {
    display: none;
  }
}
</style>
