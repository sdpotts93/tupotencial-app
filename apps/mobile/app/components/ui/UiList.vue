<template>
  <div class="list">
    <slot />
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.list > :deep(.list-item + .list-item) {
  border-top: 1px solid var(--color-border-light);
}
</style>
