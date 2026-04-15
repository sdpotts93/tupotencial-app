<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Detalle de usuario</h1>
      <div class="page-header__actions">
        <UiButton variant="soft" size="sm" to="/admin/usuarios">Volver</UiButton>
      </div>
    </div>

    <!-- Skeleton loader -->
    <div v-if="userStatus === 'pending'" class="user-detail">
      <!-- Profile card skeleton -->
      <UiCard variant="outlined">
        <div class="user-detail__header">
          <UiSkeleton variant="circle" width="56px" height="56px" />
          <div style="flex: 1; display: flex; flex-direction: column; gap: var(--space-2);">
            <UiSkeleton variant="text" width="40%" height="20px" />
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <UiSkeleton variant="rect" width="70px" height="22px" radius="var(--radius-full)" />
              <UiSkeleton variant="text" width="120px" height="12px" />
            </div>
          </div>
        </div>
      </UiCard>

      <!-- Stats grid skeleton -->
      <div class="user-detail__stats">
        <div v-for="i in 4" :key="i" class="user-detail__stat">
          <UiSkeleton variant="text" width="60%" height="10px" />
          <UiSkeleton variant="text" width="40%" height="24px" />
        </div>
      </div>

      <!-- Two side-by-side cards skeleton -->
      <div class="user-detail__grid">
        <div v-for="i in 2" :key="i">
          <UiSkeleton variant="text" width="100px" height="10px" style="margin-bottom: var(--space-2);" />
          <UiCard variant="outlined">
            <div v-for="j in 3" :key="j" style="display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid rgba(var(--tint-rgb), 0.06);">
              <UiSkeleton variant="text" width="40%" height="12px" />
              <UiSkeleton variant="text" width="30%" height="12px" />
            </div>
          </UiCard>
        </div>
      </div>

      <!-- 3 list sections skeleton -->
      <div v-for="i in 3" :key="'sec'+i">
        <UiSkeleton variant="text" width="140px" height="10px" style="margin-bottom: var(--space-2); margin-top: var(--space-2);" />
        <UiCard variant="outlined">
          <div v-for="j in 3" :key="j" style="display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid rgba(var(--tint-rgb), 0.06);">
            <UiSkeleton variant="text" width="50%" height="12px" />
            <UiSkeleton variant="text" width="20%" height="12px" />
          </div>
        </UiCard>
      </div>
    </div>

    <!-- Error state -->
    <template v-else-if="userStatus === 'error' && userError">
      <div class="user-detail__error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="user-detail__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="user-detail__error-title">No pudimos cargar el usuario</h2>
        <p class="user-detail__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refreshUser()">Reintentar</UiButton>
      </div>
    </template>

    <template v-else>
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
              <UiTag :variant="hasCoreAccess ? 'gold' : 'default'">
                {{ hasCoreAccess ? 'Core' : 'Gratuito' }}
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
            <span class="user-detail__stat-value">{{ streak?.best_streak ?? 0 }} días</span>
          </div>
        </div>

        <div class="user-detail__grid">
          <!-- Subscription details -->
          <div>
            <h3 class="user-detail__section-title">Suscripción</h3>
            <UiCard variant="outlined">
              <div v-if="subscription" class="user-detail__card-content">
                <div class="user-detail__list">
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
              </div>
              <div v-else-if="latestGrant" class="user-detail__card-content">
                <div class="user-detail__list">
                  <div class="user-detail__row">
                    <span class="user-detail__row-label">Estado</span>
                    <UiTag variant="success">Activa</UiTag>
                  </div>
                  <div class="user-detail__row">
                    <span class="user-detail__row-label">Origen</span>
                    <span>{{ grantSourceLabel(latestGrant.source) }}</span>
                  </div>
                  <div class="user-detail__row">
                    <span class="user-detail__row-label">Vigente hasta</span>
                    <span>{{ formatDate(latestGrant.ends_at) }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="user-detail__empty">Sin suscripción activa</p>
            </UiCard>
          </div>

          <!-- Entitlements -->
          <div>
            <h3 class="user-detail__section-title">Entitlements</h3>
            <UiCard variant="outlined">
              <div v-if="entitlements.length" class="user-detail__card-content">
                <div class="user-detail__tags">
                  <UiTag v-for="e in entitlements" :key="e.id" variant="info">{{ e.entitlement_key }}</UiTag>
                </div>
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
        <p>Usuario no encontrado</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const client = useSupabaseClient()
const userId = route.params.id as string

// ── Profile ──
const { data: profile, status: userStatus, error: userError, refresh: refreshUser } = useAsyncData(`user-${userId}`, async () => {
  const { data } = await client.from('profiles').select('*').eq('id', userId).maybeSingle()
  return data
}, { lazy: true })

// ── Subscription ──
const { data: subscription } = useAsyncData(`user-sub-${userId}`, async () => {
  const { data } = await client.from('subscriptions').select('*').eq('user_id', userId).maybeSingle()
  return data
}, { lazy: true })

// Core access can come from an active/trialing subscription OR a non-expired
// subscription_access_grant (e.g. add-on purchases that grant core months).
const { data: activeGrants } = useAsyncData(`user-grants-${userId}`, async () => {
  const { data } = await client
    .from('subscription_access_grants')
    .select('id, source, ends_at')
    .eq('user_id', userId)
    .gt('ends_at', new Date().toISOString())
  return data ?? []
}, { lazy: true })

const hasCoreAccess = computed(() => {
  const status = subscription.value?.status
  if (status === 'active' || status === 'trialing') return true
  return (activeGrants.value?.length ?? 0) > 0
})

const latestGrant = computed(() => {
  const grants = activeGrants.value ?? []
  if (!grants.length) return null
  return [...grants].sort((a: any, b: any) => new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime())[0]
})

// ── Entitlements ──
const { data: _entitlements } = useAsyncData(`user-ent-${userId}`, async () => {
  const { data } = await client.from('user_entitlements').select('*').eq('user_id', userId)
  return data ?? []
}, { lazy: true })
const entitlements = computed(() => _entitlements.value ?? [])

// ── Streak ──
const { data: streak } = useAsyncData(`user-streak-${userId}`, async () => {
  const { data } = await client.from('user_streaks').select('*').eq('user_id', userId).maybeSingle()
  return data
}, { lazy: true })

// ── Check-ins (count + recent) ──
const { data: _checkins } = useAsyncData(`user-checkins-${userId}`, async () => {
  const { data } = await client.from('daily_checkins').select('*').eq('user_id', userId).eq('type', 'checkin').order('date', { ascending: false }).limit(10)
  return data ?? []
}, { lazy: true })
const recentCheckins = computed(() => _checkins.value ?? [])

const { data: _checkinCount } = useAsyncData(`user-checkin-count-${userId}`, async () => {
  const { count } = await client.from('daily_checkins').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('type', 'checkin')
  return count ?? 0
}, { lazy: true })
const checkinCount = computed(() => _checkinCount.value ?? 0)

// ── Program enrollments ──
const { data: _enrollments } = useAsyncData(`user-enrollments-${userId}`, async () => {
  const { data } = await client.from('program_enrollments').select('*, programs:program_id(title)').eq('user_id', userId)
  return (data ?? []).map(e => ({
    ...e,
    program_title: (e.programs as any)?.title ?? 'Programa desconocido',
  }))
}, { lazy: true })
const enrollments = computed(() => _enrollments.value ?? [])

// ── Addon purchases ──
const { data: _addonPurchases } = useAsyncData(`user-addons-${userId}`, async () => {
  const { data } = await client.from('addon_purchases').select('*, addons:addon_id(title)').eq('user_id', userId)
  return (data ?? []).map(p => ({
    ...p,
    addon_title: (p.addons as any)?.title ?? 'Add-on desconocido',
  }))
}, { lazy: true })
const addonPurchases = computed(() => _addonPurchases.value ?? [])

// ── Community activity counts ──
const { data: _commentCount } = useAsyncData(`user-comments-${userId}`, async () => {
  const { count } = await client.from('post_comments').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  return count ?? 0
}, { lazy: true })
const commentCount = computed(() => _commentCount.value ?? 0)

const { data: _reactionCount } = useAsyncData(`user-reactions-${userId}`, async () => {
  const { count } = await client.from('post_reactions').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  return count ?? 0
}, { lazy: true })
const reactionCount = computed(() => _reactionCount.value ?? 0)

// ── Helpers ──
function segmentLabel(s: string | null) {
  if (!s) return 'Sin segmento'
  const map: Record<string, string> = { gabriel: 'Gabriel', carlotta: 'Carlotta', conjunta: 'Conjunta' }
  return map[s] ?? s
}

function segmentVariant(s: string | null) {
  if (!s) return 'default' as any
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

function grantSourceLabel(s: string) {
  const map: Record<string, string> = { addon: 'Compra de add-on', admin: 'Otorgada por admin' }
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

.user-detail__grid > div {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ─── List rows ─── */
.user-detail__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.user-detail__card-content {
  min-height: 100%;
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
  padding: var(--space-2) 0;
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

/* ─── Error state ─── */
.user-detail__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 40dvh;
  gap: var(--space-3);
}

.user-detail__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.user-detail__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.user-detail__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
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
