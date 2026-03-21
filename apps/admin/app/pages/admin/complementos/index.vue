<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">VIP</h1>
      <div class="page-header__actions">
        <UiButton v-if="canEdit" variant="primary-outline" size="sm" to="/admin/complementos/new">+ Nuevo add-on</UiButton>
      </div>
    </div>

    <UiDataTable fill :columns="columns" :rows="filteredRows" @row-click="goToEdit">
      <template #toolbar>
        <UiInput
          v-model="search"
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
const search = ref('')

const columns = [
  { key: 'title', label: 'Nombre', width: '30%' },
  { key: 'price', label: 'Precio' },
  { key: 'plan', label: 'Disponible para' },
  { key: 'status', label: 'Estado' },
  { key: 'compras', label: 'Compras' },
]

const { data: rows, refresh } = await useAsyncData('admin-addons', async () => {
  const { data } = await client
    .from('addons')
    .select('*, addon_purchases(count)')
    .order('created_at', { ascending: false })
  return (data ?? []).map(a => ({
    ...a,
    purchases: (a.addon_purchases as any)?.[0]?.count ?? 0,
  }))
})

const filteredRows = computed(() => {
  if (!search.value) return rows.value ?? []
  const q = search.value.toLowerCase()
  return (rows.value ?? []).filter(r => r.title.toLowerCase().includes(q))
})

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/complementos/${row.id}`)
}
</script>
