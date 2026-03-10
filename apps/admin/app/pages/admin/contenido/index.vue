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
          placeholder="Buscar por titulo..."
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
          placeholder="Segmento"
        />
        <UiSelect
          v-model="filterCategory"
          :options="categoryFilterOptions"
          placeholder="Categoria"
        />
      </template>

      <template #cell-status="{ value }">
        <UiTag :variant="statusVariant(value)">{{ statusLabel(value) }}</UiTag>
      </template>

      <template #cell-content_type="{ value }">
        <UiTag variant="info">{{ typeLabel(value) }}</UiTag>
      </template>

      <template #cell-segment="{ value }">
        {{ segmentLabel(value) }}
      </template>

      <template #cell-published_at="{ value }">
        {{ value ? formatDate(value) : 'Sin publicar' }}
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
  { value: 'article', label: 'Articulo' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'infographic', label: 'Infografia' },
]

const segmentOptions = [
  { value: '', label: 'Todos los segmentos' },
  { value: 'all', label: 'General' },
  { value: 'free', label: 'Gratuito' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Empresarial' },
]

const categoryFilterOptions = [
  { value: '', label: 'Todas las categorias' },
  { value: 'cat-001', label: 'Mindfulness' },
  { value: 'cat-002', label: 'Nutricion' },
  { value: 'cat-003', label: 'Ejercicio' },
  { value: 'cat-004', label: 'Sueno' },
  { value: 'cat-005', label: 'Productividad' },
  { value: 'cat-006', label: 'Relaciones' },
]

const columns = [
  { key: 'title', label: 'Titulo', width: '30%' },
  { key: 'content_type', label: 'Tipo' },
  { key: 'segment', label: 'Segmento' },
  { key: 'status', label: 'Estado' },
  { key: 'published_at', label: 'Publicacion' },
]

const rows = ref([
  { id: 'cnt-001', title: '5 pasos para el bienestar emocional', content_type: 'article', segment: 'all', category: 'cat-001', status: 'published', published_at: '2026-02-20T08:00:00' },
  { id: 'cnt-002', title: 'Meditacion guiada para la manana', content_type: 'audio', segment: 'premium', category: 'cat-001', status: 'published', published_at: '2026-02-18T06:00:00' },
  { id: 'cnt-003', title: 'Nutricion consciente: guia basica', content_type: 'article', segment: 'free', category: 'cat-002', status: 'published', published_at: '2026-02-15T10:00:00' },
  { id: 'cnt-004', title: 'Rutina de yoga para principiantes', content_type: 'video', segment: 'premium', category: 'cat-003', status: 'published', published_at: '2026-02-12T07:00:00' },
  { id: 'cnt-005', title: 'Infografia: ciclo del sueno', content_type: 'infographic', segment: 'all', category: 'cat-004', status: 'draft', published_at: null },
  { id: 'cnt-006', title: 'Como manejar el estres laboral', content_type: 'article', segment: 'enterprise', category: 'cat-005', status: 'draft', published_at: null },
  { id: 'cnt-007', title: 'Ejercicios de respiracion 4-7-8', content_type: 'video', segment: 'free', category: 'cat-001', status: 'published', published_at: '2026-02-10T09:00:00' },
  { id: 'cnt-008', title: 'Alimentacion para la energia diaria', content_type: 'article', segment: 'premium', category: 'cat-002', status: 'archived', published_at: '2026-01-28T08:00:00' },
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
  const map: Record<string, string> = { article: 'Articulo', video: 'Video', audio: 'Audio', infographic: 'Infografia' }
  return map[type] ?? type
}

function segmentLabel(segment: string) {
  const map: Record<string, string> = { all: 'General', free: 'Gratuito', premium: 'Premium', enterprise: 'Empresarial' }
  return map[segment] ?? segment
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function handleDelete(row: Record<string, any>) {
  if (confirm(`Seguro que deseas eliminar "${row.title}"?`)) {
    rows.value = rows.value.filter(r => r.id !== row.id)
  }
}

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/contenido/${row.id}`)
}
</script>
