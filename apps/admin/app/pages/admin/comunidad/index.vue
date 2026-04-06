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
        <div class="table-skeleton">
          <div class="table-skeleton__toolbar">
            <UiSkeleton variant="rect" width="200px" height="36px" radius="var(--radius-md)" />
          </div>
          <div class="table-skeleton__rows">
            <div v-for="i in 6" :key="i" class="table-skeleton__row">
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
            </div>
          </div>
        </div>
      </template>

      <!-- Error state -->
      <template v-else-if="status === 'error'">
        <div class="table-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="table-error__icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
          <h2 class="table-error__title">No pudimos cargar las publicaciones</h2>
          <p class="table-error__desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
          <UiButton variant="primary-outline" size="sm" @click="refresh()">Reintentar</UiButton>
        </div>
      </template>

      <UiDataTable v-else fill :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading" :loading-more="loadingMore" @row-click="goToEdit" @load-more="loadMore">
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
            <UiButton variant="soft" size="sm" :to="`/admin/comunidad/${row.id}`">
              <template #icon><Icon name="lucide:pencil" size="16" /></template>
              Editar
            </UiButton>
            <UiButton variant="danger-ghost" size="sm" @click.stop="handleDelete(row)">
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
  router.push(`/admin/comunidad/${row.id}`)
}

function authorAvatar(name: string) {
  return name === 'Carlotta' ? '/images/carlotta.png' : '/images/gabriel.png'
}

const confirm = useConfirm()

async function handleDelete(row: Record<string, any>) {
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

.table-skeleton {
  background: var(--color-desktop-card, var(--color-white));
  border: 1px solid var(--color-desktop-border, var(--color-border-light));
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-skeleton__toolbar {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  gap: var(--space-3);
}

.table-skeleton__row {
  display: grid;
  grid-template-columns: 120px 1fr 1.5fr 50px 50px 80px 100px 100px;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  align-items: center;
}

.table-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 40dvh;
  gap: var(--space-3);
}

.table-error__icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.table-error__title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.table-error__desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
