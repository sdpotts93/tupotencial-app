<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Categorías</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" @click="showCreateModal = true">+ Nueva categoría</UiButton>
      </div>
    </div>

    <div class="cat-container">
      <div class="cat-toolbar">
        <UiInput
          v-model="search"
          placeholder="Buscar por nombre..."
          style="min-width: 200px;"
        >
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
      </div>

      <div class="cat-list">
        <div class="cat-header">
          <span class="cat-header__drag" />
          <span class="cat-header__name">Nombre</span>
          <span class="cat-header__slug">Slug</span>
          <span class="cat-header__status">Estado</span>
          <span class="cat-header__count">Contenidos</span>
          <span class="cat-header__actions" />
        </div>

        <div
          v-for="(cat, index) in filteredRows"
          :key="cat.id"
          class="cat-row"
          :class="{
            'cat-row--dragging': dragIndex === index,
            'cat-row--over': dragOverIndex === index && dragIndex !== index,
          }"
          :draggable="!search"
          @dragstart="onDragStart(index, $event)"
          @dragover.prevent="onDragOver(index)"
          @dragend="onDragEnd"
          @click="editCategory(cat)"
        >
          <span class="cat-row__drag" :class="{ 'cat-row__drag--disabled': !!search }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/>
              <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
              <circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>
            </svg>
          </span>
          <span class="cat-row__name">{{ cat.name }}</span>
          <span class="cat-row__slug">{{ cat.slug }}</span>
          <span class="cat-row__status">
            <UiTag :variant="cat.is_active ? 'success' : 'default'">{{ cat.is_active ? 'Activa' : 'Inactiva' }}</UiTag>
          </span>
          <span class="cat-row__count">{{ cat.content_count }} elementos</span>
          <span class="cat-row__actions" @click.stop>
            <UiButton variant="soft" size="sm" @click="editCategory(cat)">
              <template #icon><Icon name="lucide:pencil" size="16" /></template>
              Editar
            </UiButton>
            <UiButton variant="danger-ghost" size="sm" @click="handleDelete(cat)">
              <template #icon><Icon name="lucide:trash-2" size="16" /></template>
              Eliminar
            </UiButton>
          </span>
        </div>

        <div v-if="!filteredRows.length" class="cat-empty">Sin resultados</div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <UiModal v-model="showCreateModal" :title="editingCategory ? 'Editar categoría' : 'Nueva categoría'" variant="center" :show-handle="false">
      <div class="modal-form">
        <UiInput
          v-model="categoryForm.name"
          label="Nombre"
          placeholder="Nombre de la categoría"
        />
        <UiSelect
          v-model="categoryForm.is_active"
          label="Estado"
          :options="[{ value: 'true', label: 'Activa' }, { value: 'false', label: 'Inactiva' }]"
        />
      </div>
      <p v-if="formError" class="form-error">{{ formError }}</p>
      <template #footer>
        <div class="modal-actions">
          <UiButton variant="soft" size="sm" @click="showCreateModal = false">Cancelar</UiButton>
          <UiButton variant="primary-outline" size="sm" :loading="saving" @click="saveCategory">{{ editingCategory ? 'Guardar cambios' : 'Crear categoría' }}</UiButton>
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
const editingCategory = ref<Record<string, any> | null>(null)
const saving = ref(false)
const search = ref('')

const formError = ref('')

const categoryForm = reactive({
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

const { data: categories, refresh } = await useAsyncData('admin-categories', async () => {
  const { data } = await client
    .from('content_categories')
    .select('*, content_item_categories(count)')
    .order('sort_order')
  return (data ?? []).map(c => ({
    ...c,
    name: c.title,
    content_count: (c.content_item_categories as any)?.[0]?.count ?? 0,
  }))
})

const filteredRows = computed(() => {
  const sorted = [...(categories.value ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  if (!search.value) return sorted
  const q = search.value.toLowerCase()
  return sorted.filter(r => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q))
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
    const sorted = [...(categories.value ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    const fromItem = sorted[dragIndex.value]
    const toItem = sorted[dragOverIndex.value]
    if (fromItem && toItem) {
      const fromOrder = fromItem.sort_order
      const toOrder = toItem.sort_order

      // Build updated sort_order for all affected items
      const updates: { id: string; sort_order: number }[] = []
      for (const cat of (categories.value ?? [])) {
        let newOrder = cat.sort_order
        if (cat.id === fromItem.id) {
          newOrder = toOrder
        } else if (fromOrder < toOrder) {
          if (cat.sort_order > fromOrder && cat.sort_order <= toOrder) newOrder = cat.sort_order - 1
        } else {
          if (cat.sort_order >= toOrder && cat.sort_order < fromOrder) newOrder = cat.sort_order + 1
        }
        if (newOrder !== cat.sort_order || cat.id === fromItem.id) {
          updates.push({ id: cat.id, sort_order: newOrder })
        }
      }

      if (updates.length) {
        await Promise.all(
          updates.map(u =>
            client.from('content_categories').update({ sort_order: u.sort_order }).eq('id', u.id),
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
function editCategory(row: Record<string, any>) {
  editingCategory.value = row
  categoryForm.name = row.name
  categoryForm.is_active = String(row.is_active)
  showCreateModal.value = true
}

async function saveCategory() {
  saving.value = true
  formError.value = ''
  try {
    const slug = slugify(categoryForm.name)
    const isActive = categoryForm.is_active === 'true'

    if (editingCategory.value) {
      await client
        .from('content_categories')
        .update({ title: categoryForm.name, slug, is_active: isActive })
        .eq('id', editingCategory.value.id)
    } else {
      const maxOrder = (categories.value ?? []).reduce((max, c) => Math.max(max, c.sort_order ?? 0), 0)
      await client
        .from('content_categories')
        .insert({ title: categoryForm.name, slug, is_active: isActive, sort_order: maxOrder + 1 })
    }

    await refresh()
    toast.show('Categoría guardada', 'success')
    showCreateModal.value = false
    editingCategory.value = null
    categoryForm.name = ''
    categoryForm.is_active = 'true'
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
      await client.from('content_categories').delete().eq('id', row.id)
      await refresh()
    } catch {
      toast.show('Error al eliminar', 'error')
    }
  }
}
</script>

<style scoped>
/* ─── Container ─── */
.cat-container {
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
.cat-toolbar {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* ─── List (shared grid) ─── */
.cat-list {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1fr 1fr auto;
  overflow: auto;
  flex: 1 1 auto;
  min-height: 0;
}

/* ─── Header ─── */
.cat-header {
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
.cat-row {
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
  .cat-row:hover {
    background: var(--color-border-light);
  }
}

.cat-row--dragging {
  opacity: 0.4;
}

.cat-row--over {
  border-top: 2px solid var(--color-tint);
}

/* ─── Drag handle ─── */
.cat-row__drag {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  cursor: grab;
}

.cat-row__drag:active {
  cursor: grabbing;
}

.cat-row__drag--disabled {
  opacity: 0.2;
  cursor: default;
}

/* ─── Cells ─── */
.cat-row__name {
  font-weight: var(--weight-medium);
}

.cat-row__slug {
  color: var(--color-muted);
}

.cat-row__count {
  color: var(--color-muted);
}

.cat-row__actions {
  display: flex;
  gap: var(--space-2);
  white-space: nowrap;
}

/* ─── Empty ─── */
.cat-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-10) var(--space-4);
  color: var(--color-muted);
  font-size: var(--text-sm);
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
