<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Check-ins</h1>
    </div>

    <UiDataTable :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading || status === 'pending'" :loading-more="loadingMore" :error="status === 'error'" error-title="No pudimos cargar los check-ins" fill @load-more="loadMore" @retry="refresh()">
      <template #toolbar>
        <UiInput v-model="searchInput" placeholder="Buscar por usuario..." style="min-width: 200px;">
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
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

      <template #cell-mood="{ value }">
        <span v-if="value" class="mood-badge" :style="{ background: moodColor(value) }">{{ moodLabel(value) }}</span>
        <span v-else style="color: var(--color-muted);">—</span>
      </template>

      <template #cell-reflection="{ value }">
        <span v-if="value" style="font-size: var(--text-xs); max-width: 280px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ value }}</span>
        <span v-else style="color: var(--color-muted);">—</span>
      </template>

      <template #cell-date="{ value }">
        {{ formatDate(value) }}
      </template>

    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { input: searchInput, debounced: search, pending: searchPending } = useDebouncedRef('')
const columns = [
  { key: 'user_name', label: 'Usuario', width: '22%' },
  { key: 'date', label: 'Fecha' },
  { key: 'mood', label: 'Estado de ánimo' },
  { key: 'reflection', label: 'Reflexión', width: '35%' },
]

const client = useSupabaseClient()
const { rows, hasMore, loading, loadingMore, loadMore, refresh, status } = await useInfiniteTable(
  'admin-checkins',
  async ({ from, to }) => {
    let query = client
      .from('daily_checkins')
      .select('id, date, user_id, type, payload, created_at, profiles!daily_checkins_profile_fk(display_name, email)')

    query = query.eq('type', 'checkin')
    if (search.value) query = query.ilike('profiles.display_name', `%${search.value}%`)

    const { data } = await query.range(from, to).order('created_at', { ascending: false })
    return (data ?? []).map((c: any) => ({
      ...c,
      user_name: c.profiles?.display_name ?? 'Sin nombre',
      user_email: c.profiles?.email ?? '',
      mood: c.payload?.mood ?? null,
      reflection: c.payload?.reflection ?? null,
    }))
  },
  [search],
)

const moodMap: Record<string, { label: string; color: string }> = {
  great: { label: 'Increíble', color: 'var(--color-mood-great, #4ade80)' },
  good: { label: 'Bien', color: 'var(--color-mood-good, #86efac)' },
  ok: { label: 'Regular', color: 'var(--color-mood-ok, #fde68a)' },
  low: { label: 'Bajo', color: 'var(--color-mood-low, #fdba74)' },
  tough: { label: 'Difícil', color: 'var(--color-mood-tough, #fca5a5)' },
}

function moodLabel(mood: string) { return moodMap[mood]?.label ?? mood }
function moodColor(mood: string) { return moodMap[mood]?.color ?? 'var(--color-sand)' }

function avatarInitials(name: string) {
  return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
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

.mood-badge {
  display: inline-block;
  padding: 4px 8px 1px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

</style>
