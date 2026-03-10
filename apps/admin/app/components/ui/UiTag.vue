<template>
  <span :class="['tag', `tag--${variant}`, `tag--${size}`]">
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'primary' | 'accent' | 'gold' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
})
</script>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-eyebrow);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.tag--sm { font-size: var(--eyebrow-sm); padding: var(--space-1) var(--space-3); }
.tag--md { font-size: var(--eyebrow-md); padding: var(--space-1) var(--space-4); }

.tag--default { background: var(--color-surface-alt); border: 1px solid var(--color-text-secondary); color: var(--color-text-secondary); }
.tag--primary { background: #E2E8F0; color: #1A202C; }
.tag--accent { background: var(--color-accent-bg); color: var(--color-accent-contrast); }
.tag--gold { background: rgba(212, 175, 55, 0.15); color: #9c8742; }
.tag--success { background: #C6F6D5; color: #22543D; }
.tag--warning { background: #FBD38D; color: #744210; }
.tag--danger { background: var(--color-danger-light); color: var(--color-danger); }
.tag--info { background: var(--color-info-bg); color: var(--color-info); }
</style>
