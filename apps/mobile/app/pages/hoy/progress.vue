<template>
  <div class="screen">
    <div class="screen__content">
      <!-- Standard header -->
      <header class="progress__header">
        <button class="progress__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="progress__header-title">Mi Progreso</h1>
      </header>

      <!-- Streak highlight -->
      <div class="progress__hero">
        <div class="progress__hero-circle">
          <img src="/logo-icon/logo-fire.png" alt="" class="progress__hero-fire" />
          <span class="progress__hero-number">{{ currentStreak }}</span>
          <span class="progress__hero-label">días</span>
        </div>
        <h2 class="progress__hero-title">Racha actual</h2>
        <p class="progress__hero-sub">Tu mejor racha: {{ bestStreak }} días</p>
      </div>

      <!-- Stats -->
      <section class="progress__stats">
        <div class="progress__stat">
          <span class="progress__stat-value progress__stat-value--checkins">{{ totalCheckins }}</span>
          <span class="progress__stat-label">Check-ins hechos</span>
        </div>
        <div class="progress__stat">
          <span class="progress__stat-value progress__stat-value--programs">{{ activeProgramsCount }}</span>
          <span class="progress__stat-label">Programas activos</span>
        </div>
        <div class="progress__stat">
          <span class="progress__stat-value progress__stat-value--content">{{ contentViewed }}</span>
          <span class="progress__stat-label">Contenidos vistos</span>
        </div>
      </section>

      <!-- Active programs (day__card style) -->
      <section class="progress__programs">
        <p class="eyebrow">PROGRAMAS ACTIVOS</p>
        <div class="progress__programs-list">
          <NuxtLink
            v-for="prog in activePrograms"
            :key="prog.id"
            :to="`/retos/${prog.id}`"
            class="progress__card"
          >
            <img :src="prog.img" :alt="prog.title" class="progress__card-img" />
            <div class="progress__card-body">
              <span class="progress__card-title">{{ prog.title }}</span>
              <span class="progress__card-meta">Día {{ prog.currentDay }} de {{ prog.totalDays }}</span>
            </div>
            <svg class="progress__card-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </NuxtLink>
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
  { id: 'mock-prog-001', title: 'Reto 7 días de gratitud', currentDay: 5, totalDays: 7, img: '/images/lib-4.jpg' },
  { id: 'mock-prog-002', title: 'Despertar consciente', currentDay: 12, totalDays: 30, img: '/images/lib-6.jpg' },
])
</script>

<style scoped>
/* ─── Header (standard) ─── */
.progress__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.progress__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.progress__back {
  position: absolute;
  left: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-dark-lighter);
  cursor: pointer;
  border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}
.progress__back:hover { background: rgba(var(--tint-rgb), 0.05); }

/* ─── Hero ─── */
.progress__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8) 0 var(--space-6);
}

.progress__hero-circle {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
}

.progress__hero-fire {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.progress__hero-number {
  position: relative;
  font-family: var(--font-title);
  font-size: var(--title-xl);
  color: var(--color-text);
  line-height: 1;
}

.progress__hero-label {
  position: relative;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
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

/* ─── Stats ─── */
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
  gap: var(--space-1);
  padding: var(--space-8) var(--space-4) var(--space-4);
  background: rgba(var(--tint-rgb), 0.04);
  border-radius: var(--radius-xl);
  justify-content: center;
}

.progress__stat-value {
  font-size: var(--title-lg);
  font-weight: var(--weight-bold);
  line-height: 1;
}

.progress__stat-value--checkins,
.progress__stat-value--programs,
.progress__stat-value--content { color: var(--color-text); }

.progress__stat-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
  text-align: center;
}

/* ─── Programs (day__card style) ─── */
.progress__programs { margin-bottom: var(--space-6); }
.progress__programs > .eyebrow { margin-bottom: var(--space-3); }

.progress__programs-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.progress__card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  text-decoration: none;
  color: var(--color-text);
  border-radius: var(--radius-xl);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  background: rgba(var(--tint-rgb), 0.04);
  transition: background var(--transition-fast);
}
.progress__card:hover { background: rgba(var(--tint-rgb), 0.06); }

.progress__card-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  object-fit: cover;
  flex-shrink: 0;
}

.progress__card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.progress__card-title {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress__card-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--color-muted);
  font-family: var(--font-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.progress__card-chevron {
  flex-shrink: 0;
  color: var(--color-muted);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .progress__stats {
    gap: var(--space-4);
  }

  .progress__stat {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
  }

  .progress__programs-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .progress__card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
  }

  .progress__card:hover {
    background: var(--color-desktop-card);
    border-color: var(--color-border);
  }
}
</style>
