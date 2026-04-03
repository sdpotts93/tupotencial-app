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

      <template v-if="dayStatus === 'pending'">
        <UiSkeleton variant="text" width="60%" height="24px" style="margin-bottom: var(--space-3);" />
        <UiSkeleton variant="text" width="90%" height="14px" style="margin-bottom: var(--space-2);" />
        <UiSkeleton variant="text" width="75%" height="14px" style="margin-bottom: var(--space-6);" />

        <UiSkeleton variant="text" width="30%" height="10px" style="margin-bottom: var(--space-3);" />
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div v-for="i in 3" :key="i" style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) var(--space-4); border-radius: var(--radius-xl); background: rgba(var(--tint-rgb), 0.04);">
            <UiSkeleton variant="rect" width="56px" height="56px" style="border-radius: var(--radius-lg); flex-shrink: 0;" />
            <div style="flex: 1;">
              <UiSkeleton variant="text" width="60%" height="14px" style="margin-bottom: 4px;" />
              <UiSkeleton variant="text" width="35%" height="10px" />
            </div>
            <UiSkeleton variant="circle" width="22px" height="22px" />
          </div>
        </div>
      </template>
      <!-- Error state -->
      <template v-else-if="dayStatus === 'error'">
        <div class="day__error">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="day__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
          <h2 class="day__error-title">No pudimos cargar el día</h2>
          <p class="day__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
          <UiButton variant="primary-outline" size="sm" @click="refreshDay()">Reintentar</UiButton>
        </div>
      </template>
      <template v-else>

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
                <span v-if="activityTypeLabel(activity)" class="day__type-tag">{{ activityTypeLabel(activity) }}</span>
              </span>
            </div>
            <span class="day__card-check">
              <svg v-if="activity.done" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" style="fill: var(--color-complete); fill-opacity: 0.2; stroke: var(--color-complete)" stroke-width="1.5"/>
                <path d="M8 12l3 3 5-5" style="stroke: var(--color-complete)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" style="stroke: rgba(var(--tint-rgb), 0.2)" stroke-width="1.5"/>
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
                <span v-if="activityTypeLabel(activity)" class="day__type-tag">{{ activityTypeLabel(activity) }}</span>
              </span>
            </div>
            <span class="day__card-check">
              <svg v-if="activity.done" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" style="fill: var(--color-complete); fill-opacity: 0.2; stroke: var(--color-complete)" stroke-width="1.5"/>
                <path d="M8 12l3 3 5-5" style="stroke: var(--color-complete)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" style="stroke: rgba(var(--tint-rgb), 0.2)" stroke-width="1.5"/>
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

      </template>
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
            <circle cx="12" cy="12" r="10" style="fill: var(--color-complete); fill-opacity: 0.2; stroke: var(--color-complete)" stroke-width="1.5"/>
            <path d="M8 12l3 3 5-5" style="stroke: var(--color-complete)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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

function activityTypeLabel(activity: DayActivity): string {
  if (activity.type === 'ai') return 'Coach IA'
  if (activity.type === 'form') return 'Check-in'
  const labels: Record<string, string> = { video: 'Video', audio: 'Audio', text: 'Artículo' }
  return labels[activity.mediaType ?? ''] ?? ''
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

function formatDuration(seconds: number | null) {
  if (!seconds) return undefined
  const m = Math.round(seconds / 60)
  return `${m} min`
}

const route = useRoute()
const { user } = useAuth()
const client = useSupabaseClient()
const toast = useToast()
const programId = route.params.id as string
const dayIndex = route.params.indDia as string

const { data: dayData, status: dayStatus, refresh: refreshDay } = useAsyncData(`program-day-${programId}-${dayIndex}`, async () => {
  if (!user.value?.id) return null
  // Fetch program type
  const { data: program } = await client
    .from('programs')
    .select('id, type')
    .eq('id', programId)
    .single()

  const pType: ProgramType = (program?.type as ProgramType) ?? 'reto'

  // Fetch the program day by program_id + day_index
  const { data: day } = await client
    .from('program_days')
    .select('id, title, description')
    .eq('program_id', programId)
    .eq('day_index', Number(dayIndex))
    .single()

  // Count total days in this program
  const { data: allDays } = await client
    .from('program_days')
    .select('id')
    .eq('program_id', programId)
  const total = allDays?.length ?? 0

  if (!day) return { programType: pType, totalDays: total, title: '', description: '', activities: [] }

  // Fetch day items with linked content and forms
  const { data: dayItems } = await client
    .from('program_day_items')
    .select('id, type, position, content_item_id, form_id, content_items(id, title, description, type, duration_seconds, thumbnail_url)')
    .eq('program_day_id', day.id)
    .order('position')

  // Check which day items the user has completed (via program_checkins payload)
  const { data: checkin } = await client
    .from('program_checkins')
    .select('payload')
    .eq('program_id', programId)
    .eq('day_index', Number(dayIndex))
    .eq('user_id', user.value.id)
    .maybeSingle()

  const completedItems = new Set<string>(
    ((checkin?.payload as any)?.completed_items as string[]) ?? [],
  )

  const acts: DayActivity[] = (dayItems ?? []).map(di => {
    const content = di.content_items as any
    if (di.type === 'content' && content) {
      return {
        id: di.id,
        type: 'media' as ActivityType,
        mediaType: content.type as 'video' | 'audio' | 'text',
        title: content.title,
        description: content.description ?? '',
        thumbnail: content.thumbnail_url ?? null,
        duration: formatDuration(content.duration_seconds),
        done: completedItems.has(di.id),
        to: content.type === 'text'
          ? `/cuenta/contenido/${content.id}`
          : `/cuenta/contenido/${content.id}/reproducir`,
      }
    }
    if (di.type === 'ai_prompt') {
      return {
        id: di.id,
        type: 'ai' as ActivityType,
        title: 'Reflexión con Coach IA',
        description: 'Habla con tu coach sobre el tema del día.',
        thumbnail: '',
        duration: '5 min',
        done: completedItems.has(di.id),
        to: '/cuenta/ia',
      }
    }
    // form
    return {
      id: di.id,
      type: 'form' as ActivityType,
      title: 'Check-in del día',
      description: 'Comparte tu reflexión.',
      thumbnail: '',
      done: completedItems.has(di.id),
    }
  })

  return {
    programType: pType,
    totalDays: total,
    title: day.title ?? '',
    description: day.description ?? '',
    activities: acts,
  }
}, { lazy: true, watch: [() => user.value?.id] })

const programType = computed<ProgramType>(() => dayData.value?.programType ?? 'reto')
const totalDays = computed(() => dayData.value?.totalDays ?? 0)
const dayTitle = computed(() => dayData.value?.title ?? '')
const dayDescription = computed(() => dayData.value?.description ?? '')
const activities = ref<DayActivity[]>(dayData.value?.activities ?? [])

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
  try {
    // Record checkin for this program day
    const completedIds = activities.value.filter(a => a.done).map(a => a.id)
    const formAct = activities.value.find(a => a.type === 'form')
    if (formAct) completedIds.push(formAct.id)

    await client.from('program_checkins').upsert({
      program_id: programId,
      user_id: user.value!.id,
      day_index: Number(dayIndex),
      payload: { reflection: reflection.value, completed_items: completedIds },
    }, { onConflict: 'program_id,user_id,day_index' })

    formSuccess.value = true
    if (formAct) formAct.done = true
  } catch {
    toast.show('Error al guardar', 'error')
  } finally {
    formLoading.value = false
  }
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
@media (hover: hover) {
  .day__back:hover { background: rgba(var(--tint-rgb), 0.04); }
}

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
  background: rgba(var(--tint-rgb), 0.04);
  transition: background var(--transition-fast);
}
@media (hover: hover) {
  .day__card:hover { background: rgba(var(--tint-rgb), 0.06); }
}
.day__card:active { background: rgba(var(--tint-rgb), 0.08); }

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
  background: rgba(var(--tint-rgb), 0.04);
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

.day__type-tag {
  display: inline-block;
  font-size: 10px;
  font-family: var(--font-eyebrow);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
  background: #ebebeb;
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
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

  .day__card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    transition: border-color var(--transition-fast), background var(--transition-fast);
  }

  @media (hover: hover) {
    .day__card:hover {
      background: var(--color-desktop-card);
      border-color: var(--color-border);
    }
  }

  .day__card:active {
    background: var(--color-desktop-card);
  }
}

/* ─── Error state ─── */
.day__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.day__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.day__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.day__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
