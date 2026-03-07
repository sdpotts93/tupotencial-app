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
      <div v-for="kpi in kpis" :key="kpi.label" class="dashboard__kpi-card" :style="{ '--kpi-bg': kpi.bg, '--kpi-accent': kpi.accent }">
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
      <NuxtLink
        v-for="action in quickActions"
        :key="action.to"
        :to="action.to"
        class="dashboard__action"
      >
        <div class="dashboard__action-thumb">
          <Icon :name="action.icon" size="22" />
        </div>
        <div class="dashboard__action-info">
          <span class="dashboard__action-name">{{ action.title }}</span>
          <span class="dashboard__action-meta">{{ action.description }}</span>
        </div>
        <Icon name="lucide:chevron-right" size="16" class="dashboard__action-arrow" />
      </NuxtLink>
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
  { label: 'Usuarios totales', value: '12,847', change: '+324 este mes', positive: true, bg: 'var(--color-ai-cool-bg)', accent: 'var(--color-ai-cool)' },
  { label: 'Suscriptores activos', value: '8,203', change: '+12.4%', positive: true, bg: 'var(--color-complete-bg)', accent: 'var(--color-complete)' },
  { label: 'Check-ins hoy', value: '1,456', change: '+8.2%', positive: true, bg: 'var(--color-ai-warm-bg)', accent: 'var(--color-ai-warm)' },
  { label: 'Programas activos', value: '24', change: '3 nuevos', positive: true, bg: 'var(--color-pro-bg)', accent: 'var(--color-pro)' },
])

const quickActions = [
  { title: 'Crear contenido', description: 'Articulo, video o audio nuevo', icon: 'lucide:file-plus', to: '/admin/content/new' },
  { title: 'Nuevo programa', description: 'Disenar un programa de bienestar', icon: 'lucide:layers', to: '/admin/programs/new' },
  { title: 'Publicar evento', description: 'Agendar un evento o taller', icon: 'lucide:calendar-plus', to: '/admin/events/new' },
  { title: 'Agregar beneficio', description: 'Nuevo beneficio para miembros', icon: 'lucide:gift', to: '/admin/benefits/new' },
  { title: 'Post comunidad', description: 'Publicacion oficial en la comunidad', icon: 'lucide:message-square-plus', to: '/admin/community/new' },
  { title: 'Planificar hoy', description: 'Configurar el plan del dia', icon: 'lucide:sun', to: '/admin/hoy' },
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
/* ─── KPI cards ─── */
.dashboard__kpis {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}

.dashboard__kpi-card {
  background: var(--kpi-bg, rgba(var(--tint-rgb), 0.04));
  border: none;
  border-radius: var(--radius-xl);
  padding: var(--space-4);
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

/* ─── Section title (matches hoy__section-title) ─── */
.dashboard__section-title {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--space-3);
  margin-top: var(--space-2);
}

/* ─── Quick actions (matches hoy__activity) ─── */
.dashboard__actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}

.dashboard__action {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-4);
  background: rgba(var(--tint-rgb), 0.04);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: var(--color-text);
  transition: background var(--transition-fast);
  cursor: pointer;
}

.dashboard__action:hover {
  background: rgba(var(--tint-rgb), 0.08);
  text-decoration: none;
}

.dashboard__action-thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  flex-shrink: 0;
  margin-bottom: var(--space-2);
}

.dashboard__action-info {
  flex: 1;
  min-width: 0;
}

.dashboard__action-name {
  display: block;
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
}

.dashboard__action-meta {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: 2px;
}

.dashboard__action-arrow {
  display: none;
}

/* ─── Desktop (matches hoy @media 1024px) ─── */
@media (min-width: 1024px) {
  .dashboard__kpis {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-4);
  }

  .dashboard__kpi-card {
    padding: var(--space-5);
  }

  .dashboard__actions-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-4);
  }

  .dashboard__action {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
  }

  .dashboard__action:hover {
    background: var(--color-desktop-card);
    border-color: var(--color-border);
  }
}
</style>
