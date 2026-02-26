<template>
  <div class="screen">
    <!-- Branded header (logo scrolls away, progress sticks) -->
    <div class="hoy__hero">
      <div class="hoy__hero-top">
        <img src="/logo-word/logo-word-white.png" alt="Tu Potencial" class="hoy__hero-logo" />
        <NuxtLink to="/hoy/progress" class="hoy__streak-badge">
          <Icon name="lucide:flame" size="16" class="hoy__streak-icon" />
          <span class="hoy__streak-count">{{ streak }}</span>
        </NuxtLink>
      </div>
      <h1 class="hoy__greeting">{{ greeting }}</h1>
    </div>

    <NuxtLink to="/hoy/progress" class="hoy__hero-progress">
      <div class="hoy__hero-progress-row">
        <span class="hoy__hero-label">{{ currentRetoLabel }}</span>
        <span class="hoy__hero-count"><Icon name="lucide:star" size="14" /> {{ retosCompleted }} / {{ retosTotal }}</span>
      </div>
      <div class="hoy__hero-bar">
        <div class="hoy__hero-bar-fill" :style="{ width: animatedProgressWidth }" />
      </div>
      <span class="hoy__hero-link">Ver progreso <Icon name="lucide:chevron-right" size="12" /></span>
    </NuxtLink>

    <div class="screen__content">

      <!-- Daily retos task list / Celebration state -->
      <section class="hoy__retos">
        <Transition name="fade" mode="out-in">
          <!-- Celebration state when all complete -->
          <NuxtLink v-if="allRetosComplete" key="complete" to="/hoy/progress" class="hoy__celebration">
            <div class="hoy__celebration-icon">
              <Icon name="lucide:party-popper" size="32" />
            </div>
            <div class="hoy__celebration-text">
              <p class="hoy__celebration-title">Dia completado</p>
              <p class="hoy__celebration-sub">Racha de {{ streak + 1 }} dias. Ver tu progreso <Icon name="lucide:arrow-right" size="14" /></p>
            </div>
          </NuxtLink>

          <!-- Task list when not all complete -->
          <div v-else key="tasks" class="hoy__retos-list">
            <button
              v-for="reto in dailyRetos"
              :key="reto.id"
              class="hoy__reto-item"
              :class="{ 'hoy__reto-item--done': reto.completed }"
              @click="handleRetoTap(reto.type)"
            >
              <span class="hoy__reto-check">
                <Icon v-if="reto.completed" name="lucide:check-circle-2" size="20" />
                <Icon v-else name="lucide:circle" size="20" />
              </span>
              <span class="hoy__reto-label">{{ reto.title }}</span>
              <Icon name="lucide:chevron-right" size="16" class="hoy__reto-arrow" />
            </button>
          </div>
        </Transition>
      </section>

      <!-- Featured card — opens "accion del dia" sheet -->
      <section class="hoy__featured">
        <button class="hoy__featured-card" @click="activeSheet = 'accion'">
          <img src="/images/rojo-carlotta.jpg" alt="" class="hoy__featured-img" />
          <div class="hoy__featured-overlay">
            <span class="hoy__featured-eyebrow">{{ dailyPlan.eyebrow }}</span>
            <h3 class="hoy__featured-name">{{ dailyPlan.title }}</h3>
            <p class="hoy__featured-desc">{{ dailyPlan.message }}</p>
          </div>
        </button>
      </section>

      <!-- Mensaje del dia -->
      <section class="hoy__mensaje">
        <div class="hoy__mensaje-card">
          <Icon name="lucide:quote" size="18" class="hoy__mensaje-icon" />
          <p class="hoy__mensaje-text">{{ mensajeDelDia.text }}</p>
          <div class="hoy__mensaje-author">
            <img :src="`/images/${mensajeDelDia.author}.png`" :alt="mensajeDelDia.author" class="hoy__mensaje-avatar" />
            <span class="hoy__mensaje-name">{{ mensajeDelDia.author === 'gabriel' ? 'Gabriel' : 'Carlotta' }}</span>
          </div>
        </div>
      </section>

      <!-- Continue active programs -->
      <section v-if="activePrograms.length" class="hoy__continue">
        <h2 class="title title--md hoy__continue-title">Continua</h2>
        <div class="hoy__continue-scroll">
          <NuxtLink
            v-for="prog in activePrograms"
            :key="prog.id"
            :to="`/retos/${prog.id}`"
            class="hoy__continue-card"
          >
            <div class="hoy__continue-progress">
              <svg viewBox="0 0 36 36" class="hoy__continue-ring">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ffffff15" stroke-width="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke="var(--color-sand)"
                  stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="`${prog.progressPct * 97.4} 97.4`"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <span class="hoy__continue-day">{{ prog.currentDay }}</span>
            </div>
            <div class="hoy__continue-info">
              <span class="hoy__continue-name">{{ prog.title }}</span>
              <span class="hoy__continue-meta">Dia {{ prog.currentDay }} de {{ prog.totalDays }}</span>
            </div>
            <Icon name="lucide:chevron-right" size="16" class="hoy__continue-arrow" />
          </NuxtLink>
        </div>
      </section>

      <!-- Latest from Biblioteca -->
      <section class="hoy__latest">
        <div class="hoy__latest-header">
          <h2 class="title title--md">Recientes</h2>
          <NuxtLink to="/library" class="hoy__latest-see-all">Ver todo</NuxtLink>
        </div>
        <div class="hoy__latest-scroll">
          <NuxtLink
            v-for="item in latestContent"
            :key="item.id"
            :to="item.to"
            class="hoy__latest-card"
          >
            <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="hoy__latest-img" />
            <div class="hoy__latest-overlay">
              <Icon :name="contentTypeIcon(item.type)" size="14" class="hoy__latest-type-label" />
              <span class="hoy__latest-title">{{ item.title }}</span>
              <span v-if="item.duration" class="hoy__latest-duration"><Icon class="clock-icon" name="lucide:clock" size="12" /> {{ item.duration }}</span>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Explore -->
      <section class="hoy__start">
        <h2 class="title title--md hoy__start-title">Explora</h2>
        <div class="hoy__start-list">
          <template v-for="activity in activities" :key="activity.id">
            <NuxtLink
              :to="activity.to"
              :class="['hoy__activity', { 'hoy__activity--wide': activity.id === 'ai-coach' }]"
              :style="{ '--activity-accent': activity.accent }"
            >
              <span v-if="activity.featured" class="hoy__activity-badge">Nuevo</span>
              <div class="hoy__activity-thumb">
                <Icon :name="activity.icon" size="28" />
              </div>
              <div class="hoy__activity-info">
                <h3 class="hoy__activity-name">{{ activity.title }}</h3>
                <p class="hoy__activity-meta">{{ activity.meta }}</p>
              </div>
            </NuxtLink>
          </template>
        </div>
      </section>

    </div>

    <!-- Check-in slideover -->
    <div
      class="hoy__overlay"
      :class="{ 'hoy__overlay--active': activeSheet === 'checkin' }"
      @click.self="activeSheet = 'none'"
    >
      <div class="hoy__sheet">
        <div class="hoy__sheet-header">
          <div class="hoy__sheet-handle" />
          <button class="hoy__sheet-close" aria-label="Cerrar" @click="activeSheet = 'none'">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <Transition name="fade" mode="out-in">
          <!-- Success state -->
          <div v-if="checkinSuccess" key="success" class="hoy__checkin-success">
            <div class="hoy__checkin-success-badge"><Icon name="lucide:trophy" size="48" /></div>
            <p class="hoy__checkin-success-streak">{{ streak + 1 }} dias</p>
            <p class="hoy__checkin-success-msg">{{ streakMessage }}</p>
            <UiButton block variant="secondary" @click="closeCheckinSheet">Listo</UiButton>
          </div>

          <!-- Form state -->
          <div v-else key="form">
            <h1 class="hoy__sheet-title">Como te sientes hoy?</h1>
            <p class="hoy__sheet-subtitle">Tomate un momento para reflexionar sobre tu estado actual.</p>

            <!-- Mood selector -->
            <div class="hoy__checkin-moods">
              <button
                v-for="mood in moods"
                :key="mood.value"
                :class="['hoy__checkin-mood', { 'hoy__checkin-mood--selected': selectedMood === mood.value }]"
                :style="selectedMood === mood.value ? { background: mood.color, borderColor: mood.color } : {}"
                @click="selectedMood = mood.value"
              >
                <span class="hoy__checkin-mood-emoji"><Icon :name="mood.emoji" size="24" /></span>
                <span class="hoy__checkin-mood-label">{{ mood.label }}</span>
              </button>
            </div>

            <!-- Reflection -->
            <UiTextarea
              v-model="checkinReflection"
              label="Reflexion (opcional)"
              placeholder="Que quieres lograr hoy?"
              :rows="3"
            />

            <UiButton block :loading="checkinLoading" :disabled="!selectedMood" class="hoy__checkin-submit" @click="handleCheckin">
              Completar check-in
            </UiButton>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Accion del dia slideover -->
    <div
      class="hoy__overlay"
      :class="{ 'hoy__overlay--active': activeSheet === 'accion' }"
      @click.self="activeSheet = 'none'"
    >
      <div class="hoy__sheet">
        <div class="hoy__sheet-header">
          <div class="hoy__sheet-handle" />
          <button class="hoy__sheet-close" aria-label="Cerrar" @click="activeSheet = 'none'">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <Transition name="fade" mode="out-in">
          <!-- Success state -->
          <div v-if="accionSuccess" key="success" class="hoy__checkin-success">
            <div class="hoy__checkin-success-badge"><Icon name="lucide:check-circle" size="48" /></div>
            <p class="hoy__checkin-success-streak">{{ accionChoice === 'done' ? 'Accion completada' : 'Listo para manana' }}</p>
            <p class="hoy__checkin-success-msg">{{ accionChoice === 'done' ? 'Excelente trabajo hoy. Cada accion cuenta.' : 'No pasa nada. Manana es una nueva oportunidad.' }}</p>
            <UiButton block variant="secondary" @click="closeAccionSheet">Listo</UiButton>
          </div>

          <!-- Form state -->
          <div v-else key="form">
            <h1 class="hoy__sheet-title">{{ dailyPlan.title }}</h1>
            <p class="hoy__sheet-subtitle">{{ dailyPlan.message }}</p>

            <div class="hoy__accion-options">
              <button
                :class="['hoy__accion-option', { 'hoy__accion-option--selected': accionChoice === 'done' }]"
                @click="accionChoice = 'done'"
              >
                <span class="hoy__accion-option-icon"><Icon name="lucide:check-circle" size="24" /></span>
                <span class="hoy__accion-option-text">Hoy cumpli con la accion del dia</span>
              </button>

              <button
                :class="['hoy__accion-option', { 'hoy__accion-option--selected': accionChoice === 'skip' }]"
                @click="accionChoice = 'skip'"
              >
                <span class="hoy__accion-option-icon"><Icon name="lucide:arrow-right-circle" size="24" /></span>
                <span class="hoy__accion-option-text">Hoy no cumpli, estoy listo para manana</span>
              </button>
            </div>

            <UiButton block :loading="accionLoading" :disabled="!accionChoice" @click="handleAccion">
              Confirmar
            </UiButton>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()

// ─── Time-aware greeting ───
const greeting = computed(() => {
  const name = user.value?.display_name?.split(' ')[0] ?? ''
  const hour = new Date().getHours()
  let saludo = 'Buenos dias'
  if (hour >= 12 && hour < 18) saludo = 'Buenas tardes'
  else if (hour >= 18) saludo = 'Buenas noches'
  return name ? `${saludo}, ${name}` : saludo
})

// ─── Streak ───
const streak = ref(7)

const streakMessage = computed(() => {
  const next = streak.value + 1
  if (next >= 30) return 'Increible disciplina! Un mes completo.'
  if (next >= 14) return 'Dos semanas seguidas! Vas imparable.'
  if (next >= 7) return 'Una semana completa! Sigue asi.'
  if (next >= 3) return 'Buen comienzo! Ya llevas 3 dias.'
  return 'Sigue asi!'
})

// ─── Daily retos queue (2 items: check-in + admin-configurable action) ───
const dailyRetos = ref([
  { id: 'checkin', type: 'checkin' as const, title: 'Completa tu check-in', completed: false },
  { id: 'accion', type: 'accion' as const, title: 'Accion del dia', completed: false },
])

const retosCompleted = computed(() => dailyRetos.value.filter(r => r.completed).length)
const retosTotal = computed(() => dailyRetos.value.length)
const allRetosComplete = computed(() => retosCompleted.value === retosTotal.value)
const currentReto = computed(() => dailyRetos.value.find(r => !r.completed) ?? dailyRetos.value[dailyRetos.value.length - 1]!)
const currentRetoLabel = computed(() => {
  if (allRetosComplete.value) return 'RETOS COMPLETADOS'
  return currentReto.value.title.toUpperCase()
})
const retosProgressWidth = computed(() => {
  if (!retosTotal.value) return '0%'
  return `${Math.round((retosCompleted.value / retosTotal.value) * 100)}%`
})

// Animate progress bar on mount
const animatedProgressWidth = ref('0%')
onMounted(() => {
  requestAnimationFrame(() => {
    setTimeout(() => {
      animatedProgressWidth.value = retosProgressWidth.value
    }, 300)
  })
})
watch(retosProgressWidth, (val) => {
  animatedProgressWidth.value = val
})

function completeReto(type: 'checkin' | 'accion') {
  const reto = dailyRetos.value.find(r => r.type === type)
  if (reto) reto.completed = true
}

function handleRetoTap(type: 'checkin' | 'accion') {
  const reto = dailyRetos.value.find(r => r.type === type)
  if (reto?.completed) return
  if (type === 'checkin') activeSheet.value = 'checkin'
  else activeSheet.value = 'accion'
}

// ─── Mensaje del dia (admin-configurable) ───
const mensajeDelDia = ref({
  text: 'El exito no es la clave de la felicidad. La felicidad es la clave del exito.',
  author: 'gabriel' as 'gabriel' | 'carlotta',
})

// ─── Mock daily plan ───
const dailyPlan = ref({
  eyebrow: 'Accion del dia',
  title: 'Prioriza una sola cosa',
  message: 'Enfoca tu energia en una accion clave. Hazla con intencion.',
})

// ─── Active programs (mock) ───
const activePrograms = ref([
  { id: 'mock-uuid-prog-001', title: 'Reto 7 dias de gratitud', currentDay: 4, totalDays: 7, progressPct: 4 / 7 },
  { id: 'mock-uuid-prog-002', title: 'Despertar consciente', currentDay: 12, totalDays: 30, progressPct: 12 / 30 },
])

// ─── Latest from biblioteca (mock — most recent published) ───
const latestContent = ref([
  {
    id: 'mock-uuid-ci-001',
    type: 'video' as const,
    typeLabel: 'Video',
    title: 'Meditacion matutina: Gratitud y presencia',
    thumbnail: '/images/lib-1.jpg',
    duration: '10 min',
    to: '/library/mock-uuid-ci-001',
  },
  {
    id: 'mock-uuid-ci-002',
    type: 'video' as const,
    typeLabel: 'Video',
    title: 'Rutina energizante de 5 minutos',
    thumbnail: '/images/lib-2.jpg',
    duration: '5 min',
    to: '/library/mock-uuid-ci-002',
  },
  {
    id: 'mock-uuid-ci-003',
    type: 'video' as const,
    typeLabel: 'Video',
    title: 'Respiracion 4-7-8 para calmar la ansiedad',
    thumbnail: '/images/lib-3.jpg',
    duration: '8 min',
    to: '/library/mock-uuid-ci-003',
  },
])

function contentTypeIcon(type: string) {
  switch (type) {
    case 'video': return 'lucide:video'
    case 'audio': return 'lucide:headphones'
    case 'text': return 'lucide:file-text'
    case 'link': return 'lucide:external-link'
    default: return 'lucide:file'
  }
}

// ─── App sections ───
const activities = ref([
  {
    id: 'ai-coach',
    title: 'Mi Coach IA',
    meta: 'Tu coach personal',
    icon: 'lucide:bot',
    accent: '#9AB3C7',
    to: '/ai',
    featured: true,
  },
  {
    id: 'eventos',
    title: 'Eventos',
    meta: 'En vivo y grabados',
    icon: 'lucide:calendar',
    accent: '#C08A8A',
    to: '/events',
    featured: false,
  },
  {
    id: 'vip',
    title: 'VIP',
    meta: 'Acceso premium',
    icon: 'lucide:crown',
    accent: '#C9A88E',
    to: '/addons',
    featured: false,
  },
])

// ─── Sheet state ───
const activeSheet = ref<'none' | 'checkin' | 'accion'>('none')

// ─── Check-in state ───
const selectedMood = ref<string | null>(null)
const checkinReflection = ref('')
const checkinLoading = ref(false)
const checkinSuccess = ref(false)

const moods = [
  { value: 'great', emoji: 'lucide:laugh', label: 'Increible', color: '#4ECDC4' },
  { value: 'good', emoji: 'lucide:smile', label: 'Bien', color: '#A8D86E' },
  { value: 'ok', emoji: 'lucide:meh', label: 'Regular', color: '#F5D547' },
  { value: 'low', emoji: 'lucide:frown', label: 'Bajo', color: '#F09A5E' },
  { value: 'tough', emoji: 'lucide:annoyed', label: 'Dificil', color: '#E05A5A' },
]

async function handleCheckin() {
  if (!selectedMood.value) return
  checkinLoading.value = true
  await new Promise(r => setTimeout(r, 800))
  checkinLoading.value = false
  checkinSuccess.value = true
  completeReto('checkin')
}

function closeCheckinSheet() {
  activeSheet.value = 'none'
  // Reset after sheet transition finishes
  setTimeout(() => {
    selectedMood.value = null
    checkinReflection.value = ''
    checkinSuccess.value = false
  }, 400)
}

// ─── Accion del dia state ───
const accionChoice = ref<'done' | 'skip' | null>(null)
const accionLoading = ref(false)
const accionSuccess = ref(false)

async function handleAccion() {
  if (!accionChoice.value) return
  accionLoading.value = true
  await new Promise(r => setTimeout(r, 600))
  accionLoading.value = false
  accionSuccess.value = true
  completeReto('accion')
}

function closeAccionSheet() {
  activeSheet.value = 'none'
  setTimeout(() => {
    accionChoice.value = null
    accionSuccess.value = false
  }, 400)
}
</script>

<style scoped>

/* ─── Hero header ─── */
.hoy__hero {
  background: radial-gradient(ellipse at -11% 18%, rgb(174 174 174 / 14%) 0%, transparent 55%), #282828c2;
  padding: var(--space-5) var(--space-5) 0;
}

.hoy__hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.hoy__hero-logo {
  height: 20px;
  width: auto;
}

/* ─── Streak badge ─── */
.hoy__streak-badge {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3) var(--space-1) var(--space-2);
  background: linear-gradient(135deg, rgba(255, 170, 50, 0.25), rgba(255, 120, 30, 0.2));
  border: 1px solid rgba(255, 170, 50, 0.3);
  border-radius: var(--radius-full);
  text-decoration: none;
  transition: background var(--transition-fast);
}

.hoy__streak-badge:hover {
  background: linear-gradient(135deg, rgba(255, 170, 50, 0.35), rgba(255, 120, 30, 0.3));
  text-decoration: none;
}

.hoy__streak-icon {
  color: #ffaa32;
}

.hoy__streak-count {
  font-family: var(--font-eyebrow);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: #ffaa32;
  letter-spacing: 0.02em;
}

/* ─── Greeting ─── */
.hoy__greeting {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: white;
  line-height: var(--leading-tight);
  margin-bottom: var(--space-1);
  margin-top: var(--space-5);
  font-weight: 100;
}

/* ─── Progress bar ─── */
.hoy__hero-progress {
  display: block;
  position: sticky;
  top: 0;
  z-index: 100;
  background: #282828b5;
  border-radius: 0 0 var(--radius-2xl) var(--radius-2xl);
  padding: var(--space-3) var(--space-5) var(--space-3);
  margin-bottom: var(--space-5);
  box-shadow: 0px 1px 0px rgb(255 255 255 / 16%);
  backdrop-filter: blur(5px);
  text-decoration: none;
  color: inherit;
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

.hoy__hero-count > span {
  font-size: 14px;
  top: 2px;
  position: relative;
  margin-right: 4px;
  color: #ffe726;
}

.hoy__hero-link {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  margin-top: var(--space-3);
  letter-spacing: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
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
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ─── Daily retos task list ─── */
.hoy__retos {
  margin-bottom: var(--space-6);
}

.hoy__retos-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.hoy__reto-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: #ffffff12;
    border-radius: var(--radius-xl);
    box-shadow: 0px 0px 2px #ffffff78;
    border: none;
    color: white;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    width: 100%;
    transition: background var(--transition-fast);
}

.hoy__reto-item:hover {
  background: #ffffff20;
}

.hoy__reto-item--done {
  opacity: 0.5;
}

.hoy__reto-item--done .hoy__reto-label {
  text-decoration: line-through;
}

.hoy__reto-check {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
}

.hoy__reto-item--done .hoy__reto-check {
  color: #A8D86E;
}

.hoy__reto-label {
  flex: 1;
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  line-height: var(--leading-snug);
}

.hoy__reto-arrow {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.3);
}

.hoy__reto-item--done .hoy__reto-arrow {
  display: none;
}

/* ─── Celebration state ─── */
.hoy__celebration {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.15), rgba(168, 216, 110, 0.12));
  border: 1px solid rgba(168, 216, 110, 0.25);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: inherit;
}

.hoy__celebration-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(168, 216, 110, 0.2);
  border-radius: var(--radius-lg);
  color: #A8D86E;
}

.hoy__celebration-text {
  flex: 1;
  min-width: 0;
}

.hoy__celebration-title {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: white;
  line-height: var(--leading-snug);
}

.hoy__celebration-sub {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
  line-height: var(--leading-normal);
}

/* ─── Mensaje del dia ─── */
.hoy__mensaje {
  margin-bottom: var(--space-6);
  position: relative;
}

.hoy__mensaje-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-5);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding-right: var(--space-10);
}

.hoy__mensaje-icon {
  flex-shrink: 0;
  color: rgba(0, 0, 0, 0.35);
  font-size: 1rem;
  margin-left: auto;
  position: absolute;
  right: var(--space-5);
}

.hoy__mensaje-text {
  font-size: 1rem;
  font-weight: var(--weight-medium);
  line-height: var(--leading-relaxed);
  color: var(--color-dark);
  font-style: italic;
  padding-block: 0.5rem;
}

.hoy__mensaje-author {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-1);
  align-self: flex-end;
  position: relative;
  right: calc(-1 * var(--space-5));
}

.hoy__mensaje-avatar {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.hoy__mensaje-name {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: rgba(0, 0, 0, 0.45);
}

/* ─── Featured card ─── */
.hoy__featured {
  margin-bottom: var(--space-8);
}

.hoy__featured-card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  background: #000;
}

.hoy__featured-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  object-position: bottom;
}

.hoy__featured-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-5);
  backdrop-filter: blur(12px);
  background: #6d6d6d08;
}

.hoy__featured-eyebrow {
  display: block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: white;
  margin-bottom: var(--space-1);
}

.hoy__featured-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: white;
  margin: 0 0 var(--space-1);
  line-height: var(--leading-snug);
}

.hoy__featured-desc {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.7);
  line-height: var(--leading-normal);
}

/* ─── Continue active programs ─── */
.hoy__continue {
  margin-bottom: var(--space-8);
}

.hoy__continue-title {
  margin-bottom: var(--space-4);
}

.hoy__continue-scroll {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.hoy__continue-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: #ffffff12;
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: white;
  box-shadow: 0px 0px 2px #ffffff78;
  transition: background var(--transition-fast);
}

.hoy__continue-card:hover {
  background: #ffffff20;
  text-decoration: none;
}

.hoy__continue-progress {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.hoy__continue-ring {
  width: 100%;
  height: 100%;
}

.hoy__continue-day {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: white;
  transform: translateY(3px);
}

.hoy__continue-info {
  flex: 1;
  min-width: 0;
}

.hoy__continue-name {
  display: block;
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hoy__continue-meta {
  display: block;
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.hoy__continue-arrow {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.3);
}

/* ─── Latest from Biblioteca ─── */
.hoy__latest {
  margin-bottom: var(--space-8);
}

.hoy__latest-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.hoy__latest-see-all {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: white;
  text-decoration: none;
}

.hoy__latest-scroll {
  display: flex;
  gap: var(--space-3);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline-start: var(--space-5);
  -webkit-overflow-scrolling: touch;
  margin: 0 calc(-1 * var(--space-5));
}

.hoy__latest-scroll::before,
.hoy__latest-scroll::after {
  content: '';
  flex: 0 0 var(--space-5);
}

.hoy__latest-scroll::-webkit-scrollbar { display: none; }

.hoy__latest-card {
  flex: 0 0 85%;
  scroll-snap-align: start;
  text-decoration: none;
  color: white;
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  aspect-ratio: 3 / 2;
}

.hoy__latest-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hoy__latest-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-5);
  background: linear-gradient(to top, rgb(0 0 0) 0%, rgb(0 0 0 / 60%) 36%, transparent 100%);
}

.hoy__latest-type {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  /* font-weight: 800; */
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--space-1);
  font-family: var(--font-eyebrow);
}

.hoy__latest-type-label {
  position: absolute;
  bottom: var(--space-5);
  right: var(--space-5);
  padding: var(--space-1);
  border-radius: 4px;
  font-size: 10px;
}

.hoy__latest-title {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  font-weight: var(--weight-bold);
  line-height: var(--leading-snug);
  color: white;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: var(--space-1);
}

.hoy__latest-duration {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: var(--space-2);
  font-family: var(--font-eyebrow);
  text-transform: uppercase;
}

/* ─── Explore grid ─── */
.hoy__start {
  margin-bottom: var(--space-6);
}

.hoy__start-title {
  margin-bottom: var(--space-4);
}

.hoy__start-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.hoy__activity {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
  background: #ffffff12;
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: white;
  transition: background var(--transition-fast);
  border: none;
  width: 100%;
  text-align: center;
  cursor: pointer;
  font-family: inherit;
  align-items: center;
  box-shadow: 0px 0px 2px #ffffff78;
}

.hoy__activity-badge {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  background: rgba(154, 179, 199, 0.25);
  color: #9AB3C7;
}

.hoy__activity--wide {
  grid-column: 1 / -1;
  flex-direction: row;
  text-align: left;
  gap: var(--space-4);
  background: linear-gradient(330deg, rgb(154 179 199 / 35%) 0%, rgba(32, 32, 32, 0) 100%);
}

.hoy__activity:hover {
  background: #ffffff25;
  text-decoration: none;
}

.hoy__activity-thumb {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-sand);
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

/* ─── Sheet overlay ─── */
.hoy__overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  pointer-events: none;
  transition: background var(--transition-base);
}

.hoy__overlay--active {
  background: rgba(0, 0, 0, 0.4);
  pointer-events: auto;
}

.hoy__sheet {
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--space-2) var(--space-6) var(--space-10);
  max-height: 85dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.hoy__overlay--active .hoy__sheet {
  transform: translateY(0);
}

.hoy__sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-9);
}

.hoy__sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin-top: var(--space-2);
}

.hoy__sheet-close {
  position: absolute;
  right: 0;
  top: 10px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.hoy__sheet-close:hover {
  background: var(--color-border-light);
}

.hoy__sheet-title {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-3);
  font-weight: 100;
}

.hoy__sheet-subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-6);
}

/* ─── Check-in sheet content ─── */
.hoy__checkin-moods {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.hoy__checkin-mood {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface-alt);
  color: var(--color-text);
  cursor: pointer;
  flex: 1;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.hoy__checkin-mood:hover {
  border-color: var(--color-text-secondary);
}

.hoy__checkin-mood--selected {
  background: var(--color-sand);
  color: white;
  border-color: var(--color-sand);
}

.hoy__checkin-mood-emoji { font-size: 1.5rem; }

.hoy__checkin-mood-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
}

.hoy__checkin-mood--selected .hoy__checkin-mood-label {
  color: white;
}

.hoy__checkin-submit { margin-top: var(--space-6); }

/* ─── Check-in success ─── */
.hoy__checkin-success {
  text-align: center;
  padding: var(--space-6) 0 var(--space-2);
}

.hoy__checkin-success-badge {
  margin-bottom: var(--space-3);
  color: var(--color-primary);
  animation: success-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes success-bounce {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

.hoy__checkin-success-streak {
  font-family: var(--font-title);
  font-size: var(--title-lg);
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-1);
}

.hoy__checkin-success-msg {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

/* ─── Accion del dia sheet content ─── */
.hoy__accion-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.hoy__accion-option {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.hoy__accion-option:hover {
  border-color: var(--color-text-secondary);
}

.hoy__accion-option--selected {
  border-color: var(--color-primary);
  background: white;
}

.hoy__accion-option-icon {
  flex-shrink: 0;
  color: var(--color-muted);
}

.hoy__accion-option--selected .hoy__accion-option-icon {
  color: var(--color-primary);
}

.hoy__accion-option-text {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  line-height: var(--leading-snug);
}

/* ─── Transitions ─── */
.fade-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from { opacity: 0; transform: translateY(8px); }
.fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .hoy__overlay,
  .hoy__sheet,
  .hoy__hero-bar-fill,
  .fade-enter-active,
  .fade-leave-active,
  .hoy__checkin-success-badge {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>
