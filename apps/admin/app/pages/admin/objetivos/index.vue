<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Objetivos</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" @click="showCreateModal = true">+ Nuevo objetivo</UiButton>
      </div>
    </div>

    <div class="obj-container">
      <div class="obj-toolbar">
        <UiInput
          v-model="searchInput"
          placeholder="Buscar por nombre..."
          style="min-width: 200px;"
        >
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
      </div>

      <div class="obj-list">
        <div class="obj-header">
          <span class="obj-header__drag" />
          <span class="obj-header__name">Nombre</span>
          <span class="obj-header__slug">Slug</span>
          <span class="obj-header__status">Estado</span>
          <span class="obj-header__count">Contenidos</span>
          <span class="obj-header__actions" />
        </div>

        <div v-if="objsStatus === 'pending'" class="obj-bar"><div class="obj-bar__fill" /></div>

        <div v-if="objsStatus === 'error'" class="obj-empty">
          <UiErrorState title="No pudimos cargar los objetivos" @retry="refresh()" />
        </div>

        <div v-else-if="objsStatus === 'pending' && !filteredRows.length" class="obj-empty obj-empty--loading" />

        <div v-else-if="!filteredRows.length" class="obj-empty">
          <UiEmptyState title="Sin resultados" description="No se encontraron objetivos. Intenta con otra búsqueda.">
            <template #icon><Icon name="lucide:search-x" size="32" /></template>
            <template #action><UiButton variant="primary-outline" size="sm" @click="refresh()">Reintentar</UiButton></template>
          </UiEmptyState>
        </div>

        <template v-else>
          <div
            v-for="(obj, index) in filteredRows"
            :key="obj.id"
            class="obj-row"
            :class="{
              'obj-row--dragging': dragIndex === index,
              'obj-row--over': dragOverIndex === index && dragIndex !== index,
            }"
            :draggable="!searchInput"
            @dragstart="onDragStart(index, $event)"
            @dragover.prevent="onDragOver(index)"
            @dragend="onDragEnd"
            @click="editObjective(obj)"
          >
            <span class="obj-row__drag" :class="{ 'obj-row__drag--disabled': !!searchInput }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/>
                <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
                <circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>
              </svg>
            </span>
            <span class="obj-row__name">{{ obj.name }}</span>
            <span class="obj-row__slug">{{ obj.slug }}</span>
            <span class="obj-row__status">
              <UiTag :variant="obj.is_active ? 'success' : 'default'">{{ obj.is_active ? 'Activo' : 'Inactivo' }}</UiTag>
            </span>
            <span class="obj-row__count">{{ obj.content_count }} elementos</span>
            <span class="obj-row__actions" @click.stop>
              <UiButton variant="soft" size="sm" @click="editObjective(obj)">
                <template #icon><Icon name="lucide:pencil" size="16" /></template>
                Editar
              </UiButton>
              <UiButton variant="danger-ghost" size="sm" @click="handleDelete(obj)">
                <template #icon><Icon name="lucide:trash-2" size="16" /></template>
                Eliminar
              </UiButton>
            </span>
          </div>
        </template>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <UiModal v-model="showCreateModal" :title="editingObjective ? 'Editar objetivo' : 'Nuevo objetivo'">
      <div class="modal-form">
        <UiInput
          v-model="objectiveForm.name"
          label="Nombre"
          placeholder="Nombre del objetivo"
        />
        <UiSelect
          v-model="objectiveForm.is_active"
          label="Estado"
          :options="[{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }]"
        />
      </div>
      <p v-if="formError" class="form-error">{{ formError }}</p>
      <template #footer>
        <div class="modal-actions">
          <UiButton variant="soft" size="sm" @click="showCreateModal = false">Cancelar</UiButton>
          <UiButton variant="primary-outline" size="sm" :loading="saving" @click="saveObjective">{{ editingObjective ? 'Guardar cambios' : 'Crear objetivo' }}</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const toast = useToast()

const showCreateModal = ref(false)
const editingObjective = ref<Record<string, any> | null>(null)
const saving = ref(false)
const { input: searchInput, debounced: search } = useDebouncedRef('')

const formError = ref('')

const objectiveForm = reactive({
  name: '',
  is_active: 'true',
})

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const { data: objectives, refresh, status: objsStatus } = useAsyncData('admin-objectives', async () => {
  let query = client.from('content_objectives').select('*, content_item_objectives(count)')

  if (search.value) query = query.or(`title.ilike.%${search.value}%,slug.ilike.%${search.value}%`)

  const { data } = await query.order('position')
  return (data ?? []).map(o => ({
    ...o,
    name: o.title,
    content_count: (o.content_item_objectives as any)?.[0]?.count ?? 0,
  }))
}, { watch: [search], lazy: true })

const filteredRows = computed(() => {
  return [...(objectives.value ?? [])].sort((a, b) => a.position - b.position)
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
    const sorted = [...(objectives.value ?? [])].sort((a, b) => a.position - b.position)
    const fromItem = sorted[dragIndex.value]
    const toItem = sorted[dragOverIndex.value]
    if (fromItem && toItem) {
      const fromOrder = fromItem.position
      const toOrder = toItem.position

      const updates: { id: string; position: number }[] = []
      for (const obj of (objectives.value ?? [])) {
        let newOrder = obj.position
        if (obj.id === fromItem.id) {
          newOrder = toOrder
        } else if (fromOrder < toOrder) {
          if (obj.position > fromOrder && obj.position <= toOrder) newOrder = obj.position - 1
        } else {
          if (obj.position >= toOrder && obj.position < fromOrder) newOrder = obj.position + 1
        }
        if (newOrder !== obj.position || obj.id === fromItem.id) {
          updates.push({ id: obj.id, position: newOrder })
        }
      }

      if (updates.length) {
        await Promise.all(
          updates.map(u =>
            client.from('content_objectives').update({ position: u.position }).eq('id', u.id),
          ),
        )
        await refresh()
      }
    }
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

// ── CRUD ──
function editObjective(row: Record<string, any>) {
  editingObjective.value = row
  objectiveForm.name = row.name
  objectiveForm.is_active = String(row.is_active)
  showCreateModal.value = true
}

async function saveObjective() {
  saving.value = true
  formError.value = ''
  try {
    const slug = slugify(objectiveForm.name)
    const isActive = objectiveForm.is_active === 'true'

    if (editingObjective.value) {
      await client
        .from('content_objectives')
        .update({ title: objectiveForm.name, slug, is_active: isActive })
        .eq('id', editingObjective.value.id)
    } else {
      const maxPosition = (objectives.value ?? []).reduce((max, o) => Math.max(max, o.position ?? 0), 0)
      await client
        .from('content_objectives')
        .insert({ title: objectiveForm.name, slug, is_active: isActive, position: maxPosition + 1 })
    }

    await refresh()
    toast.show('Objetivo guardado', 'success')
    showCreateModal.value = false
    editingObjective.value = null
    objectiveForm.name = ''
    objectiveForm.is_active = 'true'
  } catch {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

const confirm = useConfirm()

async function handleDelete(row: Record<string, any>) {
  if (await confirm({ message: `¿Seguro que deseas eliminar "${row.name}"?` })) {
    try {
      await client.from('content_objectives').delete().eq('id', row.id)
      await refresh()
    } catch {
      toast.show('Error al eliminar', 'error')
    }
  }
}
</script>

<style scoped>
/* ─── Container ─── */
.obj-container {
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
.obj-toolbar {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* ─── List (shared grid) ─── */
.obj-list {
  display: grid;
  grid-template-columns: 40px 1fr 1fr auto 1fr auto;
  overflow: auto;
  flex: 1 1 auto;
  min-height: 0;
}

/* ─── Header ─── */
.obj-header {
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
.obj-row {
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
  .obj-row:hover {
    background: var(--color-border-light);
  }
}

.obj-row--dragging {
  opacity: 0.4;
}

.obj-row--over {
  border-top: 2px solid var(--color-tint);
}

/* ─── Drag handle ─── */
.obj-row__drag {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  cursor: grab;
}

.obj-row__drag:active {
  cursor: grabbing;
}

.obj-row__drag--disabled {
  opacity: 0.2;
  cursor: default;
}

/* ─── Cells ─── */
.obj-row__name {
  font-weight: var(--weight-medium);
}

.obj-row__slug {
  color: var(--color-muted);
}

.obj-row__count {
  color: var(--color-muted);
}

.obj-row__actions {
  display: flex;
  gap: var(--space-2);
  white-space: nowrap;
}

/* ─── Empty ─── */
.obj-empty {
  grid-column: 1 / -1;
}

.obj-empty--loading {
  min-height: 10dvh;
}

.obj-bar {
  grid-column: 1 / -1;
  height: 0;
  position: relative;
  overflow: visible;
}

.obj-bar__fill {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  overflow: hidden;
}

.obj-bar__fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 40%;
  border-radius: 2px;
  background: rgba(230, 120, 74, 0.7);
  animation: dt-slide 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes dt-slide {
  0%   { left: -40%; }
  100% { left: 100%; }
}


/* ─── Modal ─── */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.form-error {
  width: 100%;
  font-size: var(--text-sm);
  color: var(--color-danger);
  text-align: center;
  order: -1;
}
</style>
