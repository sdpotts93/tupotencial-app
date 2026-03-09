<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Programas</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" to="/admin/programs/new">+ Nuevo programa</UiButton>
      </div>
    </div>

    <UiDataTable fill :columns="columns" :rows="filteredRows" @row-click="goToEdit">
      <template #toolbar>
        <UiInput
          v-model="search"
          placeholder="Buscar por titulo..."
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
          v-model="filterSegment"
          :options="segmentFilterOptions"
          placeholder="Segmento"
        />
      </template>

      <template #cell-program_type="{ value }">
        <UiTag :variant="typeVariant(value)">{{ typeLabel(value) }}</UiTag>
      </template>

      <template #cell-status="{ value }">
        <UiTag :variant="statusVariant(value)">{{ statusLabel(value) }}</UiTag>
      </template>

      <template #cell-duration_days="{ value }">
        {{ value }} dias
      </template>

      <template #cell-enrolled_count="{ value }">
        {{ value?.toLocaleString('es-MX') ?? 0 }}
      </template>

      <template #actions="{ row }">
        <UiButton variant="soft" size="sm" @click.stop="handleDuplicate(row)">
          <template #icon><Icon name="lucide:copy" size="16" /></template>
          Duplicar
        </UiButton>
        <UiButton variant="soft" size="sm" :to="`/admin/programs/${row.id}`">
          <template #icon><Icon name="lucide:pencil" size="16" /></template>
          Editar
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
const filterSegment = ref('')

const typeOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: 'challenge', label: 'Reto' },
  { value: 'course', label: 'Curso' },
  { value: 'path', label: 'Ruta' },
  { value: 'workshop', label: 'Taller' },
]

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'active', label: 'Activo' },
  { value: 'draft', label: 'Borrador' },
  { value: 'archived', label: 'Archivado' },
]

const segmentFilterOptions = [
  { value: '', label: 'Todos los segmentos' },
  { value: 'all', label: 'General' },
  { value: 'free', label: 'Gratuito' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Empresarial' },
]

const columns = [
  { key: 'title', label: 'Titulo', width: '30%' },
  { key: 'program_type', label: 'Tipo' },
  { key: 'duration_days', label: 'Duracion' },
  { key: 'status', label: 'Estado' },
  { key: 'enrolled_count', label: 'Inscritos' },
]

const rows = ref([
  { id: 'prg-001', title: 'Reto 21 dias de meditacion', program_type: 'challenge', duration_days: 21, status: 'active', enrolled_count: 3420, segment: 'premium' },
  { id: 'prg-002', title: 'Curso de nutricion consciente', program_type: 'course', duration_days: 30, status: 'active', enrolled_count: 1856, segment: 'premium' },
  { id: 'prg-003', title: 'Ruta de bienestar integral', program_type: 'path', duration_days: 90, status: 'active', enrolled_count: 978, segment: 'all' },
  { id: 'prg-004', title: 'Taller de manejo del estres', program_type: 'workshop', duration_days: 5, status: 'active', enrolled_count: 2105, segment: 'free' },
  { id: 'prg-005', title: 'Reto 7 dias de gratitud', program_type: 'challenge', duration_days: 7, status: 'active', enrolled_count: 4512, segment: 'free' },
  { id: 'prg-006', title: 'Curso de yoga para principiantes', program_type: 'course', duration_days: 28, status: 'draft', enrolled_count: 0, segment: 'premium' },
  { id: 'prg-007', title: 'Ruta de productividad personal', program_type: 'path', duration_days: 60, status: 'draft', enrolled_count: 0, segment: 'enterprise' },
  { id: 'prg-008', title: 'Reto detox digital', program_type: 'challenge', duration_days: 14, status: 'archived', enrolled_count: 1230, segment: 'all' },
])

const filteredRows = computed(() => {
  return rows.value.filter(row => {
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!row.title.toLowerCase().includes(q)) return false
    }
    if (filterType.value && row.program_type !== filterType.value) return false
    if (filterStatus.value && row.status !== filterStatus.value) return false
    if (filterSegment.value && row.segment !== filterSegment.value) return false
    return true
  })
})

function typeVariant(type: string) {
  const map: Record<string, string> = { challenge: 'warning', course: 'info', path: 'accent', workshop: 'success' }
  return (map[type] ?? 'default') as any
}

function typeLabel(type: string) {
  const map: Record<string, string> = { challenge: 'Reto', course: 'Curso', path: 'Ruta', workshop: 'Taller' }
  return map[type] ?? type
}

function statusVariant(status: string) {
  const map: Record<string, string> = { active: 'success', draft: 'warning', archived: 'default' }
  return (map[status] ?? 'default') as any
}

function statusLabel(status: string) {
  const map: Record<string, string> = { active: 'Activo', draft: 'Borrador', archived: 'Archivado' }
  return map[status] ?? status
}

function handleDuplicate(row: Record<string, any>) {
  alert(`Programa duplicado como "Copia de ${row.title}" (mock)`)
  navigateTo('/admin/programs/new')
}

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/programs/${row.id}`)
}
</script>
