<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Detalle de usuario</h1>
      <div class="page-header__actions">
        <UiButton variant="outline" size="sm" to="/admin/users">Volver</UiButton>
        <UiButton v-if="user.status === 'active'" variant="ghost" size="sm" @click="suspendUser">Suspender</UiButton>
        <UiButton v-else-if="user.status === 'suspended'" variant="ghost" size="sm" @click="reactivateUser">Reactivar</UiButton>
      </div>
    </div>

    <div class="user-detail">
      <div class="user-detail__main">
        <!-- Profile Card -->
        <UiCard variant="outlined">
          <div class="profile-card">
            <div class="profile-card__avatar">{{ user.full_name?.charAt(0) ?? '?' }}</div>
            <div class="profile-card__info">
              <h2 class="profile-card__name">{{ user.full_name }}</h2>
              <p class="profile-card__email">{{ user.email }}</p>
              <div class="profile-card__tags">
                <UiTag :variant="planVariant(user.plan)">{{ planLabel(user.plan) }}</UiTag>
                <UiTag :variant="user.status === 'active' ? 'success' : 'danger'">
                  {{ user.status === 'active' ? 'Activo' : 'Suspendido' }}
                </UiTag>
              </div>
            </div>
          </div>
        </UiCard>

        <!-- Stats -->
        <div class="user-stats">
          <div class="user-stats__item">
            <span class="user-stats__value">{{ user.streak_days }}</span>
            <span class="eyebrow">Racha (dias)</span>
          </div>
          <div class="user-stats__item">
            <span class="user-stats__value">{{ user.checkins_total }}</span>
            <span class="eyebrow">Check-ins</span>
          </div>
          <div class="user-stats__item">
            <span class="user-stats__value">{{ user.programs_completed }}</span>
            <span class="eyebrow">Programas</span>
          </div>
          <div class="user-stats__item">
            <span class="user-stats__value">{{ user.community_posts }}</span>
            <span class="eyebrow">Publicaciones</span>
          </div>
        </div>

        <!-- Activity -->
        <h3 class="section-title">Actividad reciente</h3>
        <UiDataTable :columns="activityColumns" :rows="activityRows">
          <template #cell-type="{ value }">
            <UiTag size="sm">{{ value }}</UiTag>
          </template>
          <template #cell-created_at="{ value }">
            {{ formatDate(value) }}
          </template>
        </UiDataTable>
      </div>

      <div class="user-detail__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <h3 class="sidebar-title">Informacion de la cuenta</h3>
            <div class="info-row">
              <span class="info-row__label">ID</span>
              <span class="info-row__value">{{ route.params.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Telefono</span>
              <span class="info-row__value">{{ user.phone }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Fecha de nacimiento</span>
              <span class="info-row__value">{{ user.birth_date }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Genero</span>
              <span class="info-row__value">{{ user.gender }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Registro</span>
              <span class="info-row__value">{{ formatDate(user.created_at) }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Ultimo acceso</span>
              <span class="info-row__value">{{ formatDate(user.last_login) }}</span>
            </div>
          </div>
        </UiCard>

        <UiCard variant="outlined">
          <div class="form-section">
            <h3 class="sidebar-title">Suscripcion</h3>
            <div class="info-row">
              <span class="info-row__label">Plan</span>
              <span class="info-row__value">{{ planLabel(user.plan) }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Inicio</span>
              <span class="info-row__value">{{ user.subscription_start }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Renovacion</span>
              <span class="info-row__value">{{ user.subscription_renewal }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Add-ons activos</span>
              <span class="info-row__value">{{ user.active_addons }}</span>
            </div>
          </div>
        </UiCard>

        <UiCard variant="filled">
          <div class="form-section">
            <h3 class="sidebar-title">Programas inscritos</h3>
            <div v-for="program in enrolledPrograms" :key="program.id" class="program-entry">
              <span class="program-entry__name">{{ program.title }}</span>
              <span class="program-entry__progress">{{ program.progress }}%</span>
            </div>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

const user = reactive({
  full_name: 'Maria Lopez Hernandez',
  email: 'maria.lopez@gmail.com',
  phone: '+52 55 1234 5678',
  birth_date: '15 mar 1990',
  gender: 'Femenino',
  plan: 'premium',
  status: 'active',
  streak_days: 45,
  checkins_total: 312,
  programs_completed: 5,
  community_posts: 28,
  created_at: '2025-08-15T10:00:00',
  last_login: '2026-02-24T07:30:00',
  subscription_start: '15 ago 2025',
  subscription_renewal: '15 mar 2026',
  active_addons: 2,
})

const activityColumns = [
  { key: 'type', label: 'Tipo' },
  { key: 'description', label: 'Descripcion' },
  { key: 'created_at', label: 'Fecha' },
]

const activityRows = ref([
  { id: '1', type: 'Check-in', description: 'Check-in matutino completado', created_at: '2026-02-24T07:30:00' },
  { id: '2', type: 'Contenido', description: 'Leyo "5 pasos para el bienestar emocional"', created_at: '2026-02-24T07:45:00' },
  { id: '3', type: 'Programa', description: 'Completo dia 15 de "Reto 21 dias de meditacion"', created_at: '2026-02-23T08:00:00' },
  { id: '4', type: 'Comunidad', description: 'Publico en la comunidad', created_at: '2026-02-23T12:30:00' },
  { id: '5', type: 'Beneficio', description: 'Canjeo descuento en NutriVida', created_at: '2026-02-22T15:00:00' },
])

const enrolledPrograms = ref([
  { id: 'prg-001', title: 'Reto 21 dias de meditacion', progress: 71 },
  { id: 'prg-002', title: 'Curso de nutricion consciente', progress: 45 },
  { id: 'prg-005', title: 'Reto 7 dias de gratitud', progress: 100 },
])

function planVariant(plan: string) {
  const map: Record<string, string> = { free: 'default', premium: 'accent', enterprise: 'primary' }
  return (map[plan] ?? 'default') as any
}

function planLabel(plan: string) {
  const map: Record<string, string> = { free: 'Gratuito', premium: 'Premium', enterprise: 'Empresarial' }
  return map[plan] ?? plan
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function suspendUser() {
  if (confirm('Seguro que deseas suspender a este usuario?')) {
    user.status = 'suspended'
    alert('Usuario suspendido (mock)')
  }
}

function reactivateUser() {
  user.status = 'active'
  alert('Usuario reactivado (mock)')
}
</script>

<style scoped>
.user-detail {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--space-6);
  align-items: start;
}

.user-detail__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.user-detail__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.profile-card {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-5);
}

.profile-card__avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--title-sm);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
}

.profile-card__name {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
}

.profile-card__email {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

.profile-card__tags {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.user-stats__item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.user-stats__value {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  color: var(--color-text);
}

.section-title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  margin-top: var(--space-2);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
}

.sidebar-title {
  font-family: var(--font-body);
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  margin-bottom: var(--space-2);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-1) 0;
}

.info-row__label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.info-row__value {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}

.program-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.program-entry:last-child {
  border-bottom: none;
}

.program-entry__name {
  font-size: var(--text-sm);
}

.program-entry__progress {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-success);
}

@media (max-width: 768px) {
  .user-detail { grid-template-columns: 1fr; }
  .user-stats { grid-template-columns: repeat(2, 1fr); }
}
</style>
