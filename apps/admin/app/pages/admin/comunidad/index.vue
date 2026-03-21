<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Comunidad</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" to="/admin/comunidad/new">+ Nueva publicación</UiButton>
      </div>
    </div>

    <UiTabs v-model="activeTab" :tabs="tabs" />

    <div class="tab-content">
      <UiDataTable fill :columns="columns" :rows="filteredRows" @row-click="goToEdit">
        <template #toolbar>
          <UiInput
            v-model="search"
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
const search = ref('')
const activeTab = ref('all')

const tabs = [
  { value: 'all', label: 'Todos' },
  { value: 'gabriel', label: 'Gabriel' },
  { value: 'carlotta', label: 'Carlotta' },
]

const columns = [
  { key: 'author', label: 'Autor' },
  { key: 'body', label: 'Contenido', width: '30%' },
  { key: 'likes_count', label: 'Likes' },
  { key: 'comments_count', label: 'Comentarios' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Fecha' },
]

const client = useSupabaseClient()
const { data: rows, refresh } = await useAsyncData('admin-posts', async () => {
  const { data } = await client
    .from('posts')
    .select('*, profiles:author_user_id(display_name, avatar_url), post_reactions(count), post_comments(count)')
    .order('created_at', { ascending: false })
  return (data ?? []).map(p => ({
    ...p,
    author: (p.profiles as any)?.display_name ?? 'Anónimo',
    author_name: (p.profiles as any)?.display_name ?? 'Anónimo',
    author_avatar: (p.profiles as any)?.avatar_url ?? null,
    likes_count: (p.post_reactions as any)?.[0]?.count ?? 0,
    comments_count: (p.post_comments as any)?.[0]?.count ?? 0,
  }))
})

const filteredRows = computed(() => {
  let result = rows.value ?? []
  if (activeTab.value === 'gabriel') result = result.filter(r => r.author === 'Gabriel')
  else if (activeTab.value === 'carlotta') result = result.filter(r => r.author === 'Carlotta')
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r => r.author.toLowerCase().includes(q) || r.body.toLowerCase().includes(q))
  }
  return result
})

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

async function handleDelete(row: Record<string, any>) {
  if (confirm(`¿Seguro que deseas eliminar esta publicación de ${row.author}?`)) {
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
