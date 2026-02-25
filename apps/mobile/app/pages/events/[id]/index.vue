<template>
  <div class="screen">
    <UiTopNav :title="event.title" show-back />
    <div class="screen__content">
      <div class="event-detail__hero">
        <div class="event-detail__hero-bg" />
      </div>

      <p class="eyebrow eyebrow--accent">{{ event.dateLabel }}</p>
      <h1 class="title title--lg">{{ event.title }}</h1>
      <p class="event-detail__desc">{{ event.description }}</p>

      <div class="event-detail__meta">
        <UiTag v-if="event.requiresSub" variant="accent">Solo miembros</UiTag>
        <UiTag variant="default">{{ event.status }}</UiTag>
      </div>

      <UiButton block class="event-detail__cta" :to="`/events/${id}/watch`">
        {{ event.isLive ? 'Ver en vivo' : 'Ver grabación' }}
      </UiButton>
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
  dateLabel: 'Jueves 28 Feb, 19:00 CDMX',
  requiresSub: true,
  status: 'Publicado',
  isLive: false,
})
</script>

<style scoped>
.event-detail__hero {
  margin: 0 calc(var(--space-4) * -1) var(--space-5);
  aspect-ratio: 16/9;
}

.event-detail__hero-bg {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, var(--color-navy), var(--color-green));
}

.event-detail__desc {
  font-size: var(--text-base); color: var(--color-text-secondary);
  line-height: var(--leading-relaxed); margin: var(--space-3) 0 var(--space-5);
}

.event-detail__meta { display: flex; gap: var(--space-2); margin-bottom: var(--space-5); }
</style>
