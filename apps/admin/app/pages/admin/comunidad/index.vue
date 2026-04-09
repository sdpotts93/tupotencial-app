<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Comunidad</h1>
      <div class="page-header__actions">
        <UiButton v-if="canEdit" variant="primary-outline" size="sm" to="/admin/comunidad/new">+ Nueva publicación</UiButton>
      </div>
    </div>

    <UiTabs v-model="activeTab" :tabs="tabs" />

    <div class="tab-content">
      <!-- Skeleton loader -->
      <template v-if="status === 'pending'">
        <UiTableSkeleton :toolbar-widths="['200px']" columns="120px 1fr 1.5fr 50px 50px 80px 100px 100px">
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <UiSkeleton variant="rect" width="32px" height="32px" radius="var(--radius-full)" />
            <UiSkeleton variant="text" width="80px" height="14px" />
          </div>
          <UiSkeleton variant="text" width="70%" height="14px" />
          <UiSkeleton variant="text" width="90%" height="14px" />
          <UiSkeleton variant="text" width="30px" height="14px" />
          <UiSkeleton variant="text" width="30px" height="14px" />
          <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
          <UiSkeleton variant="text" width="80px" height="14px" />
          <UiSkeleton variant="rect" width="80px" height="30px" radius="var(--radius-md)" />
        </UiTableSkeleton>
      </template>

      <!-- Error state -->
      <template v-else-if="status === 'error'">
        <UiErrorState title="No pudimos cargar las publicaciones" @retry="refresh()" />
      </template>

      <UiDataTable v-else fill :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading" :loading-more="loadingMore" @row-click="goToEdit" @load-more="loadMore" @retry="refresh()">
        <template #toolbar>
          <UiInput
            v-model="searchInput"
            placeholder="Buscar por autor o contenido..."
            style="min-width: 200px;"
          >
            <template #suffix><Icon name="lucide:search" size="18" /></template>
          </UiInput>
        </template>

        <template #cell-author="{ value }">
          <div class="author-cell">
            <img :src="authorAvatar(value)" :alt="value" class="author-cell__avatar" />
            <span class="author-cell__name">{{ value }}</span>
          </div>
        </template>

        <template #cell-body="{ value }">
          <span class="truncate" style="max-width: 300px; display: inline-block;">{{ value }}</span>
        </template>

        <template #cell-status="{ value }">
          <UiTag :variant="statusVariant(value)">{{ statusLabel(value) }}</UiTag>
        </template>

        <template #cell-likes_count="{ value }">
          {{ value }}
        </template>

        <template #cell-comments_count="{ value }">
          {{ value }}
        </template>

        <template #cell-created_at="{ value }">
          {{ formatDate(value) }}
        </template>

        <template #actions="{ row }">
          <div class="row-actions">
            <UiButton v-if="canEdit" variant="soft" size="sm" :to="`/admin/comunidad/${row.id}`">
              <template #icon><Icon name="lucide:pencil" size="16" /></template>
              Editar
            </UiButton>
            <UiButton v-if="canEdit" variant="danger-ghost" size="sm" @click.stop="handleDelete(row)">
              <template #icon><Icon name="lucide:trash-2" size="16" /></template>
              Eliminar
            </UiButton>
          </div>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const { input: searchInput, debounced: search, pending: searchPending } = useDebouncedRef('')
const activeTab = ref('all')

const tabs = [
  { value: 'all', label: 'Todos' },
  { value: 'gabriel', label: 'Gabriel' },
  { value: 'carlotta', label: 'Carlotta' },
]

const columns = [
  { key: 'author', label: 'Autor' },
  { key: 'title', label: 'Título' },
  { key: 'body', label: 'Contenido', width: '30%' },
  { key: 'likes_count', label: 'Likes' },
  { key: 'comments_count', label: 'Comentarios' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Fecha' },
]

const client = useSupabaseClient()
const { avatarUrl } = useCharacterAvatars()
const { canEdit } = useAdminAuth()
const segmentAuthor: Record<string, string> = { gabriel: 'Gabriel', carlotta: 'Carlotta' }

const { rows, hasMore, loading, loadingMore, loadMore, refresh, status } = await useInfiniteTable(
  'admin-posts',
  async ({ from, to }) => {
    let query = client.from('posts').select('*, post_reactions(count), post_comments(count)')

    if (activeTab.value !== 'all') {
      query = query.eq('community_segment', activeTab.value)
    }
    if (search.value) {
      query = query.or(`body.ilike.%${search.value}%,community_segment.ilike.%${search.value}%`)
    }

    const { data } = await query.range(from, to).order('created_at', { ascending: false })
    return (data ?? []).map(p => ({
      ...p,
      author: segmentAuthor[p.community_segment ?? ''] ?? 'Anónimo',
      likes_count: (p.post_reactions as any)?.[0]?.count ?? 0,
      comments_count: (p.post_comments as any)?.[0]?.count ?? 0,
    }))
  },
  [activeTab, search],
)

function statusVariant(status: string) {
  const map: Record<string, string> = { published: 'success', hidden: 'default', draft: 'warning' }
  return (map[status] ?? 'default') as any
}

function statusLabel(status: string) {
  const map: Record<string, string> = { published: 'Publicado', hidden: 'Oculto', draft: 'Borrador' }
  return map[status] ?? status
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function goToEdit(row: Record<string, any>) {
  if (!canEdit.value) return
  router.push(`/admin/comunidad/${row.id}`)
}

function authorAvatar(name: string) {
  return avatarUrl(name.toLowerCase())
}

const confirm = useConfirm()

async function handleDelete(row: Record<string, any>) {
  if (!canEdit.value) return
  if (await confirm({ message: `¿Seguro que deseas eliminar esta publicación de ${row.author}?` })) {
    await client.from('posts').delete().eq('id', row.id)
    await refresh()
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

.row-actions {
  display: flex;
  gap: var(--space-2);
}

.author-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.author-cell__avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.author-cell__name {
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
}

</style>
