<template>
  <Teleport to="body">
    <TransitionGroup name="scale-fade" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast--${toast.type}`]"
        role="alert"
      >
        <p class="toast__message">{{ toast.message }}</p>
        <button class="toast__dismiss" aria-label="Cerrar" @click="dismiss(toast.id)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

const toasts = ref<Toast[]>([])
let nextId = 0

function show(message: string, type: Toast['type'] = 'info', duration = 3500) {
  const id = nextId++
  toasts.value.push({ id, message, type })
  setTimeout(() => dismiss(id), duration)
}

function dismiss(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

defineExpose({ show })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: calc(var(--safe-area-top) + var(--space-4));
  left: var(--space-4);
  right: var(--space-4);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2);
  pointer-events: auto;
  font-size: var(--text-sm);
}

.toast--success { background: var(--color-success); color: #fff; }
.toast--error { background: var(--color-danger); color: #fff; }
.toast--info { background: var(--color-primary); color: var(--color-primary-contrast); }
.toast--warning { background: var(--color-warning); color: #fff; }

.toast__message { flex: 1; }

.toast__dismiss {
  display: flex;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
}
.toast__dismiss:hover { opacity: 1; }
</style>
