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

        <template #cell-author_name="{ value, row }">
          <div class="author-cell">
            <div class="author-cell__avatar">{{ value?.charAt(0) ?? 'A' }}</div>
            <div>
              <span class="author-cell__name">{{ value }}</span>
              <span v-if="row.is_official" class="author-cell__badge eyebrow">Oficial</span>
            </div>
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
          <UiButton variant="soft" size="sm" :to="`/admin/comunidad/${row.id}`">
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
const activeTab = ref('all')

const tabs = [
  { value: 'all', label: 'Todos' },
  { value: 'official', label: 'Oficiales' },
  { value: 'reported', label: 'Reportados' },
  { value: 'hidden', label: 'Ocultos' },
]

const columns = [
  { key: 'author_name', label: 'Autor' },
  { key: 'body', label: 'Contenido', width: '30%' },
  { key: 'likes_count', label: 'Likes' },
  { key: 'comments_count', label: 'Comentarios' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Fecha' },
]

const rows = ref([
  { id: 'post-001', author_name: 'Tu Potencial', is_official: true, body: 'Feliz lunes! Recuerda que cada semana es una oportunidad nueva para cultivar habitos saludables.', likes_count: 245, comments_count: 32, status: 'published', created_at: '2026-02-24T08:00:00' },
  { id: 'post-002', author_name: 'Maria Lopez', is_official: false, body: 'Hoy complete el dia 15 del reto de meditacion! Me siento increible.', likes_count: 89, comments_count: 12, status: 'published', created_at: '2026-02-24T07:30:00' },
  { id: 'post-003', author_name: 'Tu Potencial', is_official: true, body: 'Nuevo articulo disponible: "5 pasos para el bienestar emocional". Descubrelo en la seccion de contenido.', likes_count: 156, comments_count: 18, status: 'published', created_at: '2026-02-23T10:00:00' },
  { id: 'post-004', author_name: 'Carlos Ramirez', is_official: false, body: 'Alguien tiene tips para dormir mejor? He estado batallando con el insomnio.', likes_count: 34, comments_count: 28, status: 'published', created_at: '2026-02-23T22:15:00' },
  { id: 'post-005', author_name: 'Ana Gutierrez', is_official: false, body: 'Contenido que incumple los lineamientos de la comunidad...', likes_count: 2, comments_count: 0, status: 'reported', created_at: '2026-02-22T14:00:00' },
  { id: 'post-006', author_name: 'Roberto Diaz', is_official: false, body: 'Publicacion oculta por moderacion.', likes_count: 0, comments_count: 0, status: 'hidden', created_at: '2026-02-21T11:00:00' },
])

const filteredRows = computed(() => {
  let result = rows.value
  if (activeTab.value === 'official') result = result.filter(r => r.is_official)
  else if (activeTab.value === 'reported') result = result.filter(r => r.status === 'reported')
  else if (activeTab.value === 'hidden') result = result.filter(r => r.status === 'hidden')
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(r => r.author_name.toLowerCase().includes(q) || r.body.toLowerCase().includes(q))
  }
  return result
})

function statusVariant(status: string) {
  const map: Record<string, string> = { published: 'success', reported: 'danger', hidden: 'default', draft: 'warning' }
  return (map[status] ?? 'default') as any
}

function statusLabel(status: string) {
  const map: Record<string, string> = { published: 'Publicado', reported: 'Reportado', hidden: 'Oculto', draft: 'Borrador' }
  return map[status] ?? status
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/comunidad/${row.id}`)
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

.author-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.author-cell__avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
}

.author-cell__name {
  font-weight: var(--weight-medium);
  display: block;
  font-size: var(--text-sm);
}

.author-cell__badge {
  font-size: var(--eyebrow-sm);
  color: var(--color-primary);
}
</style>
