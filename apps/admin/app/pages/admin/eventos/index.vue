<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Eventos</h1>
      <div class="page-header__actions">
        <UiButton v-if="canEdit" variant="soft" size="sm" @click="openVimeoImport">
          <template #icon><Icon name="lucide:download" size="16" /></template>
          Importar desde Vimeo
        </UiButton>
        <UiButton v-if="canEdit" variant="primary-outline" size="sm" to="/admin/eventos/new">+ Nuevo evento</UiButton>
      </div>
    </div>

    <UiTabs v-model="activeTab" :tabs="tabs" />

    <div class="tab-content">
      <UiDataTable fill :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading || status === 'pending'" :loading-more="loadingMore" :error="status === 'error'" error-title="No pudimos cargar los eventos" @row-click="handleRowClick" @load-more="loadMore" @retry="refresh()">
        <template #toolbar>
          <UiInput
            v-model="searchInput"
            placeholder="Buscar por título..."
            style="min-width: 200px;"
          >
            <template #suffix><Icon name="lucide:search" size="18" /></template>
          </UiInput>
        </template>

        <template #cell-starts_at="{ value }">
          {{ value ? formatDateTime(value) : '—' }}
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

        <template v-if="activeTab !== 'past'" #actions="{ row }">
          <UiButton variant="soft" size="sm" :to="`/admin/eventos/${row.id}`">
            <template #icon><Icon name="lucide:pencil" size="16" /></template>
            Editar
          </UiButton>
        </template>
      </UiDataTable>
    </div>

    <!-- Vimeo import modal -->
    <UiModal v-model="showVimeoModal" title="Importar desde Vimeo" :show-close="true">
      <div v-if="vimeoLoading" class="vimeo-import__loading">
        <UiSkeleton v-for="i in 4" :key="i" variant="rect" width="100%" height="64px" radius="var(--radius-md)" />
      </div>
      <div v-else-if="vimeoError" class="vimeo-import__error">
        <p>{{ vimeoError }}</p>
        <UiButton variant="primary-outline" size="sm" @click="fetchVimeoEvents">Reintentar</UiButton>
      </div>
      <template v-else>
        <p v-if="vimeoEvents.length === 0" class="vimeo-import__empty">
          No hay lives próximos por importar. Los lives terminados se importan desde Contenido.
        </p>
        <div v-else class="vimeo-import__list">
          <label
            v-for="ev in vimeoEvents"
            :key="ev.vimeo_live_event_id"
            class="vimeo-import__item"
            :class="{ 'vimeo-import__item--selected': selectedEventIds.has(ev.vimeo_live_event_id) }"
          >
            <input
              type="checkbox"
              :checked="selectedEventIds.has(ev.vimeo_live_event_id)"
              class="vimeo-import__checkbox"
              @change="toggleEventSelect(ev.vimeo_live_event_id)"
            />
            <img v-if="ev.thumbnail" :src="ev.thumbnail" alt="" class="vimeo-import__thumb" />
            <div class="vimeo-import__info">
              <span class="vimeo-import__title">{{ ev.title }}</span>
              <span v-if="ev.description" class="vimeo-import__meta">{{ ev.description.slice(0, 80) }}</span>
            </div>
          </label>
        </div>
      </template>
      <template #footer>
        <div class="vimeo-import__footer">
          <span v-if="vimeoEvents.length" class="vimeo-import__count">{{ selectedEventIds.size }} seleccionados</span>
          <UiButton
            variant="primary-outline"
            size="sm"
            :disabled="selectedEventIds.size === 0 || vimeoImporting"
            :loading="vimeoImporting"
            @click="importSelectedEvents"
          >
            Importar como borrador
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const { input: searchInput, debounced: search, pending: searchPending } = useDebouncedRef('')
const activeTab = ref('upcoming')

const tabs = [
  { value: 'upcoming', label: 'Próximos' },
  { value: 'past', label: 'Historial' },
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

const client = useSupabaseClient()
const { canEdit } = useAdminAuth()

const { rows, hasMore, loading, loadingMore, loadMore, refresh, status } = await useInfiniteTable(
  'admin-events',
  async ({ from, to }) => {
    let query = client.from('events').select('id, title, description, start_at, end_at, plan, entitlement_key, status, cover_url, created_at, event_registrations(count)')

    const now = new Date().toISOString()
    if (activeTab.value === 'upcoming') {
      query = query.gt('start_at', now).neq('status', 'draft')
    } else if (activeTab.value === 'past') {
      query = query.lte('start_at', now)
    } else if (activeTab.value === 'draft') {
      query = query.eq('status', 'draft')
    }

    if (search.value) query = query.ilike('title', `%${search.value}%`)

    const { data } = await query.range(from, to).order('start_at', { ascending: false })
    return (data ?? []).map(e => ({
      ...e,
      starts_at: e.start_at,
      registered_count: (e.event_registrations as any)?.[0]?.count ?? 0,
    }))
  },
  [activeTab, search],
)

const { entitlementLabels } = await useAdminEntitlements()
const { formatAdminEventDateTime } = useAdminEventTime()

function statusVariant(status: string) {
  const map: Record<string, string> = { published: 'success', draft: 'warning', cancelled: 'danger' }
  return (map[status] ?? 'default') as any
}

function statusLabel(status: string) {
  const map: Record<string, string> = { published: 'Publicado', draft: 'Borrador', cancelled: 'Cancelado' }
  return map[status] ?? status
}

function formatDateTime(iso: string) {
  return formatAdminEventDateTime(iso)
}

function handleRowClick(row: Record<string, any>) {
  if (!canEdit.value) return
  if (activeTab.value === 'past') return
  router.push(`/admin/eventos/${row.id}`)
}

// ── Vimeo live event import ──
interface VimeoEvent {
  vimeo_live_event_id: string
  title: string
  description: string | null
  duration_seconds: number
  thumbnail: string | null
}

const showVimeoModal = ref(false)
const vimeoLoading = ref(false)
const vimeoError = ref('')
const vimeoImporting = ref(false)
const vimeoEvents = ref<VimeoEvent[]>([])
const selectedEventIds = reactive(new Set<string>())

async function fetchVimeoEvents() {
  vimeoLoading.value = true
  vimeoError.value = ''
  try {
    const res = await $fetch<{ events: VimeoEvent[] }>('/api/vimeo/events')
    vimeoEvents.value = res.events
  } catch (e: any) {
    vimeoError.value = e?.data?.message || 'Error al obtener eventos de Vimeo'
  } finally {
    vimeoLoading.value = false
  }
}

function openVimeoImport() {
  showVimeoModal.value = true
  selectedEventIds.clear()
  fetchVimeoEvents()
}

function toggleEventSelect(id: string) {
  if (selectedEventIds.has(id)) selectedEventIds.delete(id)
  else selectedEventIds.add(id)
}

async function importSelectedEvents() {
  vimeoImporting.value = true
  const toast = useToast()
  try {
    const selected = vimeoEvents.value.filter(e => selectedEventIds.has(e.vimeo_live_event_id))
    const payloads = selected.map(e => ({
      title: e.title,
      description: e.description?.slice(0, 500) || null,
      vimeo_live_event_id: e.vimeo_live_event_id,
      cover_url: e.thumbnail,
      plan: 'free' as const,
      status: 'draft' as const,
    }))
    const { error } = await client.from('events').insert(payloads)
    if (error) throw error
    toast.show(`${selected.length} evento(s) importados como borrador`, 'success')
    showVimeoModal.value = false
    activeTab.value = 'draft'
    refresh()
  } catch {
    useToast().show('Error al importar eventos', 'error')
  } finally {
    vimeoImporting.value = false
  }
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


/* ─── Vimeo import modal ─── */
.vimeo-import__loading {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.vimeo-import__error {
  text-align: center;
  color: var(--color-danger);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) 0;
}

.vimeo-import__empty {
  text-align: center;
  color: var(--color-muted);
  padding: var(--space-6) 0;
  font-size: var(--text-sm);
}

.vimeo-import__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 400px;
  overflow-y: auto;
}

.vimeo-import__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

@media (hover: hover) {
  .vimeo-import__item:hover {
    background: var(--color-surface-alt);
  }
}

.vimeo-import__item--selected {
  background: rgba(var(--tint-rgb), 0.06);
}

.vimeo-import__checkbox {
  flex-shrink: 0;
  accent-color: var(--color-tint);
}

.vimeo-import__thumb {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.vimeo-import__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.vimeo-import__title {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vimeo-import__meta {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.vimeo-import__footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
}

.vimeo-import__actions {
  display: flex;
  gap: var(--space-2);
  width: 100%;
}

.vimeo-import__actions > * {
  flex: 1;
}

.vimeo-import__count {
  font-size: var(--text-sm);
  color: var(--color-muted);
}
</style>
