<template>
  <div class="screen">
    <div class="screen__content">
      <header class="day__header safe-top">
        <button class="day__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="day__header-title">Día {{ dayIndex }}</h1>
        <UiTag variant="accent" class="day__counter">{{ dayIndex }}/{{ totalDays }}</UiTag>
      </header>

      <h2 class="title title--lg">{{ dayTitle }}</h2>
      <p class="day__desc">{{ dayDescription }}</p>

      <!-- Activity cards -->
      <section class="day__activities">
        <p class="eyebrow">ACTIVIDADES</p>
        <div class="day__activities-list">
          <NuxtLink
            v-for="activity in activities.filter(a => a.to)"
            :key="activity.id"
            :to="activity.to!"
            class="day__card"
          >
            <img v-if="activity.thumbnail" :src="activity.thumbnail" :alt="activity.title" loading="lazy" class="day__card-img" />
            <div v-else class="day__card-icon-placeholder">
              <Icon :name="activityIcon(activity)" size="20" />
            </div>
            <div class="day__card-body">
              <span class="day__card-title">{{ activity.title }}</span>
              <span class="day__card-meta">
                <Icon :name="activityIcon(activity)" size="12" />
                <span v-if="activity.duration">{{ activity.duration }}</span>
              </span>
            </div>
            <span class="day__card-check">
              <svg v-if="activity.done" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#60a97c" fill-opacity="0.2" stroke="#60a97c" stroke-width="1.5"/>
                <path d="M8 12l3 3 5-5" stroke="#60a97c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.2)" stroke-width="1.5"/>
              </svg>
            </span>
          </NuxtLink>

          <button
            v-for="activity in activities.filter(a => !a.to)"
            :key="activity.id"
            class="day__card"
            @click="handleActivityClick(activity)"
          >
            <img v-if="activity.thumbnail" :src="activity.thumbnail" :alt="activity.title" loading="lazy" class="day__card-img" />
            <div v-else class="day__card-icon-placeholder">
              <Icon :name="activityIcon(activity)" size="20" />
            </div>
            <div class="day__card-body">
              <span class="day__card-title">{{ activity.title }}</span>
              <span class="day__card-meta">
                <Icon :name="activityIcon(activity)" size="12" />
                <span v-if="activity.duration">{{ activity.duration }}</span>
              </span>
            </div>
            <span class="day__card-check">
              <svg v-if="activity.done" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#60a97c" fill-opacity="0.2" stroke="#60a97c" stroke-width="1.5"/>
                <path d="M8 12l3 3 5-5" stroke="#60a97c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.2)" stroke-width="1.5"/>
              </svg>
            </span>
          </button>
        </div>
      </section>

      <!-- Completar día CTA -->
      <div v-if="hasForm" class="day__cta">
        <UiButton block variant="secondary" @click="showFormSheet = true">
          Completar día
        </UiButton>
      </div>
    </div>

    <!-- Slideover feedback form -->
    <UiModal
      v-model="showFormSheet"
      title="Check-in del día"
      variant="drawer"
    >
      <Transition name="day-fade" mode="out-in">
        <div v-if="formSuccess" key="success" class="day__form-success">
          <svg class="day__form-success-icon" width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#60a97c" fill-opacity="0.2" stroke="#60a97c" stroke-width="1.5"/>
            <path d="M8 12l3 3 5-5" stroke="#60a97c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p class="day__form-success-title">¡Día completado!</p>
          <p class="day__form-success-msg">Excelente trabajo hoy.</p>
        </div>

        <div v-else key="form">
          <p class="day__form-desc">Comparte tu reflexión de hoy sobre este tema.</p>
          <UiTextarea
            v-model="reflection"
            label="Tu reflexión"
            placeholder="Escribe aquí lo que agradeces hoy..."
            :rows="5"
          />
        </div>
      </Transition>

      <template #footer>
        <UiButton
          v-if="!formSuccess"
          block
          :loading="formLoading"
          :disabled="!reflection.trim()"
          @click="handleFormSubmit"
        >
          Enviar check-in
        </UiButton>
        <UiButton
          v-else
          block
          variant="secondary"
          @click="closeFormSheet"
        >
          Listo
        </UiButton>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

type ProgramType = 'reto' | 'bootcamp' | 'programa'
type ActivityType = 'media' | 'ai' | 'form'

interface DayActivity {
  id: string
  type: ActivityType
  mediaType?: 'video' | 'audio' | 'text'
  title: string
  description: string
  thumbnail: string
  duration?: string
  done: boolean
  to?: string
}

function activityIcon(activity: DayActivity): string {
  if (activity.type === 'ai') return 'lucide:bot'
  if (activity.type === 'form') return 'lucide:clipboard-check'
  switch (activity.mediaType) {
    case 'video': return 'lucide:video'
    case 'audio': return 'lucide:headphones'
    case 'text': return 'lucide:file-text'
    default: return 'lucide:file'
  }
}

const route = useRoute()
const programId = route.params.id as string
const dayIndex = route.params.dayIndex as string

const programTypeMap: Record<string, ProgramType> = {
  'mock-prog-001': 'reto',
  'mock-prog-002': 'programa',
  'mock-prog-003': 'reto',
  'mock-prog-004': 'bootcamp',
  'mock-prog-005': 'programa',
}
const programType = ref<ProgramType>(programTypeMap[programId] || 'reto')
const totalDays = 7

const dayTitle = ref('Oportunidades')
const dayDescription = ref('Hoy reflexiona sobre las oportunidades que has tenido en tu vida. Piensa en cómo cada experiencia te ha llevado a donde estás ahora.')

const baseActivities: DayActivity[] = [
  {
    id: 'act-001',
    type: 'media',
    mediaType: 'audio',
    title: 'Meditación de gratitud',
    description: 'Una meditación guiada de 10 minutos.',
    thumbnail: '/images/lib-1.jpg',
    duration: '10 min',
    done: true,
    to: '/content/mock-content-001/play',
  },
  {
    id: 'act-002',
    type: 'media',
    mediaType: 'text',
    title: 'Diario de gratitud',
    description: 'Lee y reflexiona sobre la gratitud.',
    thumbnail: '/images/lib-6.jpg',
    duration: '5 min',
    done: false,
    to: '/content/mock-content-005',
  },
  {
    id: 'act-003',
    type: 'ai',
    title: 'Reflexión con Coach IA',
    description: 'Habla con tu coach sobre el tema del día.',
    thumbnail: '/images/lib-3.jpg',
    duration: '5 min',
    done: false,
    to: '/ai',
  },
]

const formActivity: DayActivity = {
  id: 'act-form',
  type: 'form',
  title: 'Check-in del día',
  description: 'Comparte tu reflexión.',
  thumbnail: '/images/lib-7.jpg',
  done: false,
}

const activities = ref<DayActivity[]>(
  programType.value === 'bootcamp'
    ? [...baseActivities, formActivity]
    : [...baseActivities],
)

const hasForm = computed(() => {
  if (programType.value === 'bootcamp') return true
  return activities.value.some(a => a.type === 'form')
})

// Form sheet state
const showFormSheet = ref(false)
const reflection = ref('')
const formLoading = ref(false)
const formSuccess = ref(false)

function handleActivityClick(activity: DayActivity) {
  if (activity.type === 'form') {
    showFormSheet.value = true
  }
}

async function handleFormSubmit() {
  formLoading.value = true
  await new Promise(r => setTimeout(r, 800))
  formLoading.value = false
  formSuccess.value = true
  const fa = activities.value.find(a => a.type === 'form')
  if (fa) fa.done = true
}

function closeFormSheet() {
  showFormSheet.value = false
  setTimeout(() => {
    reflection.value = ''
    formSuccess.value = false
  }, 400)
}
</script>

<style scoped>
/* ─── Header (matches library / retos pattern) ─── */
.day__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.day__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.day__back {
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
.day__back:hover { background: rgba(0, 0, 0, 0.04); }

.day__counter {
  position: absolute;
  right: 0;
}

/* ─── Day info ─── */
.day__desc {
  font-size: var(--text-base);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin: var(--space-3) 0 var(--space-6);
}

/* ─── Activity cards ─── */
.day__activities { margin-bottom: var(--space-6); }
.day__activities > .eyebrow { margin-bottom: var(--space-3); }

.day__activities-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.day__card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  text-decoration: none;
  color: var(--color-text);
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: none;
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  background: rgba(0, 0, 0, 0.04);
  transition: background var(--transition-fast);
}
.day__card:hover { background: rgba(0, 0, 0, 0.06); }
.day__card:active { background: rgba(0, 0, 0, 0.08); }

.day__card-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  object-fit: cover;
  flex-shrink: 0;
}

.day__card-icon-placeholder {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-muted);
}

.day__card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.day__card-title {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.day__card-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--color-muted);
  font-family: var(--font-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.day__card-check {
  flex-shrink: 0;
  display: flex;
}

/* ─── CTA ─── */
.day__cta { margin-bottom: var(--space-4); }

/* ─── Form slideover content ─── */
.day__form-desc {
  font-size: var(--text-sm);
  color: var(--color-text);
  opacity: 0.6;
  margin-bottom: var(--space-4);
}

.day__form-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-6) 0;
  gap: var(--space-3);
}

.day__form-success-icon { flex-shrink: 0; }

.day__form-success-title {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  font-weight: var(--weight-bold);
  color: var(--color-text);
}

.day__form-success-msg {
  font-size: var(--text-base);
  color: var(--color-text);
  opacity: 0.6;
}

/* ─── Form transition ─── */
.day-fade-enter-active,
.day-fade-leave-active {
  transition: opacity 0.2s ease;
}
.day-fade-enter-from,
.day-fade-leave-to {
  opacity: 0;
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .day__activities-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
