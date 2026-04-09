<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Feedback</h1>
    </div>

    <UiDataTable :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading || status === 'pending'" :loading-more="loadingMore" :error="status === 'error'" error-title="No pudimos cargar las respuestas" fill @load-more="loadMore" @retry="refresh()">
      <template #toolbar>
        <UiInput v-model="searchInput" placeholder="Buscar por formulario..." style="min-width: 200px;">
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
        <UiSelect v-model="filterSource" :options="sourceOptions" placeholder="Origen" />
      </template>

      <template #cell-form_title="{ value }">
        <span style="font-weight: var(--weight-medium);">{{ value || 'Sin titulo' }}</span>
      </template>

      <template #cell-user_name="{ value, row }">
        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <div class="user-avatar">{{ avatarInitials(value) }}</div>
          <div>
            <div style="font-weight: var(--weight-medium);">{{ value }}</div>
            <div style="font-size: var(--text-xs); color: var(--color-muted);">{{ row.user_email }}</div>
          </div>
        </div>
      </template>

      <template #cell-source="{ value }">
        <UiTag :variant="value === 'program' ? 'info' : value === 'daily_action' ? 'warning' : 'default'">
          {{ sourceLabel(value) }}
        </UiTag>
      </template>

      <template #cell-answers="{ value }">
        <div class="answers-preview">
          <div v-for="(answer, question) in (value || {})" :key="question" class="answers-preview__item">
            <span class="answers-preview__q">{{ question }}:</span>
            <span class="answers-preview__a">{{ answer || '—' }}</span>
          </div>
          <span v-if="!value || !Object.keys(value).length" style="color: var(--color-muted);">—</span>
        </div>
      </template>

      <template #cell-created_at="{ value }">
        {{ formatDate(value) }}
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { input: searchInput, debounced: search, pending: searchPending } = useDebouncedRef('')
const filterSource = ref('')

const sourceOptions = [
  { value: '', label: 'Todos los origenes' },
  { value: 'daily_action', label: 'Accion diaria' },
  { value: 'program', label: 'Programa' },
]

const columns = [
  { key: 'form_title', label: 'Formulario', width: '20%' },
  { key: 'user_name', label: 'Usuario', width: '20%' },
  { key: 'source', label: 'Origen' },
  { key: 'program_title', label: 'Programa' },
  { key: 'answers', label: 'Respuestas', width: '30%' },
  { key: 'created_at', label: 'Fecha' },
]

const client = useSupabaseClient()
const { rows, hasMore, loading, loadingMore, loadMore, refresh, status } = await useInfiniteTable(
  'admin-feedback',
  async ({ from, to }) => {
    let query = client
      .from('form_submissions')
      .select('id, form_id, user_id, answers, source, program_id, created_at, forms(title), profiles!form_submissions_profile_fk(display_name, email), programs(title)')

    if (search.value) query = query.ilike('forms.title', `%${search.value}%`)
    if (filterSource.value) query = query.eq('source', filterSource.value)

    const { data } = await query.range(from, to).order('created_at', { ascending: false })
    return (data ?? []).map((s: any) => ({
      ...s,
      form_title: s.forms?.title ?? '',
      user_name: s.profiles?.display_name ?? 'Sin nombre',
      user_email: s.profiles?.email ?? '',
      program_title: s.programs?.title ?? '—',
    }))
  },
  [search, filterSource],
)

function sourceLabel(source: string) {
  const map: Record<string, string> = { daily_action: 'Accion diaria', program: 'Programa' }
  return map[source] ?? source ?? '—'
}

function avatarInitials(name: string) {
  return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-full);
  background: var(--color-sand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: var(--weight-semibold);
  color: var(--color-dark);
  flex-shrink: 0;
}

.answers-preview {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--text-xs);
  max-width: 320px;
}

.answers-preview__item {
  display: flex;
  gap: var(--space-1);
  line-height: var(--leading-normal);
}

.answers-preview__q {
  color: var(--color-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  flex-shrink: 0;
}

.answers-preview__a {
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>
