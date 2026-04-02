<template>
  <div class="screen">
    <template v-if="addonStatus === 'pending'">
      <div class="addon">
        <div class="addon__media" style="background: rgba(var(--tint-rgb), 0.06);">
          <UiSkeleton variant="rect" width="100%" height="100%" />
          <div class="addon__nav safe-top">
            <button class="addon__back" aria-label="Volver" @click="$router.back()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="addon__info">
          <UiSkeleton variant="text" width="65%" height="24px" style="margin-bottom: var(--space-3);" />
          <UiSkeleton variant="text" width="100%" height="14px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="80%" height="14px" style="margin-bottom: var(--space-5);" />
          <UiSkeleton variant="text" width="40%" height="22px" style="margin-bottom: var(--space-5);" />
          <UiSkeleton variant="rect" width="100%" height="44px" style="border-radius: var(--radius-lg);" />
        </div>
      </div>
    </template>
    <div v-else class="addon">
      <!-- Media -->
      <div class="addon__media">
        <img :src="addon.img" alt="" class="addon__img" />
        <div class="addon__overlay" />
        <div class="addon__nav safe-top">
          <button class="addon__back" aria-label="Volver" @click="$router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="addon__info">
        <button class="addon__back-link" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <h1 class="title title--lg addon__title">{{ addon.title }}</h1>

        <p class="addon__desc">{{ addon.description }}</p>

        <div class="addon__price">
          <span class="addon__price-value">{{ addon.priceLabel }}</span>
          <span class="addon__price-note">Pago único</span>
        </div>

        <div class="addon__actions">
          <template v-if="addon.owned">
            <div class="addon__owned">
              <UiTag variant="success">Desbloqueado</UiTag>
              <p>Ya tienes acceso a este contenido.</p>
            </div>
          </template>
          <template v-else-if="isNative">
            <p class="addon__native-note">Las compras se realizan desde la versión web en tupotencial.com</p>
          </template>
          <template v-else>
            <UiButton variant="outline" block :loading="purchasing" @click="handlePurchase">
              Comprar
            </UiButton>
          </template>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const client = useSupabaseClient()
const { user } = useAuth()
const { isNative } = useNativePlatform()

function formatPrice(cents: number) {
  return cents > 0 ? `$${(cents / 100).toLocaleString('es-MX')} MXN` : 'Gratis'
}

const { data: rawAddon, status: addonStatus } = useAsyncData(`addon-${route.params.id}`, async () => {
  const { data } = await client.from('addons').select('*').eq('id', route.params.id).single()
  return data
}, { lazy: true })

const { data: isOwned } = useAsyncData(`addon-owned-${route.params.id}`, async () => {
  if (!user.value?.id) return null
  const { data } = await client.from('addon_purchases').select('id').eq('addon_id', route.params.id as string).eq('user_id', user.value.id).maybeSingle()
  return !!data
}, { lazy: true, watch: [() => user.value?.id] })

const addon = computed(() => ({
  title: rawAddon.value?.title ?? '',
  description: rawAddon.value?.description ?? '',
  priceLabel: formatPrice(rawAddon.value?.price ?? 0),
  img: rawAddon.value?.cover_url ?? null,
  owned: isOwned.value ?? false,
  stripePriceId: rawAddon.value?.stripe_price_id ?? null,
}))

// ── Purchase flow ──
const config = useRuntimeConfig()
const purchasing = ref(false)

async function handlePurchase() {
  const { data: { session } } = await client.auth.getSession()
  if (!session) {
    navigateTo('/iniciar-sesion?redirect=' + route.fullPath)
    return
  }

  const workerUrl = config.public.stripeWorkerUrl
  if (!workerUrl) {
    console.error('STRIPE_WORKER_URL not configured')
    return
  }

  if (!addon.value.stripePriceId) {
    console.error('Addon has no Stripe Price ID configured')
    return
  }

  purchasing.value = true
  try {
    const res = await fetch(`${workerUrl}/create-addon-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        addonId: route.params.id,
        stripePriceId: addon.value.stripePriceId,
        returnUrl: window.location.origin + '/cuenta/complementos',
      }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      console.error('Addon checkout error:', data.error)
    }
  } catch (err) {
    console.error('Addon checkout error:', err)
  } finally {
    purchasing.value = false
  }
}
</script>

<style scoped>
/* ─── Mobile layout ─── */
.addon {
  display: flex;
  flex-direction: column;
}

/* ─── Media ─── */
.addon__media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.addon__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.addon__overlay {
  position: absolute;
  inset: 0;
}

/* ─── Nav (mobile back) ─── */
.addon__nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: var(--space-3) var(--space-4);
}

.addon__back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dark-lighter);
  background: rgba(var(--tint-inverse-rgb), 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .addon__back:hover { background: rgba(var(--tint-inverse-rgb), 1); }
}

/* ─── Back link (desktop only) ─── */
.addon__back-link {
  display: none;
}

/* ─── Info ─── */
.addon__info {
  padding: var(--space-4);
  padding-bottom: 2rem;
  width: 100%;
  max-width: var(--max-content-width);
  margin: 0 auto;
}

.addon__title {
  margin-top: var(--space-1);
  margin-bottom: var(--space-2);
}

/* ─── Description ─── */
.addon__desc {
  font-size: var(--text-base);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-5);
}

/* ─── Price ─── */
.addon__price {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.addon__price-value {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
}

.addon__price-note {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

/* ─── Actions ─── */
.addon__actions {
  margin-bottom: var(--space-5);
}

/* ─── Owned state ─── */
.addon__owned {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: rgba(var(--color-mood-good-rgb), 0.1);
  border-radius: var(--radius-lg);
}

.addon__owned p {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

/* ─── Meta ─── */
.addon__meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-8);
}

.addon__tag {
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
}

.addon__tag--unlocked {
  background: var(--color-complete-bg);
  color: var(--color-complete);
}

/* ─── Tablet ─── */
@media (min-width: 768px) {
  .addon__info {
    max-width: var(--max-page-width);
    padding: var(--space-6);
  }
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .addon {
    display: grid;
    grid-template-columns: 55fr 45fr;
    background: var(--color-desktop-card);
    border-radius: var(--radius-2xl);
    overflow: hidden;
    border: 1px solid var(--color-desktop-border);
    margin: var(--space-6);
    min-height: 480px;
    max-width: 1100px;
  }

  .addon__media {
    order: 2;
    aspect-ratio: unset;
  }

  .addon__nav { display: none; }

  .addon__back-link {
    display: flex;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    color: var(--color-dark-lighter);
    background: none;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    padding: 0;
    margin-bottom: var(--space-6);
  }
  @media (hover: hover) {
    .addon__back-link:hover { background: rgba(var(--tint-rgb), 0.06); }
  }

  .addon__info {
    order: 1;
    max-width: none;
    margin: 0;
    padding: var(--space-10);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .addon__title {
    font-size: var(--title-xl);
  }

  .addon__desc {
    font-size: var(--text-lg);
  }

  .addon__price-value {
    font-size: var(--title-lg);
  }

  .addon__actions :deep(.btn) {
    width: auto;
  }
}
</style>
