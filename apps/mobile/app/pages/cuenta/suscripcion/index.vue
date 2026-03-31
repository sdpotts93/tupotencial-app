<template>
  <div class="screen">
    <div class="screen__content">
      <header class="sub__header">
        <button class="sub__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="sub__header-title">Suscripción</h1>
      </header>

      <!-- Plans -->
      <div class="sub__plans">
        <div
          v-for="plan in plans"
          :key="plan.id"
          :class="['sub__plan', { 'sub__plan--current': plan.isCurrent, 'sub__plan--core': plan.id === 'core' }]"
        >
          <div class="sub__plan-top">
            <div class="sub__plan-name-row">
              <h3 class="sub__plan-name">{{ plan.title }}</h3>
              <UiTag v-if="plan.isCurrent" variant="success" size="sm">Tu plan</UiTag>
            </div>
            <p class="sub__plan-price">
              <template v-if="plan.price === 0">Gratis</template>
              <template v-else>
                ${{ (plan.price / 100).toLocaleString('es-MX') }}
                <span class="sub__plan-interval">MXN/{{ plan.interval === 'year' ? 'año' : 'mes' }}</span>
              </template>
            </p>
            <p class="sub__plan-desc">{{ plan.description }}</p>
          </div>

          <!-- Benefits for this plan -->
          <ul v-if="plan.benefits.length" class="sub__benefits">
            <li v-for="b in plan.benefits" :key="b.id">{{ b.title }}</li>
          </ul>

          <div class="sub__plan-action">
            <template v-if="plan.isCurrent">
              <p class="sub__plan-status">Activo</p>
            </template>
            <template v-else-if="plan.id === 'core'">
              <UiButton v-if="!isNative" block :loading="checkoutLoading" @click="startCheckout">
                Suscribirme a Core
              </UiButton>
              <p v-else class="sub__native-note">Suscríbete desde tupotencial.com para acceder al plan Core.</p>
            </template>
            <template v-else>
              <p class="sub__plan-status sub__plan-status--muted">Plan base</p>
            </template>
          </div>
        </div>
      </div>

      <p v-if="!isNative" class="sub__footer">
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
/* ─── Header ─── */
.sub__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.sub__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.sub__back {
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
  .sub__back:hover { background: rgba(var(--tint-rgb), 0.04); }
}

/* ─── Plans ─── */
.sub__plans {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sub__plan {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sub__plan--current {
  border-color: var(--color-gold);
  background: rgba(156, 135, 66, 0.04);
}

.sub__plan-top {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sub__plan-name-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.sub__plan-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
}

.sub__plan-price {
  font-size: var(--title-lg);
  font-weight: var(--weight-bold);
  color: var(--color-dark-lighter);
  margin-top: var(--space-1);
}

.sub__plan-interval {
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  color: var(--color-muted);
}

.sub__plan-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-top: var(--space-1);
}

/* ─── Benefits ─── */
.sub__benefits {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.sub__benefits li {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  padding-left: var(--space-5);
  position: relative;
  line-height: var(--leading-relaxed);
}

.sub__benefits li::before {
  content: '\2713';
  position: absolute;
  left: 0;
  font-weight: var(--weight-bold);
}

.sub__plan--core .sub__benefits li::before {
  color: var(--color-gold);
}

/* ─── Actions ─── */
.sub__plan-action {
  margin-top: auto;
}

.sub__plan-status {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-complete);
  text-align: center;
}

.sub__plan-status--muted {
  color: var(--color-muted);
}

.sub__native-note {
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-align: center;
  line-height: var(--leading-relaxed);
}

.sub__footer {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-top: var(--space-6);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .sub__header {
    justify-content: flex-start;
  }

  .sub__header-title { display: none; }
  .sub__back { display: none; }

  .sub__plans {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
    max-width: 800px;
  }

  .sub__plan {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
  }

  .sub__plan--current {
    border-color: var(--color-gold);
  }
}
</style>
