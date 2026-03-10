<template>
  <div class="screen">
    <div class="benefit">
      <!-- Media (icon on gradient) -->
      <div class="benefit__media" :style="{ background: benefit.bgGradient }">
        <div class="benefit__icon" :style="{ color: benefit.color }">
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

      <!-- Info -->
      <div class="benefit__info">
        <button class="benefit__back-link" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <p class="eyebrow" :style="{ color: benefit.color }">BENEFICIO EXCLUSIVO</p>
        <h1 class="title title--lg benefit__title">{{ benefit.title }}</h1>

        <p class="benefit__desc">{{ benefit.description }}</p>

        <div v-if="benefit.code" class="benefit__code">
          <p class="benefit__code-label">TU CÓDIGO</p>
          <p class="benefit__code-value" :style="{ color: benefit.color }">{{ benefit.code }}</p>
        </div>

        <div class="benefit__actions">
          <UiButton variant="outline" block @click="handleOpen">Abrir enlace</UiButton>
        </div>
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
  color: 'var(--color-mood-great)',
  bgColor: 'rgba(var(--color-mood-great-rgb), 0.15)',
  bgGradient: 'linear-gradient(135deg, rgba(var(--color-mood-great-rgb), 0.3), rgba(var(--color-mood-great-rgb), 0.08))',
})

function handleOpen() {
  window.open(benefit.value.url, '_blank')
}
</script>

<style scoped>
/* ─── Mobile layout ─── */
.benefit {
  display: flex;
  flex-direction: column;
}

/* ─── Media (icon hero) ─── */
.benefit__media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray);
}

.benefit__icon {
  color: var(--color-text-secondary);
}

/* ─── Nav (mobile back) ─── */
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
  color: var(--color-dark-lighter);
  background: rgba(var(--tint-rgb), 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .benefit__back:hover { background: rgba(var(--tint-rgb), 0.5); }
}

/* ─── Back link (desktop only) ─── */
.benefit__back-link {
  display: none;
}

/* ─── Info ─── */
.benefit__info {
  padding: var(--space-4);
  padding-bottom: 2rem;
  width: 100%;
  max-width: var(--max-content-width);
  margin: 0 auto;
}

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
  background: rgba(var(--tint-rgb), 0.04);
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

/* ─── Tablet ─── */
@media (min-width: 768px) {
  .benefit__info {
    max-width: var(--max-page-width);
    padding: var(--space-6);
  }
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .benefit {
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

  .benefit__media {
    order: 2;
    aspect-ratio: unset;
    min-height: 100%;
  }

  .benefit__icon :deep(svg) {
    width: 96px;
    height: 96px;
  }

  .benefit__nav { display: none; }

  .benefit__back-link {
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
    .benefit__back-link:hover { background: rgba(var(--tint-rgb), 0.06); }
  }

  .benefit__info {
    order: 1;
    max-width: none;
    margin: 0;
    padding: var(--space-10);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .benefit__title {
    font-size: var(--title-xl);
  }

  .benefit__desc {
    font-size: var(--text-lg);
  }

  .benefit__info > .eyebrow {
    font-size: var(--eyebrow-lg);
  }

  .benefit__code-value {
    font-size: var(--title-lg);
  }

  .benefit__actions :deep(.btn) {
    width: auto;
  }
}
</style>
