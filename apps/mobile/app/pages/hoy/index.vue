<template>
  <div class="screen">
    <!-- Branded header (logo scrolls away, progress sticks) -->
    <div class="hoy__hero">
      <img src="/logo-word/logo-word-white.png" alt="Tu Potencial" class="hoy__hero-logo" />
    </div>

    <div class="hoy__hero-progress">
      <div class="hoy__hero-progress-row">
        <span class="hoy__hero-label">{{ currentRetoLabel }}</span>
        <span class="hoy__hero-count"><Icon name="lucide:star" size="14" /> {{ retosCompleted }} / {{ retosTotal }}</span>
      </div>
      <div class="hoy__hero-bar">
        <div class="hoy__hero-bar-fill" :style="{ width: retosProgressWidth }" />
      </div>
      <NuxtLink to="/retos" class="hoy__hero-link">Ver todos los retos →</NuxtLink>
    </div>

    <div class="screen__content">
      <!-- Mensaje del día -->
      <section class="hoy__mensaje">
        <div class="hoy__mensaje-card">
          <Icon name="lucide:quote" size="18" class="hoy__mensaje-icon" />
          <p class="hoy__mensaje-text">{{ mensajeDelDia }}</p>
          <div class="hoy__mensaje-author">
            <img src="https://i.pravatar.cc/80?img=12" alt="Avatar" class="hoy__mensaje-avatar" />
            <span class="hoy__mensaje-name">Gabriel</span>
          </div>
        </div>
      </section>

      <!-- Daily check-in button -->
      <button class="hoy__checkin-btn" @click="activeSheet = 'checkin'">
        Completa tu check-in
      </button>

      <!-- Featured card — opens "acción del día" sheet -->
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

      <!-- Start your day -->
      <section class="hoy__start">
        <h2 class="title title--md hoy__start-title">Recomendado para ti</h2>
        <div class="hoy__start-list">
          <template v-for="activity in activities" :key="activity.id">
            <NuxtLink
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
          </template>
        </div>
      </section>

    </div>

    <!-- ═══ Check-in slideover ═══ -->
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

        <h1 class="hoy__sheet-title">¿Cómo te sientes hoy?</h1>
        <p class="hoy__sheet-subtitle">Tómate un momento para reflexionar sobre tu estado actual.</p>

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
          label="Reflexión (opcional)"
          placeholder="¿Qué quieres lograr hoy?"
          :rows="3"
        />

        <UiButton block :loading="checkinLoading" :disabled="!selectedMood" class="hoy__checkin-submit" @click="handleCheckin">
          Completar check-in
        </UiButton>

        <!-- Success state -->
        <Transition name="fade">
          <div v-if="checkinSuccess" class="hoy__checkin-success">
            <div class="hoy__checkin-success-badge"><Icon name="lucide:trophy" size="48" /></div>
            <p>Tu racha es de <strong>{{ streak + 1 }} días</strong>. ¡Sigue así!</p>
            <UiButton block variant="secondary" @click="closeCheckinSheet">Listo</UiButton>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ═══ Acción del día slideover ═══ -->
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

        <h1 class="hoy__sheet-title">{{ dailyPlan.title }}</h1>
        <p class="hoy__sheet-subtitle">{{ dailyPlan.message }}</p>

        <div class="hoy__accion-options">
          <button
            :class="['hoy__accion-option', { 'hoy__accion-option--selected': accionChoice === 'done' }]"
            @click="accionChoice = 'done'"
          >
            <span class="hoy__accion-option-icon"><Icon name="lucide:check-circle" size="24" /></span>
            <span class="hoy__accion-option-text">Hoy cumplí con la acción del día</span>
          </button>

          <button
            :class="['hoy__accion-option', { 'hoy__accion-option--selected': accionChoice === 'skip' }]"
            @click="accionChoice = 'skip'"
          >
            <span class="hoy__accion-option-icon"><Icon name="lucide:arrow-right-circle" size="24" /></span>
            <span class="hoy__accion-option-text">Hoy no cumplí, estoy listo para mañana</span>
          </button>
        </div>

        <UiButton block :loading="accionLoading" :disabled="!accionChoice" @click="handleAccion">
          Confirmar
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ─── Daily retos queue ───
const dailyRetos = ref([
  { id: 'checkin', type: 'checkin' as const, title: 'Completa tu check-in', completed: false },
  { id: 'video', type: 'video' as const, title: 'Mira el video del día', completed: false },
  { id: 'accion', type: 'accion' as const, title: 'Acción del día', completed: false },
])

const retosCompleted = computed(() => dailyRetos.value.filter(r => r.completed).length)
const retosTotal = computed(() => dailyRetos.value.length)
const currentReto = computed(() => dailyRetos.value.find(r => !r.completed) ?? dailyRetos.value[dailyRetos.value.length - 1]!)
const currentRetoLabel = computed(() => {
  if (retosCompleted.value === retosTotal.value) return 'RETOS COMPLETADOS'
  return currentReto.value.title.toUpperCase()
})
const retosProgressWidth = computed(() => {
  if (!retosTotal.value) return '0%'
  return `${Math.round((retosCompleted.value / retosTotal.value) * 100)}%`
})

function completeReto(type: 'checkin' | 'video' | 'accion') {
  const reto = dailyRetos.value.find(r => r.type === type)
  if (reto) reto.completed = true
}

// Mensaje del día (admin-configurable)
const mensajeDelDia = ref('El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.')

// Mock daily plan
const dailyPlan = ref({
  eyebrow: 'Acción del día',
  title: 'Prioriza una sola cosa',
  message: 'Enfoca tu energía en una acción clave. Hazla con intención.',
})

// Activities list
const activities = ref([
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

// ─── Sheet state ───
const activeSheet = ref<'none' | 'checkin' | 'accion'>('none')

// ─── Check-in state ───
const selectedMood = ref<string | null>(null)
const checkinReflection = ref('')
const checkinLoading = ref(false)
const checkinSuccess = ref(false)
const streak = ref(7)

const moods = [
  { value: 'great', emoji: 'lucide:laugh', label: 'Increíble', color: '#4ECDC4' },
  { value: 'good', emoji: 'lucide:smile', label: 'Bien', color: '#A8D86E' },
  { value: 'ok', emoji: 'lucide:meh', label: 'Regular', color: '#F5D547' },
  { value: 'low', emoji: 'lucide:frown', label: 'Bajo', color: '#F09A5E' },
  { value: 'tough', emoji: 'lucide:annoyed', label: 'Difícil', color: '#E05A5A' },
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

// ─── Acción del día state ───
const accionChoice = ref<'done' | 'skip' | null>(null)
const accionLoading = ref(false)

async function handleAccion() {
  if (!accionChoice.value) return
  accionLoading.value = true
  await new Promise(r => setTimeout(r, 600))
  accionLoading.value = false
  completeReto('accion')
  activeSheet.value = 'none'
  // Reset after transition
  setTimeout(() => {
    accionChoice.value = null
  }, 400)
}
</script>

<style scoped>
/* ─── Hero header (dark branded card from top) ─── */
.hoy__hero {
  background: radial-gradient(ellipse at -11% 18%, rgb(174 174 174 / 14%) 0%, transparent 55%), #28282800;
  padding: var(--space-5) var(--space-5) 0;
}

.hoy__hero-logo {
  height: 20px;
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

.hoy__hero-count > span {
  font-size: 14px;
  top: 2px;
  position: relative;
  margin-right: 4px;
  color: #ffe726;
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

/* ─── Mensaje del día ─── */
.hoy__mensaje {
  margin-bottom: var(--space-6);
  position: relative;
}

.hoy__mensaje-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-5);
  background: var(--color-sand);
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

/* ─── Daily check-in button ─── */
.hoy__checkin-btn {
  width: 100%;
  padding: var(--space-4);
  margin-bottom: var(--space-6);
  border: none;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.25), rgba(168, 216, 110, 0.2));
  color: white;
  font-family: inherit;
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.hoy__checkin-btn:hover {
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.35), rgba(168, 216, 110, 0.3));
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
  padding: var(--space-6);
  /* padding-top: var(--space-16, 6rem); */
  background: linear-gradient(to top, rgb(0 0 0 / 0%) 0%, rgba(0, 0, 0, 0.45) 55%, transparent 100%);
  backdrop-filter: blur(16px);
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

/* ─── Start your day ─── */
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
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: #ffffff21;
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: white;
  transition: background var(--transition-fast);
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
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
  display: none;
}

/* ─── Sheet overlay (shared pattern from login) ─── */
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

.hoy__checkin-success {
  text-align: center;
  padding: var(--space-6) 0 var(--space-2);
}

.hoy__checkin-success-badge {
  font-size: 3rem;
  margin-bottom: var(--space-3);
  color: var(--color-primary);
}

.hoy__checkin-success p {
  font-size: var(--text-md);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

/* ─── Acción del día sheet content ─── */
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

/* ─── Fade transition ─── */
.fade-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.fade-enter-from { opacity: 0; transform: translateY(8px); }

@media (prefers-reduced-motion: reduce) {
  .hoy__overlay,
  .hoy__sheet,
  .fade-enter-active {
    transition-duration: 0.01ms !important;
  }
}
</style>
