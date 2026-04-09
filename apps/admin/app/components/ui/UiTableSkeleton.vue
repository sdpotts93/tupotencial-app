<template>
  <div class="table-skeleton">
    <div v-if="toolbarWidths.length" class="table-skeleton__toolbar">
      <UiSkeleton
        v-for="(w, i) in toolbarWidths"
        :key="i"
        variant="rect"
        :width="w"
        height="36px"
        radius="var(--radius-md)"
      />
    </div>
    <div class="table-skeleton__rows">
      <div v-for="i in rowCount" :key="i" class="table-skeleton__row" :style="rowStyle">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  toolbarWidths?: string[]
  rowCount?: number
  columns?: string
}

const props = withDefaults(defineProps<Props>(), {
  toolbarWidths: () => ['200px'],
  rowCount: 6,
  columns: '1fr 80px 80px 80px 100px',
})

const rowStyle = computed(() => ({
  gridTemplateColumns: props.columns,
}))
</script>

<style scoped>
.table-skeleton {
  background: var(--color-desktop-card, var(--color-white));
  border: 1px solid var(--color-desktop-border, var(--color-border-light));
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-skeleton__toolbar {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  gap: var(--space-3);
}

.table-skeleton__row {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  align-items: center;
}
</style>
