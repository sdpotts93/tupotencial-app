<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Usuarios</h1>
    </div>

    <UiDataTable fill :columns="columns" :rows="filteredRows">
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

const rows = ref([
  { id: 'usr-001', full_name: 'Maria Lopez Hernandez', email: 'maria.lopez@gmail.com', plan: 'core', segment: 'carlotta', status: 'active', created_at: '2025-08-15T10:00:00' },
  { id: 'usr-002', full_name: 'Carlos Ramirez Torres', email: 'carlos.rt@outlook.com', plan: 'core', segment: 'gabriel', status: 'active', created_at: '2025-10-03T14:30:00' },
  { id: 'usr-003', full_name: 'Ana Sofia Gutierrez', email: 'ana.gtz@gmail.com', plan: 'free', segment: 'carlotta', status: 'active', created_at: '2026-01-20T09:00:00' },
  { id: 'usr-004', full_name: 'Roberto Diaz Mora', email: 'rdiaz@empresa.com', plan: 'core', segment: 'gabriel', status: 'active', created_at: '2025-05-10T08:00:00' },
  { id: 'usr-005', full_name: 'Laura Mendez', email: 'laura.mendez@yahoo.com', plan: 'free', segment: 'carlotta', status: 'inactive', created_at: '2025-12-01T16:00:00' },
  { id: 'usr-006', full_name: 'Fernando Castillo', email: 'fcastillo@gmail.com', plan: 'core', segment: 'gabriel', status: 'active', created_at: '2026-01-05T11:30:00' },
  { id: 'usr-007', full_name: 'Sofia Torres Vega', email: 'sofia.tv@hotmail.com', plan: 'free', segment: 'carlotta', status: 'active', created_at: '2026-02-15T13:00:00' },
  { id: 'usr-008', full_name: 'Pedro Sanchez', email: 'pedro.s@empresa.com', plan: 'core', segment: 'gabriel', status: 'inactive', created_at: '2025-09-20T10:00:00' },
  { id: 'usr-009', full_name: 'Valentina Morales', email: 'val.morales@gmail.com', plan: 'core', segment: 'carlotta', status: 'active', created_at: '2025-07-12T07:00:00' },
  { id: 'usr-010', full_name: 'Diego Herrera Ruiz', email: 'dherrera@outlook.com', plan: 'free', segment: 'gabriel', status: 'active', created_at: '2026-02-22T20:00:00' },
])

const filteredRows = computed(() => {
  return rows.value.filter(row => {
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
