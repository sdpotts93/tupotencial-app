<template>
  <div class="screen">
    <!-- Hero -->
    <div class="benefit__hero" :style="{ background: benefit.bgGradient }">
      <div class="benefit__hero-icon">
        <Icon :name="benefit.icon" size="64" />
      </div>

      <div class="benefit__nav safe-top">
        <button class="benefit__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="screen__content">
      <p class="eyebrow" :style="{ color: benefit.color }">BENEFICIO EXCLUSIVO</p>
      <h1 class="title title--lg benefit__title">{{ benefit.title }}</h1>

      <p class="benefit__desc">{{ benefit.description }}</p>

      <div v-if="benefit.code" class="benefit__code">
        <p class="benefit__code-label">TU CÓDIGO</p>
        <p class="benefit__code-value" :style="{ color: benefit.color }">{{ benefit.code }}</p>
      </div>

      <div class="benefit__actions">
        <UiButton block @click="handleOpen">Abrir enlace</UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const benefit = ref({
  title: 'Descuento en retiros',
  description: 'Obtén un 15% de descuento en todos los retiros presenciales de Tu Potencial. Este beneficio es exclusivo para miembros activos con suscripción Core.',
  code: 'TPRETIRO15',
  url: 'https://example.com/retiros',
  icon: 'lucide:mountain',
  color: '#4ECDC4',
  bgColor: 'rgba(78, 205, 196, 0.15)',
  bgGradient: 'linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(78, 205, 196, 0.08))',
})

function handleOpen() {
  window.open(benefit.value.url, '_blank')
}
</script>

<style scoped>
.screen__content {
  padding-bottom: 2rem;
}

/* ─── Hero ─── */
.benefit__hero {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.benefit__hero-icon {
  color: var(--color-text-secondary);
}

/* ─── Nav ─── */
.benefit__nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: var(--space-3) var(--space-4);
}

.benefit__back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.benefit__back:hover { background: rgba(0, 0, 0, 0.5); }

.benefit__title {
  margin-top: var(--space-1);
  margin-bottom: var(--space-2);
}

/* ─── Description ─── */
.benefit__desc {
  font-size: var(--text-base);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-5);
}

/* ─── Code ─── */
.benefit__code {
  background: rgba(0, 0, 0, 0.04);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  text-align: center;
}

.benefit__code-label {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.benefit__code-value {
  font-family: var(--font-eyebrow);
  font-size: var(--title-md);
  font-weight: var(--weight-bold);
  letter-spacing: 0.1em;
}

/* ─── Actions ─── */
.benefit__actions {
  margin-bottom: var(--space-5);
}

.benefit__actions :deep(.btn) {
  background: #FFFFFF;
  color: var(--color-dark);
  border-color: var(--color-border);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .benefit__hero {
    border-radius: var(--radius-xl);
    overflow: hidden;
    margin: var(--space-4);
    width: calc(100% - var(--space-4) * 2);
  }
}
</style>
