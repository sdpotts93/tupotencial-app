<template>
  <div class="screen">
    <UiTopNav show-back />
    <div class="screen__content">
      <!-- Hero (inspired by inspiration-retos-[id]) -->
      <div class="program-detail__hero">
        <div class="program-detail__hero-bg" />
        <div class="program-detail__hero-content">
          <UiTag variant="accent">{{ program.typeLabel }}</UiTag>
          <h1 class="title title--xl" style="color: var(--color-light); margin-top: var(--space-3);">{{ program.title }}</h1>
          <p class="program-detail__hero-meta">{{ program.duration }} • {{ program.totalDays }} días</p>
        </div>
      </div>

      <!-- CTA -->
      <div class="program-detail__cta">
        <UiButton v-if="!program.enrolled" block @click="enroll">Inscribirme</UiButton>
        <UiButton v-else block variant="secondary" :to="`/retos/${id}/day/${program.currentDay}`">
          Continuar — Día {{ program.currentDay }}
        </UiButton>
      </div>

      <!-- Description -->
      <p class="program-detail__desc">{{ program.description }}</p>

      <!-- Day list -->
      <section class="program-detail__days">
        <p class="eyebrow">DÍAS DEL PROGRAMA</p>
        <UiList>
          <UiListItem
            v-for="day in program.days"
            :key="day.index"
            :label="`Día ${day.index}: ${day.title}`"
            :description="day.done ? 'Completado ✓' : ''"
            :to="`/retos/${id}/day/${day.index}`"
          />
        </UiList>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const id = route.params.id as string

const program = ref({
  title: 'Reto 7 días de gratitud',
  typeLabel: 'RETO',
  duration: '7 días',
  totalDays: 7,
  enrolled: true,
  currentDay: 5,
  description: 'Cada día te invitamos a reflexionar sobre lo que agradeces. Este reto transformará tu perspectiva y te ayudará a encontrar alegría en las pequeñas cosas. Dedica solo 5 minutos diarios a esta práctica.',
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
.program-detail__hero {
  margin: 0 calc(var(--space-4) * -1);
  position: relative;
  aspect-ratio: 16/10;
  display: flex;
  align-items: flex-end;
  margin-bottom: var(--space-5);
}

.program-detail__hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, var(--color-navy), var(--color-green));
  border-radius: 0 0 var(--radius-2xl) var(--radius-2xl);
}

.program-detail__hero-content {
  position: relative;
  padding: var(--space-6);
  width: 100%;
}

.program-detail__hero-meta {
  font-size: var(--text-sm);
  color: var(--color-sand);
  margin-top: var(--space-2);
}

.program-detail__cta { margin-bottom: var(--space-5); }

.program-detail__desc {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

.program-detail__days > .eyebrow { margin-bottom: var(--space-3); }

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .program-detail__hero {
    margin-left: 0;
    margin-right: 0;
    border-radius: var(--radius-xl);
    overflow: hidden;
  }
}
</style>
