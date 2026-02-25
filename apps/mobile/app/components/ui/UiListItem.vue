<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="list-item list-item--clickable"
  >
    <span v-if="$slots.icon" class="list-item__icon">
      <slot name="icon" />
    </span>
    <div class="list-item__content">
      <span class="list-item__label">{{ label }}</span>
      <span v-if="description" class="list-item__description">{{ description }}</span>
    </div>
    <span v-if="$slots.suffix" class="list-item__suffix">
      <slot name="suffix" />
    </span>
    <svg v-else class="list-item__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </NuxtLink>
  <div
    v-else
    :class="['list-item', { 'list-item--clickable': clickable }]"
  >
    <span v-if="$slots.icon" class="list-item__icon">
      <slot name="icon" />
    </span>
    <div class="list-item__content">
      <span class="list-item__label">{{ label }}</span>
      <span v-if="description" class="list-item__description">{{ description }}</span>
    </div>
    <span v-if="$slots.suffix" class="list-item__suffix">
      <slot name="suffix" />
    </span>
    <svg v-else-if="clickable" class="list-item__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</template>

<script setup lang="ts">

interface Props {
  label: string
  description?: string
  to?: string
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  clickable: false,
})
</script>

<style scoped>
.list-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  text-decoration: none;
  color: inherit;
}

.list-item--clickable {
  cursor: pointer;
  transition: background var(--transition-fast);
}
.list-item--clickable:hover { background: rgba(255, 255, 255, 0.08); }
.list-item--clickable:active { background: rgba(255, 255, 255, 0.12); }

.list-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.7);
}

.list-item__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.list-item__label {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: white;
}

.list-item__description {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.6);
}

.list-item__suffix { flex-shrink: 0; }

.list-item__chevron {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.5);
}
</style>
