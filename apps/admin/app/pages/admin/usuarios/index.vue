<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Usuarios</h1>
    </div>

    <UiDataTable fill :columns="columns" :rows="filteredRows" @row-click="goToUser">
      <template #toolbar>
        <UiInput
          v-model="search"
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
          <div class="user-cell__avatar">{{ value?.charAt(0) ?? '?' }}</div>
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

const search = ref('')
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
const { data: rows, refresh } = await useAsyncData('admin-users', async () => {
  // profiles, subscriptions, and user_entitlements all FK to auth.users (not to each other),
  // so we query them separately and join in JS.
  const [{ data: profiles }, { data: subs }, { data: entitlements }] = await Promise.all([
    client.from('profiles').select('*').order('created_at', { ascending: false }),
    client.from('subscriptions').select('user_id, status'),
    client.from('user_entitlements').select('user_id, entitlement_key'),
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
})

const filteredRows = computed(() => {
  const list = rows.value ?? []
  return list.filter(row => {
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!row.full_name.toLowerCase().includes(q) && !row.email.toLowerCase().includes(q)) return false
    }
    if (filterPlan.value && row.plan !== filterPlan.value) return false
    if (filterStatus.value && row.status !== filterStatus.value) return false
    if (filterSegment.value && row.segment !== filterSegment.value) return false
    return true
  })
})

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
