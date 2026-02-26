<template>
  <div class="screen">
    <!-- Hero -->
    <div class="edetail__hero">
      <img :src="event.img" alt="" class="edetail__hero-img" />
      <div class="edetail__hero-overlay" />

      <div class="edetail__nav safe-top">
        <button class="edetail__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="screen__content">
      <p class="eyebrow">{{ event.dateLabel }}</p>
      <h1 class="title title--lg edetail__title">{{ event.title }}</h1>

      <div class="edetail__actions">
        <UiButton block :to="`/events/${id}/watch`">
          {{ event.isLive ? 'Ver en vivo' : 'Ver grabación' }}
        </UiButton>
      </div>

      <p class="edetail__desc">{{ event.description }}</p>

      <div class="edetail__meta">
        <span v-if="event.requiresSub" class="edetail__tag edetail__tag--member">Solo miembros</span>
        <UiTag>{{ event.status }}</UiTag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const id = route.params.id as string

const event = ref({
  title: 'Live: Meditación grupal',
  description: 'Únete a esta sesión guiada de meditación con Carlotta. Exploraremos técnicas de respiración y visualización para calmar la mente y encontrar claridad interior.',
  dateLabel: 'JUEVES 28 FEB · 19:00 CDMX',
  img: '/images/lib-4.jpg',
  requiresSub: true,
  status: 'Publicado',
  isLive: false,
})
</script>

<style scoped>
.screen__content {
  padding-bottom: 2rem;
}

/* ─── Hero ─── */
.edetail__hero {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.edetail__hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edetail__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.35) 0%, transparent 40%, rgba(255, 255, 255, 0.6) 100%);
}

/* ─── Nav ─── */
.edetail__nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: var(--space-3) var(--space-4);
}

.edetail__back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dark-lighter);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.edetail__back:hover { background: rgba(255, 255, 255, 1); }

.edetail__title {
  margin-top: var(--space-1);
  margin-bottom: var(--space-2);
}

/* ─── Actions ─── */
.edetail__actions { margin: var(--space-5) 0; }

.edetail__actions :deep(.btn) {
  background: #FFFFFF;
  color: var(--color-text);
  border-color: var(--color-border);
}

/* ─── Description ─── */
.edetail__desc {
  font-size: var(--text-base);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-5);
}

/* ─── Meta ─── */
.edetail__meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-8);
}

.edetail__tag {
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

.edetail__tag--member {
  background: rgba(212, 175, 55, 0.15);
  color: #D4AF37;
}

.edetail__meta :deep(.tag) {
  background: var(--color-sand);
  color: var(--color-text);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .edetail__hero {
    border-radius: var(--radius-xl);
    overflow: hidden;
    margin: var(--space-4);
    width: calc(100% - var(--space-4) * 2);
  }
}
</style>
