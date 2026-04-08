<template>
  <div class="pricing">
    <div class="screen__content">
      <div class="pricing__hero">
        <img src="/logo-icon/logo-icon-green.png" alt="" class="pricing__logo" />
        <h1 class="title title--lg">Conoce nuestros planes</h1>
        <p class="pricing__subtitle">Elige el plan que mejor se adapte a tu momento de transformación.</p>
      </div>

      <!-- Plans -->
      <div class="pricing__plans">
        <!-- Free -->
        <div class="pricing__plan">
          <h3 class="pricing__plan-name">Gratis</h3>
          <p class="pricing__plan-price">$0 <span>MXN/mes</span></p>
          <p class="pricing__plan-desc">Reflexiones diarias y contenido básico para comenzar tu camino.</p>
          <UiButton variant="outline" block to="/registro">
            Crear cuenta gratis
          </UiButton>
          <div class="pricing__divider" />
          <ul class="pricing__features">
            <li>Canal diario con reflexiones y micro-acciones</li>
            <li>Guías y retos limitados</li>
            <li>Biblioteca limitada (rutinas y meditaciones básicas)</li>
          </ul>
        </div>
      
        <!-- Core -->
        <div class="pricing__plan pricing__plan--core">
          <div class="pricing__plan-header">
            <h3 class="pricing__plan-name">Core</h3>
            <span class="pricing__tag-core">MÁS POPULAR</span>
          </div>
          <p class="pricing__plan-price">$399 <span>MXN/mes</span></p>
          <p class="pricing__plan-desc">Acceso completo a programas, comunidad y herramientas de cambio.</p>
          <UiButton v-if="!isNative" block class="pricing__cta-core" :disabled="checkoutLoading" @click="startCheckout">
            {{ checkoutLoading ? 'Redirigiendo...' : 'Empezar Core' }}
          </UiButton>
          <p v-else class="pricing__native-note">Suscríbete desde tupotencial.com para acceder al plan Core.</p>
          <div class="pricing__divider" />
          <ul class="pricing__features">
            <li>Todo lo del plan gratuito</li>
            <li>Biblioteca completa de rutinas, meditaciones y contenido</li>
            <li>Comunidad privada + lives semanales con Gabriel y Carlotta</li>
            <li>Programas guiados de 30 días con check-ins</li>
            <li>Coach IA — recomendaciones por estado de energía y ánimo</li>
            <li>Rachas, logros y avances visibles</li>
          </ul>
        </div>
      </div>

      <p v-if="!isNative" class="pricing__note">
        Pago seguro con Stripe. Cancela en cualquier momento. Los add-ons y experiencias se adquieren por separado.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const { isNative } = useNativePlatform()
const checkoutLoading = ref(false)

async function startCheckout() {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    navigateTo('/iniciar-sesion?redirect=/precios')
    return
  }

  const workerUrl = config.public.stripeWorkerUrl
  if (!workerUrl) {
    console.error('STRIPE_WORKER_URL not configured')
    return
  }

  checkoutLoading.value = true
  try {
    const res = await fetch(`${workerUrl}/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        returnUrl: window.location.origin + '/cuenta/mis-datos',
      }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      console.error('Checkout error:', data.error)
    }
  } catch (err) {
    console.error('Checkout error:', err)
  } finally {
    checkoutLoading.value = false
  }
}
</script>

<style scoped>
.pricing { min-height: 100dvh; background: var(--color-white); }

.pricing__hero {
  text-align: center;
  padding: var(--space-6) 0 var(--space-8);
}

.pricing__logo { height: 48px; width: auto; margin: 0 auto var(--space-4); }

.pricing__subtitle {
  font-size: var(--text-sm); color: var(--color-muted); margin-top: var(--space-2);
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
  background-color: #9c87420a;
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

/* Core tag */
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
</style>
