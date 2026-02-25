<template>
  <div class="screen">
    <UiTopNav show-back @back="navigateTo('/addons')" />
    <div class="screen__content">
      <div class="addon-detail__hero">
        <div class="addon-detail__hero-bg" />
      </div>

      <p class="eyebrow eyebrow--accent">{{ addon.typeLabel }}</p>
      <h1 class="title title--lg">{{ addon.title }}</h1>
      <p class="addon-detail__desc">{{ addon.description }}</p>

      <div class="addon-detail__price">
        <span class="addon-detail__price-value">{{ addon.priceLabel }}</span>
        <span class="addon-detail__price-note">Pago único</span>
      </div>

      <!-- Web: show purchase CTA; Native: show status -->
      <UiButton v-if="!addon.owned" block>
        Comprar (web)
      </UiButton>
      <div v-else class="addon-detail__owned">
        <UiTag variant="success">Desbloqueado</UiTag>
        <p>Ya tienes acceso a este contenido.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const addon = ref({
  title: 'Mentoría 1:1 con Gabriel',
  typeLabel: 'EXPERIENCIA',
  description: 'Cuatro sesiones individuales de coaching de 45 minutos cada una. Trabaja directamente con Gabriel en tus metas de crecimiento personal y liderazgo.',
  priceLabel: '$2,499 MXN',
  owned: false,
})
</script>

<style scoped>
.addon-detail__hero { margin: 0 calc(var(--space-4) * -1) var(--space-5); aspect-ratio: 16/9; }
.addon-detail__hero-bg { width: 100%; height: 100%; background: linear-gradient(135deg, var(--color-navy), var(--color-green)); }

.addon-detail__desc {
  font-size: var(--text-base); color: var(--color-text-secondary);
  line-height: var(--leading-relaxed); margin: var(--space-3) 0 var(--space-5);
}

.addon-detail__price {
  display: flex; align-items: baseline; gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.addon-detail__price-value {
  font-family: var(--font-title); font-size: var(--title-md); color: var(--color-primary);
}

.addon-detail__price-note { font-size: var(--text-sm); color: var(--color-muted); }

.addon-detail__owned {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-4); background: var(--color-success-light);
  border-radius: var(--radius-lg);
}

.addon-detail__owned p { font-size: var(--text-sm); color: var(--color-success); }
</style>
