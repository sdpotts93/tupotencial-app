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
    <!-- Error state -->
    <template v-else-if="addonStatus === 'error'">
      <div class="addon__error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="addon__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="addon__error-title">No pudimos cargar el complemento</h2>
        <p class="addon__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refreshAddon()">Reintentar</UiButton>
      </div>
    </template>
    <div v-else class="addon">
      <!-- Media -->
      <div ref="heroEl" class="addon__media">
        <img :src="addon.img" alt="" class="addon__img" />
        <div class="addon__overlay" />
        <div :class="['addon__nav safe-top', { 'addon__nav--scrolled': heroScrolled }]">
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

        <div v-if="coreBonusMonths > 0" class="addon__core-bonus">
          <p class="addon__core-bonus-label">Incluye Core</p>
          <p class="addon__core-bonus-title">{{ coreBonusLabel }}</p>
          <p class="addon__core-bonus-copy">Los meses incluidos se acumulan al final de tu acceso Core vigente.</p>
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
          <template v-else-if="!addon.purchaseReady">
            <div class="addon__web-note">
              <UiButton variant="outline" block disabled>
                Configuración pendiente
              </UiButton>
              <p>Este complemento todavía no tiene completa su configuración en RevenueCat.</p>
            </div>
          </template>
          <template v-else>
            <div class="addon__web-note">
              <UiButton variant="primary-outline" block :loading="purchasing" @click="handlePurchase">
                Comprar ahora
              </UiButton>
              <p>Tu acceso se activará en cuanto RevenueCat confirme la compra y el webhook sincronice tu entitlement.</p>
            </div>
          </template>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  hideBottomNav: true,
})

const route = useRoute()
const client = useSupabaseClient()
const toast = useToast()
const { user, refreshProfile, hasEntitlement } = useAuth()
const { isNative } = useNativePlatform()
const { purchaseAddon } = useRevenueCat()
const purchasing = ref(false)

const heroEl = ref<HTMLElement | null>(null)
const heroScrolled = useHeroScrolled(heroEl)

function formatPrice(cents: number) {
  return cents > 0 ? `$${(cents / 100).toLocaleString('es-MX')} MXN` : 'Gratis'
}

const { data: rawAddon, status: addonStatus, refresh: refreshAddon } = useAsyncData(`addon-${route.params.id}`, async () => {
  const { data } = await client
    .from('addons')
    .select('*, addon_entitlements(entitlement_key)')
    .eq('id', route.params.id as string)
    .single()
  return data
}, { lazy: true })

const entitlementKeys = computed(() => (
  (rawAddon.value?.addon_entitlements ?? []).map((row: { entitlement_key: string }) => row.entitlement_key)
))

const addon = computed(() => ({
  title: rawAddon.value?.title ?? '',
  description: rawAddon.value?.description ?? '',
  priceLabel: formatPrice(rawAddon.value?.price ?? 0),
  img: rawAddon.value?.cover_url ?? undefined,
  owned: entitlementKeys.value.some(key => hasEntitlement(key)),
  purchaseReady: !!rawAddon.value?.revenuecat_offering_id && entitlementKeys.value.length > 0,
}))

const coreBonusMonths = computed(() => rawAddon.value?.grants_core_months ?? 0)
const coreBonusLabel = computed(() => {
  const months = coreBonusMonths.value
  return months === 1 ? '1 mes de Core incluido' : `${months} meses de Core incluidos`
})

async function waitForAddonSync() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await refreshProfile()
    await refreshAddon()

    if (entitlementKeys.value.some(key => hasEntitlement(key))) {
      return true
    }

    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  return false
}

async function handlePurchase() {
  if (purchasing.value || !rawAddon.value?.revenuecat_offering_id) return

  purchasing.value = true
  try {
    const outcome = await purchaseAddon(
      rawAddon.value.revenuecat_offering_id,
      rawAddon.value.revenuecat_package_id,
      entitlementKeys.value[0] ?? null,
    )

    if (outcome === 'cancelled') {
      toast.show('Compra cancelada', 'info')
      return
    }

    if (outcome === 'error') {
      toast.show('No pudimos iniciar la compra', 'error')
      return
    }

    const synced = await waitForAddonSync()
    if (!synced) {
      toast.show('La compra se completó, pero la activación sigue pendiente', 'info')
      return
    }

    toast.show('Complemento desbloqueado', 'success')
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: var(--space-3) var(--space-4);
  transition: background var(--transition-fast), backdrop-filter var(--transition-fast);
}

.addon__nav--scrolled {
  background: rgba(var(--tint-inverse-rgb), 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
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

.addon__core-bonus {
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  border: 1px solid color-mix(in srgb, var(--color-gold) 28%, var(--color-border) 72%);
  background: color-mix(in srgb, var(--color-gold-bg) 68%, white 32%);
}

.addon__core-bonus-label {
  margin: 0 0 var(--space-2);
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-gold);
}

.addon__core-bonus-title {
  margin: 0;
  font-family: var(--font-title);
  font-size: var(--title-sm);
  color: var(--color-text);
}

.addon__core-bonus-copy {
  margin: var(--space-2) 0 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.addon__web-note {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.addon__web-note p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
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

/* ─── Error state ─── */
.addon__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.addon__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.addon__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.addon__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
