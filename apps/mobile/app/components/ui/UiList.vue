<template>
  <div class="list">
    <slot />
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.04);
  color: var(--color-text);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.list > :deep(.list-item + .list-item) {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
