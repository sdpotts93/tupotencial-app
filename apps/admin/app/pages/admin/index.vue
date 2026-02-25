<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Dashboard</h1>
      <div class="page-header__actions">
        <UiButton variant="outline" size="sm" to="/admin/content/new">
          + Nuevo contenido
        </UiButton>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="dashboard__kpis">
      <div v-for="kpi in kpis" :key="kpi.label" class="dashboard__kpi-card">
        <span class="eyebrow dashboard__kpi-label">{{ kpi.label }}</span>
        <span class="dashboard__kpi-value">{{ kpi.value }}</span>
        <span :class="['dashboard__kpi-change', kpi.positive ? 'dashboard__kpi-change--up' : 'dashboard__kpi-change--down']">
          {{ kpi.change }}
        </span>
      </div>
    </div>

    <!-- Quick Actions -->
    <h2 class="dashboard__section-title">Acciones rapidas</h2>
    <div class="dashboard__actions-grid">
      <UiCard
        v-for="action in quickActions"
        :key="action.to"
        variant="outlined"
        :title="action.title"
        :subtitle="action.description"
        :to="action.to"
        clickable
      />
    </div>

    <!-- Recent Activity -->
    <h2 class="dashboard__section-title">Actividad reciente</h2>
    <UiDataTable :columns="activityColumns" :rows="activityRows">
      <template #cell-type="{ value }">
        <UiTag :variant="typeVariant(value)">{{ value }}</UiTag>
      </template>
      <template #cell-created_at="{ value }">
        {{ formatDate(value) }}
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const kpis = ref([
  { label: 'Usuarios totales', value: '12,847', change: '+324 este mes', positive: true },
  { label: 'Suscriptores activos', value: '8,203', change: '+12.4%', positive: true },
  { label: 'Check-ins hoy', value: '1,456', change: '+8.2%', positive: true },
  { label: 'Programas activos', value: '24', change: '3 nuevos', positive: true },
])

const quickActions = [
  { title: 'Crear contenido', description: 'Articulo, video o audio nuevo', to: '/admin/content/new' },
  { title: 'Nuevo programa', description: 'Disenar un programa de bienestar', to: '/admin/programs/new' },
  { title: 'Publicar evento', description: 'Agendar un evento o taller', to: '/admin/events/new' },
  { title: 'Agregar beneficio', description: 'Nuevo beneficio para miembros', to: '/admin/benefits/new' },
  { title: 'Post comunidad', description: 'Publicacion oficial en la comunidad', to: '/admin/community/new' },
  { title: 'Planificar hoy', description: 'Configurar el plan del dia', to: '/admin/hoy' },
]

const activityColumns = [
  { key: 'action', label: 'Accion' },
  { key: 'type', label: 'Tipo' },
  { key: 'item', label: 'Elemento' },
  { key: 'user', label: 'Responsable' },
  { key: 'created_at', label: 'Fecha' },
]

const activityRows = ref([
  { id: '1', action: 'Contenido publicado', type: 'contenido', item: '5 pasos para el bienestar emocional', user: 'Ana Garcia', created_at: '2026-02-24T10:30:00' },
  { id: '2', action: 'Programa actualizado', type: 'programa', item: 'Reto 21 dias de meditacion', user: 'Carlos Lopez', created_at: '2026-02-24T09:15:00' },
  { id: '3', action: 'Evento creado', type: 'evento', item: 'Taller de mindfulness', user: 'Ana Garcia', created_at: '2026-02-23T16:45:00' },
  { id: '4', action: 'Beneficio agregado', type: 'beneficio', item: '20% en suplementos NutriVida', user: 'Maria Torres', created_at: '2026-02-23T14:20:00' },
  { id: '5', action: 'Usuario registrado', type: 'usuario', item: 'Luisa Fernandez', user: 'Sistema', created_at: '2026-02-23T11:00:00' },
])

function typeVariant(type: string) {
  const map: Record<string, string> = {
    contenido: 'info',
    programa: 'accent',
    evento: 'warning',
    beneficio: 'success',
    usuario: 'primary',
  }
  return (map[type] ?? 'default') as any
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.dashboard__kpis {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.dashboard__kpi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.dashboard__kpi-value {
  font-family: var(--font-title);
  font-size: var(--title-lg);
  color: var(--color-text);
  line-height: 1;
}

.dashboard__kpi-change {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

.dashboard__kpi-change--up {
  color: var(--color-success);
}

.dashboard__kpi-change--down {
  color: var(--color-danger);
}

.dashboard__section-title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-4);
  margin-top: var(--space-2);
}

.dashboard__actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}
</style>
