<template>
  <div class="screen">
    <!-- Branded header (logo scrolls away, progress sticks) -->
    <div class="hoy__hero-row">
      <div class="hoy__hero">
        <div class="hoy__hero-top">
          <img src="/logo-icon/logo-fire.png" alt="Tu Potencial" class="hoy__hero-logo" />
          <NuxtLink to="/cuenta/hoy/progreso" class="hoy__streak-badge">
            <Icon name="lucide:flame" size="16" class="hoy__streak-icon" />
            <span class="hoy__streak-count">{{ streak }}</span>
            <span class="hoy__streak-label">días</span>
          </NuxtLink>
        </div>
        <h1 class="hoy__greeting">{{ greeting }}</h1>
      </div>

      <NuxtLink to="/cuenta/hoy/progreso" :class="['hoy__hero-progress', { 'hoy__hero-progress--complete': allRetosComplete }]">
        <div class="hoy__hero-progress-row">
          <span class="hoy__hero-label">{{ currentRetoLabel }}</span>
          <span class="hoy__hero-count"><Icon name="lucide:star" size="14" /> {{ retosCompleted }} / {{ retosTotal }}</span>
        </div>
        <div class="hoy__hero-bar">
          <div class="hoy__hero-bar-fill" :style="{ width: animatedProgressWidth }" />
        </div>
        <span class="hoy__hero-link">Ver progreso <Icon name="lucide:chevron-right" size="12" /></span>
      </NuxtLink>
    </div>

    <div class="screen__content">

      <!-- Daily retos task list / Celebration state -->
      <section :class="['hoy__retos', { 'hoy__retos--complete': allRetosComplete }]">
        <Transition name="fade" mode="out-in">
          <!-- Celebration state when all complete -->
          <NuxtLink v-if="allRetosComplete" key="complete" to="/cuenta/hoy/progreso" class="hoy__celebration">
            <div class="hoy__celebration-icon">
              <Icon name="lucide:party-popper" size="32" />
            </div>
            <div class="hoy__celebration-text">
              <p class="hoy__celebration-title">Día completado</p>
              <p class="hoy__celebration-sub">Racha de {{ streak }} días</p>
            </div>
            <span class="hoy__celebration-cta">Ver progreso <Icon name="lucide:chevron-right" size="14" /></span>
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

      <!-- Featured + Mensaje: side-by-side on desktop -->
      <div class="hoy__duo-row">
        <section class="hoy__featured">
          <button class="hoy__featured-card" @click="activeSheet = 'accion'">
            <img src="/images/rojo-carlotta.jpg" alt="" class="hoy__featured-img" />
            <div class="hoy__featured-info">
              <div class="hoy__featured-eyebrow-row">
                <span class="hoy__featured-eyebrow">{{ dailyPlan.eyebrow }}</span>
                <Icon v-if="!todayAccion" name="lucide:arrow-up-right" size="16" class="hoy__featured-arrow" />
              </div>
              <h3 class="hoy__featured-name" :class="{ 'hoy__featured-name--done': !!todayAccion }">{{ dailyPlan.title }}</h3>
            </div>
          </button>
        </section>

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
      </div>

      <!-- Continue active programs -->
      <section v-if="activePrograms.length" class="hoy__continue">
        <h2 class="hoy__section-title">Continúa con tus programas</h2>
        <div class="hoy__continue-scroll">
          <NuxtLink
            v-for="prog in activePrograms"
            :key="prog.id"
            :to="`/cuenta/retos/${prog.id}`"
            class="hoy__continue-card"
          >
            <div class="hoy__continue-progress">
              <svg viewBox="0 0 36 36" class="hoy__continue-ring">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(var(--tint-inverse-rgb), 0.08)" stroke-width="3" />
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
              <span class="hoy__continue-meta">Día {{ prog.currentDay }} de {{ prog.totalDays }}</span>
            </div>
            <Icon name="lucide:chevron-right" size="16" class="hoy__continue-arrow" />
          </NuxtLink>
        </div>
      </section>

      <!-- Latest from Biblioteca -->
      <section class="hoy__latest">
        <div class="hoy__latest-header">
          <h2 class="hoy__section-title">Contenido Reciente</h2>
          <NuxtLink to="/cuenta/biblioteca" class="hoy__latest-see-all">Ver todo</NuxtLink>
        </div>
        <div class="hoy__latest-scroll">
          <div
            v-for="item in latestContent"
            :key="item.id"
            :class="['hoy__latest-card', { 'hoy__latest-card--locked': isContentLocked(item) }]"
            @click="handleContentClick(item)"
          >
            <div class="hoy__latest-img-wrap">
              <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="hoy__latest-img" />
              <EntitlementLockBadge :locked="isContentLocked(item)" />
            </div>
            <div class="hoy__latest-info">
              <span class="hoy__latest-title">{{ item.title }}</span>
              <div class="hoy__latest-meta-row">
                <span v-if="item.duration" class="hoy__latest-duration"><Icon class="clock-icon" name="lucide:clock" size="12" /> {{ item.duration }}</span>
                <span v-if="item.typeLabel" class="hoy__type-tag">{{ item.typeLabel }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Explore -->
      <section class="hoy__start">
        <h2 class="hoy__section-title">Explora otras secciones</h2>
        <div class="hoy__start-list">
          <template v-for="activity in activities" :key="activity.id">
            <NuxtLink
              :to="activity.to"
              :class="['hoy__activity', { 'hoy__activity--wide': activity.featured }]"
              :style="{ '--activity-accent': activity.accent }"
            >
              <div class="hoy__activity-thumb">
                <Icon :name="activity.icon" size="28" />
              </div>
              <div class="hoy__activity-info">
                <h3 class="hoy__activity-name">{{ activity.title }}<Icon v-if="activity.featured" name="lucide:star" size="16" class="hoy__activity-star" /></h3>
                <p class="hoy__activity-meta">{{ activity.meta }}</p>
              </div>
              <svg class="hoy__activity-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
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
            <div class="hoy__checkin-success-badge"><Icon name="lucide:check-circle" size="48" /></div>
            <p class="hoy__checkin-success-streak">Check-in completado</p>
            <p class="hoy__checkin-success-msg">Ahora completa tu acción del día para sumar a tu racha.</p>
            <UiButton block variant="secondary" @click="closeCheckinSheet">Listo</UiButton>
          </div>

          <!-- Form state -->
          <div v-else key="form">
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

            <UiButton block variant="secondary" :loading="checkinLoading" :disabled="!selectedMood" class="hoy__checkin-submit" @click="handleCheckin">
              Completar check-in
            </UiButton>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Acción del día slideover -->
    <div
      class="hoy__overlay"
      :class="{ 'hoy__overlay--active': activeSheet === 'accion' }"
      @click.self="closeAccionSheet"
    >
      <div class="hoy__sheet">
        <div class="hoy__sheet-header">
          <div class="hoy__sheet-handle" />
          <button class="hoy__sheet-close" aria-label="Cerrar" @click="closeAccionSheet">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <Transition name="fade" mode="out-in">
          <!-- Success state -->
          <div v-if="accionSuccess" key="success" class="hoy__checkin-success">
            <div class="hoy__checkin-success-badge"><Icon :name="allRetosComplete ? 'lucide:trophy' : 'lucide:check-circle'" size="48" /></div>
            <template v-if="allRetosComplete">
              <p class="hoy__checkin-success-streak">{{ streak }} días</p>
              <p class="hoy__checkin-success-msg">{{ streakMessage }}</p>
            </template>
            <template v-else>
              <p class="hoy__checkin-success-streak">{{ accionChoice === 'done' ? 'Acción completada' : 'Listo para mañana' }}</p>
              <p class="hoy__checkin-success-msg">{{ accionChoice === 'done' ? 'Excelente trabajo hoy. Cada acción cuenta.' : 'No pasa nada. Mañana es una nueva oportunidad.' }}</p>
            </template>

            <UiButton block variant="outline" @click="showShareBadge = true">
              <template #icon><Icon name="lucide:share-2" size="18" /></template>
              Compartir logro
            </UiButton>

            <ShareBadge
              v-model="showShareBadge"
              :eyebrow="dailyPlan.eyebrow"
              :action-title="dailyPlan.title"
              :streak-count="streak"
              :share-text="dailyPlan.badgeShareText"
              :outcome="accionChoice!"
            />
          </div>

          <!-- Form action type: render form fields -->
          <div v-else-if="actionType === 'form' && actionRef" key="form-fields">
            <h1 class="hoy__sheet-title">{{ actionRef.title }}</h1>
            <p v-if="actionRef.description" class="hoy__sheet-subtitle">{{ actionRef.description }}</p>

            <div class="hoy__form-fields">
              <template v-for="(field, idx) in (actionRef.fields as any[])" :key="idx">
                <UiInput
                  v-if="field.type === 'text' || field.type === 'email'"
                  :label="field.question || field.label"
                  :type="field.type"
                  :required="field.required"
                  :error="formFieldErrors[idx]"
                  :model-value="formAnswers[idx] ?? ''"
                  @update:model-value="formAnswers[idx] = $event"
                />
                <UiTextarea
                  v-else-if="field.type === 'textarea'"
                  :label="field.question || field.label"
                  :required="field.required"
                  :error="formFieldErrors[idx]"
                  :model-value="formAnswers[idx] ?? ''"
                  :rows="3"
                  @update:model-value="formAnswers[idx] = $event"
                />
                <UiSelect
                  v-else-if="field.type === 'select'"
                  :label="field.question || field.label"
                  :required="field.required"
                  :error="formFieldErrors[idx]"
                  :model-value="formAnswers[idx] ?? ''"
                  :options="(field.options ?? []).map((o: string) => ({ value: o, label: o }))"
                  placeholder="Selecciona una opción"
                  @update:model-value="formAnswers[idx] = $event"
                />
                <div v-else-if="field.type === 'rating'" class="hoy__form-rating">
                  <label class="hoy__form-label">{{ field.question || field.label }}<span v-if="field.required" class="hoy__form-required">*</span></label>
                  <div class="hoy__form-rating-stars">
                    <button
                      v-for="star in 5"
                      :key="star"
                      class="hoy__form-rating-star"
                      :class="{ 'hoy__form-rating-star--active': Number(formAnswers[idx] ?? 0) >= star }"
                      @click="formAnswers[idx] = String(star)"
                    >
                      <Icon name="lucide:star" size="28" />
                    </button>
                  </div>
                  <p v-if="formFieldErrors[idx]" class="hoy__form-field-error">{{ formFieldErrors[idx] }}</p>
                </div>
              </template>
            </div>

            <UiButton block variant="secondary" :loading="accionLoading" :disabled="!isFormValid" @click="handleFormSubmit">
              Enviar
            </UiButton>
          </div>

          <!-- Default: done/skip options -->
          <div v-else key="form">
            <h1 class="hoy__sheet-title">{{ dailyPlan.title }}</h1>

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

            <UiButton block variant="secondary" :loading="accionLoading" :disabled="!accionChoice" @click="handleAccion">
              Confirmar
            </UiButton>
          </div>
        </Transition>
      </div>
    </div>

    <EntitlementPurchaseModal v-model="showPurchaseModal" :addon="selectedAddon" />
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const router = useRouter()
const { user, isSubscriber } = useAuth()
const { isLocked, getAddonForEntitlement } = useEntitlementGating()

const showPurchaseModal = ref(false)
const selectedAddon = ref<{ id: string; title: string; description: string | null } | null>(null)
const toast = useToast()
const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

// ─── Time-aware greeting ───
const greeting = computed(() => {
  const name = user.value?.display_name?.split(' ')[0] ?? ''
  const hour = new Date().getHours()
  let saludo = 'Buenos días'
  if (hour >= 12 && hour < 18) saludo = 'Buenas tardes'
  else if (hour >= 18) saludo = 'Buenas noches'
  return name ? `${saludo}, ${name}` : saludo
})

// ─── Streak ───
const { data: streakData, refresh: refreshStreak } = await useAsyncData('hoy-streak', async () => {
  if (!user.value?.id) return null
  const { data } = await client.from('user_streaks').select('current_streak').eq('user_id', user.value.id).maybeSingle()
  return data?.current_streak ?? 0
}, { watch: [() => user.value?.id] })
const streak = computed(() => streakData.value ?? 0)

const streakMessage = computed(() => {
  const next = streak.value
  if (next >= 30) return '¡Increíble disciplina! Un mes completo.'
  if (next >= 14) return '¡Dos semanas seguidas! Vas imparable.'
  if (next >= 7) return '¡Una semana completa! Sigue así.'
  if (next >= 3) return '¡Buen comienzo! Ya llevas 3 días.'
  return '¡Sigue así!'
})

// Update streak only when BOTH check-in and acción are completed for today
async function maybeUpdateStreak() {
  const uid = user.value!.id
  // Check both retos exist for today
  const [checkinRow, accionRow] = await Promise.all([
    client.from('daily_checkins').select('id').eq('user_id', uid).eq('date', today).eq('type', 'checkin').maybeSingle(),
    client.from('daily_checkins').select('id').eq('user_id', uid).eq('date', today).eq('type', 'accion').maybeSingle(),
  ])
  if (!checkinRow.data || !accionRow.data) return // not both done yet

  // Check if yesterday both retos were also completed (consecutive)
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  const [yCheckin, yAccion] = await Promise.all([
    client.from('daily_checkins').select('id').eq('user_id', uid).eq('date', yesterday).eq('type', 'checkin').maybeSingle(),
    client.from('daily_checkins').select('id').eq('user_id', uid).eq('date', yesterday).eq('type', 'accion').maybeSingle(),
  ])
  const isConsecutive = streak.value > 0 && !!yCheckin.data && !!yAccion.data
  const newStreak = isConsecutive ? streak.value + 1 : 1
  const newBest = Math.max(newStreak, streak.value)

  await client.from('user_streaks').upsert({
    user_id: uid,
    current_streak: newStreak,
    best_streak: newBest,
    last_checkin_date: today,
  }, { onConflict: 'user_id' })

  await refreshStreak()
}

// ─── Hoy page data (single RPC: settings + daily plan + content) ───
const { data: hoyPage } = await useAsyncData('hoy-page', async () => {
  const { data } = await client.rpc('get_hoy_page', { p_date: today })
  return data as { settings: Record<string, any>; daily_plan: Record<string, any> | null; action_ref: Record<string, any> | null; content: any[] } | null
})

const hoyDefaults = computed(() => hoyPage.value?.settings?.hoy_defaults ?? {})
const dailyPlanData = computed(() => hoyPage.value?.daily_plan)
// Resolve action type: daily plan overrides defaults; normalize default values to plan values
const normalizeActionType = (t: string | undefined) => {
  if (!t) return undefined
  if (t === 'talk_to_ai') return 'ai_prompt'
  if (t === 'contenido') return 'content'
  if (t === 'formulario') return 'form'
  return t
}
const actionType = computed(() => {
  const planType = dailyPlanData.value?.primary_action_type as string | undefined
  if (planType) return planType
  return normalizeActionType(hoyDefaults.value.action_type as string | undefined)
})
const actionPayload = computed(() => dailyPlanData.value?.primary_action_payload as Record<string, any> | null)
const actionRef = computed(() => hoyPage.value?.action_ref ?? null)

// Dynamic featured card name based on action type + resolved reference
const featuredName = computed(() => {
  const ref = actionRef.value
  const name = ref?.title ?? ''
  if (actionType.value === 'ai_prompt') return 'Habla con tu Coach IA'
  if (actionType.value === 'form' && name) return `Completa el cuestionario ${name}`
  if (actionType.value === 'content' && ref) {
    const contentType = ref.type as string
    if (contentType === 'video') return `Ve el video ${name}`
    if (contentType === 'article') return `Lee el artículo ${name}`
    if (contentType === 'audio') return `Escucha ${name}`
    return name
  }
  return dailyPlanData.value?.title || hoyDefaults.value.badge_title || 'Acción del día'
})

const dailyPlan = computed(() => ({
  eyebrow: 'Acción del día',
  title: featuredName.value,
  badgeShareText: dailyPlanData.value?.message || hoyDefaults.value.badge_subtitle || null,
}))

// ─── Mensaje del día (derived from daily plan payload or fallback to defaults) ───
const mensajeDelDia = computed(() => {
  const payload = dailyPlanData.value?.primary_action_payload as Record<string, any> | null
  return {
    text: payload?.quote_text || hoyDefaults.value.phrase_text,
    author: (payload?.quote_author || hoyDefaults.value.phrase_author) as 'gabriel' | 'carlotta',
  }
})

// ─── Today's checkin (to know if already completed) ───
const { data: todayCheckin, refresh: refreshCheckin } = await useAsyncData('hoy-checkin', async () => {
  if (!user.value?.id) return null
  const { data } = await client.from('daily_checkins').select('id').eq('date', today).eq('user_id', user.value.id).eq('type', 'checkin').maybeSingle()
  return data
}, { watch: [() => user.value?.id] })

// ─── Today's accion completion ───
const { data: todayAccion, refresh: refreshAccion } = await useAsyncData('hoy-accion', async () => {
  if (!user.value?.id) return null
  const { data } = await client.from('daily_checkins').select('id, payload').eq('date', today).eq('user_id', user.value.id).eq('type', 'accion').maybeSingle()
  return data
}, { watch: [() => user.value?.id] })

// ─── Daily retos queue (2 items: check-in + admin-configurable action) ───
const accionTitle = computed(() => {
  if (actionType.value === 'ai_prompt') return 'Habla con tu Coach IA'
  if (actionType.value === 'content') return 'Acción del día'
  return 'Acción del día'
})

const dailyRetos = computed(() => [
  { id: 'checkin', type: 'checkin' as const, title: 'Completa tu check-in', completed: !!todayCheckin.value },
  { id: 'accion', type: 'accion' as const, title: accionTitle.value, completed: !!todayAccion.value },
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
onMounted(async () => {
  requestAnimationFrame(() => {
    setTimeout(() => {
      animatedProgressWidth.value = retosProgressWidth.value
    }, 300)
  })

  await checkAutoCompleteAccion()
})

// Auto-complete acción based on action type when user has performed the action
async function checkAutoCompleteAccion() {
  if (todayAccion.value || !user.value?.id) return

  let completed = false

  if (actionType.value === 'ai_prompt') {
    // Check localStorage flag AND verify a user message actually exists in DB today
    if (localStorage.getItem(`hoy-ai-done-${today}`) === 'true') {
      const { data } = await client.from('ai_messages')
        .select('id')
        .eq('user_id', user.value.id)
        .eq('role', 'user')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .limit(1)
        .maybeSingle()
      completed = !!data
      if (!data) localStorage.removeItem(`hoy-ai-done-${today}`)
    }
  } else if (actionType.value === 'content' && actionPayload.value?.content_id) {
    // Check localStorage flag for content viewed
    completed = localStorage.getItem(`hoy-content-done-${today}`) === actionPayload.value.content_id
  }
  // Form type is handled inline by handleFormSubmit, no auto-check needed

  if (completed) {
    await client.from('daily_checkins').insert({
      date: today,
      user_id: user.value.id,
      type: 'accion',
      payload: { outcome: 'done', daily_plan_id: dailyPlanData.value?.id ?? null },
    })
    localStorage.removeItem(`hoy-ai-done-${today}`)
    localStorage.removeItem(`hoy-content-done-${today}`)
    await refreshAccion()
    await maybeUpdateStreak()
  }
}

// Re-check when user navigates back (e.g. returning from AI coach or content page)
onActivated(() => checkAutoCompleteAccion())
if (import.meta.client) {
  const onVisChange = () => { if (document.visibilityState === 'visible') checkAutoCompleteAccion() }
  onMounted(() => document.addEventListener('visibilitychange', onVisChange))
  onUnmounted(() => document.removeEventListener('visibilitychange', onVisChange))
}
watch(retosProgressWidth, (val) => {
  animatedProgressWidth.value = val
})

function handleRetoTap(type: 'checkin' | 'accion') {
  const reto = dailyRetos.value.find(r => r.type === type)
  if (reto?.completed) return
  if (type === 'checkin') {
    activeSheet.value = 'checkin'
    return
  }
  // Route based on admin-configured action type
  if (actionType.value === 'ai_prompt') {
    navigateTo('/cuenta/ia')
  } else if (actionType.value === 'content' && actionPayload.value?.content_id) {
    navigateTo(`/cuenta/contenido/${actionPayload.value.content_id}`)
  } else {
    activeSheet.value = 'accion'
  }
}

// ─── Active programs ───
const { data: activeProgramsData } = await useAsyncData('hoy-programs', async () => {
  if (!user.value?.id) return []
  const { data: enrollments } = await client.from('program_enrollments').select('program_id, programs(id, title)').eq('user_id', user.value.id).eq('status', 'active')
  if (!enrollments?.length) return []

  const programIds = enrollments.map(e => (e.programs as any)?.id ?? e.program_id)

  // Count total days per program
  const { data: days } = await client.from('program_days').select('program_id').in('program_id', programIds)
  const dayCountMap: Record<string, number> = {}
  for (const d of days ?? []) {
    dayCountMap[d.program_id] = (dayCountMap[d.program_id] ?? 0) + 1
  }

  // Get user's checkins per program
  const { data: checkins } = await client.from('program_checkins').select('program_id, day_index').eq('user_id', user.value.id).in('program_id', programIds)
  const checkinCountMap: Record<string, number> = {}
  for (const c of checkins ?? []) {
    checkinCountMap[c.program_id] = (checkinCountMap[c.program_id] ?? 0) + 1
  }

  return enrollments.map(e => {
    const prog = e.programs as any
    const pid = prog?.id ?? e.program_id
    const totalDays = dayCountMap[pid] ?? 0
    const currentDay = checkinCountMap[pid] ?? 0
    return { id: pid, title: prog?.title ?? '', currentDay, totalDays }
  })
}, { watch: [() => user.value?.id] })

const activePrograms = computed(() =>
  (activeProgramsData.value ?? []).map(p => ({
    ...p,
    progressPct: p.totalDays > 0 ? p.currentDay / p.totalDays : 0,
  })),
)

// ─── Latest from biblioteca (resolved by RPC based on admin config) ───
const latestContent = computed(() =>
  (hoyPage.value?.content ?? []).map((item: any) => ({
    id: item.id,
    type: item.type,
    typeLabel: ({ video: 'Video', audio: 'Audio', article: 'Artículo', link: 'Enlace' } as Record<string, string>)[item.type] ?? item.type,
    title: item.title,
    thumbnail: item.thumbnail_url ?? null,
    duration: item.duration_seconds ? `${Math.round(item.duration_seconds / 60)} min` : '',
    to: `/cuenta/contenido/${item.id}`,
    entitlement_key: item.entitlement_key ?? null,
    plan: item.plan ?? 'free',
  })),
)

function isContentLocked(item: { entitlement_key: string | null; plan?: string }) {
  if (isLocked(item.entitlement_key)) return true
  if (item.plan === 'core' && !isSubscriber.value) return true
  return false
}

function handleContentClick(item: { id: string; entitlement_key: string | null; plan?: string }) {
  if (isLocked(item.entitlement_key)) {
    selectedAddon.value = getAddonForEntitlement(item.entitlement_key!)
    showPurchaseModal.value = true
    return
  }
  if (item.plan === 'core' && !isSubscriber.value) {
    selectedAddon.value = { id: 'core', title: 'Plan Core', description: 'Suscríbete al plan Core para acceder a este contenido.' }
    showPurchaseModal.value = true
    return
  }
  router.push(`/cuenta/contenido/${item.id}`)
}

function contentTypeIcon(type: string) {
  switch (type) {
    case 'video': return 'lucide:video'
    case 'audio': return 'lucide:headphones'
    case 'text': return 'lucide:file-text'
    case 'link': return 'lucide:external-link'
    default: return 'lucide:file'
  }
}

// ─── App sections (admin-configurable) ───
const allAppSections: Record<string, { title: string; meta: string; icon: string; accent: string; to: string }> = {
  'ai-coach': { title: 'Mi Coach IA', meta: 'Conversaciones guiadas para tu crecimiento', icon: 'lucide:bot', accent: 'var(--color-ai-cool)', to: '/cuenta/ia' },
  'eventos': { title: 'Eventos', meta: 'Talleres en vivo y grabaciones', icon: 'lucide:calendar', accent: 'var(--color-ai-warm)', to: '/cuenta/eventos' },
  'suscripcion': { title: 'Suscripción', meta: 'Tu plan y opciones de upgrade', icon: 'lucide:wallet', accent: 'var(--color-ai-warm)', to: '/cuenta/suscripcion' },
  'vip': { title: 'VIP', meta: 'Contenido exclusivo y beneficios', icon: 'lucide:star', accent: 'var(--color-ai-earth)', to: '/cuenta/complementos' },
  'biblioteca': { title: 'Biblioteca', meta: 'Todo el contenido disponible', icon: 'lucide:book', accent: 'var(--color-ai-cool)', to: '/cuenta/biblioteca' },
  'comunidad': { title: 'Comunidad', meta: 'Comparte con otros miembros', icon: 'lucide:users', accent: 'var(--color-ai-warm)', to: '/cuenta/comunidad' },
  'beneficios': { title: 'Beneficios', meta: 'Descuentos y alianzas exclusivas', icon: 'lucide:tag', accent: 'var(--color-ai-earth)', to: '/cuenta/beneficios' },
  'retos': { title: 'Programas', meta: 'Programas y retos activos', icon: 'lucide:flag', accent: 'var(--color-ai-cool)', to: '/cuenta/retos' },
}

const activities = computed(() => {
  const savedSections = hoyPage.value?.settings?.hoy_explore_sections?.sections ?? []
  return savedSections
    .map((s: { id: string; featured: boolean }) => {
      const source = allAppSections[s.id]
      if (!source) return null
      return { id: s.id, ...source, featured: s.featured }
    })
    .filter(Boolean)
    .sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
})

// ─── Sheet state ───
const activeSheet = ref<'none' | 'checkin' | 'accion'>('none')

// ─── Check-in state ───
const selectedMood = ref<string | null>(null)
const checkinReflection = ref('')
const checkinLoading = ref(false)
const checkinSuccess = ref(false)

const moods = [
  { value: 'great', emoji: 'lucide:laugh', label: 'Increíble', color: 'var(--color-mood-great)' },
  { value: 'good', emoji: 'lucide:smile', label: 'Bien', color: 'var(--color-mood-good)' },
  { value: 'ok', emoji: 'lucide:meh', label: 'Regular', color: 'var(--color-mood-ok)' },
  { value: 'low', emoji: 'lucide:frown', label: 'Bajo', color: 'var(--color-mood-low)' },
  { value: 'tough', emoji: 'lucide:annoyed', label: 'Difícil', color: 'var(--color-mood-tough)' },
]

async function handleCheckin() {
  if (!selectedMood.value) return
  checkinLoading.value = true
  try {
    await client.from('daily_checkins').insert({
      date: today,
      user_id: user.value!.id,
      type: 'checkin',
      payload: { mood: selectedMood.value, reflection: checkinReflection.value },
    })

    checkinSuccess.value = true
    await refreshCheckin()
    // Update streak if both retos are now complete
    await maybeUpdateStreak()
  } catch {
    toast.show('Error al guardar', 'error')
  } finally {
    checkinLoading.value = false
  }
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
const accionSuccess = ref(false)
const showShareBadge = ref(false)

async function handleAccion() {
  if (!accionChoice.value) return
  accionLoading.value = true
  try {
    await client.from('daily_checkins').insert({
      date: today,
      user_id: user.value!.id,
      type: 'accion',
      payload: { outcome: accionChoice.value, daily_plan_id: dailyPlanData.value?.id ?? null },
    })
    accionSuccess.value = true
    await refreshAccion()
    // Update streak if both retos are now complete
    await maybeUpdateStreak()
  } catch {
    toast.show('Error al guardar', 'error')
  } finally {
    accionLoading.value = false
  }
}

// ─── Form action state ───
const formAnswers = reactive<Record<number, string>>({})
const formFieldErrors = reactive<Record<number, string>>({})

const isFormValid = computed(() => {
  const fields = (actionRef.value?.fields ?? []) as { type: string; label: string; required?: boolean }[]
  return fields.every((f, idx) => !f.required || (formAnswers[idx] ?? '').trim() !== '')
})

function validateFormFields(): boolean {
  const fields = (actionRef.value?.fields ?? []) as { type: string; question?: string; label?: string; required?: boolean }[]
  // Clear previous errors
  Object.keys(formFieldErrors).forEach(k => delete formFieldErrors[Number(k)])
  let valid = true
  fields.forEach((f, idx) => {
    if (f.required && !(formAnswers[idx] ?? '').trim()) {
      formFieldErrors[idx] = 'Este campo es obligatorio'
      valid = false
    }
  })
  return valid
}

async function handleFormSubmit() {
  if (!validateFormFields()) return
  accionLoading.value = true
  try {
    const fields = (actionRef.value?.fields ?? []) as { label?: string; question?: string }[]
    // Build answers keyed by question/label
    const answers: Record<string, string> = {}
    fields.forEach((f, idx) => { answers[f.question || f.label || `field_${idx}`] = formAnswers[idx] ?? '' })

    // Save form submission
    await client.from('form_submissions').insert({
      form_id: actionPayload.value?.form_id,
      user_id: user.value!.id,
      answers,
    })

    // Mark acción as done
    await client.from('daily_checkins').insert({
      date: today,
      user_id: user.value!.id,
      type: 'accion',
      payload: { outcome: 'done', daily_plan_id: dailyPlanData.value?.id ?? null },
    })
    accionSuccess.value = true
    await refreshAccion()
    await maybeUpdateStreak()
  } catch {
    toast.show('Error al guardar', 'error')
  } finally {
    accionLoading.value = false
  }
}

function closeAccionSheet() {
  activeSheet.value = 'none'
  setTimeout(() => {
    accionChoice.value = null
    accionSuccess.value = false
    showShareBadge.value = false
    // Reset form answers and errors
    Object.keys(formAnswers).forEach(k => delete formAnswers[Number(k)])
    Object.keys(formFieldErrors).forEach(k => delete formFieldErrors[Number(k)])
  }, 400)
}
</script>

<style scoped>

/* ─── Hero row (transparent on mobile, grid on desktop) ─── */
.hoy__hero-row {
  display: contents;
}

/* ─── Hero header ─── */
.hoy__hero {
  background: var(--color-gray);
  padding: var(--space-5) var(--space-5) 0;
}

.hoy__hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.hoy__hero-logo {
  height: 40px;
  width: auto;
}

/* ─── Streak badge ─── */
.hoy__streak-badge {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3) var(--space-1) var(--space-2);
  background: var(--color-dark);
  border: none;
  border-radius: var(--radius-full);
  text-decoration: none;
  transition: background var(--transition-fast);
}

@media (hover: hover) {
  .hoy__streak-badge:hover {
    background: var(--color-text);
    text-decoration: none;
  }
}

.hoy__streak-icon {
  color: var(--color-pro);
}

.hoy__streak-count {
  font-family: var(--font-eyebrow);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--color-pro);
  letter-spacing: 0.02em;
}

.hoy__streak-label {
  display: none;
}

/* ─── Greeting ─── */
.hoy__greeting {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
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
  background: var(--color-gray);
  border-radius: 0 0 var(--radius-2xl) var(--radius-2xl);
  padding: var(--space-3) var(--space-5) var(--space-3);
  margin-bottom: var(--space-5);
  backdrop-filter: blur(5px);
  text-decoration: none;
  color: var(--color-text);
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
  color: var(--color-text);
}

.hoy__hero-count {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.hoy__hero-count > span {
  font-size: 14px;
  top: 2px;
  position: relative;
  margin-right: 4px;
  color: var(--color-yellow);
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
  color: var(--color-muted);
}

.hoy__hero-bar {
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.hoy__hero-bar-fill {
  height: 100%;
  background: var(--color-text);
  border-radius: var(--radius-full);
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ─── Daily retos task list ─── */
.hoy__retos {
  margin-bottom: var(--space-6);
}

.hoy__retos--complete {
  margin-bottom: 0;
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
    background: rgba(var(--tint-rgb), 0.04);
    border-radius: var(--radius-xl);
    border: none;
    color: var(--color-text);
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    width: 100%;
    transition: background var(--transition-fast);
}

@media (hover: hover) {
  .hoy__reto-item:hover {
    background: rgba(var(--tint-rgb), 0.08);
  }
}

.hoy__reto-item--done {
  opacity: 0.5;
}

.hoy__reto-item--done .hoy__reto-label {
  text-decoration: line-through;
}

.hoy__reto-check {
  flex-shrink: 0;
  color: var(--color-muted);
  display: flex;
}

.hoy__reto-item--done .hoy__reto-check {
  color: var(--color-mood-good);
}

.hoy__reto-label {
  flex: 1;
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  line-height: var(--leading-snug);
}

.hoy__reto-arrow {
  flex-shrink: 0;
  color: var(--color-muted);
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
  background: var(--color-complete-bg);
  border: 1px solid rgba(72, 187, 120, 0.25);
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
  background: rgba(72, 187, 120, 0.2);
  border-radius: var(--radius-lg);
  color: var(--color-complete);
}

.hoy__celebration-text {
  flex: 1;
  min-width: 0;
}

.hoy__celebration-title {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.hoy__celebration-sub {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: 2px;
  line-height: var(--leading-normal);
}

/* Hide celebration on mobile */
.hoy__celebration {
  display: none;
}

/* CTA button inside celebration (visible on desktop) */
.hoy__celebration-cta {
  display: none;
}

/* Hero progress complete state (mobile) */
.hoy__hero-progress--complete {
  position: static;
}

.hoy__hero-progress--complete .hoy__hero-label {
  color: var(--color-complete);
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
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding-right: var(--space-10);
}

.hoy__mensaje-icon {
  flex-shrink: 0;
  color: rgba(var(--tint-rgb), 0.35);
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
  color: rgba(var(--tint-rgb), 0.45);
}

/* ─── Featured card ─── */
.hoy__featured {
  margin-bottom: var(--space-8);
}

.hoy__featured-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: var(--radius-2xl);
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  background: none;
}

.hoy__featured-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-2xl);
}

.hoy__featured-info {
  padding: var(--space-4) var(--space-1) 0;
}

.hoy__featured-eyebrow-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-1);
}

.hoy__featured-eyebrow {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.hoy__featured-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  margin: 0 0 var(--space-1);
  line-height: var(--leading-snug);
}
.hoy__featured-name--done {
  text-decoration: line-through;
  opacity: 0.5;
}

.hoy__featured-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

.hoy__featured-arrow {
  color: var(--color-muted);
  flex-shrink: 0;
}

/* ─── Continue active programs ─── */
.hoy__continue {
  margin-bottom: var(--space-8);
  border-top: 1px solid rgba(var(--tint-rgb), 0.04);
  padding-top: var(--space-5);
}

.hoy__section-title {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--space-3);
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
  background: rgba(var(--tint-rgb), 0.04);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: var(--color-text);
  transition: background var(--transition-fast);
}

@media (hover: hover) {
  .hoy__continue-card:hover {
    background: rgba(var(--tint-rgb), 0.08);
    text-decoration: none;
  }
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
  color: var(--color-text);
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
  color: var(--color-muted);
  margin-top: 2px;
}

.hoy__continue-arrow {
  flex-shrink: 0;
  color: var(--color-muted);
}

/* ─── Latest from Biblioteca ─── */
.hoy__latest {
  margin-bottom: var(--space-8);
  border-top: 1px solid rgba(var(--tint-rgb), 0.04);
  padding-top: var(--space-5);
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
  color: var(--color-text);
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
  flex: 0 0 60%;
  scroll-snap-align: start;
  text-decoration: none;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
}

.hoy__latest-img-wrap {
  position: relative;
}

.hoy__latest-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-xl);
}

.hoy__latest-card--locked .hoy__latest-img {
  opacity: 0.65;
  filter: grayscale(20%);
}

.hoy__latest-info {
  padding: var(--space-3) var(--space-1) 0;
}

.hoy__latest-title {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hoy__latest-meta-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.hoy__latest-duration {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--color-muted);
  font-family: var(--font-eyebrow);
  text-transform: uppercase;
}

.hoy__type-tag {
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

/* ─── Explore grid ─── */
.hoy__start {
  margin-bottom: var(--space-6);
  border-top: 1px solid rgba(var(--tint-rgb), 0.04);
  padding-top: var(--space-5);
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
  background: rgba(var(--tint-rgb), 0.04);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: var(--color-text);
  transition: background var(--transition-fast);
  border: none;
  width: 100%;
  text-align: center;
  cursor: pointer;
  font-family: inherit;
  align-items: center;
}

.hoy__activity-star {
  display: inline-block;
  vertical-align: middle;
  margin-left: var(--space-1);
  color: var(--color-yellow);
  fill: var(--color-yellow);
  margin-left: 8px;
  margin-bottom: 4px;

}

.hoy__activity-chevron {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  color: var(--color-muted);
  flex-shrink: 0;
}

.hoy__activity--wide .hoy__activity-chevron {
  position: static;
  align-self: center;
}

.hoy__activity--wide {
  grid-column: 1 / -1;
  flex-direction: row;
  text-align: left;
  gap: var(--space-4);
}

/* .hoy__activity--wide .hoy__activity-name {
  color: var(--color-light);
} */

@media (hover: hover) {
  .hoy__activity:hover {
    background: rgba(var(--tint-rgb), 0.1);
    text-decoration: none;
  }
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
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.hoy__activity-meta {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: 2px;
}

/* ─── Sheet overlay ─── */
.hoy__overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(var(--tint-rgb), 0);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  pointer-events: none;
  transition: background var(--transition-base);
}

.hoy__overlay--active {
  background: rgba(var(--tint-rgb), 0.4);
  pointer-events: auto;
}

.hoy__sheet {
  background: var(--color-accent);
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
  margin-bottom: var(--space-6);
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
@media (hover: hover) {
  .hoy__sheet-close:hover {
    background: var(--color-border-light);
  }
}

.hoy__sheet-title {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-2);
  margin-top: var(--space-10);
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface-alt);
  color: var(--color-text);
  cursor: pointer;
  flex: 1;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

@media (hover: hover) {
  .hoy__checkin-mood:hover {
    border-color: var(--color-text-secondary);
  }
}

.hoy__checkin-mood--selected {
  background: var(--color-sand);
  color: var(--color-text);
  border-color: var(--color-sand);
}

.hoy__checkin-mood-emoji { font-size: 1.5rem; }

.hoy__checkin-mood-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
}

.hoy__checkin-mood--selected .hoy__checkin-mood-label {
  color: var(--color-text);
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
  margin-bottom: var(--space-5);
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
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: rgba(var(--tint-rgb), 0.04);
  color: var(--color-text);
  border: 1.5px solid transparent;
  border-radius: var(--radius-xl);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.hoy__accion-option--selected {
  border-color: var(--color-border);
  background: var(--color-surface);
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

/* ─── Form fields ─── */
.hoy__form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}
.hoy__form-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: rgba(var(--tint-inverse-rgb), 0.7);
  margin-bottom: var(--space-2);
  display: block;
}
.hoy__form-rating-stars {
  display: flex;
  gap: var(--space-2);
}
.hoy__form-rating-star {
  background: none;
  border: none;
  padding: var(--space-1);
  color: rgba(var(--tint-inverse-rgb), 0.2);
  cursor: pointer;
  transition: color 0.15s ease;
}
.hoy__form-rating-star--active {
  color: var(--color-sand);
}
.hoy__form-required {
  color: var(--color-danger);
  margin-left: 2px;
}
.hoy__form-field-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  margin-top: var(--space-1);
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

/* ─── Desktop SaaS layout ─── */
@media (min-width: 1024px) {

  .hoy__mensaje-text {
    padding-inline: 3rem;
    padding-top: 2rem;
    font-size: 1.3rem;
  }
  /* Hero row: 2-col layout */
  .hoy__hero-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
    margin: var(--space-6) var(--space-8) 0;
  }

  /* Hero: compact greeting row */
  .hoy__hero {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    margin: 0;
    padding: var(--space-5) var(--space-6);
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .hoy__hero-top {
    display: contents;
  }

  .hoy__hero-logo {
    display: none;
  }

  .hoy__greeting {
    font-size: var(--title-md);
    margin-top: 0;
    order: -1;
    flex: 1;
  }

  .hoy__streak-badge {
    margin-left: auto;
  }

  .hoy__streak-label {
    display: inline;
    font-family: var(--font-eyebrow);
    font-size: var(--text-sm);
    font-weight: var(--weight-bold);
    color: var(--color-pro);
    letter-spacing: 0.02em;
  }

  /* Progress bar: inline card (not sticky) */
  .hoy__hero-progress {
    position: static;
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    margin: 0;
    padding: var(--space-3) var(--space-6);
    z-index: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .hoy__hero-link {
    justify-content: flex-end;
  }

  /* Content area: 2-col grid on desktop */
  .screen__content {
    max-width: none;
    padding: var(--space-6) var(--space-8);
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: var(--space-4);
  }

  /* Retos: right column, below mensaje */
  .hoy__retos {
    grid-column: 2;
    grid-row: 2;
    margin-bottom: 0;
  }

  .hoy__retos-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .hoy__reto-item {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
  }

  @media (hover: hover) {
    .hoy__reto-item:hover {
      background: var(--color-desktop-card);
      border-color: var(--color-border);
    }
  }

  .hoy__celebration {
    display: flex;
    border: 1px solid rgba(72, 187, 120, 0.2);
    background: var(--color-complete-bg);
  }

  .hoy__celebration-cta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    flex-shrink: 0;
    font-family: var(--font-eyebrow);
    font-size: var(--eyebrow-sm);
    font-weight: var(--weight-bold);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-complete);
    background: none;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-full);
    white-space: nowrap;
  }

  /* Flatten duo-row so children participate in parent grid */
  .hoy__duo-row {
    display: contents;
  }

  /* Featured: left column, spans both rows */
  .hoy__featured {
    grid-column: 1;
    grid-row: 1 / 3;
    margin-bottom: 0;
  }

  /* Mensaje: right column, row 1 */
  .hoy__mensaje {
    grid-column: 2;
    grid-row: 1;
    margin-bottom: 0;
  }

  /* Use CSS grid on the parent .screen__content to create a 2-col row for featured+mensaje */
  .hoy__featured-card {
    position: relative;
    flex-direction: row;
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    height: 100%;
  }

  .hoy__featured-img {
    width: 250px;
    height: auto;
    aspect-ratio: auto;
    border-radius: var(--radius-lg);
    margin: var(--space-4);
    flex-shrink: 0;
  }

  .hoy__featured-info {
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .hoy__featured-arrow {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    color: var(--color-muted);
  }

  /* Mensaje card: fill height */
  .hoy__mensaje-card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /* Full-width sections in grid */
  .hoy__continue,
  .hoy__latest,
  .hoy__start {
    grid-column: 1 / -1;
    border-top: none;
  }

  /* Continue + Recientes + Explora: side-by-side rows */
  .hoy__continue-scroll {
    display: flex;
    flex-direction: row;
    gap: var(--space-3);
  }

  .hoy__continue-card {
    flex: 1;
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
  }

  @media (hover: hover) {
    .hoy__continue-card:hover {
      background: var(--color-desktop-card);
      border-color: var(--color-border);
    }
  }

  /* Latest from biblioteca - grid */
  .hoy__latest-scroll {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-4);
    overflow-x: visible;
    margin: 0;
  }

  .hoy__latest-scroll::before,
  .hoy__latest-scroll::after {
    display: none;
  }

  .hoy__latest-card {
    flex: none;
  }

  .hoy__latest-img {
    border-radius: var(--radius-lg);
  }

  /* Explore grid */
  .hoy__start-list {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .hoy__activity {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
  }

  @media (hover: hover) {
    .hoy__activity:hover {
      background: var(--color-desktop-card);
      border-color: var(--color-border);
    }
  }

  .hoy__activity--wide {
    grid-column: span 1;
    flex-direction: column;
    text-align: center;
    gap: 0;
  }

  .hoy__activity--wide .hoy__activity-chevron {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
  }

  /* Sheets become centered modals on desktop */
  .hoy__overlay {
    justify-content: center;
    align-items: center;
  }

  .hoy__sheet {
    border-radius: var(--radius-xl);
    max-width: 480px;
    width: 100%;
    max-height: 80dvh;
    transform: scale(0.95);
    opacity: 0;
    transition: transform 0.25s ease, opacity 0.25s ease;
  }

  .hoy__overlay--active .hoy__sheet {
    transform: scale(1);
    opacity: 1;
  }

  .hoy__sheet-handle {
    display: none;
  }
}
</style>
