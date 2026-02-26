<template>
  <div class="screen">
    <!-- Hero -->
    <div class="addon__hero">
      <img :src="addon.img" alt="" class="addon__hero-img" />
      <div class="addon__hero-overlay" />

      <div class="addon__nav safe-top">
        <button class="addon__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="screen__content">
      <p class="eyebrow">{{ addon.typeLabel }}</p>
      <h1 class="title title--lg addon__title">{{ addon.title }}</h1>

      <p class="addon__desc">{{ addon.description }}</p>

      <div class="addon__price">
        <span class="addon__price-value">{{ addon.priceLabel }}</span>
        <span class="addon__price-note">Pago único</span>
      </div>

      <div class="addon__actions">
        <UiButton v-if="!addon.owned" block>
          Comprar
        </UiButton>
        <div v-else class="addon__owned">
          <UiTag variant="success">Desbloqueado</UiTag>
          <p>Ya tienes acceso a este contenido.</p>
        </div>
      </div>

      <div class="addon__meta">
        <span v-if="addon.owned" class="addon__tag addon__tag--unlocked">Desbloqueado</span>
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
  img: '/images/lib-4.jpg',
  owned: false,
})
</script>

<style scoped>
.screen__content {
  padding-bottom: 2rem;
}

/* ─── Hero ─── */
.addon__hero {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.addon__hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.addon__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
}

/* ─── Nav ─── */
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
  color: var(--color-dark);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.addon__back:hover { background: rgba(255, 255, 255, 1); }

.addon__title {
  margin-top: var(--space-1);
  margin-bottom: var(--space-2);
}

/* ─── Description ─── */
.addon__desc {
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.6);
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
  color: white;
}

.addon__price-note {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.5);
}

/* ─── Actions ─── */
.addon__actions {
  margin-bottom: var(--space-5);
}

.addon__actions :deep(.btn) {
  background: #FFFFFF;
  color: var(--color-text);
  border-color: #FFFFFF;
}

/* ─── Owned state ─── */
.addon__owned {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: rgba(168, 216, 110, 0.1);
  border-radius: var(--radius-lg);
}

.addon__owned p {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.6);
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
  background: rgba(168, 216, 110, 0.15);
  color: #A8D86E;
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .addon__hero {
    border-radius: var(--radius-xl);
    overflow: hidden;
    margin: var(--space-4);
    width: calc(100% - var(--space-4) * 2);
  }
}
</style>
