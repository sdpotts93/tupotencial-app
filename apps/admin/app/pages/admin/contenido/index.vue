<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Contenido</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" to="/admin/contenido/new">+ Crear contenido</UiButton>
      </div>
    </div>

    <UiDataTable :columns="columns" :rows="filteredRows" fill @row-click="goToEdit">
      <template #toolbar>
        <UiInput
          v-model="search"
          placeholder="Buscar por título..."
          style="min-width: 200px;"
        >
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
        <UiSelect
          v-model="filterStatus"
          :options="statusOptions"
          placeholder="Estado"
        />
        <UiSelect
          v-model="filterType"
          :options="typeOptions"
          placeholder="Tipo"
        />
        <UiSelect
          v-model="filterSegment"
          :options="segmentOptions"
          placeholder="Plan"
        />
        <UiSelect
          v-model="filterCategory"
          :options="categoryFilterOptions"
          placeholder="Categoría"
        />
      </template>

      <template #cell-status="{ value }">
        <UiTag :variant="statusVariant(value)">{{ statusLabel(value) }}</UiTag>
      </template>

      <template #cell-content_type="{ value }">
        <UiTag variant="info">{{ typeLabel(value) }}</UiTag>
      </template>

      <template #cell-segment="{ value }">
        <UiTag :variant="value === 'core' ? 'gold' : 'default'">{{ value === 'core' ? 'Core' : 'Gratuito' }}</UiTag>
      </template>

      <template #cell-entitlement_key="{ value }">
        <UiTag v-if="value" variant="accent">{{ entitlementLabels[value] ?? value }}</UiTag>
        <span v-else style="color: var(--color-muted);">—</span>
      </template>

      <template #cell-published_at="{ value }">
        {{ value ? formatDate(value) : 'Sin publicar' }}
      </template>

      <template #cell-title="{ row, value }">
        <div class="title-cell">
          <button class="featured-star" :class="{ 'featured-star--active': row.id === featuredId }" @click.stop="toggleFeatured(row.id)">
            <Icon :name="row.id === featuredId ? 'lucide:star' : 'lucide:star'" size="16" />
          </button>
          <span>{{ value }}</span>
        </div>
      </template>

      <template #actions="{ row }">
        <UiButton variant="soft" size="sm" :to="`/admin/contenido/${row.id}`">
          <template #icon><Icon name="lucide:pencil" size="16" /></template>
          Editar
        </UiButton>
        <UiButton variant="danger-ghost" size="sm" @click.stop="handleDelete(row)">
          <template #icon><Icon name="lucide:trash-2" size="16" /></template>
          Eliminar
        </UiButton>
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()

const search = ref('')
const filterStatus = ref('')
const filterType = ref('')
const filterSegment = ref('')
const filterCategory = ref('')

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

const typeOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'article', label: 'Artículo' },
]

const segmentOptions = [
  { value: '', label: 'Todos los planes' },
  { value: 'free', label: 'Gratuito' },
  { value: 'core', label: 'Core' },
]

const categoryFilterOptions = [
  { value: '', label: 'Todas las categorías' },
  { value: 'cat-001', label: 'Mindfulness' },
  { value: 'cat-002', label: 'Nutrición' },
  { value: 'cat-003', label: 'Ejercicio' },
  { value: 'cat-004', label: 'Sueño' },
  { value: 'cat-005', label: 'Productividad' },
  { value: 'cat-006', label: 'Relaciones' },
]

const entitlementLabels: Record<string, string> = {
  vip: 'VIP',
  mentoria_grupal: 'Mentoría grupal',
  bootcamp_liderazgo: 'Bootcamp: Liderazgo',
  coaching_1on1: 'Coaching 1:1',
  retiro_marzo_2026: 'Retiro marzo 2026',
}

const columns = [
  { key: 'title', label: 'Título', width: '210px' },
  { key: 'content_type', label: 'Tipo' },
  { key: 'segment', label: 'Plan' },
  { key: 'entitlement_key', label: 'Complemento' },
  { key: 'status', label: 'Estado' },
  { key: 'published_at', label: 'Publicación' },
]

const rows = ref([
  { id: 'cnt-001', title: '5 pasos para el bienestar emocional', content_type: 'video', segment: 'core', category: 'cat-001', status: 'published', published_at: '2026-02-20T08:00:00', entitlement_key: null as string | null },
  { id: 'cnt-002', title: 'Meditación guiada para la mañana', content_type: 'audio', segment: 'core', category: 'cat-001', status: 'published', published_at: '2026-02-18T06:00:00', entitlement_key: null as string | null },
  { id: 'cnt-003', title: 'Nutrición consciente: guía básica', content_type: 'article', segment: 'free', category: 'cat-002', status: 'published', published_at: '2026-02-15T10:00:00', entitlement_key: null as string | null },
  { id: 'cnt-004', title: 'Rutina de yoga para principiantes', content_type: 'video', segment: 'core', category: 'cat-003', status: 'published', published_at: '2026-02-12T07:00:00', entitlement_key: null as string | null },
  { id: 'cnt-005', title: 'Higiene del sueño: consejos prácticos', content_type: 'article', segment: 'free', category: 'cat-004', status: 'draft', published_at: null, entitlement_key: 'vip' as string | null },
  { id: 'cnt-006', title: 'Como manejar el estrés laboral', content_type: 'audio', segment: 'free', category: 'cat-005', status: 'draft', published_at: null, entitlement_key: null as string | null },
  { id: 'cnt-007', title: 'Ejercicios de respiración 4-7-8', content_type: 'video', segment: 'free', category: 'cat-001', status: 'published', published_at: '2026-02-10T09:00:00', entitlement_key: null as string | null },
  { id: 'cnt-008', title: 'Alimentación para la energía diaria', content_type: 'article', segment: 'core', category: 'cat-002', status: 'archived', published_at: '2026-01-28T08:00:00', entitlement_key: 'bootcamp_liderazgo' as string | null },
])

const filteredRows = computed(() => {
  return rows.value.filter(row => {
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!row.title.toLowerCase().includes(q)) return false
    }
    if (filterStatus.value && row.status !== filterStatus.value) return false
    if (filterType.value && row.content_type !== filterType.value) return false
    if (filterSegment.value && row.segment !== filterSegment.value) return false
    if (filterCategory.value && row.category !== filterCategory.value) return false
    return true
  })
})

function statusVariant(status: string) {
  const map: Record<string, string> = { published: 'success', draft: 'warning', archived: 'default' }
  return (map[status] ?? 'default') as any
}

function statusLabel(status: string) {
  const map: Record<string, string> = { published: 'Publicado', draft: 'Borrador', archived: 'Archivado' }
  return map[status] ?? status
}

function typeLabel(type: string) {
  const map: Record<string, string> = { video: 'Video', audio: 'Audio', article: 'Artículo' }
  return map[type] ?? type
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function handleDelete(row: Record<string, any>) {
  if (confirm(`¿Seguro que deseas eliminar "${row.title}"?`)) {
    rows.value = rows.value.filter(r => r.id !== row.id)
  }
}

const featuredId = ref<string | null>('cnt-001')

function toggleFeatured(id: string) {
  featuredId.value = featuredId.value === id ? null : id
}

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/contenido/${row.id}`)
}
</script>

<style scoped>
.title-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.featured-star {
  all: unset;
  cursor: pointer;
  color: var(--color-muted);
  display: flex;
  align-items: center;
  transition: color var(--transition-fast);
  flex-shrink: 0;
}

@media (hover: hover) {
  .featured-star:hover {
    color: var(--color-warning, #e0a500);
  }
}

.featured-star--active {
  color: var(--color-warning, #e0a500);
}
</style>
