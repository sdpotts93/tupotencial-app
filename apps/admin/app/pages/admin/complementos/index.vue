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
      <div class="addon-skeleton">
        <div class="addon-skeleton__toolbar">
          <UiSkeleton variant="rect" width="200px" height="36px" radius="var(--radius-md)" />
        </div>
        <div class="addon-skeleton__rows">
          <div v-for="i in 6" :key="i" class="addon-skeleton__row">
            <UiSkeleton variant="text" width="60%" height="14px" />
            <UiSkeleton variant="text" width="80px" height="14px" />
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
      <div class="addon-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="addon-error__icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="addon-error__title">No pudimos cargar los add-ons</h2>
        <p class="addon-error__desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refresh()">Reintentar</UiButton>
      </div>
    </template>

    <UiDataTable v-else fill :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading" :loading-more="loadingMore" @row-click="goToEdit" @load-more="loadMore">
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
        <UiButton variant="soft" size="sm" :to="`/admin/complementos/${row.id}`">
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
  router.push(`/admin/complementos/${row.id}`)
}
</script>

<style scoped>
.addon-skeleton {
  background: var(--color-desktop-card, var(--color-white));
  border: 1px solid var(--color-desktop-border, var(--color-border-light));
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.addon-skeleton__toolbar {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
}

.addon-skeleton__row {
  display: grid;
  grid-template-columns: 1fr 100px 80px 80px 60px 100px;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  align-items: center;
}

.addon-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 40dvh;
  gap: var(--space-3);
}

.addon-error__icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.addon-error__title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.addon-error__desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
