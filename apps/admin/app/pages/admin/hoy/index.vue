<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Hoy - Planificacion diaria</h1>
      <div class="page-header__actions">
        <UiButton variant="outline" size="sm" @click="viewMode = viewMode === 'calendar' ? 'list' : 'calendar'">
          {{ viewMode === 'calendar' ? 'Ver lista' : 'Ver calendario' }}
        </UiButton>
      </div>
    </div>

    <UiTabs v-model="activeTab" :tabs="weekTabs" />

    <!-- Calendar View -->
    <div v-if="viewMode === 'calendar'" class="hoy-calendar">
      <div class="hoy-calendar__grid">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          :class="['hoy-calendar__day', { 'hoy-calendar__day--today': day.isToday, 'hoy-calendar__day--has-content': day.items > 0 }]"
          @click="goToDate(day.date)"
        >
          <span class="hoy-calendar__day-name eyebrow">{{ day.dayName }}</span>
          <span class="hoy-calendar__day-number">{{ day.dayNumber }}</span>
          <span v-if="day.items > 0" class="hoy-calendar__day-count">{{ day.items }} elementos</span>
          <span v-else class="hoy-calendar__day-empty">Sin plan</span>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="hoy-list">
      <UiDataTable :columns="columns" :rows="dailyPlans" @row-click="goToDateFromRow">
        <template #cell-date="{ value }">
          <strong>{{ formatDate(value) }}</strong>
        </template>

        <template #cell-status="{ value }">
          <UiTag :variant="value === 'published' ? 'success' : value === 'scheduled' ? 'info' : 'warning'">
            {{ statusLabel(value) }}
          </UiTag>
        </template>

        <template #cell-items_count="{ value }">
          {{ value }} elementos
        </template>

        <template #actions="{ row }">
          <UiButton variant="ghost" size="sm" :to="`/admin/hoy/${row.date}`">Editar</UiButton>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const viewMode = ref<'calendar' | 'list'>('calendar')
const activeTab = ref('current')

const weekTabs = [
  { value: 'current', label: 'Esta semana' },
  { value: 'next', label: 'Proxima semana' },
  { value: 'all', label: 'Todos los planes' },
]

const columns = [
  { key: 'date', label: 'Fecha' },
  { key: 'theme', label: 'Tema del dia' },
  { key: 'items_count', label: 'Elementos' },
  { key: 'status', label: 'Estado' },
]

const calendarDays = ref([
  { date: '2026-02-23', dayName: 'Lun', dayNumber: 23, items: 5, isToday: false },
  { date: '2026-02-24', dayName: 'Mar', dayNumber: 24, items: 4, isToday: true },
  { date: '2026-02-25', dayName: 'Mie', dayNumber: 25, items: 3, isToday: false },
  { date: '2026-02-26', dayName: 'Jue', dayNumber: 26, items: 4, isToday: false },
  { date: '2026-02-27', dayName: 'Vie', dayNumber: 27, items: 2, isToday: false },
  { date: '2026-02-28', dayName: 'Sab', dayNumber: 28, items: 1, isToday: false },
  { date: '2026-03-01', dayName: 'Dom', dayNumber: 1, items: 0, isToday: false },
])

const dailyPlans = ref([
  { id: 'dp-001', date: '2026-02-24', theme: 'Bienestar emocional', items_count: 4, status: 'published' },
  { id: 'dp-002', date: '2026-02-25', theme: 'Nutricion consciente', items_count: 3, status: 'scheduled' },
  { id: 'dp-003', date: '2026-02-26', theme: 'Movimiento y energia', items_count: 4, status: 'scheduled' },
  { id: 'dp-004', date: '2026-02-27', theme: 'Descanso y recuperacion', items_count: 2, status: 'draft' },
  { id: 'dp-005', date: '2026-02-28', theme: 'Conexion social', items_count: 1, status: 'draft' },
  { id: 'dp-006', date: '2026-02-23', theme: 'Productividad y enfoque', items_count: 5, status: 'published' },
])

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}

function statusLabel(status: string) {
  const map: Record<string, string> = { published: 'Publicado', scheduled: 'Programado', draft: 'Borrador' }
  return map[status] ?? status
}

function goToDate(date: string) {
  router.push(`/admin/hoy/${date}`)
}

function goToDateFromRow(row: Record<string, any>) {
  router.push(`/admin/hoy/${row.date}`)
}
</script>

<style scoped>
.hoy-calendar {
  margin-top: var(--space-6);
}

.hoy-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-3);
}

.hoy-calendar__day {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  min-height: 120px;
}

.hoy-calendar__day:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-1);
}

.hoy-calendar__day--today {
  border-color: var(--color-primary);
  background: rgba(40, 55, 74, 0.04);
}

.hoy-calendar__day--has-content {
  border-left: 3px solid var(--color-success);
}

.hoy-calendar__day-name {
  font-size: var(--eyebrow-sm);
}

.hoy-calendar__day-number {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  color: var(--color-text);
}

.hoy-calendar__day-count {
  font-size: var(--text-xs);
  color: var(--color-success);
  font-weight: var(--weight-medium);
}

.hoy-calendar__day-empty {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.hoy-list {
  margin-top: var(--space-6);
}

@media (max-width: 768px) {
  .hoy-calendar__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
