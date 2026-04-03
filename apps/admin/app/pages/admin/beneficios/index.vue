<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Beneficios</h1>
      <div class="page-header__actions">
        <UiButton v-if="canEdit" variant="primary-outline" size="sm" to="/admin/beneficios/new">+ Nuevo beneficio</UiButton>
      </div>
    </div>

    <!-- Skeleton loader -->
    <template v-if="benefitsStatus === 'pending'">
      <div class="ben-container">
        <div class="ben-toolbar">
          <UiSkeleton variant="rect" width="200px" height="36px" radius="var(--radius-md)" />
        </div>
        <div style="display: flex; flex-direction: column;">
          <div v-for="i in 6" :key="i" style="display: grid; grid-template-columns: 40px minmax(200px, 1fr) 1fr 1fr auto; gap: var(--space-2); padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border-light); align-items: center;">
            <UiSkeleton variant="rect" width="16px" height="16px" radius="var(--radius-sm)" />
            <UiSkeleton variant="text" width="70%" height="14px" />
            <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
            <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
            <UiSkeleton variant="rect" width="120px" height="30px" radius="var(--radius-md)" />
          </div>
        </div>
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="benefitsStatus === 'error'">
      <div class="ben__error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="ben__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="ben__error-title">No pudimos cargar los beneficios</h2>
        <p class="ben__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refresh()">Reintentar</UiButton>
      </div>
    </template>

    <template v-else>
      <div class="ben-container">
        <div class="ben-toolbar">
          <UiInput
            v-model="searchInput"
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
            :draggable="!searchInput"
            @dragstart="onDragStart(index, $event)"
            @dragover.prevent="onDragOver(index)"
            @dragend="onDragEnd"
            @click="goToEdit(row)"
          >
            <span class="ben-row__drag" :class="{ 'ben-row__drag--disabled': !!searchInput }">
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
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const { input: searchInput, debounced: search } = useDebouncedRef('')

const client = useSupabaseClient()
const { canEdit } = useAdminAuth()
const { data: benefits, refresh, status: benefitsStatus } = useAsyncData('admin-benefits', async () => {
  let query = client.from('benefits').select('*')

  if (search.value) query = query.ilike('title', `%${search.value}%`)

  const { data } = await query.order('position')
  return (data ?? []).map(b => ({
    ...b,
    sort_order: b.position,
  }))
}, { watch: [search], lazy: true })

const filteredRows = computed(() => {
  return [...(benefits.value ?? [])].sort((a, b) => a.sort_order - b.sort_order)
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

const confirm = useConfirm()

async function handleDelete(row: Record<string, any>) {
  if (await confirm({ message: `¿Seguro que deseas eliminar "${row.title}"?` })) {
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

/* ─── Error state ─── */
.ben__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 40dvh;
  gap: var(--space-3);
}

.ben__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.ben__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.ben__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
