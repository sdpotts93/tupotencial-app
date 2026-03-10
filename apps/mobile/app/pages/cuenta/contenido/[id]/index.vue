<template>
  <div class="screen">
    <div class="detail">
      <!-- Media -->
      <div class="detail__media">
        <img :src="content.thumbnail" alt="" class="detail__img" />
        <div class="detail__overlay" />
        <div class="detail__nav safe-top">
          <button class="detail__back" aria-label="Volver" @click="$router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
        <button class="detail__play-btn" aria-label="Reproducir" @click="navigateTo(`/cuenta/contenido/${id}/reproducir`)">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
        </button>
      </div>

      <!-- Info -->
      <div class="detail__info">
        <button class="detail__back-link" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <p class="eyebrow">{{ content.typeLabel }}</p>
        <h1 class="title title--lg detail__title">{{ content.title }}</h1>
        <p v-if="content.subtitle" class="detail__subtitle">{{ content.subtitle }}</p>

        <div class="detail__actions">
          <UiButton variant="outline" block @click="navigateTo(`/cuenta/contenido/${id}/reproducir`)">
            {{ content.type === 'text' ? 'Leer' : 'Reproducir' }}
          </UiButton>
        </div>

        <p class="detail__description">{{ content.description }}</p>

        <div class="detail__meta">
          <UiTag v-if="content.duration">{{ content.duration }}</UiTag>
        </div>
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
  typeLabel: 'MEDITACIÓN',
  type: 'audio',
  description: 'Esta meditación te guiará a través de una práctica de respiración consciente de 10 minutos. Ideal para momentos de estrés o para empezar tu día con claridad. Cierra los ojos, encuentra una posición cómoda y permite que tu atención se centre en el flujo natural de tu respiración.',
  duration: '10 min',
  thumbnail: coverMap[id] || '/images/lib-1.jpg',
})
</script>

<style scoped>
/* ─── Mobile layout ─── */
.detail {
  display: flex;
  flex-direction: column;
}

/* ─── Media ─── */
.detail__media {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
}

.detail__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail__overlay {
  position: absolute;
  inset: 0;
}

/* ─── Nav (mobile back) ─── */
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
  color: var(--color-dark-lighter);
  background: rgba(var(--tint-inverse-rgb), 0.85);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .detail__back:hover { background: rgba(var(--tint-inverse-rgb), 1); }
}

/* ─── Play button ─── */
.detail__play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(var(--tint-rgb), 0.45);
  backdrop-filter: blur(8px);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: background var(--transition-fast);
}
@media (hover: hover) {
  .detail__play-btn:hover { background: rgba(var(--tint-rgb), 0.65); }
}

/* ─── Back link (desktop only) ─── */
.detail__back-link {
  display: none;
}

/* ─── Info ─── */
.detail__info {
  padding: var(--space-4);
  padding-bottom: 2rem;
  width: 100%;
  max-width: var(--max-content-width);
  margin: 0 auto;
}

.detail__title {
  margin-top: var(--space-1);
  margin-bottom: var(--space-2);
}

.detail__subtitle {
  font-size: var(--text-md);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

.detail__actions { margin: var(--space-5) 0; }

.detail__description {
  font-size: var(--text-base);
  color: var(--color-muted);
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
  color: var(--color-white);
}

/* ─── Tablet ─── */
@media (min-width: 768px) {
  .detail__info {
    max-width: var(--max-page-width);
    padding: var(--space-6);
  }
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .detail {
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

  .detail__media {
    order: 2;
    aspect-ratio: unset;
  }

  .detail__play-btn {
    width: 72px;
    height: 72px;
  }

  .detail__nav { display: none; }

  .detail__back-link {
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
    .detail__back-link:hover { background: rgba(var(--tint-rgb), 0.06); }
  }

  .detail__info {
    order: 1;
    max-width: none;
    margin: 0;
    padding: var(--space-10);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .detail__title {
    font-size: var(--title-xl);
  }

  .detail__subtitle {
    font-size: var(--text-lg);
  }

  .detail__description {
    font-size: var(--text-lg);
  }

  .detail__info > .eyebrow {
    font-size: var(--eyebrow-lg);
  }

  .detail__actions :deep(.btn) {
    width: auto;
    display: inline-flex;
  }
}
</style>
