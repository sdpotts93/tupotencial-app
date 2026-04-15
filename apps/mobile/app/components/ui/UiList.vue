<template>
  <div class="list" :class="{ 'list--gutter': gutter }">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ gutter?: boolean }>()
</script>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  background: rgba(var(--tint-rgb), 0.04);
  color: var(--color-text);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.list--gutter { margin-bottom: 2rem; }

.list > :deep(.list-item + .list-item) {
  border-top: 1px solid rgba(var(--tint-rgb), 0.08);
}

@media (min-width: 1024px) {
  .list {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
  }

  .list > :deep(.list-item + .list-item) {
    border-top-color: var(--color-desktop-border);
  }
}
</style>
