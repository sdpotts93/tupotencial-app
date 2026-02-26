<template>
  <div class="pricing">
    <UiTopNav title="Membresía" show-back />
    <div class="screen__content">
      <div class="pricing__hero">
        <img src="/logo-icon/logo-icon-green.png" alt="" class="pricing__logo" />
        <h1 class="title title--xl">Redefine tu balance</h1>
        <p class="pricing__subtitle">Elige el plan que mejor se adapte a tu momento de transformación.</p>
      </div>

      <!-- Plans -->
      <div class="pricing__plans">
        <!-- Free -->
        <div class="pricing__plan">
          <p class="eyebrow">EXPLORA Y CONECTA</p>
          <h3 class="pricing__plan-name">Gratis</h3>
          <p class="pricing__plan-price">$0 <span>MXN/mes</span></p>
          <ul class="pricing__features">
            <li>Canal diario con reflexiones y micro-acciones</li>
            <li>Guías y retos introductorios de 7-15-30 días</li>
            <li>Biblioteca limitada (rutinas y meditaciones básicas)</li>
            <li>Coach IA — orientación introductoria</li>
          </ul>
          <UiButton variant="outline" block to="/auth/register">
            Crear cuenta gratis
          </UiButton>
        </div>

        <!-- Core -->
        <div class="pricing__plan pricing__plan--featured">
          <UiTag variant="primary">MÁS POPULAR</UiTag>
          <p class="eyebrow" style="margin-top: var(--space-3);">TRANSFORMA Y CRECE</p>
          <h3 class="pricing__plan-name">Core</h3>
          <p class="pricing__plan-price">$399 <span>MXN/mes</span></p>
          <p class="pricing__plan-annual">o $3,499/año (ahorra 27%)</p>
          <ul class="pricing__features">
            <li>Todo lo del plan gratuito +</li>
            <li>Biblioteca completa de rutinas, meditaciones y contenido</li>
            <li>Comunidad privada + lives semanales con Gabriel y Carlotta</li>
            <li>Programas guiados de 30 días con check-ins</li>
            <li>Coach IA — recomendaciones por estado de energía y ánimo</li>
            <li>Gamificación: rachas, logros y avances visibles</li>
          </ul>
          <UiButton block>
            Empezar Core
          </UiButton>
        </div>
      </div>

      <p class="pricing__note">
        Pago seguro con Stripe. Cancela en cualquier momento. Los add-ons y experiencias se adquieren por separado.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })
</script>

<style scoped>
.pricing { min-height: 100dvh; background: var(--color-light); }

.pricing__hero {
  text-align: center;
  padding: var(--space-6) 0 var(--space-8);
}

.pricing__logo { height: 48px; width: auto; margin: 0 auto var(--space-4); }

.pricing__subtitle {
  font-size: var(--text-sm); color: var(--color-muted); margin-top: var(--space-2);
}

.pricing__plans {
  display: flex; flex-direction: column; gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.pricing__plan {
  background: rgba(0, 0, 0, 0.04); color: var(--color-text); border-radius: var(--radius-xl);
  padding: var(--space-6); border: 1px solid rgba(0, 0, 0, 0.075);
}

.pricing__plan--featured {
  border: 2px solid var(--color-accent);
}

.pricing__plan-name {
  font-family: var(--font-title); font-size: var(--title-md); margin: var(--space-2) 0;
}

.pricing__plan-price {
  font-size: var(--title-lg); font-weight: var(--weight-bold); color: var(--color-accent);
}

.pricing__plan-price span {
  font-size: var(--text-sm); font-weight: var(--weight-regular); color: var(--color-muted);
}

.pricing__plan-annual {
  font-size: var(--text-sm); color: var(--color-accent); margin-top: var(--space-1);
}

.pricing__features {
  list-style: none; padding: 0; margin: var(--space-4) 0 var(--space-5);
  display: flex; flex-direction: column; gap: var(--space-2);
}

.pricing__features li {
  font-size: var(--text-sm); color: var(--color-text-secondary);
  padding-left: var(--space-5); position: relative;
}

.pricing__features li::before {
  content: '✓'; position: absolute; left: 0;
  color: var(--color-accent); font-weight: var(--weight-bold);
}

.pricing__note {
  text-align: center; font-size: var(--text-xs); color: var(--color-muted);
  line-height: var(--leading-relaxed);
}

@media (min-width: 768px) {
  .pricing__plans {
    flex-direction: row;
    align-items: flex-start;
  }

  .pricing__plan { flex: 1; }
}
</style>
