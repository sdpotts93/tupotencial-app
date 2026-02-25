<template>
  <div class="screen">
    <UiTopNav title="Tu progreso" show-back @back="navigateTo('/hoy')" />
    <div class="screen__content">
      <!-- Streak highlight (inspired by inspiration-hoy-progress) -->
      <div class="progress__hero">
        <div class="progress__hero-circle">
          <span class="progress__hero-number">{{ currentStreak }}</span>
          <span class="progress__hero-label">días</span>
        </div>
        <h2 class="progress__hero-title">Racha actual</h2>
        <p class="progress__hero-sub">Tu mejor racha: {{ bestStreak }} días</p>
      </div>

      <!-- Stats -->
      <section class="progress__stats">
        <div class="progress__stat">
          <span class="progress__stat-value">{{ totalCheckins }}</span>
          <span class="progress__stat-label">Check-ins</span>
        </div>
        <div class="progress__stat">
          <span class="progress__stat-value">{{ activeProgramsCount }}</span>
          <span class="progress__stat-label">Programas activos</span>
        </div>
        <div class="progress__stat">
          <span class="progress__stat-value">{{ contentViewed }}</span>
          <span class="progress__stat-label">Contenidos vistos</span>
        </div>
      </section>

      <!-- Active programs summary -->
      <section class="progress__programs">
        <p class="eyebrow">PROGRAMAS ACTIVOS</p>
        <UiList>
          <UiListItem
            v-for="prog in activePrograms"
            :key="prog.id"
            :label="prog.title"
            :description="`Día ${prog.currentDay} de ${prog.totalDays}`"
            :to="`/retos/${prog.id}`"
          />
        </UiList>
      </section>

      <!-- Week calendar -->
      <section class="progress__week">
        <p class="eyebrow">ESTA SEMANA</p>
        <div class="progress__days">
          <div
            v-for="day in weekDays"
            :key="day.label"
            :class="['progress__day', { 'progress__day--done': day.done, 'progress__day--today': day.today }]"
          >
            <span class="progress__day-label">{{ day.label }}</span>
            <span class="progress__day-dot" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const currentStreak = ref(7)
const bestStreak = ref(14)
const totalCheckins = ref(42)
const activeProgramsCount = ref(2)
const contentViewed = ref(28)

const activePrograms = ref([
  { id: 'mock-prog-001', title: 'Reto 7 días de gratitud', currentDay: 5, totalDays: 7 },
  { id: 'mock-prog-002', title: 'Despertar consciente', currentDay: 12, totalDays: 30 },
])

const weekDays = computed(() => {
  const today = new Date()
  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const dayOfWeek = (today.getDay() + 6) % 7 // Monday = 0
  return dayLabels.map((label, i) => ({
    label,
    done: i < dayOfWeek,
    today: i === dayOfWeek,
  }))
})
</script>

<style scoped>
.progress__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8) 0 var(--space-6);
}

.progress__hero-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), var(--color-navy));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
}

.progress__hero-number {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  color: #fff;
  line-height: 1;
}

.progress__hero-label {
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.progress__hero-title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
}

.progress__hero-sub {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

.progress__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}

.progress__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4);
  background: #ffffff21;
  color: white;
  border-radius: var(--radius-xl);
}

.progress__stat-value {
  font-size: var(--title-sm);
  font-weight: var(--weight-bold);
  color: var(--color-accent);
}

.progress__stat-label {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-top: 2px;
}

.progress__programs { margin-bottom: var(--space-8); }
.progress__programs > .eyebrow { margin-bottom: var(--space-3); }

.progress__week { margin-bottom: var(--space-6); }
.progress__week > .eyebrow { margin-bottom: var(--space-3); }

.progress__days {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
}

.progress__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.progress__day-label {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  color: var(--color-muted);
  font-weight: var(--weight-semibold);
}

.progress__day-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-surface-alt);
  border: 2px solid var(--color-border);
}

.progress__day--done .progress__day-dot {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.progress__day--today .progress__day-dot {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(40, 55, 74, 0.15);
}
</style>
