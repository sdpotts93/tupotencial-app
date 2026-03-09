<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Categorias</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" @click="showCreateModal = true">+ Nueva categoria</UiButton>
      </div>
    </div>

    <UiDataTable fill :columns="columns" :rows="filteredRows" @row-click="editCategory">
      <template #toolbar>
        <UiInput
          v-model="search"
          placeholder="Buscar por nombre..."
          style="min-width: 200px;"
        >
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
      </template>

      <template #cell-icon_url="{ value }">
        <div class="category-icon">
          <Icon v-if="value" name="lucide:target" size="20" />
          <span v-else>—</span>
        </div>
      </template>

      <template #cell-sort_order="{ row }">
        <div class="order-controls">
          <button class="order-btn" :disabled="row.sort_order === 1" @click.stop="moveUp(row)">&#9650;</button>
          <span>{{ row.sort_order }}</span>
          <button class="order-btn" :disabled="row.sort_order === categories.length" @click.stop="moveDown(row)">&#9660;</button>
        </div>
      </template>

      <template #cell-is_active="{ value }">
        <UiTag :variant="value ? 'success' : 'default'">{{ value ? 'Activa' : 'Inactiva' }}</UiTag>
      </template>

      <template #cell-content_count="{ value }">
        {{ value }} elementos
      </template>

      <template #actions="{ row }">
        <UiButton variant="soft" size="sm" @click.stop="editCategory(row)">
          <template #icon><Icon name="lucide:pencil" size="16" /></template>
          Editar
        </UiButton>
        <UiButton variant="danger-ghost" size="sm" @click.stop="handleDelete(row)">
          <template #icon><Icon name="lucide:trash-2" size="16" /></template>
          Eliminar
        </UiButton>
      </template>
    </UiDataTable>

    <!-- Create/Edit Modal -->
    <UiModal v-model="showCreateModal" :title="editingCategory ? 'Editar categoria' : 'Nueva categoria'" variant="center" :show-handle="false">
      <div class="modal-form">
        <UiInput
          v-model="categoryForm.name"
          label="Nombre"
          placeholder="Nombre de la categoria"
        />
        <UiSelect
          v-model="categoryForm.is_active"
          label="Estado"
          :options="[{ value: 'true', label: 'Activa' }, { value: 'false', label: 'Inactiva' }]"
        />
      </div>
      <template #footer>
        <div class="modal-actions">
          <UiButton variant="soft" size="sm" @click="showCreateModal = false">Cancelar</UiButton>
          <UiButton variant="primary-outline" size="sm" @click="saveCategory">{{ editingCategory ? 'Guardar cambios' : 'Crear categoria' }}</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const showCreateModal = ref(false)
const editingCategory = ref<Record<string, any> | null>(null)
const search = ref('')

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

const columns = [
  { key: 'sort_order', label: 'Orden', width: '80px' },
  { key: 'name', label: 'Nombre' },
  { key: 'slug', label: 'Slug' },
  { key: 'is_active', label: 'Estado' },
  { key: 'content_count', label: 'Contenidos' },
]

const categories = ref([
  { id: 'cat-001', name: 'Mindfulness', slug: 'mindfulness', icon_url: '/icons/mindfulness.svg', is_active: true, sort_order: 1, content_count: 42 },
  { id: 'cat-002', name: 'Nutricion', slug: 'nutricion', icon_url: '/icons/nutricion.svg', is_active: true, sort_order: 2, content_count: 38 },
  { id: 'cat-003', name: 'Ejercicio', slug: 'ejercicio', icon_url: '/icons/ejercicio.svg', is_active: true, sort_order: 3, content_count: 31 },
  { id: 'cat-004', name: 'Sueno', slug: 'sueno', icon_url: '/icons/sueno.svg', is_active: true, sort_order: 4, content_count: 19 },
  { id: 'cat-005', name: 'Productividad', slug: 'productividad', icon_url: '/icons/productividad.svg', is_active: true, sort_order: 5, content_count: 25 },
  { id: 'cat-006', name: 'Relaciones', slug: 'relaciones', icon_url: '/icons/relaciones.svg', is_active: true, sort_order: 6, content_count: 15 },
  { id: 'cat-007', name: 'Finanzas personales', slug: 'finanzas-personales', icon_url: '', is_active: false, sort_order: 7, content_count: 8 },
])

const filteredRows = computed(() => {
  if (!search.value) return categories.value
  const q = search.value.toLowerCase()
  return categories.value.filter(r => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q))
})

function editCategory(row: Record<string, any>) {
  editingCategory.value = row
  categoryForm.name = row.name
  categoryForm.is_active = String(row.is_active)
  showCreateModal.value = true
}

function saveCategory() {
  if (editingCategory.value) {
    editingCategory.value.name = categoryForm.name
    editingCategory.value.slug = slugify(categoryForm.name)
    editingCategory.value.is_active = categoryForm.is_active === 'true'
  }
  alert(editingCategory.value ? 'Categoria actualizada (mock)' : 'Categoria creada (mock)')
  showCreateModal.value = false
  editingCategory.value = null
  categoryForm.name = ''
  categoryForm.is_active = 'true'
}

function moveUp(row: Record<string, any>) {
  const idx = categories.value.findIndex(c => c.id === row.id)
  const current = categories.value[idx]
  const prev = categories.value[idx - 1]
  if (idx > 0 && current && prev) {
    current.sort_order--
    prev.sort_order++
    categories.value.sort((a, b) => a.sort_order - b.sort_order)
  }
}

function handleDelete(row: Record<string, any>) {
  if (confirm(`Seguro que deseas eliminar "${row.name}"?`)) {
    categories.value = categories.value.filter(c => c.id !== row.id)
  }
}

function moveDown(row: Record<string, any>) {
  const idx = categories.value.findIndex(c => c.id === row.id)
  const current = categories.value[idx]
  const next = categories.value[idx + 1]
  if (idx < categories.value.length - 1 && current && next) {
    current.sort_order++
    next.sort_order--
    categories.value.sort((a, b) => a.sort_order - b.sort_order)
  }
}
</script>

<style scoped>
.category-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
}

.order-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.order-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  color: var(--color-muted);
  transition: background var(--transition-fast);
}

.order-btn:hover:not(:disabled) {
  background: var(--color-surface-alt);
  color: var(--color-text);
}

.order-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

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
</style>
