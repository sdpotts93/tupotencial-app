<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Beneficios</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" to="/admin/benefits/new">+ Nuevo beneficio</UiButton>
      </div>
    </div>

    <div class="ben-container">
      <div class="ben-toolbar">
        <UiInput
          v-model="search"
          placeholder="Buscar por aliado o beneficio..."
          style="min-width: 200px;"
        >
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
      </div>

      <div class="ben-list">
        <div class="ben-header">
          <span class="ben-header__drag" />
          <span>Aliado</span>
          <span>Beneficio</span>
          <span>Descuento</span>
          <span>Segmento</span>
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
          <span class="ben-row__partner">{{ row.partner_name }}</span>
          <span class="ben-row__title">{{ row.title }}</span>
          <span class="ben-row__discount">{{ row.discount_type === 'percentage' ? `${row.discount_value}%` : `$${row.discount_value} MXN` }}</span>
          <span class="ben-row__segment">{{ segmentLabel(row.segment) }}</span>
          <span class="ben-row__status">
            <UiTag :variant="row.status === 'active' ? 'success' : row.status === 'expired' ? 'danger' : 'warning'">
              {{ statusLabel(row.status) }}
            </UiTag>
          </span>
          <span class="ben-row__actions" @click.stop>
            <UiButton variant="soft" size="sm" :to="`/admin/benefits/${row.id}`">
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

const benefits = ref([
  { id: 'ben-001', sort_order: 1, partner_name: 'NutriVida', title: '20% en suplementos', discount_type: 'percentage', discount_value: 20, segment: 'premium', status: 'active', redemptions: 1234 },
  { id: 'ben-002', sort_order: 2, partner_name: 'YogaFlow Studio', title: 'Clase gratis de yoga', discount_type: 'percentage', discount_value: 100, segment: 'all', status: 'active', redemptions: 856 },
  { id: 'ben-003', sort_order: 3, partner_name: 'Cafe Mindful', title: '$50 de descuento en pedido', discount_type: 'fixed', discount_value: 50, segment: 'premium', status: 'active', redemptions: 2103 },
  { id: 'ben-004', sort_order: 4, partner_name: 'SleepWell', title: '15% en colchones y almohadas', discount_type: 'percentage', discount_value: 15, segment: 'enterprise', status: 'active', redemptions: 312 },
  { id: 'ben-005', sort_order: 5, partner_name: 'GymFit', title: '2 meses gratis de membresía', discount_type: 'percentage', discount_value: 100, segment: 'premium', status: 'active', redemptions: 567 },
  { id: 'ben-006', sort_order: 6, partner_name: 'Libreria Zen', title: '30% en libros de bienestar', discount_type: 'percentage', discount_value: 30, segment: 'all', status: 'expired', redemptions: 945 },
])

const filteredRows = computed(() => {
  const sorted = [...benefits.value].sort((a, b) => a.sort_order - b.sort_order)
  if (!search.value) return sorted
  const q = search.value.toLowerCase()
  return sorted.filter(r => r.partner_name.toLowerCase().includes(q) || r.title.toLowerCase().includes(q))
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

function onDragEnd() {
  if (dragIndex.value !== null && dragOverIndex.value !== null && dragIndex.value !== dragOverIndex.value) {
    const sorted = [...benefits.value].sort((a, b) => a.sort_order - b.sort_order)
    const fromItem = sorted[dragIndex.value]
    const toItem = sorted[dragOverIndex.value]
    if (fromItem && toItem) {
      const fromOrder = fromItem.sort_order
      const toOrder = toItem.sort_order

      if (fromOrder < toOrder) {
        for (const b of benefits.value) {
          if (b.sort_order > fromOrder && b.sort_order <= toOrder) b.sort_order--
        }
      } else {
        for (const b of benefits.value) {
          if (b.sort_order >= toOrder && b.sort_order < fromOrder) b.sort_order++
        }
      }
      fromItem.sort_order = toOrder
    }
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

// ── Helpers ──
function segmentLabel(segment: string) {
  const map: Record<string, string> = { all: 'General', free: 'Gratuito', premium: 'Premium', enterprise: 'Empresarial' }
  return map[segment] ?? segment
}

function statusLabel(status: string) {
  const map: Record<string, string> = { active: 'Activo', expired: 'Expirado', draft: 'Borrador' }
  return map[status] ?? status
}

function handleDelete(row: Record<string, any>) {
  if (confirm(`Seguro que deseas eliminar "${row.title}"?`)) {
    benefits.value = benefits.value.filter(b => b.id !== row.id)
  }
}

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/benefits/${row.id}`)
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
  grid-template-columns: 40px minmax(140px, 1fr) minmax(140px, 1fr) 1fr 1fr 1fr auto;
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

.ben-row:hover {
  background: var(--color-border-light);
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
.ben-row__partner {
  font-weight: var(--weight-medium);
}

.ben-row__discount,
.ben-row__segment {
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
