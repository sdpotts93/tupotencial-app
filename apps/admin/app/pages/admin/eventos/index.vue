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
            placeholder="Buscar por título..."
            style="min-width: 200px;"
          >
            <template #suffix><Icon name="lucide:search" size="18" /></template>
          </UiInput>
        </template>

        <template #cell-starts_at="{ value }">
          {{ formatDateTime(value) }}
        </template>

        <template #cell-plan="{ value }">
          <UiTag :variant="value === 'core' ? 'gold' : 'default'">{{ value === 'core' ? 'Core' : 'Gratuito' }}</UiTag>
        </template>

        <template #cell-entitlement_key="{ value }">
          <UiTag v-if="value" variant="accent">{{ entitlementLabels[value] ?? value }}</UiTag>
          <span v-else style="color: var(--color-muted);">—</span>
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
  { value: 'upcoming', label: 'Próximos' },
  { value: 'past', label: 'Pasados' },
  { value: 'draft', label: 'Borradores' },
]

const columns = [
  { key: 'title', label: 'Evento', width: '24%' },
  { key: 'starts_at', label: 'Fecha y hora' },
  { key: 'plan', label: 'Plan' },
  { key: 'entitlement_key', label: 'Complemento' },
  { key: 'registered_count', label: 'Registrados' },
  { key: 'status', label: 'Estado' },
]

const rows = ref([
  { id: 'evt-001', title: 'Taller de mindfulness para principiantes', starts_at: '2026-03-05T18:00:00', plan: 'core', registered_count: 234, status: 'published', is_upcoming: true, entitlement_key: null as string | null },
  { id: 'evt-002', title: 'Clase de yoga restaurativa', starts_at: '2026-03-08T10:00:00', plan: 'core', registered_count: 156, status: 'published', is_upcoming: true, entitlement_key: 'vip' as string | null },
  { id: 'evt-003', title: 'Conferencia: Nutrición y bienestar', starts_at: '2026-03-15T17:00:00', plan: 'free', registered_count: 89, status: 'published', is_upcoming: true, entitlement_key: null as string | null },
  { id: 'evt-004', title: 'Retiro de fin de semana', starts_at: '2026-03-22T09:00:00', plan: 'core', registered_count: 42, status: 'published', is_upcoming: true, entitlement_key: 'retiro_marzo_2026' as string | null },
  { id: 'evt-005', title: 'Mesa redonda: Salud mental en el trabajo', starts_at: '2026-02-20T16:00:00', plan: 'free', registered_count: 312, status: 'published', is_upcoming: false, entitlement_key: null as string | null },
  { id: 'evt-006', title: 'Taller de cocina saludable', starts_at: '2026-04-01T11:00:00', plan: 'free', registered_count: 0, status: 'draft', is_upcoming: true, entitlement_key: null as string | null },
  { id: 'evt-007', title: 'Masterclass de liderazgo consciente', starts_at: '2026-02-10T17:00:00', plan: 'core', registered_count: 189, status: 'published', is_upcoming: false, entitlement_key: 'bootcamp_liderazgo' as string | null },
])

const entitlementLabels: Record<string, string> = {
  vip: 'VIP',
  mentoria_grupal: 'Mentoría grupal',
  bootcamp_liderazgo: 'Bootcamp: Liderazgo',
  coaching_1on1: 'Coaching 1:1',
  retiro_marzo_2026: 'Retiro marzo 2026',
}

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
