<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Programas</h1>
      <div class="page-header__actions">
        <UiButton v-if="canEdit" variant="primary-outline" size="sm" to="/admin/programas/new">+ Nuevo programa</UiButton>
      </div>
    </div>

    <!-- Skeleton loader -->
    <template v-if="status === 'pending'">
      <div class="table-skeleton">
        <div class="table-skeleton__toolbar">
          <UiSkeleton variant="rect" width="200px" height="36px" radius="var(--radius-md)" />
          <UiSkeleton variant="rect" width="120px" height="36px" radius="var(--radius-md)" />
          <UiSkeleton variant="rect" width="120px" height="36px" radius="var(--radius-md)" />
          <UiSkeleton variant="rect" width="120px" height="36px" radius="var(--radius-md)" />
        </div>
        <div class="table-skeleton__rows">
          <div v-for="i in 6" :key="i" class="table-skeleton__row">
            <UiSkeleton variant="text" width="60%" height="14px" />
            <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
            <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
            <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
            <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
            <UiSkeleton variant="text" width="40px" height="14px" />
            <UiSkeleton variant="rect" width="80px" height="30px" radius="var(--radius-md)" />
          </div>
        </div>
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="status === 'error'">
      <div class="table-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="table-error__icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="table-error__title">No pudimos cargar los programas</h2>
        <p class="table-error__desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refresh()">Reintentar</UiButton>
      </div>
    </template>

    <UiDataTable v-else fill :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading" :loading-more="loadingMore" @row-click="goToEdit" @load-more="loadMore">
      <template #toolbar>
        <UiInput
          v-model="searchInput"
          placeholder="Buscar por título..."
          style="min-width: 200px;"
        >
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
        <UiSelect
          v-model="filterType"
          :options="typeOptions"
          placeholder="Tipo"
        />
        <UiSelect
          v-model="filterStatus"
          :options="statusOptions"
          placeholder="Estado"
        />
        <UiSelect
          v-model="filterPlan"
          :options="planFilterOptions"
          placeholder="Plan"
        />
      </template>

      <template #cell-program_type="{ value }">
        <UiTag :variant="typeVariant(value)">{{ typeLabel(value) }}</UiTag>
      </template>

      <template #cell-plan="{ value }">
        <UiTag :variant="value === 'core' ? 'gold' : 'default'">{{ value === 'core' ? 'Core' : 'Gratuito' }}</UiTag>
      </template>

      <template #cell-entitlement_key="{ value }">
        <UiTag v-if="value" variant="accent">{{ entitlementLabels[value] ?? value }}</UiTag>
        <span v-else style="color: var(--color-muted);">—</span>
      </template>

      <template #cell-status="{ value }">
        <UiTag :variant="statusVariant(value)">{{ statusLabel(value) }}</UiTag>
      </template>

      <template #cell-enrolled_count="{ value }">
        {{ value?.toLocaleString('es-MX') ?? 0 }}
      </template>

      <template #actions="{ row }">
        <UiButton variant="soft" size="sm" :to="`/admin/programas/${row.id}`">
          <template #icon><Icon name="lucide:pencil" size="16" /></template>
          Editar
        </UiButton>
        <UiButton variant="soft" size="sm" @click.stop="handleDuplicate(row)">
          <template #icon><Icon name="lucide:copy" size="16" /></template>
          Duplicar
        </UiButton>
        <UiButton variant="danger-ghost" size="sm" @click.stop="handleDelete(row)">
          <template #icon><Icon name="lucide:trash-2" size="16" /></template>
          Eliminar
        </UiButton>
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()

const { input: searchInput, debounced: search, pending: searchPending } = useDebouncedRef('')
const filterType = ref('')
const filterStatus = ref('')
const filterPlan = ref('')

const typeOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: 'program', label: 'Programa' },
  { value: 'reto', label: 'Reto' },
  { value: 'bootcamp', label: 'Bootcamp' },
]

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

const planFilterOptions = [
  { value: '', label: 'Todos los planes' },
  { value: 'free', label: 'Gratuito' },
  { value: 'core', label: 'Core' },
]

const entitlementLabels: Record<string, string> = {
  vip: 'VIP',
  mentoria_grupal: 'Mentoría grupal',
  bootcamp_liderazgo: 'Bootcamp: Liderazgo',
  coaching_1on1: 'Coaching 1:1',
  retiro_marzo_2026: 'Retiro marzo 2026',
}

const columns = [
  { key: 'title', label: 'Título', width: '25%' },
  { key: 'program_type', label: 'Tipo' },
  { key: 'plan', label: 'Plan' },
  { key: 'entitlement_key', label: 'Complemento' },
  { key: 'status', label: 'Estado' },
  { key: 'enrolled_count', label: 'Inscritos' },
]

const client = useSupabaseClient()
const { canEdit } = useAdminAuth()

const { rows, hasMore, loading, loadingMore, loadMore, refresh, status } = await useInfiniteTable(
  'admin-programs',
  async ({ from, to }) => {
    let query = client.from('programs').select('*, program_enrollments(count)')

    if (search.value) query = query.ilike('title', `%${search.value}%`)
    if (filterType.value) query = query.eq('type', filterType.value)
    if (filterStatus.value) query = query.eq('status', filterStatus.value)
    if (filterPlan.value) query = query.eq('plan', filterPlan.value)

    const { data } = await query.range(from, to).order('created_at', { ascending: false })
    return (data ?? []).map(p => ({
      ...p,
      program_type: p.type,
      enrolled_count: (p.program_enrollments as any)?.[0]?.count ?? 0,
    }))
  },
  [search, filterType, filterStatus, filterPlan],
)

function typeVariant(type: string) {
  const map: Record<string, string> = { program: 'info', reto: 'warning', bootcamp: 'accent' }
  return (map[type] ?? 'default') as any
}

function typeLabel(type: string) {
  const map: Record<string, string> = { program: 'Programa', reto: 'Reto', bootcamp: 'Bootcamp' }
  return map[type] ?? type
}

function statusVariant(status: string) {
  const map: Record<string, string> = { published: 'success', draft: 'warning', archived: 'default' }
  return (map[status] ?? 'default') as any
}

function statusLabel(status: string) {
  const map: Record<string, string> = { published: 'Publicado', draft: 'Borrador', archived: 'Archivado' }
  return map[status] ?? status
}

async function handleDuplicate(row: Record<string, any>) {
  await client.from('programs').insert({
    title: `${row.title} (copia)`,
    type: row.type,
    plan: row.plan,
    status: 'draft',
    description: row.description,
    cover_url: row.cover_url,
    entitlement_key: row.entitlement_key,
  })
  refresh()
}

const confirm = useConfirm()

async function handleDelete(row: Record<string, any>) {
  if (await confirm({ message: `¿Seguro que deseas eliminar "${row.title}"?` })) {
    await client.from('programs').delete().eq('id', row.id)
    refresh()
  }
}

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/programas/${row.id}`)
}
</script>

<style scoped>
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
  grid-template-columns: 1fr 80px 80px 80px 80px 60px 100px;
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
