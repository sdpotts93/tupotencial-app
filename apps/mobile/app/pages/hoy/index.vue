<template>
  <div class="screen">
    <!-- Branded header (logo scrolls away, progress sticks) -->
    <div class="hoy__hero">
      <img src="/logo-icon/logo-icon-white.png" alt="Tu Potencial" class="hoy__hero-logo" />
    </div>

    <div class="hoy__hero-progress">
      <div class="hoy__hero-progress-row">
        <span class="hoy__hero-label">RETOS ACTIVOS</span>
        <span class="hoy__hero-count"><Icon name="lucide:star" size="14" /> {{ retosCompleted }} / {{ retosTotal }}</span>
      </div>
      <div class="hoy__hero-bar">
        <div class="hoy__hero-bar-fill" :style="{ width: retosProgressWidth }" />
      </div>
      <NuxtLink to="/retos" class="hoy__hero-link">Ver todos los retos →</NuxtLink>
    </div>

    <div class="screen__content">
      <!-- Featured card (inspired by n2 "Featured Collection") -->
      <section class="hoy__featured">
        <h2 class="title title--md hoy__featured-title">Recomendado para ti</h2>
        <NuxtLink to="/hoy/checkin" class="hoy__featured-card">
          <div class="hoy__featured-text">
            <p class="eyebrow eyebrow--sm">{{ dailyPlan.eyebrow }}</p>
            <h3 class="hoy__featured-name">{{ dailyPlan.title }}</h3>
            <p class="hoy__featured-desc">{{ dailyPlan.message }}</p>
          </div>
          <div class="hoy__featured-visual">
            <img src="/logo-icon/logo-icon-white.png" alt="" />
          </div>
        </NuxtLink>
      </section>

      <!-- Start your day (inspired by n2 activity list) -->
      <section class="hoy__start">
        <h2 class="title title--md hoy__start-title">Empieza tu día</h2>
        <div class="hoy__start-list">
          <NuxtLink
            v-for="activity in activities"
            :key="activity.id"
            :to="activity.to"
            class="hoy__activity"
          >
            <div class="hoy__activity-thumb" :style="{ background: activity.bg }">
              <Icon :name="activity.icon" size="20" />
            </div>
            <div class="hoy__activity-info">
              <h3 class="hoy__activity-name">{{ activity.title }}</h3>
              <p class="hoy__activity-meta">{{ activity.meta }}</p>
            </div>
            <Icon name="lucide:chevron-right" size="16" class="hoy__activity-arrow" />
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// Mock retos progress
const activeRetos = ref([
  { title: 'Reto 7 días de gratitud', currentDay: 5, totalDays: 7 },
  { title: 'Despertar consciente', currentDay: 12, totalDays: 30 },
])

const retosCompleted = computed(() =>
  activeRetos.value.filter(r => r.currentDay >= r.totalDays).length,
)
const retosTotal = computed(() => activeRetos.value.length)
const retosProgressWidth = computed(() => {
  if (!activeRetos.value.length) return '0%'
  const totalDays = activeRetos.value.reduce((sum, r) => sum + r.totalDays, 0)
  const completedDays = activeRetos.value.reduce((sum, r) => sum + r.currentDay, 0)
  return `${Math.round((completedDays / totalDays) * 100)}%`
})

// Mock daily plan
const dailyPlan = ref({
  eyebrow: 'TU ACCIÓN DEL DÍA',
  title: 'Prioriza una sola cosa',
  message: 'Enfoca tu energía en una acción clave. Hazla con intención.',
})

// Activities list
const activities = ref([
  {
    id: 'checkin',
    title: 'Completa tu check-in',
    meta: 'Reflexión diaria • 3 min',
    icon: 'lucide:pen-line',
    bg: 'linear-gradient(135deg, var(--color-navy), var(--color-green))',
    to: '/hoy/checkin',
  },
  {
    id: 'reto-gratitud',
    title: 'Reto de gratitud — Día 5',
    meta: 'Reto activo • 5 min',
    icon: 'lucide:heart-handshake',
    bg: 'linear-gradient(135deg, var(--color-green), #A7A68E)',
    to: '/retos/mock-prog-001/day/5',
  },
  {
    id: 'library-rec',
    title: 'Respiración consciente',
    meta: 'Audio • 8 min',
    icon: 'lucide:wind',
    bg: 'linear-gradient(135deg, #28374A, var(--color-navy))',
    to: '/library',
  },
  {
    id: 'ai-coach',
    title: 'Habla con tu coach',
    meta: 'AI Coach • Sin límite',
    icon: 'lucide:bot',
    bg: 'linear-gradient(135deg, var(--color-dark), #28374A)',
    to: '/ai/chat/new',
  },
])
</script>

<style scoped>
/* ─── Hero header (dark branded card from top) ─── */
.hoy__hero {
  background: radial-gradient(ellipse at -11% 18%, rgb(174 174 174 / 14%) 0%, transparent 55%), #28282800;
  padding: var(--space-5) var(--space-5) 0;
}

.hoy__hero-logo {
  height: 36px;
  width: auto;
  margin-bottom: var(--space-5);
}

.hoy__hero-progress {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #28313c6b;
  border-radius: 0 0 var(--radius-2xl) var(--radius-2xl);
  padding: var(--space-3) var(--space-5) var(--space-5);
  margin-bottom: var(--space-5);
  box-shadow: 2px 19px 24px rgb(0 0 0 / 14%);
  backdrop-filter: blur(5px);
}

.hoy__hero-progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.hoy__hero-label {
  font-family: var(--font-eyebrow);
  font-weight: var(--weight-bold);
  font-size: var(--eyebrow-sm);
  letter-spacing: 0.08em;
  color: #fff;
}

.hoy__hero-count {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: #fff;
}

.hoy__hero-bar {
  height: 4px;
  background: #ffffff30;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.hoy__hero-bar-fill {
  height: 100%;
  background: white;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.hoy__hero-link {
  display: block;
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: #fff;
}
.hoy__hero-link:hover {
  color: #fff;
  text-decoration: none;
}

/* ─── Featured card ─── */
.hoy__featured {
  margin-bottom: var(--space-8);
}

.hoy__featured-title {
  margin-bottom: var(--space-4);
}

.hoy__featured-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: #ffffff14;
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: white;
  transition: background var(--transition-fast);
}

.hoy__featured-card:hover {
  background: #ffffff30;
  text-decoration: none;
}

.hoy__featured-text {
  flex: 1;
  min-width: 0;
}

.hoy__featured-name {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  color: white;
  margin: var(--space-1) 0 var(--space-2);
  line-height: var(--leading-snug);
}

.hoy__featured-desc {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.6);
  line-height: var(--leading-relaxed);
}

.hoy__featured-visual {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-navy), var(--color-green));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hoy__featured-visual img {
  height: 36px;
  width: auto;
  opacity: 0.6;
}

/* ─── Start your day ─── */
.hoy__start {
  margin-bottom: var(--space-6);
}

.hoy__start-title {
  margin-bottom: var(--space-4);
}

.hoy__start-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.hoy__activity {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: #ffffff21;
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: white;
  transition: background var(--transition-fast);
}

.hoy__activity:hover {
  background: #ffffff30;
  text-decoration: none;
}

.hoy__activity-thumb {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.hoy__activity-info {
  flex: 1;
  min-width: 0;
}

.hoy__activity-name {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: white;
  line-height: var(--leading-snug);
}

.hoy__activity-meta {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.hoy__activity-arrow {
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}
</style>
