<template>
  <div class="tabs">
    <div class="tabs__list" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        role="tab"
        :aria-selected="modelValue === tab.value"
        :class="['tabs__tab', { 'tabs__tab--active': modelValue === tab.value }]"
        @click="$emit('update:modelValue', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  value: string
  label: string
}

interface Props {
  tabs: Tab[]
  modelValue: string
}

defineProps<Props>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.tabs__list {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs__list::-webkit-scrollbar { display: none; }

.tabs__tab {
  flex-shrink: 0;
  padding: var(--space-3) var(--space-4);
  border: none;
  background: none;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
  white-space: nowrap;
}

.tabs__tab:hover { color: rgba(255, 255, 255, 0.8); }

.tabs__tab--active {
  color: white;
  border-bottom-color: white;
}
</style>
