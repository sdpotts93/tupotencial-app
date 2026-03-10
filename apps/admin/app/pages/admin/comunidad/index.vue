<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Comunidad</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" to="/admin/comunidad/new">+ Nueva publicacion</UiButton>
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

const rows = ref([
  { id: 'post-001', author: 'Gabriel', body: 'Feliz lunes! Recuerda que cada semana es una oportunidad nueva para cultivar habitos saludables.', likes_count: 245, comments_count: 32, status: 'published', created_at: '2026-02-24T08:00:00' },
  { id: 'post-002', author: 'Carlotta', body: 'Nuevo reto: 7 dias de gratitud. Inscribete desde la seccion de Retos!', likes_count: 156, comments_count: 18, status: 'published', created_at: '2026-02-23T10:00:00' },
  { id: 'post-003', author: 'Gabriel', body: 'Nuevo articulo disponible: "5 pasos para el bienestar emocional". Descubrelo en la seccion de contenido.', likes_count: 89, comments_count: 12, status: 'published', created_at: '2026-02-22T14:00:00' },
  { id: 'post-004', author: 'Carlotta', body: 'Esta semana les compartimos una meditacion guiada especial para la gratitud. Disponible en la biblioteca.', likes_count: 134, comments_count: 21, status: 'published', created_at: '2026-02-21T09:00:00' },
  { id: 'post-005', author: 'Gabriel', body: 'Tip de la semana: Intenta hacer 3 respiraciones profundas antes de cada comida. Notaras la diferencia.', likes_count: 67, comments_count: 8, status: 'draft', created_at: '2026-02-20T16:00:00' },
  { id: 'post-006', author: 'Carlotta', body: 'Publicacion oculta por revision.', likes_count: 0, comments_count: 0, status: 'hidden', created_at: '2026-02-19T11:00:00' },
])

const filteredRows = computed(() => {
  let result = rows.value
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

function handleDelete(row: Record<string, any>) {
  if (confirm(`Seguro que deseas eliminar esta publicacion de ${row.author}?`)) {
    rows.value = rows.value.filter(r => r.id !== row.id)
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
