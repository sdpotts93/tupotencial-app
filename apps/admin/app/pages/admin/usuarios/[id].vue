<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Detalle de usuario</h1>
      <div class="page-header__actions">
        <UiButton variant="soft" size="sm" to="/admin/usuarios">Volver</UiButton>
      </div>
    </div>

    <div class="user-detail" v-if="profile">
      <!-- Profile header -->
      <UiCard variant="outlined">
        <div class="user-detail__header">
          <div class="user-detail__avatar">{{ profile.display_name?.charAt(0) ?? '?' }}</div>
          <div class="user-detail__info">
            <h2 class="user-detail__name">{{ profile.display_name ?? 'Sin nombre' }}</h2>
            <p class="user-detail__meta">
              <UiTag :variant="segmentVariant(profile.community_segment)">{{ segmentLabel(profile.community_segment) }}</UiTag>
              <span class="user-detail__date">Registrado {{ formatDate(profile.created_at) }}</span>
            </p>
          </div>
        </div>
      </UiCard>

      <!-- Stats grid -->
      <div class="user-detail__stats">
        <div class="user-detail__stat">
          <span class="eyebrow user-detail__stat-label">Plan</span>
          <span class="user-detail__stat-value">
            <UiTag :variant="subscription?.status === 'active' ? 'gold' : 'default'">
              {{ subscription?.status === 'active' ? 'Core' : 'Gratuito' }}
            </UiTag>
          </span>
        </div>
        <div class="user-detail__stat">
          <span class="eyebrow user-detail__stat-label">Racha actual</span>
          <span class="user-detail__stat-value">{{ streak?.current_streak ?? 0 }} días</span>
        </div>
        <div class="user-detail__stat">
          <span class="eyebrow user-detail__stat-label">Check-ins</span>
          <span class="user-detail__stat-value">{{ checkinCount }}</span>
        </div>
        <div class="user-detail__stat">
          <span class="eyebrow user-detail__stat-label">Racha máxima</span>
          <span class="user-detail__stat-value">{{ streak?.longest_streak ?? 0 }} días</span>
        </div>
      </div>

      <div class="user-detail__grid">
        <!-- Subscription details -->
        <div>
          <h3 class="user-detail__section-title">Suscripción</h3>
          <UiCard variant="outlined">
            <div class="user-detail__list" v-if="subscription">
              <div class="user-detail__row">
                <span class="user-detail__row-label">Estado</span>
                <UiTag :variant="subStatusVariant(subscription.status)">{{ subStatusLabel(subscription.status) }}</UiTag>
              </div>
              <div class="user-detail__row" v-if="subscription.current_period_end">
                <span class="user-detail__row-label">Periodo actual hasta</span>
                <span>{{ formatDate(subscription.current_period_end) }}</span>
              </div>
              <div class="user-detail__row" v-if="subscription.stripe_customer_id">
                <span class="user-detail__row-label">Stripe Customer</span>
                <span class="user-detail__mono">{{ subscription.stripe_customer_id }}</span>
              </div>
            </div>
            <p v-else class="user-detail__empty">Sin suscripción activa</p>
          </UiCard>
        </div>

        <!-- Entitlements -->
        <div>
          <h3 class="user-detail__section-title">Entitlements</h3>
          <UiCard variant="outlined">
            <div class="user-detail__tags" v-if="entitlements.length">
              <UiTag v-for="e in entitlements" :key="e.id" variant="info">{{ e.entitlement_key }}</UiTag>
            </div>
            <p v-else class="user-detail__empty">Sin entitlements</p>
          </UiCard>
        </div>
      </div>

      <!-- Programs -->
      <h3 class="user-detail__section-title">Programas inscritos</h3>
      <UiCard variant="outlined">
        <div v-if="enrollments.length">
          <div v-for="e in enrollments" :key="e.id" class="user-detail__row">
            <span>{{ e.program_title }}</span>
            <UiTag :variant="e.status === 'active' ? 'success' : 'default'">{{ e.status }}</UiTag>
          </div>
        </div>
        <p v-else class="user-detail__empty">Sin programas inscritos</p>
      </UiCard>

      <!-- Add-on purchases -->
      <h3 class="user-detail__section-title">Compras de add-ons</h3>
      <UiCard variant="outlined">
        <div v-if="addonPurchases.length">
          <div v-for="p in addonPurchases" :key="p.id" class="user-detail__row">
            <span>{{ p.addon_title }}</span>
            <span class="user-detail__mono">${{ (p.amount / 100).toLocaleString('es-MX') }} MXN</span>
          </div>
        </div>
        <p v-else class="user-detail__empty">Sin compras</p>
      </UiCard>

      <!-- Recent check-ins -->
      <h3 class="user-detail__section-title">Check-ins recientes</h3>
      <UiCard variant="outlined">
        <div v-if="recentCheckins.length">
          <div v-for="c in recentCheckins" :key="c.id" class="user-detail__row">
            <span>{{ formatDate(c.date) }}</span>
            <span>{{ moodLabel((c.payload as any)?.mood) }}</span>
          </div>
        </div>
        <p v-else class="user-detail__empty">Sin check-ins</p>
      </UiCard>

      <!-- Community activity -->
      <h3 class="user-detail__section-title">Actividad en comunidad</h3>
      <div class="user-detail__stats user-detail__stats--small">
        <div class="user-detail__stat">
          <span class="eyebrow user-detail__stat-label">Comentarios</span>
          <span class="user-detail__stat-value">{{ commentCount }}</span>
        </div>
        <div class="user-detail__stat">
          <span class="eyebrow user-detail__stat-label">Reacciones</span>
          <span class="user-detail__stat-value">{{ reactionCount }}</span>
        </div>
      </div>
    </div>

    <div v-else class="user-detail__loading">
      <p>Cargando usuario...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const client = useSupabaseClient()
const userId = route.params.id as string

// ── Profile ──
const { data: profile } = await useAsyncData(`user-${userId}`, async () => {
  const { data } = await client.from('profiles').select('*').eq('id', userId).single()
  return data
})

// ── Subscription ──
const { data: subscription } = await useAsyncData(`user-sub-${userId}`, async () => {
  const { data } = await client.from('subscriptions').select('*').eq('user_id', userId).maybeSingle()
  return data
})

// ── Entitlements ──
const { data: _entitlements } = await useAsyncData(`user-ent-${userId}`, async () => {
  const { data } = await client.from('user_entitlements').select('*').eq('user_id', userId)
  return data ?? []
})
const entitlements = computed(() => _entitlements.value ?? [])

// ── Streak ──
const { data: streak } = await useAsyncData(`user-streak-${userId}`, async () => {
  const { data } = await client.from('user_streaks').select('*').eq('user_id', userId).maybeSingle()
  return data
})

// ── Check-ins (count + recent) ──
const { data: _checkins } = await useAsyncData(`user-checkins-${userId}`, async () => {
  const { data } = await client.from('daily_checkins').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10)
  return data ?? []
})
const recentCheckins = computed(() => _checkins.value ?? [])

const { data: _checkinCount } = await useAsyncData(`user-checkin-count-${userId}`, async () => {
  const { count } = await client.from('daily_checkins').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  return count ?? 0
})
const checkinCount = computed(() => _checkinCount.value ?? 0)

// ── Program enrollments ──
const { data: _enrollments } = await useAsyncData(`user-enrollments-${userId}`, async () => {
  const { data } = await client.from('program_enrollments').select('*, programs:program_id(title)').eq('user_id', userId)
  return (data ?? []).map(e => ({
    ...e,
    program_title: (e.programs as any)?.title ?? 'Programa desconocido',
  }))
})
const enrollments = computed(() => _enrollments.value ?? [])

// ── Addon purchases ──
const { data: _addonPurchases } = await useAsyncData(`user-addons-${userId}`, async () => {
  const { data } = await client.from('addon_purchases').select('*, addons:addon_id(title)').eq('user_id', userId)
  return (data ?? []).map(p => ({
    ...p,
    addon_title: (p.addons as any)?.title ?? 'Add-on desconocido',
  }))
})
const addonPurchases = computed(() => _addonPurchases.value ?? [])

// ── Community activity counts ──
const { data: _commentCount } = await useAsyncData(`user-comments-${userId}`, async () => {
  const { count } = await client.from('post_comments').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  return count ?? 0
})
const commentCount = computed(() => _commentCount.value ?? 0)

const { data: _reactionCount } = await useAsyncData(`user-reactions-${userId}`, async () => {
  const { count } = await client.from('post_reactions').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  return count ?? 0
})
const reactionCount = computed(() => _reactionCount.value ?? 0)

// ── Helpers ──
function segmentLabel(s: string) {
  const map: Record<string, string> = { gabriel: 'Gabriel', carlotta: 'Carlotta', conjunta: 'Conjunta' }
  return map[s] ?? s
}

function segmentVariant(s: string) {
  const map: Record<string, string> = { gabriel: 'info', carlotta: 'accent', conjunta: 'primary' }
  return (map[s] ?? 'default') as any
}

function subStatusVariant(s: string) {
  const map: Record<string, string> = { active: 'success', trialing: 'info', past_due: 'warning', canceled: 'default', incomplete: 'default' }
  return (map[s] ?? 'default') as any
}

function subStatusLabel(s: string) {
  const map: Record<string, string> = { active: 'Activa', trialing: 'Prueba', past_due: 'Pago pendiente', canceled: 'Cancelada', incomplete: 'Incompleta' }
  return map[s] ?? s
}

function moodLabel(mood: string) {
  const map: Record<string, string> = { great: 'Increíble', good: 'Bien', ok: 'Regular', low: 'Bajo', tough: 'Difícil' }
  return map[mood] ?? mood ?? '—'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.user-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ─── Header ─── */
.user-detail__header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.user-detail__avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  flex-shrink: 0;
}

.user-detail__name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  line-height: 1.2;
}

.user-detail__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-1);
}

.user-detail__date {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

/* ─── Stats ─── */
.user-detail__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

.user-detail__stats--small {
  grid-template-columns: repeat(2, 1fr);
}

.user-detail__stat {
  background: rgba(var(--tint-rgb), 0.04);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.user-detail__stat-value {
  font-family: var(--font-title);
  font-size: var(--title-lg);
  color: var(--color-text);
  line-height: 1;
}

.user-detail__stat-label {
  max-width: 12ch;
  line-height: 1.3;
}

/* ─── Section title ─── */
.user-detail__section-title {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-top: var(--space-2);
}

/* ─── Grid ─── */
.user-detail__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

/* ─── List rows ─── */
.user-detail__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.user-detail__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-bottom: 1px solid rgba(var(--tint-rgb), 0.06);
  font-size: var(--text-sm);
}

.user-detail__row:last-child {
  border-bottom: none;
}

.user-detail__row-label {
  color: var(--color-muted);
  font-size: var(--text-xs);
}

.user-detail__mono {
  font-family: monospace;
  font-size: var(--text-xs);
  color: var(--color-muted);
}

/* ─── Tags ─── */
.user-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* ─── Empty state ─── */
.user-detail__empty {
  font-size: var(--text-sm);
  color: var(--color-muted);
  padding: var(--space-2) 0;
}

.user-detail__loading {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-muted);
}

@media (max-width: 768px) {
  .user-detail__stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .user-detail__grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .user-detail__stat {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
  }
}
</style>
