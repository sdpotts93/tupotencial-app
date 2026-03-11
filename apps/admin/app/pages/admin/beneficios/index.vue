<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Beneficios</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" to="/admin/beneficios/new">+ Nuevo beneficio</UiButton>
      </div>
    </div>

    <div class="ben-container">
      <div class="ben-toolbar">
        <UiInput
          v-model="search"
          placeholder="Buscar beneficio..."
          style="min-width: 200px;"
        >
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
      </div>

      <div class="ben-list">
        <div class="ben-header">
          <span class="ben-header__drag" />
          <span>Beneficio</span>
          <span>Plan</span>
          <span>Estado</span>
          <span class="ben-header__actions" />
        </div>

        <div
          v-for="(row, index) in filteredRows"
          :key="row.id"
          class="ben-row"
          :class="{
            'ben-row--dragging': dragIndex === index,
            'ben-row--over': dragOverIndex === index && dragIndex !== index,
          }"
          :draggable="!search"
          @dragstart="onDragStart(index, $event)"
          @dragover.prevent="onDragOver(index)"
          @dragend="onDragEnd"
          @click="goToEdit(row)"
        >
          <span class="ben-row__drag" :class="{ 'ben-row__drag--disabled': !!search }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/>
              <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
              <circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>
            </svg>
          </span>
          <span class="ben-row__title">{{ row.title }}</span>
          <span class="ben-row__plan">
            <UiTag :variant="row.plan === 'core' ? 'gold' : 'default'">{{ planLabel(row.plan) }}</UiTag>
          </span>
          <span class="ben-row__status">
            <UiTag :variant="row.status === 'active' ? 'success' : 'warning'">
              {{ statusLabel(row.status) }}
            </UiTag>
          </span>
          <span class="ben-row__actions" @click.stop>
            <UiButton variant="soft" size="sm" :to="`/admin/beneficios/${row.id}`">
              <template #icon><Icon name="lucide:pencil" size="16" /></template>
              Editar
            </UiButton>
            <UiButton variant="danger-ghost" size="sm" @click="handleDelete(row)">
              <template #icon><Icon name="lucide:trash-2" size="16" /></template>
              Eliminar
            </UiButton>
          </span>
        </div>

        <div v-if="!filteredRows.length" class="ben-empty">Sin resultados</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const search = ref('')

const client = useSupabaseClient()
const { data: benefits, refresh } = await useAsyncData('admin-benefits', async () => {
  const { data } = await client.from('benefits').select('*').order('position')
  return (data ?? []).map(b => ({
    ...b,
    sort_order: b.position,
  }))
})

const filteredRows = computed(() => {
  const sorted = [...(benefits.value ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  if (!search.value) return sorted
  const q = search.value.toLowerCase()
  return sorted.filter(r => r.title.toLowerCase().includes(q))
})

// ── Drag & drop ──
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(index: number, e: DragEvent) {
  dragIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(index: number) {
  dragOverIndex.value = index
}

async function onDragEnd() {
  if (dragIndex.value !== null && dragOverIndex.value !== null && dragIndex.value !== dragOverIndex.value) {
    const items = [...(benefits.value ?? [])]
    const sorted = items.sort((a, b) => a.sort_order - b.sort_order)
    const fromItem = sorted[dragIndex.value]
    const toItem = sorted[dragOverIndex.value]
    if (fromItem && toItem) {
      const fromOrder = fromItem.sort_order
      const toOrder = toItem.sort_order

      if (fromOrder < toOrder) {
        for (const b of items) {
          if (b.sort_order > fromOrder && b.sort_order <= toOrder) b.sort_order--
        }
      } else {
        for (const b of items) {
          if (b.sort_order >= toOrder && b.sort_order < fromOrder) b.sort_order++
        }
      }
      fromItem.sort_order = toOrder

      // Persist new positions
      await Promise.all(
        items.map(b => client.from('benefits').update({ position: b.sort_order }).eq('id', b.id)),
      )
      refresh()
    }
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

// ── Helpers ──
function planLabel(plan: string) {
  const map: Record<string, string> = { free: 'Gratuito', core: 'Core' }
  return map[plan] ?? plan
}

function statusLabel(status: string) {
  const map: Record<string, string> = { active: 'Activo', inactive: 'Inactivo' }
  return map[status] ?? status
}

async function handleDelete(row: Record<string, any>) {
  if (confirm(`¿Seguro que deseas eliminar "${row.title}"?`)) {
    await client.from('benefits').delete().eq('id', row.id)
    refresh()
  }
}

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/beneficios/${row.id}`)
}
</script>

<style scoped>
/* ─── Container ─── */
.ben-container {
  background: var(--color-desktop-card, var(--color-white));
  border: 1px solid var(--color-desktop-border, var(--color-border-light));
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex: 0 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ─── Toolbar ─── */
.ben-toolbar {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* ─── List (shared grid) ─── */
.ben-list {
  display: grid;
  grid-template-columns: 40px minmax(200px, 1fr) 1fr 1fr auto;
  overflow: auto;
  flex: 1 1 auto;
  min-height: 0;
}

/* ─── Header ─── */
.ben-header {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-gray);
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 0;
  z-index: 2;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* ─── Row ─── */
.ben-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  align-items: center;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

@media (hover: hover) {
  .ben-row:hover {
    background: var(--color-border-light);
  }
}

.ben-row--dragging {
  opacity: 0.4;
}

.ben-row--over {
  border-top: 2px solid var(--color-tint);
}

/* ─── Drag handle ─── */
.ben-row__drag {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  cursor: grab;
}

.ben-row__drag:active {
  cursor: grabbing;
}

.ben-row__drag--disabled {
  opacity: 0.2;
  cursor: default;
}

/* ─── Cells ─── */
.ben-row__title {
  font-weight: var(--weight-medium);
}

.ben-row__plan {
  color: var(--color-muted);
}

.ben-row__actions {
  display: flex;
  gap: var(--space-2);
  white-space: nowrap;
}

/* ─── Empty ─── */
.ben-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-10) var(--space-4);
  color: var(--color-muted);
  font-size: var(--text-sm);
}
</style>
