<template>
  <div class="screen">
    <div class="detail">
      <!-- Media -->
      <div class="detail__media">
        <img :src="program.thumbnail" alt="" class="detail__img" />
        <div class="detail__overlay" />
        <div class="detail__nav safe-top">
          <button class="detail__back" aria-label="Volver" @click="$router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="detail__info">
        <button class="detail__back-link" @click="$router.back()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver
        </button>

        <p class="eyebrow">{{ program.typeLabel }} · {{ program.duration }}</p>
        <h1 class="title title--lg detail__title">{{ program.title }}</h1>

        <div class="detail__actions">
          <UiButton v-if="!program.enrolled" block @click="enroll">Inscribirme</UiButton>
          <UiButton variant="outline" v-else block :to="`/retos/${id}/day/${program.currentDay}`">
            Continuar — Día {{ program.currentDay }}
          </UiButton>
        </div>

        <p class="detail__description">{{ program.description }}</p>

        <div class="detail__meta">
          <span :class="['detail__tag', program.enrolled ? 'detail__tag--inscrito' : (program.free ? 'detail__tag--gratis' : 'detail__tag--core')]">
            {{ program.enrolled ? 'Inscrito' : (program.free ? 'Gratis' : 'Core') }}
          </span>
          <UiTag>{{ program.totalDays }} días</UiTag>
        </div>
      </div>
    </div>

    <!-- Day list (below the card on desktop) -->
    <section class="detail__days">
      <p class="eyebrow">DÍAS DEL PROGRAMA</p>
      <UiList>
        <UiListItem
          v-for="day in program.days"
          :key="day.index"
          :label="`Día ${day.index}: ${day.title}`"
          :description="day.done ? 'Completado ✓' : ''"
          :description-variant="day.done ? 'success' : 'default'"
          :to="`/retos/${id}/day/${day.index}`"
        />
      </UiList>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const id = route.params.id as string

const coverMap: Record<string, string> = {
  'mock-prog-001': '/images/lib-3.jpg',
  'mock-prog-002': '/images/lib-5.jpg',
  'mock-prog-003': '/images/lib-7.jpg',
  'mock-prog-004': '/images/lib-2.jpg',
  'mock-prog-005': '/images/lib-8.jpg',
}

const program = ref({
  title: 'Reto 7 días de gratitud',
  typeLabel: 'RETO',
  duration: '7 días',
  totalDays: 7,
  enrolled: true,
  free: true,
  currentDay: 5,
  description: 'Cada día te invitamos a reflexionar sobre lo que agradeces. Este reto transformará tu perspectiva y te ayudará a encontrar alegría en las pequeñas cosas. Dedica solo 5 minutos diarios a esta práctica.',
  thumbnail: coverMap[id] || '/images/lib-1.jpg',
  days: [
    { index: 1, title: 'Gratitud personal', done: true },
    { index: 2, title: 'Personas importantes', done: true },
    { index: 3, title: 'Momentos del día', done: true },
    { index: 4, title: 'Tu cuerpo', done: true },
    { index: 5, title: 'Oportunidades', done: false },
    { index: 6, title: 'Naturaleza', done: false },
    { index: 7, title: 'Tu camino', done: false },
  ],
})

function enroll() {
  program.value.enrolled = true
}
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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.detail__back:hover { background: rgba(255, 255, 255, 1); }

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

/* ─── Actions ─── */
.detail__actions { margin: var(--space-5) 0; }

/* ─── Description ─── */
.detail__description {
  font-size: var(--text-base);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-5);
}

/* ─── Meta tags ─── */
.detail__meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-8);
}

.detail__tag {
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

.detail__tag--core {
  background: rgba(212, 175, 55, 0.15);
  color: #9c8742;
}

.detail__tag--gratis {
  background: rgba(192, 192, 192, 0.15);
  color: #9c9c9c;
}

.detail__tag--inscrito {
  background: rgba(72, 187, 120, 0.15);
  color: #60a97c;
}

.detail__meta :deep(.tag) {
  background: var(--color-sand);
  color: white;
}

/* ─── Day list ─── */
.detail__days {
  padding: 0 var(--space-4);
  margin-bottom: var(--space-6);
}

.detail__days > .eyebrow {
  margin-bottom: var(--space-3);
}

/* ─── Tablet ─── */
@media (min-width: 768px) {
  .detail__info {
    max-width: var(--max-page-width);
    padding: var(--space-6);
  }

  .detail__days {
    padding: 0 var(--space-6);
    max-width: var(--max-page-width);
    margin-left: auto;
    margin-right: auto;
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
    min-height: 420px;
    max-width: 1100px;
  }

  .detail__media {
    order: 2;
    aspect-ratio: unset;
  }

  .detail__nav { display: none; }

  .detail__back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-bottom: var(--space-6);
    transition: color var(--transition-fast);
  }
  .detail__back-link:hover { color: var(--color-text); }

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

  .detail__days {
    padding: 0 var(--space-6);
    margin-left: var(--space-6);
    max-width: 700px;
    margin-top: var(--space-2);
  }

  .detail__days > .eyebrow {
    font-size: var(--eyebrow-lg);
  }
}
</style>
