<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Detalle de check-in</h1>
      <div class="page-header__actions">
        <UiButton variant="soft" size="sm" to="/admin/checkins">Volver</UiButton>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="dataStatus === 'pending'" class="detail">
      <UiCard variant="outlined">
        <div class="detail__header">
          <UiSkeleton variant="circle" width="56px" height="56px" />
          <div style="flex: 1; display: flex; flex-direction: column; gap: var(--space-2);">
            <UiSkeleton variant="text" width="40%" height="20px" />
            <UiSkeleton variant="text" width="120px" height="12px" />
          </div>
        </div>
      </UiCard>

      <div class="detail__stats">
        <div v-for="i in 3" :key="i" class="detail__stat">
          <UiSkeleton variant="text" width="60%" height="10px" />
          <UiSkeleton variant="text" width="40%" height="16px" />
        </div>
      </div>

      <UiSkeleton variant="text" width="80px" height="10px" style="margin-top: var(--space-2);" />
      <UiCard variant="outlined">
        <UiSkeleton variant="rect" width="100%" height="80px" radius="var(--radius-md)" />
      </UiCard>
    </div>

    <!-- Error state -->
    <template v-else-if="dataStatus === 'error'">
      <div class="detail__error">
        <h2 class="detail__error-title">No pudimos cargar el check-in</h2>
        <p class="detail__error-desc">Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refresh()">Reintentar</UiButton>
      </div>
    </template>

    <template v-else>
      <div v-if="checkin" class="detail">
        <!-- User header -->
        <UiCard variant="outlined">
          <div class="detail__header">
            <div class="detail__avatar">{{ avatarInitials(checkin.user_name) }}</div>
            <div class="detail__info">
              <h2 class="detail__name">{{ checkin.user_name }}</h2>
              <p class="detail__email">{{ checkin.user_email }}</p>
            </div>
          </div>
        </UiCard>

        <!-- Meta stats -->
        <div class="detail__stats">
          <div class="detail__stat">
            <span class="eyebrow detail__stat-label">Fecha</span>
            <span class="detail__stat-value">{{ formatDate(checkin.date) }}</span>
          </div>
          <div class="detail__stat">
            <span class="eyebrow detail__stat-label">Estado de ánimo</span>
            <span class="detail__stat-value">
              <span v-if="checkin.mood" class="mood-badge" :style="{ background: moodColor(checkin.mood) }">
                {{ moodLabel(checkin.mood) }}
              </span>
              <span v-else style="color: var(--color-muted);">—</span>
            </span>
          </div>
          <div class="detail__stat">
            <span class="eyebrow detail__stat-label">Registrado</span>
            <span class="detail__stat-value">{{ formatDateTime(checkin.created_at) }}</span>
          </div>
        </div>

        <!-- Reflection -->
        <h3 class="detail__section-title">Reflexión</h3>
        <UiCard variant="outlined">
          <p v-if="checkin.reflection" class="detail__reflection">{{ checkin.reflection }}</p>
          <p v-else class="detail__empty">Sin reflexión</p>
        </UiCard>

        <!-- Additional payload data -->
        <template v-if="extraEntries.length">
          <h3 class="detail__section-title">Datos adicionales</h3>
          <UiCard variant="outlined">
            <div v-for="([key, value], i) in extraEntries" :key="i" class="detail__row">
              <span class="detail__row-label">{{ key }}</span>
              <span>{{ value }}</span>
            </div>
          </UiCard>
        </template>
      </div>

      <div v-else class="detail__loading">
        <p>Check-in no encontrado</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const client = useSupabaseClient()
const id = route.params.id as string

const { data: checkin, status: dataStatus, refresh } = useAsyncData(`checkin-${id}`, async () => {
  const { data } = await client
    .from('daily_checkins')
    .select('id, date, user_id, type, payload, created_at, profiles!daily_checkins_profile_fk(display_name, email)')
    .eq('id', id)
    .single()

  if (!data) return null

  const payload = (data.payload ?? {}) as Record<string, unknown>

  return {
    ...data,
    user_name: (data.profiles as any)?.display_name ?? 'Sin nombre',
    user_email: (data.profiles as any)?.email ?? '',
    mood: (payload.mood as string) ?? null,
    reflection: (payload.reflection as string) ?? null,
  }
}, { lazy: true })

const extraEntries = computed(() => {
  const payload = checkin.value?.payload as Record<string, unknown> | null
  if (!payload || typeof payload !== 'object') return []
  return Object.entries(payload).filter(([key]) => key !== 'mood' && key !== 'reflection')
})

const moodMap: Record<string, { label: string; color: string }> = {
  great: { label: 'Increíble', color: 'var(--color-mood-great, #4ade80)' },
  good: { label: 'Bien', color: 'var(--color-mood-good, #86efac)' },
  ok: { label: 'Regular', color: 'var(--color-mood-ok, #fde68a)' },
  low: { label: 'Bajo', color: 'var(--color-mood-low, #fdba74)' },
  tough: { label: 'Difícil', color: 'var(--color-mood-tough, #fca5a5)' },
}

function moodLabel(mood: string) { return moodMap[mood]?.label ?? mood }
function moodColor(mood: string) { return moodMap[mood]?.color ?? 'var(--color-sand)' }

function avatarInitials(name: string) {
  return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ─── Header ─── */
.detail__header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.detail__avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-desktop-border);
  color: var(--color-accent-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
}

.detail__name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  line-height: 1.2;
  font-weight: 100;
}

.detail__email {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

/* ─── Stats ─── */
.detail__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.detail__stat {
  background: rgba(var(--tint-rgb), 0.04);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.detail__stat-value {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.detail__stat-label {
  max-width: 12ch;
  line-height: 1.3;
}

/* ─── Section title ─── */
.detail__section-title {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-top: var(--space-2);
}

/* ─── Rows ─── */
.detail__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-bottom: 1px solid rgba(var(--tint-rgb), 0.06);
  font-size: var(--text-sm);
}

.detail__row:last-child {
  border-bottom: none;
}

.detail__row-label {
  color: var(--color-muted);
  font-size: var(--text-xs);
}

/* ─── Reflection ─── */
.detail__reflection {
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: var(--leading-relaxed);
  white-space: pre-wrap;
}

/* ─── Mood badge ─── */
.mood-badge {
  display: inline-block;
  padding: 4px 8px 1px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

/* ─── Empty / Error ─── */
.detail__empty {
  font-size: var(--text-sm);
  color: var(--color-muted);
  padding: var(--space-2) 0;
}

.detail__loading {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-muted);
}

.detail__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 40dvh;
  gap: var(--space-3);
}

.detail__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
}

.detail__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
}

@media (max-width: 768px) {
  .detail__stats {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .detail__stat {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
  }
}
</style>
