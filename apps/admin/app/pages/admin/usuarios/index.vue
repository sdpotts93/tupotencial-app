<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Usuarios</h1>
    </div>

    <UiDataTable fill :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading || status === 'pending'" :loading-more="loadingMore" :error="status === 'error'" error-title="No pudimos cargar los usuarios" @row-click="goToUser" @load-more="loadMore" @retry="refresh()">
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
    const { data: adminRows } = await client
      .from('admin_users')
      .select('user_id')

    const adminIdSet = new Set((adminRows ?? []).map(row => row.user_id))

    // Fetch the full subscriber set up-front so it drives both the plan/status
    // filters and the per-row plan/status display. This set includes add-on
    // grants (subscription_access_grants), so users with core-via-add-on are
    // counted as subscribers even without a row in `subscriptions`.
    const { data: subscriberIdsData } = await client.rpc('get_subscriber_user_ids')
    const subscriberIds = new Set<string>(subscriberIdsData ?? [])

    let profilesQuery = client.from('profiles').select('*')
    if (search.value) {
      profilesQuery = profilesQuery.or(`display_name.ilike.%${search.value}%,email.ilike.%${search.value}%`)
    }
    if (filterSegment.value) profilesQuery = profilesQuery.eq('community_segment', filterSegment.value)

    if (filterPlan.value === 'core' || filterStatus.value === 'active') {
      if (!subscriberIds.size) return []
      profilesQuery = profilesQuery.in('id', [...subscriberIds])
    } else if (filterPlan.value === 'free' || filterStatus.value === 'inactive') {
      if (subscriberIds.size) profilesQuery = profilesQuery.not('id', 'in', `(${[...subscriberIds].join(',')})`)
    }

    const { data: profiles } = await profilesQuery.range(from, to).order('created_at', { ascending: false })
    const visibleProfiles = (profiles ?? []).filter((profile: any) => {
      if (!adminIdSet.has(profile.id)) return true

      // Admin-only invited accounts should be managed from /admin/roles.
      // Show dual-role admins here only once they have actual customer onboarding data.
      return Boolean(
        profile.onboarding_time
        || profile.onboarding_motivation?.length
        || profile.onboarding_focus?.length,
      )
    })

    const profileIds = visibleProfiles.map((p: any) => p.id)
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
    return visibleProfiles.map((p: any) => {
      const subStatus = subsMap.get(p.id) ?? null
      const hasAccess = subscriberIds.has(p.id)
      return {
        ...p,
        full_name: p.display_name ?? 'Sin nombre',
        email: p.email ?? '\u2014',
        segment: p.community_segment ?? '',
        plan: hasAccess ? 'core' : 'free',
        subscription_status: subStatus,
        status: hasAccess ? 'active' : 'inactive',
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

</style>
