<template>
  <div class="screen">
    <!-- Hero — full bleed to top -->
    <div class="detail__hero">
      <img :src="content.thumbnail" alt="" class="detail__hero-img" />
      <div class="detail__hero-overlay" />

      <!-- Back button overlaid on hero -->
      <div class="detail__nav safe-top">
        <button class="detail__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>

      <button class="detail__play-btn" aria-label="Reproducir" @click="navigateTo(`/content/${id}/play`)">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
      </button>
    </div>

    <div class="screen__content">
      <!-- Content info -->
      <p class="eyebrow">{{ content.typeLabel }}</p>
      <h1 class="title title--lg detail__title">{{ content.title }}</h1>
      <p v-if="content.subtitle" class="detail__subtitle">{{ content.subtitle }}</p>

      <!-- Actions -->
      <div class="detail__actions">
        <UiButton block @click="navigateTo(`/content/${id}/play`)">
          {{ content.type === 'text' ? 'Leer' : 'Reproducir' }}
        </UiButton>
      </div>

      <!-- Description -->
      <p class="detail__description">{{ content.description }}</p>

      <!-- Duration -->
      <div class="detail__meta">
        <UiTag v-if="content.duration">{{ content.duration }}</UiTag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const id = route.params.id as string

const coverMap: Record<string, string> = {
  'mock-content-001': '/images/lib-1.jpg',
  'mock-content-002': '/images/lib-2.jpg',
  'mock-content-003': '/images/lib-3.jpg',
  'mock-content-004': '/images/lib-4.jpg',
  'mock-content-005': '/images/lib-5.jpg',
  'mock-content-006': '/images/lib-6.jpg',
  'mock-content-007': '/images/lib-7.jpg',
}

const content = ref({
  title: 'Respiración consciente',
  subtitle: 'Encuentra calma en cada inhalación',
  typeLabel: 'MEDITACIÓN GUIADA',
  type: 'audio',
  description: 'Esta meditación te guiará a través de una práctica de respiración consciente de 10 minutos. Ideal para momentos de estrés o para empezar tu día con claridad. Cierra los ojos, encuentra una posición cómoda y permite que tu atención se centre en el flujo natural de tu respiración.',
  duration: '10 min',
  thumbnail: coverMap[id] || '/images/lib-1.jpg',
})
</script>

<style scoped>
.screen__content {
  padding-bottom: 2rem;
}
/* ─── Hero — full bleed to top ─── */
.detail__hero {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
}

.detail__hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
}

/* ─── Nav overlaid on hero ─── */
.detail__nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: var(--space-3) var(--space-4);
}

.detail__back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dark);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.detail__back:hover { background: rgba(255, 255, 255, 1); }

/* ─── Play button ─── */
.detail__play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.detail__play-btn:hover { background: rgba(0, 0, 0, 0.65); }

.detail__title {
  margin-top: var(--space-1);
  margin-bottom: var(--space-2);
}

/* ─── Content info (dark bg) ─── */
.detail__subtitle {
  font-size: var(--text-md);
  color: rgba(255, 255, 255, 0.5);
  margin-top: var(--space-1);
}

.detail__actions { margin: var(--space-5) 0; }

.detail__actions :deep(.btn) {
  background: #FFFFFF;
  color: var(--color-text);
  border-color: #FFFFFF;
}

.detail__description {
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.6);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-5);
}

.detail__meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.detail__meta :deep(.tag) {
  background: var(--color-sand);
  color: white;
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .detail__hero {
    border-radius: var(--radius-xl);
    overflow: hidden;
    margin: var(--space-4);
    width: calc(100% - var(--space-4) * 2);
  }
}
</style>
