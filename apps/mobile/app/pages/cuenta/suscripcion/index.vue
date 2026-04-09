<template>
  <div class="pricing">
    <div class="screen__content">
      <header class="pricing__header">
        <button class="pricing__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="pricing__header-title">Suscripción</h1>
      </header>

      <div v-if="accessTimeline" class="pricing__status-card">
        <p class="pricing__status-label">{{ accessTimeline.label }}</p>
        <p class="pricing__status-date">{{ accessTimeline.date }}</p>
        <p class="pricing__status-copy">{{ accessTimeline.copy }}</p>
      </div>

      <template v-if="subStatus === 'pending' || !subscriptionReady">
        <div class="pricing__plans">
          <div v-for="i in 2" :key="i" style="flex: 1; padding: var(--space-6); border-radius: var(--radius-xl); border: 1px solid var(--color-border);">
            <UiSkeleton variant="text" width="40%" height="20px" style="margin-bottom: var(--space-3);" />
            <UiSkeleton variant="text" width="50%" height="28px" style="margin-bottom: var(--space-2);" />
            <UiSkeleton variant="text" width="90%" height="14px" style="margin-bottom: var(--space-2);" />
            <UiSkeleton variant="text" width="70%" height="14px" style="margin-bottom: var(--space-4);" />
            <UiSkeleton variant="rect" width="100%" height="44px" style="border-radius: var(--radius-lg); margin-bottom: var(--space-4);" />
            <div style="border-top: 1px solid var(--color-border-light); padding-top: var(--space-4);">
              <UiSkeleton v-for="j in 3" :key="j" variant="text" width="80%" height="12px" style="margin-bottom: var(--space-2);" />
            </div>
          </div>
        </div>
      </template>
      <!-- Error state -->
      <template v-else-if="subStatus === 'error'">
        <div class="sub__error">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="sub__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
          <h2 class="sub__error-title">No pudimos cargar los planes</h2>
          <p class="sub__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
          <UiButton variant="primary-outline" size="sm" @click="refreshSub()">Reintentar</UiButton>
        </div>
      </template>
      <template v-else>

      <!-- Plans -->
      <div class="pricing__plans">
        <div
          v-for="plan in plans"
          :key="plan.id"
          :class="['pricing__plan', { 'pricing__plan--core': plan.id === 'core' }]"
        >
          <div class="pricing__plan-header">
            <h3 class="pricing__plan-name">{{ plan.title }}</h3>
            <span v-if="plan.id === 'core'" class="pricing__tag-core">{{ plan.isCurrent ? 'CORE' : 'MÁS POPULAR' }}</span>
            <span v-else-if="plan.isCurrent" class="pricing__tag-current">TU PLAN</span>
          </div>

          <p class="pricing__plan-price">
            <template v-if="plan.price === 0">$0 <span>MXN/mes</span></template>
            <template v-else>${{ (plan.price / 100).toLocaleString('es-MX') }} <span>MXN/{{ plan.interval === 'year' ? 'año' : 'mes' }}</span></template>
          </p>

          <p class="pricing__plan-desc">{{ plan.description }}</p>

          <!-- CTA -->
          <template v-if="plan.isCurrent">
            <UiButton variant="outline" block disabled>Plan actual</UiButton>
          </template>
          <template v-else-if="plan.id === 'core'">
            <UiButton block class="pricing__cta-core" :loading="paywallLoading" @click="openPaywall">
              Suscribirme a Core
            </UiButton>
          </template>
          <template v-else>
            <UiButton v-if="effectiveIsSubscriber" variant="outline" block @click="openCustomerCenter">Gestionar suscripción</UiButton>
            <UiButton v-else variant="outline" block disabled>Plan base</UiButton>
          </template>

          <div class="pricing__divider" />

          <!-- Benefits from benefits table -->
          <ul v-if="plan.benefits.length" class="pricing__features">
            <li v-for="b in plan.benefits" :key="b.id">{{ b.title }}</li>
          </ul>
        </div>
      </div>

      </template>

      <p class="pricing__note">
        Pago seguro. Cancela en cualquier momento.
        <template v-if="isNative">
          <br /><button class="pricing__restore" @click="handleRestore">Restaurar compras</button>
        </template>
      </p>
      <div v-if="effectiveIsSubscriber" class="pricing__manage">
        <UiButton variant="outline" size="sm" @click="openCustomerCenter">Gestionar suscripción</UiButton>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const { user, isSubscriber, refreshProfile } = useAuth()
const { isNative } = useNativePlatform()
const { purchaseCurrentOffering, restorePurchases, presentCustomerCenter, getCustomerInfo, configured } = useRevenueCat()

const rcSubscriber = ref(false)
const subscriptionReady = ref(false)
const effectiveIsSubscriber = computed(() => isSubscriber.value || rcSubscriber.value)

interface SubscriptionAccessGrant {
  source: 'addon' | 'admin'
  source_ref: string
  ends_at: string
}

// Fetch both plans + benefits for each
const { data: plansData, status: subStatus, refresh: refreshSub } = useAsyncData('suscripcion-plans', async () => {
  const [plansRes, benefitsRes] = await Promise.all([
    client.from('subscription_plans').select('id, title, description, price, interval').order('price'),
    client.from('benefits').select('id, title, plan').eq('status', 'active').order('position'),
  ])

  const benefitsByPlan = new Map<string, { id: string; title: string }[]>()
  for (const b of benefitsRes.data ?? []) {
    const arr = benefitsByPlan.get(b.plan) ?? []
    arr.push({ id: b.id, title: b.title })
    benefitsByPlan.set(b.plan, arr)
  }

  return (plansRes.data ?? []).map(p => ({
    ...p,
    benefits: benefitsByPlan.get(p.id) ?? [],
  }))
}, { lazy: true })

const { data: accessData, refresh: refreshAccess } = useAsyncData('suscripcion-access', async () => {
  const uid = user.value?.id
  if (!uid) {
    return {
      subscription: null as { status: string; current_period_end: string | null } | null,
      coreGrant: null as SubscriptionAccessGrant | null,
    }
  }

  const nowIso = new Date().toISOString()
  const [subRes, grantRes] = await Promise.all([
    client
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', uid)
      .in('status', ['active', 'trialing'])
      .maybeSingle(),
    (client as any)
      .from('subscription_access_grants')
      .select('source, source_ref, ends_at')
      .eq('user_id', uid)
      .gt('ends_at', nowIso)
      .order('ends_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  return {
    subscription: subRes.data ?? null,
    coreGrant: grantRes?.data ?? null,
  }
}, {
  lazy: true,
  watch: [() => user.value?.id],
})

const plans = computed(() =>
  (plansData.value ?? []).map(p => ({
    ...p,
    isCurrent: p.id === 'core' ? effectiveIsSubscriber.value : !effectiveIsSubscriber.value,
  })),
)

const corePlanInterval = computed(() => (
  plansData.value?.find(plan => plan.id === 'core')?.interval ?? 'month'
))

const accessTimeline = computed(() => {
  const subscription = accessData.value?.subscription
  if (subscription?.current_period_end) {
    return {
      label: corePlanInterval.value === 'month' ? 'Próxima renovación' : 'Vigencia actual',
      date: formatAccessDate(subscription.current_period_end),
      copy: corePlanInterval.value === 'month'
        ? 'Tu membresía Core seguirá activa y se renovará automáticamente en esa fecha.'
        : 'Tu membresía Core sigue activa hasta esa fecha según tu periodo actual.',
    }
  }

  const grant = accessData.value?.coreGrant
  if (grant?.ends_at) {
    return {
      label: 'Acceso Core vigente hasta',
      date: formatAccessDate(grant.ends_at),
      copy: grant.source === 'addon'
        ? 'Este acceso fue otorgado por un complemento con meses incluidos de Core.'
        : 'Este acceso fue otorgado manualmente y expirará en esa fecha.',
    }
  }

  return null
})

const paywallLoading = ref(false)

async function refreshSubscriptionState() {
  const profilePromise = refreshProfile()
  const plansPromise = refreshSub()
  const accessPromise = refreshAccess()
  const rcActive = await readRevenueCatSubscriptionState()
  const profileOk = await profilePromise
  await plansPromise
  await accessPromise

  if (rcActive !== null) {
    rcSubscriber.value = rcActive
  }

  return profileOk || rcActive === true
}

async function readRevenueCatSubscriptionState() {
  if (isNative.value) return false

  // The page can mount before the RevenueCat plugin finishes configuring.
  // Retry briefly so the first render reflects the current customer state.
  for (let attempt = 0; attempt < 5; attempt++) {
    if (!configured.value) {
      await new Promise(resolve => setTimeout(resolve, 250))
      continue
    }

    const customerInfo = await getCustomerInfo().catch(() => null)
    if (!customerInfo) {
      await new Promise(resolve => setTimeout(resolve, 250))
      continue
    }

    return typeof customerInfo.entitlements.active.core !== 'undefined'
  }

  return null
}

async function waitForSubscriptionSync() {
  const maxAttempts = 10

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await refreshSubscriptionState()

    if (effectiveIsSubscriber.value) {
      return true
    }

    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  return false
}

async function openPaywall() {
  paywallLoading.value = true
  try {
    const result = await purchaseCurrentOffering()
    if (result === 'purchased' || result === 'restored') {
      await waitForSubscriptionSync()
      await refreshSubscriptionState()
    }
  } finally {
    paywallLoading.value = false
  }
}

async function openCustomerCenter() {
  await presentCustomerCenter()
}

async function handleRestore() {
  const info = await restorePurchases()
  if (info) await waitForSubscriptionSync()
}

function formatAccessDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

onMounted(() => {
  void (async () => {
    await refreshSubscriptionState()
    subscriptionReady.value = true
  })()
})

onActivated(() => {
  void refreshSubscriptionState()
})

if (import.meta.client) {
  const onVisChange = () => {
    if (document.visibilityState === 'visible') {
      void refreshSubscriptionState()
    }
  }
  onMounted(() => document.addEventListener('visibilitychange', onVisChange))
  onUnmounted(() => document.removeEventListener('visibilitychange', onVisChange))
}
</script>

<style scoped>
.pricing { }

/* ─── Header ─── */
.pricing__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
  padding-top: var(--space-4);
}

.pricing__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.pricing__back {
  position: absolute;
  left: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-dark-lighter);
  cursor: pointer;
  border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .pricing__back:hover { background: rgba(var(--tint-rgb), 0.04); }
}

/* Plans grid */
.pricing__plans {
  display: flex; flex-direction: column; gap: var(--space-4);
  margin-bottom: var(--space-6);
  max-width: 800px;
}

/* Base card */
.pricing__plan {
  background: var(--color-desktop-card);
  color: var(--color-text);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
}

/* Core featured card */
.pricing__plan--core {
  border: 2px solid var(--color-gold);
  background-color: #fbfaf8;
}

.pricing__plan-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pricing__plan-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  margin: 0 0 var(--space-1);
}

.pricing__plan-header .pricing__plan-name {
  margin-bottom: 0;
}

.pricing__plan-price {
  font-size: var(--title-lg);
  font-weight: 500;
  color: var(--color-dark-lighter);
  margin-top: var(--space-2);
}

.pricing__plan-price span {
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  color: var(--color-muted);
}

/* Short description */
.pricing__plan-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-2);
  margin-bottom: var(--space-4);
  line-height: var(--leading-relaxed);
}

/* Divider between CTA and features */
.pricing__divider {
  height: 1px;
  background: var(--color-border-light);
  margin: var(--space-4) 0;
}

/* Tags */
.pricing__tag-core {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
  white-space: nowrap;
  background: var(--color-gold-bg);
  color: var(--color-gold);
}

.pricing__tag-current {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
  white-space: nowrap;
  background: rgba(var(--color-mood-good-rgb), 0.15);
  color: var(--color-complete);
}

/* Core CTA override */
.pricing__cta-core {
  background: var(--color-gold) !important;
  color: #fff !important;
}

/* Feature list */
.pricing__features {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: var(--space-2);
}

.pricing__features li {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  padding-left: var(--space-5);
  position: relative;
}

.pricing__features li::before {
  content: '\2713';
  position: absolute;
  left: 0;
  color: var(--color-dark-lighter);
  font-weight: var(--weight-bold);
}

.pricing__plan--core .pricing__features li::before {
  color: var(--color-gold);
}

.pricing__restore {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: var(--text-xs);
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.pricing__status-card {
  max-width: 800px;
  margin: 0 auto var(--space-5);
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  background: rgba(var(--tint-rgb), 0.04);
}

.pricing__status-label {
  margin: 0 0 var(--space-1);
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.pricing__status-date {
  margin: 0;
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.pricing__status-copy {
  margin: var(--space-2) 0 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-muted);
}

.pricing__note {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-top: var(--space-6);
}

.pricing__manage {
  display: flex;
  justify-content: center;
  margin-top: var(--space-4);
}

@media (min-width: 768px) {
  .pricing__plans {
    flex-direction: row;
    align-items: flex-start;
    margin: 0 auto;
  }

  .pricing__plan { flex: 1; }
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .pricing__header {
    justify-content: flex-start;
  }

  .pricing__header-title { display: none; }
  .pricing__back { display: none; }
}

/* ─── Error state ─── */
.sub__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.sub__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.sub__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}


.sub__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
