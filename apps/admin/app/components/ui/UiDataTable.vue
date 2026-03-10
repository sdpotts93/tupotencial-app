<template>
  <div :class="['data-table', { 'data-table--fill': fill }]">
    <div v-if="$slots.toolbar" class="data-table__toolbar">
      <slot name="toolbar" />
    </div>
    <div class="data-table__scroll" :class="{ 'data-table__scroll--capped': scrollable, 'data-table__scroll--fill': fill }">
      <table class="data-table__table">
        <thead>
          <tr>
            <th
              v-for="(col, ci) in columns"
              :key="col.key"
              :class="{ 'data-table__sticky-col': ci === 0 }"
              :style="{ width: col.width }"
            >
              {{ col.label }}
            </th>
            <th v-if="$slots.actions" class="data-table__actions-header" />
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="data-table__loading">
              Cargando...
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="data-table__empty">
              {{ emptyText }}
            </td>
          </tr>
          <tr v-for="(row, i) in rows" :key="row.id || i" class="data-table__row" @click="$emit('row-click', row)">
            <td
              v-for="(col, ci) in columns"
              :key="col.key"
              :class="{ 'data-table__sticky-col': ci === 0 }"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] ?? '—' }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="data-table__actions">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  width?: string
}

interface Props {
  columns: Column[]
  rows: Record<string, any>[]
  loading?: boolean
  emptyText?: string
  scrollable?: boolean
  fill?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: 'Sin resultados',
  scrollable: false,
  fill: false,
})

defineEmits<{ 'row-click': [row: Record<string, any>] }>()
</script>

<style scoped>
.data-table {
  background: var(--color-desktop-card, var(--color-white));
  border: 1px solid var(--color-desktop-border, var(--color-border-light));
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.data-table--fill {
  flex: 0 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.data-table__toolbar {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  overflow-x: auto;
  flex-shrink: 0;
}

.data-table__toolbar > :deep(*) {
  flex-shrink: 0;
}

.data-table__scroll { overflow-x: auto; }

.data-table__scroll--capped {
  max-height: 480px;
  overflow-y: auto;
}

.data-table__scroll--fill {
  flex: 0 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.data-table__table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.data-table__table th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  background: var(--color-gray);
  border-bottom: 1px solid var(--color-border-light);
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 2;
}

.data-table__table td {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  border-bottom: 1px solid var(--color-border-light);
  vertical-align: middle;
}

/* ─── Sticky first column ─── */
.data-table__sticky-col {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--color-desktop-card, var(--color-white));
  transition: background var(--transition-fast);
}

/* Corner cell: sticky both directions */
th.data-table__sticky-col {
  z-index: 3;
}

.data-table__row {
  cursor: pointer;
  transition: background var(--transition-fast);
}
.data-table__row:hover { background: var(--color-border-light); }

/* Sticky cell covers the tr background, so apply hover directly */
.data-table__row:hover .data-table__sticky-col {
  background: var(--color-border-light);
}

.data-table__actions-header {
  width: 1%;
  white-space: nowrap;
}

.data-table__actions {
  white-space: nowrap;
}

.data-table__actions :deep(> *) {
  display: inline-flex;
  vertical-align: middle;
}

.data-table__actions :deep(> * + *) {
  margin-left: var(--space-2);
}

.data-table__loading,
.data-table__empty {
  text-align: center;
  padding: var(--space-10) var(--space-4);
  color: var(--color-muted);
  font-size: var(--text-sm);
}
</style>
