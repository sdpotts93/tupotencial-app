<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Contenido</h1>
      <div class="page-header__actions">
        <UiButton v-if="canEdit" variant="primary-outline" size="sm" to="/admin/contenido/new">+ Crear contenido</UiButton>
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
            <Icon name="lucide:star" size="16" />
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

const { data: rows, refresh } = await useAsyncData('admin-content', async () => {
  const { data } = await client.from('content_items').select('*, content_item_categories(category_id)').order('created_at', { ascending: false })
  return (data ?? []).map(item => ({
    ...item,
    content_type: item.type,
    segment: item.plan,
    category: (item.content_item_categories as any)?.[0]?.category_id ?? null,
  }))
})

const filteredRows = computed(() => {
  return (rows.value ?? []).filter(row => {
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
