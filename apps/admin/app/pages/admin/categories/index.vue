<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Categorias</h1>
      <div class="page-header__actions">
        <UiButton size="sm" @click="showCreateModal = true">+ Nueva categoria</UiButton>
      </div>
    </div>

    <UiDataTable :columns="columns" :rows="categories" @row-click="editCategory">
      <template #cell-icon_url="{ value }">
        <div class="category-icon">
          {{ value ? '🎯' : '—' }}
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
        <UiButton variant="ghost" size="sm" @click.stop="editCategory(row)">Editar</UiButton>
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
        <UiInput
          v-model="categoryForm.slug"
          label="Slug"
          placeholder="nombre-de-la-categoria"
          hint="Identificador unico para URLs"
        />
        <UiInput
          v-model="categoryForm.icon_url"
          label="URL del icono"
          placeholder="https://ejemplo.com/icono.svg"
        />
        <UiSelect
          v-model="categoryForm.is_active"
          label="Estado"
          :options="[{ value: 'true', label: 'Activa' }, { value: 'false', label: 'Inactiva' }]"
        />
      </div>
      <template #footer>
        <div class="modal-actions">
          <UiButton variant="outline" size="sm" @click="showCreateModal = false">Cancelar</UiButton>
          <UiButton size="sm" @click="saveCategory">{{ editingCategory ? 'Guardar cambios' : 'Crear categoria' }}</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const showCreateModal = ref(false)
const editingCategory = ref<Record<string, any> | null>(null)

const categoryForm = reactive({
  name: '',
  slug: '',
  icon_url: '',
  is_active: 'true',
})

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

function editCategory(row: Record<string, any>) {
  editingCategory.value = row
  categoryForm.name = row.name
  categoryForm.slug = row.slug
  categoryForm.icon_url = row.icon_url
  categoryForm.is_active = String(row.is_active)
  showCreateModal.value = true
}

function saveCategory() {
  alert(editingCategory.value ? 'Categoria actualizada (mock)' : 'Categoria creada (mock)')
  showCreateModal.value = false
  editingCategory.value = null
  categoryForm.name = ''
  categoryForm.slug = ''
  categoryForm.icon_url = ''
  categoryForm.is_active = 'true'
}

function moveUp(row: Record<string, any>) {
  const idx = categories.value.findIndex(c => c.id === row.id)
  if (idx > 0) {
    categories.value[idx].sort_order--
    categories.value[idx - 1].sort_order++
    categories.value.sort((a, b) => a.sort_order - b.sort_order)
  }
}

function moveDown(row: Record<string, any>) {
  const idx = categories.value.findIndex(c => c.id === row.id)
  if (idx < categories.value.length - 1) {
    categories.value[idx].sort_order++
    categories.value[idx + 1].sort_order--
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
