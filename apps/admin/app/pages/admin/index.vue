<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Inicio</h1>
      <!-- <div class="page-header__actions">
        <UiButton variant="outline" size="sm" to="/admin/contenido/new">
          + Nuevo contenido
        </UiButton>
      </div> -->
    </div>

    <!-- Skeleton loader -->
    <template v-if="dashStatus === 'pending'">
      <div class="dashboard__kpis">
        <div v-for="i in 4" :key="i" class="dashboard__kpi-card">
          <UiSkeleton variant="text" width="60%" height="10px" />
          <UiSkeleton variant="text" width="40%" height="24px" />
        </div>
      </div>

      <UiSkeleton variant="text" width="120px" height="12px" style="margin-bottom: var(--space-3);" />
      <div class="dashboard__actions-grid">
        <div v-for="i in 6" :key="i" class="dashboard__action" style="pointer-events: none;">
          <UiSkeleton variant="circle" width="48px" height="48px" />
          <UiSkeleton variant="text" width="70%" height="14px" />
          <UiSkeleton variant="text" width="50%" height="10px" />
        </div>
      </div>

      <UiSkeleton variant="text" width="140px" height="12px" style="margin-bottom: var(--space-3); margin-top: var(--space-2);" />
      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        <UiSkeleton v-for="i in 5" :key="i" variant="rect" width="100%" height="40px" radius="var(--radius-md)" />
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="dashStatus === 'error'">
      <div class="dashboard__error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="dashboard__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="dashboard__error-title">No pudimos cargar el dashboard</h2>
        <p class="dashboard__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refreshDash()">Reintentar</UiButton>
      </div>
    </template>

    <template v-else>
      <!-- KPI Cards -->
      <div class="dashboard__kpis">
        <div v-for="kpi in kpis" :key="kpi.label" class="dashboard__kpi-card" :style="{ '--kpi-bg': kpi.bg, '--kpi-accent': kpi.accent }">
          <span class="eyebrow dashboard__kpi-label">{{ kpi.label }}</span>
          <span class="dashboard__kpi-value">{{ kpi.value }}</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <h2 v-if="canEdit" class="dashboard__section-title">Acciones rápidas</h2>
      <div v-if="canEdit" class="dashboard__actions-grid">
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
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const client = useSupabaseClient()
const { canEdit } = useAdminAuth()

// ── KPIs from Supabase aggregate queries ──
const { data: kpis, status: dashStatus, refresh: refreshDash } = useAsyncData('admin-dashboard-kpis', async () => {
  const _n = new Date()
  const today = `${_n.getFullYear()}-${String(_n.getMonth() + 1).padStart(2, '0')}-${String(_n.getDate()).padStart(2, '0')}`
  const [usersRes, subsRes, checkinsRes, programsRes] = await Promise.all([
    client.from('profiles').select('*', { count: 'exact', head: true }),
    client.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    client.from('daily_checkins').select('*', { count: 'exact', head: true }).eq('date', today!),
    client.from('programs').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])
  return [
    { label: 'Usuarios totales', value: (usersRes.count ?? 0).toLocaleString('es-MX'), bg: 'var(--color-ai-cool-bg)', accent: 'var(--color-ai-cool)' },
    { label: 'Suscriptores activos', value: (subsRes.count ?? 0).toLocaleString('es-MX'), bg: 'var(--color-complete-bg)', accent: 'var(--color-complete)' },
    { label: 'Check-ins hoy', value: (checkinsRes.count ?? 0).toLocaleString('es-MX'), bg: 'var(--color-ai-warm-bg)', accent: 'var(--color-ai-warm)' },
    { label: 'Programas activos', value: (programsRes.count ?? 0).toLocaleString('es-MX'), bg: 'var(--color-pro-bg)', accent: 'var(--color-pro)' },
  ]
}, { lazy: true })

const quickActions = [
  { title: 'Crear contenido', description: 'Artículo, video o audio nuevo', icon: 'lucide:file-plus', to: '/admin/contenido/new' },
  { title: 'Nuevo programa', description: 'Diseñar un programa de bienestar', icon: 'lucide:layers', to: '/admin/programas/new' },
  { title: 'Publicar evento', description: 'Agendar un evento o taller', icon: 'lucide:calendar-plus', to: '/admin/eventos/new' },
  { title: 'Agregar beneficio', description: 'Nuevo beneficio para miembros', icon: 'lucide:gift', to: '/admin/beneficios/new' },
  { title: 'Post comunidad', description: 'Publicación oficial en la comunidad', icon: 'lucide:message-square-plus', to: '/admin/comunidad/new' },
  { title: 'Planificar hoy', description: 'Configurar el plan del día', icon: 'lucide:sun', to: '/admin/hoy' },
]

const activityColumns = [
  { key: 'action', label: 'Acción' },
  { key: 'type', label: 'Tipo' },
  { key: 'item', label: 'Elemento' },
  { key: 'created_at', label: 'Fecha' },
]

// ── Recent activity from multiple tables ──
const { data: _activityData } = useAsyncData('admin-dashboard-activity', async () => {
  const [contentRes, programsRes, eventsRes, profilesRes] = await Promise.all([
    client.from('content_items').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
    client.from('programs').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
    client.from('events').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
    client.from('profiles').select('id, display_name, created_at').order('created_at', { ascending: false }).limit(3),
  ])

  const rows: { id: string; action: string; type: string; item: string; created_at: string }[] = []

  for (const c of contentRes.data ?? []) {
    rows.push({ id: c.id, action: 'Contenido publicado', type: 'contenido', item: c.title, created_at: c.created_at })
  }
  for (const p of programsRes.data ?? []) {
    rows.push({ id: p.id, action: 'Programa creado', type: 'programa', item: p.title, created_at: p.created_at })
  }
  for (const e of eventsRes.data ?? []) {
    rows.push({ id: e.id, action: 'Evento creado', type: 'evento', item: e.title, created_at: e.created_at })
  }
  for (const u of profilesRes.data ?? []) {
    rows.push({ id: u.id, action: 'Usuario registrado', type: 'usuario', item: u.display_name ?? 'Sin nombre', created_at: u.created_at })
  }

  rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return rows.slice(0, 10)
}, { lazy: true })
const activityRows = computed(() => _activityData.value ?? [])

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

.dashboard__kpi-label {
  max-width: 10ch;
  line-height: 1.3;
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
  gap: var(--space-4);
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

@media (hover: hover) {
  .dashboard__action:hover {
    background: rgba(var(--tint-rgb), 0.08);
    text-decoration: none;
  }
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

/* ─── Error state ─── */
.dashboard__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 40dvh;
  gap: var(--space-3);
}

.dashboard__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.dashboard__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.dashboard__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
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

  @media (hover: hover) {
    .dashboard__action:hover {
      background: var(--color-desktop-card);
      border-color: var(--color-border);
    }
  }
}
</style>
