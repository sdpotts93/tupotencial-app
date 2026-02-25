<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="classes"
    class="btn"
  >
    <span v-if="loading" class="btn__spinner" />
    <span v-if="$slots.icon && !loading" class="btn__icon">
      <slot name="icon" />
    </span>
    <span class="btn__label">
      <slot />
    </span>
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="disabled || loading"
    :class="classes"
    class="btn"
  >
    <span v-if="loading" class="btn__spinner" />
    <span v-if="$slots.icon && !loading" class="btn__icon">
      <slot name="icon" />
    </span>
    <span class="btn__label">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  to?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  disabled: false,
  loading: false,
  type: 'button',
})

const classes = computed(() => [
  `btn--${props.variant}`,
  `btn--${props.size}`,
  {
    'btn--block': props.block,
    'btn--loading': props.loading,
    'btn--disabled': props.disabled,
  },
])
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--btn-py) var(--btn-px);
  border-radius: var(--btn-radius);
  font-family: var(--btn-font-family);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  line-height: 1;
  border: 2px solid var(--btn-border);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.btn:active { transform: scale(0.98); }

/* Variants */
.btn--primary {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border-color: var(--color-primary);
}
.btn--primary:hover { background: var(--color-primary-hover); border-color: var(--color-primary-hover); }

.btn--secondary {
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  border-color: var(--color-accent);
}
.btn--secondary:hover { background: var(--color-accent-hover); border-color: var(--color-accent-hover); }

.btn--outline {
  background: transparent;
  color: var(--color-text);
  border-color: var(--color-border);
}
.btn--outline:hover { background: var(--color-surface-alt); border-color: var(--color-text); }

.btn--ghost {
  background: transparent;
  color: var(--color-text);
  border-color: transparent;
}
.btn--ghost:hover { background: var(--color-surface-alt); }

.btn--danger {
  background: var(--color-danger);
  color: #fff;
  border-color: var(--color-danger);
}
.btn--danger:hover { opacity: 0.9; }

/* Sizes */
.btn--sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}
.btn--lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
}

.btn--block { width: 100%; }
.btn--disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.btn--loading { cursor: wait; }

.btn__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.btn__icon { display: flex; flex-shrink: 0; }

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
