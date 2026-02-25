<template>
  <div class="list">
    <slot />
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  background: #ffffff21;
  color: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.list > :deep(.list-item + .list-item) {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
