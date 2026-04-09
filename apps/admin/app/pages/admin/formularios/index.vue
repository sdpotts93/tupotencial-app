<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Formularios</h1>
      <div class="page-header__actions">
        <UiButton v-if="canEdit" variant="primary-outline" size="sm" to="/admin/formularios/new">+ Crear formulario</UiButton>
      </div>
    </div>

    <!-- Skeleton loader -->
    <template v-if="status === 'pending'">
      <UiTableSkeleton :toolbar-widths="['200px', '120px']" columns="1fr 80px 80px 100px 100px">
        <UiSkeleton variant="text" width="60%" height="14px" />
        <UiSkeleton variant="text" width="60px" height="14px" />
        <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
        <UiSkeleton variant="text" width="80px" height="14px" />
        <UiSkeleton variant="rect" width="80px" height="30px" radius="var(--radius-md)" />
      </UiTableSkeleton>
    </template>

    <!-- Error state -->
    <template v-else-if="status === 'error'">
      <UiErrorState title="No pudimos cargar los formularios" @retry="refresh()" />
    </template>

    <UiDataTable v-else :columns="columns" :rows="rows" :has-more="hasMore" :loading="searchPending || loading" :loading-more="loadingMore" fill @row-click="goToEdit" @load-more="loadMore">
      <template #toolbar>
        <UiInput
          v-model="searchInput"
          placeholder="Buscar por título..."
          style="min-width: 200px;"
        >
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
        <UiSelect
          v-model="filterStatus"
          :options="statusOptions"
          placeholder="Estado"
        />
      </template>

      <template #cell-status="{ value }">
        <UiTag :variant="statusVariant(value)">{{ statusLabel(value) }}</UiTag>
      </template>

      <template #cell-fields_count="{ value }">
        {{ value }} campo{{ value !== 1 ? 's' : '' }}
      </template>

      <template #cell-created_at="{ value }">
        {{ formatDate(value) }}
      </template>

      <template #actions="{ row }">
        <UiButton variant="soft" size="sm" :to="`/admin/formularios/${row.id}`">
          <template #icon><Icon name="lucide:pencil" size="16" /></template>
          Editar
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
const filterStatus = ref('')

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
]

const columns = [
  { key: 'title', label: 'Título', width: '40%' },
  { key: 'fields_count', label: 'Campos' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Creado' },
]

const client = useSupabaseClient()
const { canEdit } = useAdminAuth()
const { rows, hasMore, loading, loadingMore, loadMore, refresh, status } = await useInfiniteTable(
  'admin-forms',
  async ({ from, to }) => {
    let query = client.from('forms').select('*')

    if (search.value) query = query.ilike('title', `%${search.value}%`)
    if (filterStatus.value) query = query.eq('status', filterStatus.value)

    const { data } = await query.range(from, to).order('created_at', { ascending: false })
    return (data ?? []).map(f => ({
      ...f,
      fields_count: Array.isArray(f.fields) ? f.fields.length : 0,
    }))
  },
  [search, filterStatus],
)

function statusVariant(status: string) {
  const map: Record<string, string> = { active: 'success', inactive: 'default' }
  return (map[status] ?? 'default') as any
}

function statusLabel(status: string) {
  const map: Record<string, string> = { active: 'Activo', inactive: 'Inactivo' }
  return map[status] ?? status
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

const confirm = useConfirm()

async function handleDelete(row: Record<string, any>) {
  if (await confirm({ message: `¿Seguro que deseas eliminar "${row.title}"?` })) {
    await client.from('forms').delete().eq('id', row.id)
    await refresh()
  }
}

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/formularios/${row.id}`)
}
</script>

<style scoped>
</style>
