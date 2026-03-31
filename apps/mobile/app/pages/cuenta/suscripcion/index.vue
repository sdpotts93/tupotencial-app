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

      <!-- Plans -->
      <div class="pricing__plans">
        <div
          v-for="plan in plans"
          :key="plan.id"
          :class="['pricing__plan', { 'pricing__plan--core': plan.id === 'core' }]"
        >
          <div class="pricing__plan-header">
            <h3 class="pricing__plan-name">{{ plan.title }}</h3>
            <span v-if="plan.isCurrent" class="pricing__tag-current">TU PLAN</span>
            <span v-else-if="plan.id === 'core'" class="pricing__tag-core">MÁS POPULAR</span>
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
            <UiButton v-if="!isNative" block class="pricing__cta-core" :loading="checkoutLoading" @click="startCheckout">
              Suscribirme a Core
            </UiButton>
            <p v-else class="pricing__native-note">Suscríbete desde tupotencial.com para acceder al plan Core.</p>
          </template>
          <template v-else>
            <UiButton variant="outline" block disabled>Plan base</UiButton>
          </template>

          <div class="pricing__divider" />

          <!-- Benefits from benefits table -->
          <ul v-if="plan.benefits.length" class="pricing__features">
            <li v-for="b in plan.benefits" :key="b.id">{{ b.title }}</li>
          </ul>
        </div>
      </div>

      <p v-if="!isNative" class="pricing__note">
        Pago seguro con Stripe. Cancela en cualquier momento.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const { isSubscriber } = useAuth()
const { isNative } = useNativePlatform()
const config = useRuntimeConfig()

// Fetch both plans + benefits for each
const { data: plansData } = await useAsyncData('suscripcion-plans', async () => {
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
})

const plans = computed(() =>
  (plansData.value ?? []).map(p => ({
    ...p,
    isCurrent: p.id === 'core' ? isSubscriber.value : !isSubscriber.value,
  })),
)

// ── Checkout flow ──
const checkoutLoading = ref(false)

async function startCheckout() {
  const { data: { session } } = await client.auth.getSession()
  if (!session) {
    navigateTo('/iniciar-sesion?redirect=/cuenta/suscripcion')
    return
  }

  const workerUrl = config.public.stripeWorkerUrl
  if (!workerUrl) return

  checkoutLoading.value = true
  try {
    const res = await fetch(`${workerUrl}/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        returnUrl: window.location.origin + '/cuenta/facturacion/retorno',
      }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  } catch (err) {
    console.error('Checkout error:', err)
  } finally {
    checkoutLoading.value = false
  }
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

.pricing__native-note {
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-align: center;
  line-height: var(--leading-relaxed);
}

.pricing__note {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-top: var(--space-6);
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
</style>
