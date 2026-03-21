<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Programas</h1>
      <div class="page-header__actions">
        <UiButton v-if="canEdit" variant="primary-outline" size="sm" to="/admin/programas/new">+ Nuevo programa</UiButton>
      </div>
    </div>

    <UiDataTable fill :columns="columns" :rows="filteredRows" @row-click="goToEdit">
      <template #toolbar>
        <UiInput
          v-model="search"
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

const search = ref('')
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
const { data: rows, refresh } = await useAsyncData('admin-programs', async () => {
  const { data } = await client.from('programs').select('*').order('created_at', { ascending: false })
  return (data ?? []).map(p => ({
    ...p,
    program_type: p.type,
  }))
})

const filteredRows = computed(() => {
  return (rows.value ?? []).filter(row => {
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!row.title.toLowerCase().includes(q)) return false
    }
    if (filterType.value && row.program_type !== filterType.value) return false
    if (filterStatus.value && row.status !== filterStatus.value) return false
    if (filterPlan.value && row.plan !== filterPlan.value) return false
    return true
  })
})

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
