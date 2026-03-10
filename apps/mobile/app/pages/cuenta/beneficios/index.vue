<template>
  <div class="screen">
    <div class="screen__content">
      <header class="benefits__header">
        <button class="benefits__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="benefits__header-title">Beneficios</h1>
      </header>

      <p class="benefits__intro">Disfruta descuentos y ofertas exclusivas para miembros de Tu Potencial.</p>

      <div class="benefits__list">
        <NuxtLink
          v-for="benefit in benefits"
          :key="benefit.id"
          :to="`/cuenta/beneficios/${benefit.id}`"
          class="benefits__card"
          :style="{ '--benefit-accent': benefit.color, '--benefit-bg': benefit.bgColor }"
        >
          <div class="benefits__icon-wrap">
            <Icon :name="benefit.emoji" size="28" />
          </div>
          <div class="benefits__body">
            <h3 class="benefits__name">{{ benefit.title }}</h3>
            <p class="benefits__desc">{{ benefit.description }}</p>
          </div>
          <svg class="benefits__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const benefits = ref([
  { id: 'mock-ben-001', title: 'Descuento en retiros', description: '15% de descuento en retiros presenciales', emoji: 'lucide:mountain', color: 'var(--color-mood-great)', bgColor: 'rgba(var(--color-mood-great-rgb), 0.15)' },
  { id: 'mock-ben-002', title: 'Acceso a comunidad VIP', description: 'Grupo exclusivo de WhatsApp con mentores', emoji: 'lucide:message-circle', color: 'var(--color-benefit-purple)', bgColor: 'rgba(var(--color-benefit-purple-rgb), 0.15)' },
  { id: 'mock-ben-003', title: 'Sesión 1:1 gratuita', description: 'Una sesión de coaching al mes sin costo', emoji: 'lucide:target', color: 'var(--color-mood-low)', bgColor: 'rgba(var(--color-mood-low-rgb), 0.15)' },
  { id: 'mock-ben-004', title: 'Descuento en libros', description: '20% en la tienda de libros recomendados', emoji: 'lucide:book-open', color: 'var(--color-benefit-pink)', bgColor: 'rgba(var(--color-benefit-pink-rgb), 0.15)' },
])
</script>

<style scoped>
/* ─── Header (standard) ─── */
.benefits__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.benefits__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.benefits__back {
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
  .benefits__back:hover { background: rgba(var(--tint-rgb), 0.04); }
}

/* ─── Intro ─── */
.benefits__intro {
  font-size: var(--text-md);
  color: var(--color-muted);
  margin-bottom: var(--space-6);
  line-height: var(--leading-relaxed);
}

/* ─── Card list ─── */
.benefits__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ─── Card ─── */
.benefits__card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  text-decoration: none;
  color: var(--color-text);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  cursor: pointer;
  background: rgba(var(--tint-rgb), 0.04);
  transition: background var(--transition-fast);
}
@media (hover: hover) {
  .benefits__card:hover { background: rgba(var(--tint-rgb), 0.06); }
}
.benefits__card:active { background: rgba(var(--tint-rgb), 0.08); }

/* ─── Colorful icon ─── */
.benefits__icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--benefit-bg);
  color: var(--benefit-accent);
}

/* ─── Body ─── */
.benefits__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.benefits__name {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
}

.benefits__desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
}

.benefits__chevron {
  flex-shrink: 0;
  color: var(--color-muted);
}

/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .benefits__header {
    justify-content: flex-start;
  }

  .benefits__header-title {
    display: none;
  }

  .benefits__back {
    display: none;
  }

  .benefits__list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }

  .benefits__card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    transition: border-color var(--transition-fast);
  }

  @media (hover: hover) {
    .benefits__card:hover {
      background: var(--color-desktop-card);
      border-color: var(--color-border);
    }
  }
}
</style>
