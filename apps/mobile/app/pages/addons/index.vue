<template>
  <div class="screen">
    <div class="screen__content">
      <header class="addons__header">
        <button class="addons__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="addons__header-title">VIP</h1>
      </header>

      <p class="addons__intro">Lleva tu experiencia al siguiente nivel con contenido y experiencias exclusivas.</p>

      <div class="addons__list">
        <NuxtLink
          v-for="addon in addons"
          :key="addon.id"
          :to="`/addons/${addon.id}`"
          class="addons__card"
        >
          <img v-if="addon.img" :src="addon.img" alt="" class="addons__card-img" />
          <div v-else class="addons__card-gradient" :style="{ background: addon.bg }" />
          <span class="addons__card-price">{{ addon.priceLabel }}</span>
          <div class="addons__card-overlay">
            <span class="addons__card-eyebrow">{{ addon.typeLabel }}</span>
            <h3 class="addons__card-name">{{ addon.title }}</h3>
            <p class="addons__card-desc">{{ addon.description }}</p>
            <div v-if="addon.owned" class="addons__card-footer">
              <span class="addons__tag addons__tag--unlocked">Desbloqueado</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const addons = ref([
  {
    id: 'mock-addon-001', title: 'Mentoría 1:1 con Gabriel', typeLabel: 'EXPERIENCIA',
    description: '4 sesiones de coaching personalizado de 45 minutos.',
    priceLabel: '$2,499 MXN', bg: 'linear-gradient(135deg, #28374A, #282828)', img: '/images/lib-4.jpg', owned: false,
  },
  {
    id: 'mock-addon-002', title: 'Módulo VIP: Liderazgo avanzado', typeLabel: 'CONTENIDO PREMIUM',
    description: '12 lecciones exclusivas + material descargable.',
    priceLabel: '$799 MXN', bg: 'linear-gradient(135deg, #384637, #A7A68E)', img: '/images/lib-8.jpg', owned: true,
  },
  {
    id: 'mock-addon-003', title: 'Retiro presencial — Marzo 2026', typeLabel: 'EXPERIENCIA',
    description: 'Fin de semana de inmersión en Valle de Bravo.',
    priceLabel: '$8,999 MXN', bg: 'linear-gradient(135deg, #A7A68E, #28374A)', img: '/images/lib-6.jpg', owned: false,
  },
])
</script>

<style scoped>
/* ─── Header (matches events) ─── */
.addons__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.addons__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.addons__back {
  position: absolute;
  left: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-inverse);
  cursor: pointer;
  border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}
.addons__back:hover { background: rgba(0, 0, 0, 0.04); }

/* ─── Intro ─── */
.addons__intro {
  font-size: var(--text-md);
  color: var(--color-muted);
  margin-bottom: var(--space-6);
  line-height: var(--leading-relaxed);
}

/* ─── Card list ─── */
.addons__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* ─── Card (matches events__card) ─── */
.addons__card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  text-decoration: none;
  color: var(--color-text);
  background: #000;
}

.addons__card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: bottom;
}

.addons__card-gradient {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* ─── Price badge (floating top-right) ─── */
.addons__card-price {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  font-family: var(--font-eyebrow);
  font-size: 0.8rem;
  font-weight: var(--weight-bold);
  background: var(--color-surface);
  color: var(--color-text);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1;
}

/* ─── Bottom overlay with backdrop-filter ─── */
.addons__card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-5);
  backdrop-filter: blur(13px);
  background: var(--color-surface-alt);
}

.addons__card-eyebrow {
  display: block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.addons__card-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  margin: 0 0 var(--space-1);
  line-height: var(--leading-snug);
}

.addons__card-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

.addons__card-footer {
  margin-top: var(--space-3);
}

.addons__tag {
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

.addons__tag--unlocked {
  background: rgba(168, 216, 110, 0.15);
  color: #A8D86E;
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .addons__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
