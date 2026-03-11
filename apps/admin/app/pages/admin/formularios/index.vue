<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Formularios</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" to="/admin/formularios/new">+ Crear formulario</UiButton>
      </div>
    </div>

    <UiDataTable :columns="columns" :rows="filteredRows" fill @row-click="goToEdit">
      <template #toolbar>
        <UiInput
          v-model="search"
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

const search = ref('')
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
const { data: rows, refresh } = await useAsyncData('admin-forms', async () => {
  const { data } = await client.from('forms').select('*').order('created_at', { ascending: false })
  return data ?? []
})

const filteredRows = computed(() => {
  return (rows.value ?? []).filter(row => {
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!row.title.toLowerCase().includes(q)) return false
    }
    if (filterStatus.value && row.status !== filterStatus.value) return false
    return true
  })
})

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

async function handleDelete(row: Record<string, any>) {
  if (confirm(`¿Seguro que deseas eliminar "${row.title}"?`)) {
    await client.from('forms').delete().eq('id', row.id)
    await refresh()
  }
}

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/formularios/${row.id}`)
}
</script>
