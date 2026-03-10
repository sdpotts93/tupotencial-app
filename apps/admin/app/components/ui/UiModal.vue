<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-backdrop" @click.self="close">
        <Transition name="slide-up">
          <div v-if="modelValue" :class="['modal', `modal--${variant}`]" role="dialog" :aria-label="title">
            <div v-if="showHandle" class="modal__handle" />
            <div v-if="title || showClose" class="modal__header">
              <h2 v-if="title" class="modal__title">{{ title }}</h2>
              <button v-if="showClose" class="modal__close" aria-label="Cerrar" @click="close">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <div class="modal__body">
              <slot />
            </div>
            <div v-if="$slots.footer" class="modal__footer">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  variant?: 'center' | 'drawer'
  showClose?: boolean
  showHandle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'drawer',
  showClose: true,
  showHandle: true,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(var(--tint-rgb), 0.4);
  z-index: var(--z-modal-backdrop);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal {
  background: var(--color-white);
  color: var(--color-text);
  width: 100%;
  max-height: 90dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.modal--drawer {
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding-bottom: var(--safe-area-bottom);
}

.modal--center {
  border-radius: var(--radius-2xl);
  max-width: 400px;
  margin: auto var(--space-6);
}

@media (min-width: 1024px) {
  .modal--center {
    margin: auto;
  }
}

.modal__handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin: var(--space-3) auto var(--space-1);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  gap: var(--space-3);
}

.modal__title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
}

.modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-surface-alt);
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--color-text);
  flex-shrink: 0;
}

.modal__body { padding: 0 var(--space-5) var(--space-5); }
.modal__footer { padding: 0 var(--space-5) var(--space-5); }
</style>
