<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Usuarios</h1>
    </div>

    <!-- Skeleton loader -->
    <template v-if="status === 'pending'">
      <div class="table-skeleton">
        <div class="table-skeleton__toolbar">
          <UiSkeleton variant="rect" width="250px" height="36px" radius="var(--radius-md)" />
          <UiSkeleton variant="rect" width="120px" height="36px" radius="var(--radius-md)" />
          <UiSkeleton variant="rect" width="120px" height="36px" radius="var(--radius-md)" />
          <UiSkeleton variant="rect" width="120px" height="36px" radius="var(--radius-md)" />
        </div>
        <div class="table-skeleton__rows">
          <div v-for="i in 6" :key="i" class="table-skeleton__row">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <UiSkeleton variant="rect" width="36px" height="36px" radius="var(--radius-full)" />
              <div style="display: flex; flex-direction: column; gap: var(--space-1);">
                <UiSkeleton variant="text" width="120px" height="14px" />
                <UiSkeleton variant="text" width="160px" height="12px" />
              </div>
            </div>
            <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
            <UiSkeleton variant="text" width="60px" height="14px" />
            <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
            <UiSkeleton variant="text" width="80px" height="14px" />
          </div>
        </div>
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="status === 'error'">
      <div class="table-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="table-error__icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="table-error__title">No pudimos cargar los usuarios</h2>
        <p class="table-error__desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refresh()">Reintentar</UiButton>
      </div>
    </template>

    <UiDataTable v-else fill :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading" :loading-more="loadingMore" @row-click="goToUser" @load-more="loadMore">
      <template #toolbar>
        <UiInput
          v-model="searchInput"
          placeholder="Buscar por nombre o correo..."
          style="min-width: 250px;"
        >
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
        <UiSelect
          v-model="filterPlan"
          :options="planOptions"
          placeholder="Plan"
        />
        <UiSelect
          v-model="filterStatus"
          :options="statusOptions"
          placeholder="Estado"
        />
        <UiSelect
          v-model="filterSegment"
          :options="segmentFilterOptions"
          placeholder="Segmento"
        />
      </template>

      <template #cell-full_name="{ value, row }">
        <div class="user-cell">
          <div class="user-cell__avatar">
            <img v-if="row.avatar_url" :src="row.avatar_url" alt="" class="user-cell__avatar-img" />
            <template v-else>{{ value?.charAt(0) ?? '?' }}</template>
          </div>
          <div>
            <span class="user-cell__name">{{ value }}</span>
            <span class="user-cell__email">{{ row.email }}</span>
          </div>
        </div>
      </template>

      <template #cell-plan="{ value }">
        <UiTag :variant="planVariant(value)">{{ planLabel(value) }}</UiTag>
      </template>

      <template #cell-status="{ value }">
        <UiTag :variant="value === 'active' ? 'success' : 'default'">
          {{ statusLabel(value) }}
        </UiTag>
      </template>

      <template #cell-segment="{ value }">
        {{ segmentLabel(value) }}
      </template>

      <template #cell-created_at="{ value }">
        {{ formatDate(value) }}
      </template>

    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()

const { input: searchInput, debounced: search, pending: searchPending } = useDebouncedRef('')
const filterPlan = ref('')
const filterStatus = ref('')
const filterSegment = ref('')

const planOptions = [
  { value: '', label: 'Todos los planes' },
  { value: 'free', label: 'Gratuito' },
  { value: 'core', label: 'Core' },
]

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
]

const segmentFilterOptions = [
  { value: '', label: 'Todos los segmentos' },
  { value: 'gabriel', label: 'Gabriel' },
  { value: 'carlotta', label: 'Carlotta' },
]

const columns = [
  { key: 'full_name', label: 'Usuario', width: '24%' },
  { key: 'plan', label: 'Plan' },
  { key: 'segment', label: 'Segmento' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Registro' },
]

// ── Fetch users from Supabase ──
const { rows, hasMore, loading, loadingMore, loadMore, refresh, status } = await useInfiniteTable(
  'admin-users',
  async ({ from, to }) => {
    // profiles, subscriptions, and user_entitlements all FK to auth.users (not to each other),
    // so we query them separately and join in JS.
    let profilesQuery = client.from('profiles').select('*')
    if (search.value) profilesQuery = profilesQuery.ilike('display_name', `%${search.value}%`)
    if (filterSegment.value) profilesQuery = profilesQuery.eq('community_segment', filterSegment.value)

    // For plan/status filter, pre-filter by subscription status
    if (filterPlan.value === 'core' || filterStatus.value === 'active' || filterPlan.value === 'free' || filterStatus.value === 'inactive') {
      const { data: activeIds } = await client.rpc('get_subscriber_user_ids')
      const ids = activeIds ?? []
      if (filterPlan.value === 'core' || filterStatus.value === 'active') {
        if (!ids.length) return []
        profilesQuery = profilesQuery.in('id', ids)
      } else {
        if (ids.length) profilesQuery = profilesQuery.not('id', 'in', `(${ids.join(',')})`)
      }
    }

    const { data: profiles } = await profilesQuery.range(from, to).order('created_at', { ascending: false })
    const profileIds = (profiles ?? []).map(p => p.id)
    if (!profileIds.length) return []

    const [{ data: subs }, { data: entitlements }] = await Promise.all([
      client.from('subscriptions').select('user_id, status').in('user_id', profileIds),
      client.from('user_entitlements').select('user_id, entitlement_key').in('user_id', profileIds),
    ])
    const subsMap = new Map((subs ?? []).map(s => [s.user_id, s.status]))
    const entMap = new Map<string, string[]>()
    for (const e of entitlements ?? []) {
      const list = entMap.get(e.user_id) ?? []
      list.push(e.entitlement_key)
      entMap.set(e.user_id, list)
    }
    return (profiles ?? []).map(p => {
      const subStatus = subsMap.get(p.id) ?? null
      return {
        ...p,
        full_name: p.display_name ?? 'Sin nombre',
        email: '\u2014',
        segment: p.community_segment ?? '',
        plan: subStatus === 'active' ? 'core' : 'free',
        subscription_status: subStatus,
        status: subStatus === 'active' ? 'active' : 'inactive',
        entitlements: entMap.get(p.id) ?? [],
      }
    })
  },
  [search, filterSegment, filterPlan, filterStatus],
)

function planVariant(plan: string) {
  const map: Record<string, string> = { free: 'default', core: 'gold' }
  return (map[plan] ?? 'default') as any
}

function planLabel(plan: string) {
  const map: Record<string, string> = { free: 'Gratuito', core: 'Core' }
  return map[plan] ?? plan
}

function statusLabel(status: string) {
  const map: Record<string, string> = { active: 'Activo', inactive: 'Inactivo' }
  return map[status] ?? status
}

function segmentLabel(segment: string) {
  const map: Record<string, string> = { gabriel: 'Gabriel', carlotta: 'Carlotta' }
  return map[segment] ?? segment
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function goToUser(row: any) {
  navigateTo(`/admin/usuarios/${row.id}`)
}

</script>

<style scoped>
.user-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-cell__avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
  overflow: hidden;
}

.user-cell__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-cell__name {
  font-weight: var(--weight-medium);
  display: block;
  font-size: var(--text-sm);
}

.user-cell__email {
  font-size: var(--text-xs);
  color: var(--color-muted);
  display: block;
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
  grid-template-columns: 1fr 80px 80px 80px 100px;
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
