<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Eventos</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" to="/admin/eventos/new">+ Nuevo evento</UiButton>
      </div>
    </div>

    <UiTabs v-model="activeTab" :tabs="tabs" />

    <div class="tab-content">
      <UiDataTable fill :columns="columns" :rows="filteredRows" @row-click="goToEdit">
        <template #toolbar>
          <UiInput
            v-model="search"
            placeholder="Buscar por titulo..."
            style="min-width: 200px;"
          >
            <template #suffix><Icon name="lucide:search" size="18" /></template>
          </UiInput>
        </template>

        <template #cell-event_type="{ value }">
          <UiTag :variant="typeVariant(value)">{{ typeLabel(value) }}</UiTag>
        </template>

        <template #cell-starts_at="{ value }">
          {{ formatDateTime(value) }}
        </template>

        <template #cell-modality="{ value }">
          {{ modalityLabel(value) }}
        </template>

        <template #cell-registered_count="{ value }">
          {{ value?.toLocaleString('es-MX') ?? 0 }}
        </template>

        <template #cell-status="{ value }">
          <UiTag :variant="statusVariant(value)">{{ statusLabel(value) }}</UiTag>
        </template>

        <template #actions="{ row }">
          <UiButton variant="soft" size="sm" :to="`/admin/eventos/${row.id}`">
            <template #icon><Icon name="lucide:pencil" size="16" /></template>
            Editar
          </UiButton>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const search = ref('')
const activeTab = ref('upcoming')

const tabs = [
  { value: 'upcoming', label: 'Proximos' },
  { value: 'past', label: 'Pasados' },
  { value: 'draft', label: 'Borradores' },
]

const columns = [
  { key: 'title', label: 'Evento', width: '28%' },
  { key: 'event_type', label: 'Tipo' },
  { key: 'starts_at', label: 'Fecha y hora' },
  { key: 'modality', label: 'Modalidad' },
  { key: 'registered_count', label: 'Registrados' },
  { key: 'status', label: 'Estado' },
]

const rows = ref([
  { id: 'evt-001', title: 'Taller de mindfulness para principiantes', event_type: 'workshop', starts_at: '2026-03-05T18:00:00', modality: 'online', registered_count: 234, status: 'published', is_upcoming: true },
  { id: 'evt-002', title: 'Clase de yoga restaurativa', event_type: 'class', starts_at: '2026-03-08T10:00:00', modality: 'online', registered_count: 156, status: 'published', is_upcoming: true },
  { id: 'evt-003', title: 'Conferencia: Nutricion y bienestar', event_type: 'conference', starts_at: '2026-03-15T17:00:00', modality: 'hybrid', registered_count: 89, status: 'published', is_upcoming: true },
  { id: 'evt-004', title: 'Retiro de fin de semana', event_type: 'retreat', starts_at: '2026-03-22T09:00:00', modality: 'presential', registered_count: 42, status: 'published', is_upcoming: true },
  { id: 'evt-005', title: 'Mesa redonda: Salud mental en el trabajo', event_type: 'conference', starts_at: '2026-02-20T16:00:00', modality: 'online', registered_count: 312, status: 'published', is_upcoming: false },
  { id: 'evt-006', title: 'Taller de cocina saludable', event_type: 'workshop', starts_at: '2026-04-01T11:00:00', modality: 'online', registered_count: 0, status: 'draft', is_upcoming: true },
])

const filteredRows = computed(() => {
  let result = rows.value
  if (activeTab.value === 'upcoming') result = result.filter(r => r.is_upcoming && r.status !== 'draft')
  else if (activeTab.value === 'past') result = result.filter(r => !r.is_upcoming)
  else if (activeTab.value === 'draft') result = result.filter(r => r.status === 'draft')
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r => r.title.toLowerCase().includes(q))
  }
  return result
})

function typeVariant(type: string) {
  const map: Record<string, string> = { workshop: 'warning', class: 'info', conference: 'accent', retreat: 'success' }
  return (map[type] ?? 'default') as any
}

function typeLabel(type: string) {
  const map: Record<string, string> = { workshop: 'Taller', class: 'Clase', conference: 'Conferencia', retreat: 'Retiro' }
  return map[type] ?? type
}

function modalityLabel(modality: string) {
  const map: Record<string, string> = { online: 'En linea', presential: 'Presencial', hybrid: 'Hibrido' }
  return map[modality] ?? modality
}

function statusVariant(status: string) {
  const map: Record<string, string> = { published: 'success', draft: 'warning', cancelled: 'danger' }
  return (map[status] ?? 'default') as any
}

function statusLabel(status: string) {
  const map: Record<string, string> = { published: 'Publicado', draft: 'Borrador', cancelled: 'Cancelado' }
  return map[status] ?? status
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/eventos/${row.id}`)
}
</script>

<style scoped>
.tab-content {
  margin-top: var(--space-6);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
