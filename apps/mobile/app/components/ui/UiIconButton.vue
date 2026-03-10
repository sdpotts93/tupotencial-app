<template>
  <button
    :class="['icon-btn', `icon-btn--${variant}`, `icon-btn--${size}`]"
    :disabled="disabled"
    :aria-label="label"
    type="button"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  label: string
}

withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  size: 'md',
  disabled: false,
})
</script>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}

.icon-btn--sm { width: 32px; height: 32px; }
.icon-btn--md { width: 40px; height: 40px; }
.icon-btn--lg { width: 48px; height: 48px; }

.icon-btn--default {
  background: var(--color-surface-alt);
  color: var(--color-text);
}
@media (hover: hover) {
  .icon-btn--default:hover { background: var(--color-border); }
  .icon-btn--ghost:hover { background: var(--color-surface-alt); }
  .icon-btn--outline:hover { background: var(--color-surface-alt); }
}

.icon-btn--ghost {
  background: transparent;
  color: var(--color-text);
}

.icon-btn--outline {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
