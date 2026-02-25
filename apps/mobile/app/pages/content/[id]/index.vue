<template>
  <div class="screen">
    <UiTopNav show-back>
      <template #right>
        <UiIconButton label="Más opciones">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </UiIconButton>
      </template>
    </UiTopNav>
    <div class="screen__content">
      <!-- Hero media (inspired by inspiration-content-[id]) -->
      <div class="detail__hero">
        <div class="detail__hero-media">
          <img src="/logo-icon/logo-icon-white.png" alt="" class="detail__hero-logo" />
          <button class="detail__play-btn" aria-label="Reproducir" @click="navigateTo(`/content/${id}/play`)">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
          </button>
        </div>
      </div>

      <!-- Content info -->
      <p class="eyebrow eyebrow--accent">{{ content.typeLabel }}</p>
      <h1 class="title title--lg">{{ content.title }}</h1>
      <p v-if="content.subtitle" class="detail__subtitle">{{ content.subtitle }}</p>

      <!-- Actions -->
      <div class="detail__actions">
        <UiButton block @click="navigateTo(`/content/${id}/play`)">
          {{ content.type === 'text' ? 'Leer' : 'Reproducir' }}
        </UiButton>
      </div>

      <!-- Description -->
      <p class="detail__description">{{ content.description }}</p>

      <!-- Duration / meta -->
      <div class="detail__meta">
        <UiTag v-if="content.duration">{{ content.duration }}</UiTag>
        <UiTag variant="accent">{{ content.segment || 'Todos' }}</UiTag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const id = route.params.id as string

const content = ref({
  title: 'Respiración consciente',
  subtitle: 'Encuentra calma en cada inhalación',
  typeLabel: 'MEDITACIÓN GUIADA',
  type: 'audio',
  description: 'Esta meditación te guiará a través de una práctica de respiración consciente de 10 minutos. Ideal para momentos de estrés o para empezar tu día con claridad. Cierra los ojos, encuentra una posición cómoda y permite que tu atención se centre en el flujo natural de tu respiración.',
  duration: '10 min',
  segment: 'Carlotta',
})
</script>

<style scoped>
.detail__hero { margin: 0 calc(var(--space-4) * -1) var(--space-5); }

.detail__hero-media {
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, var(--color-navy), var(--color-green));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.detail__hero-logo { height: 40px; opacity: 0.3; }

.detail__play-btn {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.detail__subtitle {
  font-size: var(--text-md);
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

.detail__actions { margin: var(--space-5) 0; }

.detail__description {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-5);
}

.detail__meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .detail__hero {
    margin-left: 0;
    margin-right: 0;
    border-radius: var(--radius-xl);
    overflow: hidden;
  }
}
</style>
