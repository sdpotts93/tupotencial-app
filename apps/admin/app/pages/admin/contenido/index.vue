<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Contenido</h1>
      <div class="page-header__actions">
        <UiButton v-if="canEdit" variant="primary-outline" size="sm" to="/admin/contenido/new">+ Crear contenido</UiButton>
      </div>
    </div>

    <UiDataTable :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading" :loading-more="loadingMore" fill @row-click="goToEdit" @load-more="loadMore">
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
        <span v-if="categoryName(value)" style="white-space: nowrap;">{{ categoryName(value) }}</span>
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
          <button class="featured-star" :class="{ 'featured-star--active': row.id === featuredId, 'featured-star--disabled': row.status !== 'published' }" :disabled="row.status !== 'published'" @click.stop="toggleFeatured(row.id)">
            <svg v-if="row.id === featuredId" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <Icon v-else name="lucide:star" size="16" />
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

const { input: searchInput, debounced: search, pending: searchPending } = useDebouncedRef('')
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

const client = useSupabaseClient()
const { canEdit } = useAdminAuth()

const { data: categories } = await useAsyncData('admin-content-categories', async () => {
  const { data } = await client.from('content_categories').select('id, title').order('sort_order')
  return data ?? []
})
const categoryFilterOptions = computed(() => [
  { value: '', label: 'Todas las categorías' },
  ...(categories.value ?? []).map(c => ({ value: c.id, label: c.title })),
])

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
  { key: 'category', label: 'Categoría' },
  { key: 'entitlement_key', label: 'Complemento' },
  { key: 'status', label: 'Estado' },
  { key: 'published_at', label: 'Publicación' },
]

const { rows, hasMore, loading, loadingMore, loadMore, refresh } = await useInfiniteTable(
  'admin-content',
  async ({ from, to }) => {
    const selectStr = filterCategory.value
      ? '*, content_item_categories!inner(category_id)'
      : '*, content_item_categories(category_id)'
    let query = client.from('content_items').select(selectStr)

    if (search.value) query = query.ilike('title', `%${search.value}%`)
    if (filterStatus.value) query = query.eq('status', filterStatus.value)
    if (filterType.value) query = query.eq('type', filterType.value)
    if (filterSegment.value) query = query.eq('plan', filterSegment.value)
    if (filterCategory.value) query = query.eq('content_item_categories.category_id', filterCategory.value)

    const { data } = await query.range(from, to).order('created_at', { ascending: false })
    return (data ?? []).map(item => ({
      ...item,
      content_type: item.type,
      segment: item.plan,
      category: (item.content_item_categories as any)?.[0]?.category_id ?? null,
    }))
  },
  [search, filterStatus, filterType, filterSegment, filterCategory],
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

const confirm = useConfirm()

async function handleDelete(row: Record<string, any>) {
  if (await confirm({ message: `¿Seguro que deseas eliminar "${row.title}"?` })) {
    await client.from('content_items').delete().eq('id', row.id)
    refresh()
  }
}

const featuredId = ref<string | null>(null)

// Load featured content from app_settings
const { data: featuredSetting } = await useAsyncData('admin-featured-content', async () => {
  const { data } = await client.from('app_settings').select('value').eq('key', 'biblioteca_featured').single()
  return (data?.value as any)?.content_id ?? null
})
watchEffect(() => { featuredId.value = featuredSetting.value })

async function toggleFeatured(id: string) {
  const newId = featuredId.value === id ? null : id
  featuredId.value = newId
  await client.from('app_settings').upsert({
    key: 'biblioteca_featured',
    value: { content_id: newId },
    updated_at: new Date().toISOString(),
  })
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

.featured-star--disabled {
  opacity: 0.25;
  cursor: not-allowed;
}
</style>
