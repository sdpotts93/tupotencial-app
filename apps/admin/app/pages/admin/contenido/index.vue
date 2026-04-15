<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Contenido</h1>
      <div class="page-header__actions">
        <UiButton v-if="canEdit" variant="soft" size="sm" @click="openVimeoImport">
          <template #icon><Icon name="lucide:download" size="16" /></template>
          Importar desde Vimeo
        </UiButton>
        <UiButton v-if="canEdit" variant="primary-outline" size="sm" to="/admin/contenido/new">+ Crear contenido</UiButton>
      </div>
    </div>

    <UiDataTable :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading || status === 'pending'" :loading-more="loadingMore" :error="status === 'error'" error-title="No pudimos cargar el contenido" fill @row-click="goToEdit" @load-more="loadMore" @retry="refresh()">
      <template #toolbar>
        <UiInput
          v-model="searchInput"
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
        <UiSelect
          v-model="filterObjective"
          :options="objectiveFilterOptions"
          placeholder="Objetivo"
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

      <template #cell-category="{ value }">
        <span v-if="value.length" class="category-cell">
          <span class="category-cell__name">{{ categoryName(value[0]) }}</span>
          <span v-if="value.length > 1" class="category-cell__more" :data-tooltip="value.slice(1).map(categoryName).join(', ')" @click.stop>+{{ value.length - 1 }}</span>
        </span>
        <span v-else style="color: var(--color-muted);">—</span>
      </template>

      <template #cell-objective="{ value }">
        <span v-if="value.length" class="category-cell">
          <span class="category-cell__name">{{ objectiveName(value[0]) }}</span>
          <span v-if="value.length > 1" class="category-cell__more" :data-tooltip="value.slice(1).map(objectiveName).join(', ')" @click.stop>+{{ value.length - 1 }}</span>
        </span>
        <span v-else style="color: var(--color-muted);">—</span>
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
          <button class="featured-star" :class="{ 'featured-star--active': row.id === featuredId, 'featured-star--disabled': row.status !== 'published' || !canEdit }" :disabled="row.status !== 'published' || !canEdit" @click.stop="toggleFeatured(row.id)">
            <svg v-if="row.id === featuredId" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <Icon v-else name="lucide:star" size="16" />
          </button>
          <span>{{ value }}</span>
        </div>
      </template>

      <template #actions="{ row }">
        <UiButton v-if="canEdit" variant="soft" size="sm" :to="`/admin/contenido/${row.id}`">
          <template #icon><Icon name="lucide:pencil" size="16" /></template>
          Editar
        </UiButton>
        <UiButton v-if="canEdit" variant="danger-ghost" size="sm" @click.stop="handleDelete(row)">
          <template #icon><Icon name="lucide:trash-2" size="16" /></template>
          Eliminar
        </UiButton>
      </template>
    </UiDataTable>
    <!-- Vimeo import modal -->
    <UiModal v-model="showVimeoModal" title="Importar desde Vimeo" :show-close="true">
      <div v-if="vimeoLoading" class="vimeo-import__loading">
        <UiSkeleton v-for="i in 4" :key="i" variant="rect" width="100%" height="64px" radius="var(--radius-md)" />
      </div>
      <div v-else-if="vimeoError" class="vimeo-import__error">
        <p>{{ vimeoError }}</p>
        <UiButton variant="primary-outline" size="sm" @click="fetchVimeoVideos">Reintentar</UiButton>
      </div>
      <template v-else>
        <p v-if="newVimeoVideos.length === 0" class="vimeo-import__empty">
          Todos los videos de Vimeo ya han sido importados.
        </p>
        <div v-else class="vimeo-import__list">
          <label
            v-for="video in newVimeoVideos"
            :key="video.vimeo_id"
            class="vimeo-import__item"
            :class="{ 'vimeo-import__item--selected': selectedVimeoIds.has(video.vimeo_id) }"
          >
            <input
              type="checkbox"
              :checked="selectedVimeoIds.has(video.vimeo_id)"
              class="vimeo-import__checkbox"
              @change="toggleVimeoSelect(video.vimeo_id)"
            />
            <img v-if="video.thumbnail" :src="video.thumbnail" alt="" class="vimeo-import__thumb" />
            <div class="vimeo-import__info">
              <span class="vimeo-import__title">{{ video.title }}</span>
              <span class="vimeo-import__meta">{{ formatDuration(video.duration_seconds) }}</span>
            </div>
          </label>
        </div>
      </template>
      <template #footer>
        <div class="vimeo-import__footer">
          <span v-if="newVimeoVideos.length" class="vimeo-import__count">{{ selectedVimeoIds.size }} seleccionados</span>
          <div class="vimeo-import__actions">
            <UiButton
              variant="soft"
              size="sm"
              :disabled="selectedVimeoIds.size === 0 || vimeoImporting"
              :loading="vimeoImporting"
              @click="importSelectedVideos('draft')"
            >
              Como borrador
            </UiButton>
            <UiButton
              variant="primary-outline"
              size="sm"
              :disabled="selectedVimeoIds.size === 0 || vimeoImporting"
              :loading="vimeoImporting"
              @click="importSelectedVideos('published')"
            >
              Importar y publicar
            </UiButton>
          </div>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()

const { input: searchInput, debounced: search, pending: searchPending } = useDebouncedRef('')
const filterStatus = ref('')
const filterType = ref('')
const filterSegment = ref('')
const filterCategory = ref('')
const filterObjective = ref('')

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

const client = useSupabaseClient()
const { canEdit } = useAdminAuth()

const { data: categories } = useAsyncData('admin-content-categories', async () => {
  const { data } = await client.from('content_categories').select('id, title').order('sort_order')
  return data ?? []
}, { lazy: true })
const categoryFilterOptions = computed(() => [
  { value: '', label: 'Todas las categorías' },
  ...(categories.value ?? []).map(c => ({ value: c.id, label: c.title })),
])

const { data: objectivesData } = useAsyncData('admin-content-objectives', async () => {
  const { data } = await client.from('content_objectives').select('id, title').order('position')
  return data ?? []
}, { lazy: true })
const objectiveFilterOptions = computed(() => [
  { value: '', label: 'Todos los objetivos' },
  ...(objectivesData.value ?? []).map(o => ({ value: o.id, label: o.title })),
])

const { entitlementLabels } = await useAdminEntitlements()

const columns = [
  { key: 'title', label: 'Título', width: '210px' },
  { key: 'content_type', label: 'Tipo' },
  { key: 'segment', label: 'Plan' },
  { key: 'category', label: 'Categoría' },
  { key: 'objective', label: 'Objetivo' },
  { key: 'entitlement_key', label: 'Complemento' },
  { key: 'status', label: 'Estado' },
  { key: 'published_at', label: 'Publicación' },
]

const { rows, hasMore, loading, loadingMore, loadMore, refresh, status } = await useInfiniteTable(
  'admin-content',
  async ({ from, to }) => {
    const catJoin = filterCategory.value
      ? 'content_item_categories!inner(category_id)'
      : 'content_item_categories(category_id)'
    const objJoin = filterObjective.value
      ? 'content_item_objectives!inner(objective_id)'
      : 'content_item_objectives(objective_id)'
    let query = client.from('content_items').select(`id, title, type, plan, status, entitlement_key, published_at, created_at, ${catJoin}, ${objJoin}`)

    if (search.value) query = query.ilike('title', `%${search.value}%`)
    if (filterStatus.value) query = query.eq('status', filterStatus.value)
    if (filterType.value) query = query.eq('type', filterType.value)
    if (filterSegment.value) query = query.eq('plan', filterSegment.value)
    if (filterCategory.value) query = query.eq('content_item_categories.category_id', filterCategory.value)
    if (filterObjective.value) query = query.eq('content_item_objectives.objective_id', filterObjective.value)

    const { data } = await query.range(from, to).order('created_at', { ascending: false })
    return (data ?? []).map(item => ({
      ...item,
      content_type: item.type,
      segment: item.plan,
      category: ((item.content_item_categories as any) ?? []).map((c: any) => c.category_id),
      objective: ((item.content_item_objectives as any) ?? []).map((o: any) => o.objective_id),
    }))
  },
  [search, filterStatus, filterType, filterSegment, filterCategory, filterObjective],
)

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

function categoryName(id: string | null) {
  if (!id) return null
  return (categories.value ?? []).find(c => c.id === id)?.title ?? null
}

function objectiveName(id: string | null) {
  if (!id) return null
  return (objectivesData.value ?? []).find(o => o.id === id)?.title ?? null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

const confirm = useConfirm()

async function handleDelete(row: Record<string, any>) {
  if (!canEdit.value) return
  if (await confirm({ message: `¿Seguro que deseas eliminar "${row.title}"?` })) {
    await client.from('content_items').delete().eq('id', row.id)
    refresh()
  }
}

const featuredId = ref<string | null>(null)

// Load featured content from app_settings
const { data: featuredSetting } = useAsyncData('admin-featured-content', async () => {
  const { data } = await client.from('app_settings').select('value').eq('key', 'biblioteca_featured').maybeSingle()
  return (data?.value as any)?.content_id ?? null
}, { server: false })
watchEffect(() => { featuredId.value = featuredSetting.value })

async function toggleFeatured(id: string) {
  if (!canEdit.value) return
  const newId = featuredId.value === id ? null : id
  featuredId.value = newId
  await client.from('app_settings').upsert({
    key: 'biblioteca_featured',
    value: { content_id: newId },
    updated_at: new Date().toISOString(),
  })
}

function goToEdit(row: Record<string, any>) {
  if (!canEdit.value) return
  router.push(`/admin/contenido/${row.id}`)
}

// ── Vimeo import ──
interface VimeoVideo {
  vimeo_id: string
  title: string
  description: string | null
  duration_seconds: number
  thumbnail: string | null
  is_past_event_recording: boolean
}

const showVimeoModal = ref(false)
const vimeoLoading = ref(false)
const vimeoError = ref('')
const vimeoImporting = ref(false)
const vimeoVideos = ref<VimeoVideo[]>([])
const selectedVimeoIds = reactive(new Set<string>())
const EVENT_RECORDINGS_SLUG = 'eventos-grabados'

const newVimeoVideos = computed(() => vimeoVideos.value)

async function fetchVimeoVideos() {
  vimeoLoading.value = true
  vimeoError.value = ''
  try {
    const res = await $fetch<{ videos: VimeoVideo[] }>('/api/vimeo/videos')
    vimeoVideos.value = res.videos
  } catch (e: any) {
    vimeoError.value = e?.data?.message || 'Error al obtener videos de Vimeo'
  } finally {
    vimeoLoading.value = false
  }
}

function openVimeoImport() {
  showVimeoModal.value = true
  selectedVimeoIds.clear()
  fetchVimeoVideos()
}

function toggleVimeoSelect(id: string) {
  if (selectedVimeoIds.has(id)) selectedVimeoIds.delete(id)
  else selectedVimeoIds.add(id)
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

async function importSelectedVideos(status: 'draft' | 'published') {
  vimeoImporting.value = true
  const toast = useToast()
  try {
    const selected = vimeoVideos.value.filter(v => selectedVimeoIds.has(v.vimeo_id))
    const now = new Date().toISOString()
    const payloads = selected.map(v => ({
      title: v.title,
      description: v.description || v.title,
      type: 'video' as const,
      vimeo_id: v.vimeo_id,
      duration_seconds: v.duration_seconds,
      thumbnail_url: v.thumbnail,
      plan: 'free' as const,
      status,
      published_at: status === 'published' ? now : null,
    }))
    const { data: insertedRows, error } = await client.from('content_items').insert(payloads).select('id')
    if (error) throw error

    const recordedEventSelections = selected
      .map((video, index) => ({ video, row: insertedRows?.[index] }))
      .filter((entry): entry is { video: VimeoVideo; row: { id: string } } => Boolean(entry.video.is_past_event_recording && entry.row?.id))

    if (recordedEventSelections.length) {
      const { data: recordingCategory } = await client
        .from('content_categories')
        .select('id')
        .eq('slug', EVENT_RECORDINGS_SLUG)
        .maybeSingle()

      if (recordingCategory?.id) {
        const { error: categoryError } = await client.from('content_item_categories').insert(
          recordedEventSelections.map(({ row }) => ({
            content_item_id: row.id,
            category_id: recordingCategory.id,
          })),
        )
        if (categoryError) throw categoryError
      }
    }

    const label = status === 'published' ? 'publicados' : 'importados como borrador'
    toast.show(`${selected.length} video(s) ${label}`, 'success')
    showVimeoModal.value = false
    refresh()
  } catch {
    useToast().show('Error al importar videos', 'error')
  } finally {
    vimeoImporting.value = false
  }
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

.featured-star--disabled {
  opacity: 0.25;
  cursor: not-allowed;
}


.category-cell {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  white-space: nowrap;
}

.category-cell__name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-cell__more {
  position: relative;
  flex-shrink: 0;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-primary);
  background: var(--color-primary-light, #e0e7ff);
  padding: 4px 6px 1px;
  border-radius: var(--radius-full);
  cursor: default;
}

.category-cell__more::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-text, #1a1a1a);
  color: #fff;
  font-size: var(--text-xs);
  font-weight: var(--weight-normal);
  padding: 4px 8px;
  border-radius: var(--radius-md);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 150ms ease;
  z-index: 10;
}

.category-cell__more:hover::after {
  opacity: 1;
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
