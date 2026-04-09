<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">VIP</h1>
      <div class="page-header__actions">
        <UiButton v-if="canEdit" variant="primary-outline" size="sm" to="/admin/complementos/new">+ Nuevo add-on</UiButton>
      </div>
    </div>

    <!-- Skeleton loader -->
    <template v-if="status === 'pending'">
      <UiTableSkeleton :toolbar-widths="['200px']" columns="1fr 100px 80px 80px 60px 100px">
        <UiSkeleton variant="text" width="60%" height="14px" />
        <UiSkeleton variant="text" width="80px" height="14px" />
        <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
        <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
        <UiSkeleton variant="text" width="40px" height="14px" />
        <UiSkeleton variant="rect" width="80px" height="30px" radius="var(--radius-md)" />
      </UiTableSkeleton>
    </template>

    <!-- Error state -->
    <template v-else-if="status === 'error'">
      <UiErrorState title="No pudimos cargar los add-ons" @retry="refresh()" />
    </template>

    <UiDataTable v-else fill :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading" :loading-more="loadingMore" @row-click="goToEdit" @load-more="loadMore" @retry="refresh()">
      <template #toolbar>
        <UiInput
          v-model="searchInput"
          placeholder="Buscar por nombre..."
          style="min-width: 200px;"
        >
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
      </template>

      <template #cell-price="{ value }">
        {{ value > 0 ? `$${(value / 100).toLocaleString('es-MX')} MXN` : 'Gratis' }}
      </template>

      <template #cell-plan="{ value }">
        <UiTag :variant="value === 'core' ? 'accent' : 'default'">
          {{ value === 'core' ? 'Core' : 'Todos' }}
        </UiTag>
      </template>

      <template #cell-status="{ value }">
        <UiTag :variant="value === 'active' ? 'success' : 'warning'">
          {{ value === 'active' ? 'Activo' : 'Inactivo' }}
        </UiTag>
      </template>

      <template #cell-compras="{ row }">
        {{ row.purchases }}
      </template>

      <template #actions="{ row }">
        <UiButton v-if="canEdit" variant="soft" size="sm" :to="`/admin/complementos/${row.id}`">
          <template #icon><Icon name="lucide:pencil" size="16" /></template>
          Editar
        </UiButton>
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const { canEdit } = useAdminAuth()
const router = useRouter()
const { input: searchInput, debounced: search, pending: searchPending } = useDebouncedRef('')

const columns = [
  { key: 'title', label: 'Nombre', width: '30%' },
  { key: 'price', label: 'Precio' },
  { key: 'plan', label: 'Disponible para' },
  { key: 'status', label: 'Estado' },
  { key: 'compras', label: 'Compras' },
]

const { rows, hasMore, loading, loadingMore, loadMore, refresh, status } = await useInfiniteTable(
  'admin-addons',
  async ({ from, to }) => {
    let query = client.from('addons').select('*, addon_purchases(count)')

    if (search.value) query = query.ilike('title', `%${search.value}%`)

    const { data } = await query.range(from, to).order('created_at', { ascending: false })
    return (data ?? []).map(a => ({
      ...a,
      purchases: (a.addon_purchases as any)?.[0]?.count ?? 0,
    }))
  },
  [search],
)

function goToEdit(row: Record<string, any>) {
  if (!canEdit.value) return
  router.push(`/admin/complementos/${row.id}`)
}
</script>

<style scoped>
</style>
