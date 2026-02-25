<template>
  <div class="screen">
    <UiTopNav title="Eventos y Lives" show-back />
    <div class="screen__content">
      <!-- Upcoming -->
      <section class="events__section">
        <p class="eyebrow">PRÓXIMOS</p>
        <div class="events__list">
          <UiCard
            v-for="event in upcomingEvents"
            :key="event.id"
            variant="default"
            clickable
            :to="`/events/${event.id}`"
          >
            <template #media>
              <div class="events__media" :style="{ background: event.bg }">
                <span class="events__date-badge">{{ event.dateLabel }}</span>
              </div>
            </template>
            <p class="eyebrow eyebrow--sm">{{ event.timeLabel }}</p>
            <h3 style="font-weight: var(--weight-semibold); margin: var(--space-1) 0;">{{ event.title }}</h3>
            <p style="font-size: var(--text-sm); color: var(--color-muted);">{{ event.description }}</p>
            <template #footer>
              <UiTag v-if="event.requiresSub" variant="accent" size="sm">Solo miembros</UiTag>
            </template>
          </UiCard>
        </div>
      </section>

      <!-- Past -->
      <section class="events__section">
        <p class="eyebrow">PASADOS</p>
        <div class="events__list">
          <UiCard
            v-for="event in pastEvents"
            :key="event.id"
            variant="outlined"
            clickable
            :to="`/events/${event.id}`"
            :title="event.title"
            :subtitle="event.dateLabel"
            eyebrow="GRABACIÓN DISPONIBLE"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const upcomingEvents = ref([
  { id: 'mock-event-001', title: 'Live: Meditación grupal', description: 'Sesión guiada de meditación con Carlotta.', dateLabel: '28 Feb', timeLabel: 'JUEVES 19:00 CDMX', bg: 'linear-gradient(135deg, #384637, #28374A)', requiresSub: true },
  { id: 'mock-event-002', title: 'Q&A: Hábitos de alto rendimiento', description: 'Preguntas y respuestas con Gabriel.', dateLabel: '5 Mar', timeLabel: 'MIÉRCOLES 20:00 CDMX', bg: 'linear-gradient(135deg, #28374A, #282828)', requiresSub: true },
])

const pastEvents = ref([
  { id: 'mock-event-003', title: 'Live: Respiración y estrés', dateLabel: '15 Feb 2026' },
  { id: 'mock-event-004', title: 'Taller: Diario de gratitud', dateLabel: '8 Feb 2026' },
])
</script>

<style scoped>
.events__section { margin-bottom: var(--space-8); }
.events__section > .eyebrow { margin-bottom: var(--space-3); }

.events__list { display: flex; flex-direction: column; gap: var(--space-4); }

.events__media {
  width: 100%; height: 100%; display: flex; align-items: flex-start; justify-content: flex-end; padding: var(--space-3);
}

.events__date-badge {
  font-family: var(--font-eyebrow); font-size: var(--eyebrow-md); font-weight: var(--weight-bold);
  background: rgba(0,0,0,0.4); color: #fff; padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md); backdrop-filter: blur(4px);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .events__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
