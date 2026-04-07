<template>
  <div class="screen">
    <!-- Skeleton -->
    <template v-if="programStatus === 'pending'">
      <div class="detail">
        <div class="detail__media">
          <UiSkeleton variant="rect" width="100%" height="100%" />
        </div>
        <div class="detail__info">
          <UiSkeleton variant="text" width="40%" height="10px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="80%" height="24px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="rect" width="100%" height="44px" radius="var(--radius-lg)" style="margin: var(--space-5) 0;" />
          <UiSkeleton variant="text" width="100%" height="14px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="90%" height="14px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="60%" height="14px" style="margin-bottom: var(--space-5);" />
          <div style="display: flex; gap: var(--space-2);">
            <UiSkeleton variant="text" width="70px" height="24px" radius="var(--radius-full)" />
            <UiSkeleton variant="text" width="70px" height="24px" radius="var(--radius-full)" />
          </div>
        </div>
      </div>
      <section class="detail__days">
        <UiSkeleton variant="text" width="50%" height="10px" style="margin-bottom: var(--space-3);" />
        <div style="display: flex; gap: var(--space-2);">
          <div v-for="i in 4" :key="i" style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); background: rgba(var(--tint-rgb), 0.04); border-radius: var(--radius-lg);">
            <UiSkeleton variant="text" width="50px" height="14px" />
            <UiSkeleton variant="text" width="60%" height="12px" />
          </div>
        </div>
      </section>
    </template>

    <!-- Error state -->
    <template v-else-if="programStatus === 'error'">
      <div class="program__error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="program__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="program__error-title">No pudimos cargar el programa</h2>
        <p class="program__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refreshProgram()">Reintentar</UiButton>
      </div>
    </template>

    <!-- Content -->
    <template v-else>
    <div class="detail">
      <!-- Media -->
      <div class="detail__media">
        <img v-if="program.thumbnail" :src="program.thumbnail" alt="" class="detail__img" />
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
        <button class="detail__back-link" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <p class="eyebrow">{{ program.typeLabel }} · {{ program.duration }}</p>
        <h1 class="title title--lg detail__title">{{ program.title }}</h1>

        <div class="detail__actions">
          <template v-if="locked">
            <UiButton block @click="showPurchaseModal = true">
              <template #icon>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </template>
              Desbloquear
            </UiButton>
          </template>
          <template v-else>
            <UiButton v-if="!program.enrolled" variant="outline" block @click="enroll">Inscribirme</UiButton>
            <template v-else-if="program.allComplete">
              <UiButton variant="outline" block @click="restart">Repetir programa</UiButton>
            </template>
            <UiButton v-else-if="completedDays.has(program.currentDay)" variant="outline" block :to="`/cuenta/retos/${id}/dia/${program.currentDay}`">
              Día {{ program.currentDay }} completado ✓
            </UiButton>
            <UiButton v-else variant="outline" block :to="`/cuenta/retos/${id}/dia/${program.currentDay}`">
              Continuar — Día {{ program.currentDay }}
            </UiButton>
          </template>
        </div>

        <p class="detail__description">{{ program.description }}</p>

        <div class="detail__meta">
          <span v-if="locked" class="detail__tag detail__tag--locked">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Complemento
          </span>
          <span v-else :class="['detail__tag', program.allComplete ? 'detail__tag--inscrito' : (program.enrolled ? 'detail__tag--inscrito' : (program.free ? 'detail__tag--gratis' : 'detail__tag--core'))]">
            {{ program.allComplete ? 'Completado' : (program.enrolled ? 'Inscrito' : (program.free ? 'Gratis' : 'Core')) }}
          </span>
          <span v-if="program.previouslyCompleted && !program.allComplete" class="detail__tag detail__tag--completed-before">Completado anteriormente</span>
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
          :class="{ 'detail__day--locked': !day.unlocked || locked }"
          :label="`Día ${day.index}`"
          :description="day.title"
          :to="day.unlocked && !locked ? `/cuenta/retos/${id}/dia/${day.index}` : undefined"
        >
          <template #suffix>
            <svg v-if="day.done && day.unlocked && !locked" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" style="fill: var(--color-complete); fill-opacity: 0.2; stroke: var(--color-complete)" stroke-width="1.5"/>
              <path d="M8 12l3 3 5-5" style="stroke: var(--color-complete)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="!day.unlocked || locked" class="detail__lock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </template>
        </UiListItem>
      </UiList>
    </section>

    <EntitlementPurchaseModal v-model="showPurchaseModal" :addon="addonInfo" />
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const client = useSupabaseClient()
const id = route.params.id as string
const { user, isSubscriber } = useAuth()
const { isLocked, getAddonForEntitlement } = useEntitlementGating()
const { isDayUnlocked, getCurrentDay } = useProgramProgression()

const showPurchaseModal = ref(false)

// ── Fetch program from Supabase ──
const { data: programData, status: programStatus, refresh: refreshProgram } = useAsyncData(`program-detail-${id}`, async () => {
  const { data } = await client.from('programs').select('*').eq('id', id).single()
  return data
}, { lazy: true })

// ── Fetch program days with item counts ──
const { data: programDays } = useAsyncData(`program-days-${id}`, async () => {
  const { data } = await client.from('program_days').select('id, day_index, title, program_day_items(id)').eq('program_id', id).order('day_index')
  return (data ?? []).map(d => ({
    day_index: d.day_index,
    title: d.title,
    itemCount: (d.program_day_items as any[])?.length ?? 0,
  }))
}, { lazy: true })

// ── Fetch enrollment status ──
const { data: enrollment, refresh: refreshEnrollment } = useAsyncData(`program-enrollment-${id}`, async () => {
  if (!user.value?.id) return null
  const { data } = await client.from('program_enrollments').select('id, enrolled_at, status, run').eq('program_id', id).eq('user_id', user.value.id).maybeSingle()
  return data
}, { lazy: true, watch: [() => user.value?.id] })

const enrolledAt = computed(() => enrollment.value?.enrolled_at ?? null)
const currentRun = computed(() => enrollment.value?.run ?? 1)

// ── Fetch checkin progress (filtered by current run) ──
const { data: checkins, refresh: refreshCheckins } = useAsyncData(`program-checkins-${id}`, async () => {
  if (!user.value?.id) return []
  const { data } = await client.from('program_checkins').select('day_index, payload').eq('program_id', id).eq('user_id', user.value.id).eq('run', currentRun.value)
  return data ?? []
}, { lazy: true, watch: [() => user.value?.id, currentRun] })

// Refresh checkins whenever enrollment loads/changes (handles back-navigation after clearNuxtData)
watch(enrollment, () => { if (enrollment.value) refreshCheckins() })

// A day is only "completed" when all its items have been checked off
const completedDays = computed(() => {
  const done = new Set<number>()
  const itemCounts = new Map((programDays.value ?? []).map(d => [d.day_index, d.itemCount]))
  for (const c of (checkins.value ?? [])) {
    const completedItems: string[] = (c.payload as any)?.completed_items ?? []
    const totalItems = itemCounts.get(c.day_index) ?? 0
    if (totalItems > 0 && completedItems.length >= totalItems) {
      done.add(c.day_index)
    }
  }
  return done
})
const totalDays = computed(() => programDays.value?.length ?? 0)
const currentDay = computed(() =>
  getCurrentDay(enrolledAt.value, completedDays.value, totalDays.value),
)
const allComplete = computed(() =>
  !!enrollment.value && completedDays.value.size >= totalDays.value && totalDays.value > 0,
)

const program = computed(() => {
  const p = programData.value
  return {
    title: p?.title ?? '',
    typeLabel: (p?.type ?? 'program').toUpperCase(),
    duration: `${totalDays.value} días`,
    totalDays: totalDays.value,
    enrolled: !!enrollment.value,
    enrollmentStatus: enrollment.value?.status ?? null,
    free: p?.plan === 'free',
    currentDay: currentDay.value,
    allComplete: allComplete.value,
    previouslyCompleted: currentRun.value > 1,
    entitlement_key: (p?.entitlement_key ?? null) as string | null,
    description: p?.description ?? '',
    thumbnail: p?.cover_url ?? null,
    days: (programDays.value ?? []).map(d => ({
      index: d.day_index,
      title: d.title ?? '',
      done: completedDays.value.has(d.day_index),
      unlocked: !!enrollment.value && isDayUnlocked(d.day_index, enrolledAt.value),
    })),
  }
})

const locked = computed(() => {
  if (isLocked(program.value.entitlement_key)) return true
  if (!program.value.free && !isSubscriber.value) return true
  return false
})
const addonInfo = computed(() =>
  program.value.entitlement_key ? getAddonForEntitlement(program.value.entitlement_key) : null,
)

async function enroll() {
  await client.from('program_enrollments').insert({ program_id: id, status: 'active' })
  await refreshEnrollment()
}

async function restart() {
  if (!enrollment.value) return
  const { error } = await client.from('program_enrollments').update({
    enrolled_at: new Date().toISOString(),
    status: 'active',
    run: currentRun.value + 1,
  }).eq('program_id', id).eq('user_id', user.value!.id)
  if (error) return
  clearNuxtData(`program-enrollment-${id}`)
  clearNuxtData(`program-checkins-${id}`)
  await refreshEnrollment()
  await nextTick()
  await refreshCheckins()
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
  background: rgba(var(--tint-inverse-rgb), 0.85);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .detail__back:hover { background: rgba(var(--tint-inverse-rgb), 1); }
}

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
.detail__actions { margin: var(--space-5) 0; display: flex; flex-direction: column; align-items: start; gap: var(--space-3); }

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
  background: var(--color-gold-bg);
  color: var(--color-gold);
}

.detail__tag--gratis {
  background: var(--color-silver-bg);
  color: var(--color-silver);
}

.detail__tag--inscrito {
  background: var(--color-complete-bg);
  color: var(--color-complete);
}

.detail__tag--completed-before {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.detail__tag--locked {
  background: var(--color-surface-alt);
  color: var(--color-muted);
}

.detail__meta :deep(.tag) {
  background: var(--color-sand);
  color: var(--color-white);
}

/* ─── Completed badge ─── */

.detail__lock-icon {
  color: var(--color-muted);
  opacity: 0.4;
}

.detail__day--locked {
  opacity: 0.4;
  pointer-events: none;
}

.detail__day--locked:hover {
  background: transparent;
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
    display: flex;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    color: var(--color-dark-lighter);
    background: none;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    padding: 0;
    margin-bottom: var(--space-6);
  }
  @media (hover: hover) {
    .detail__back-link:hover { background: rgba(var(--tint-rgb), 0.06); }
  }

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
    max-width: 900px;
    margin-top: var(--space-2);
  }

  .detail__days > .eyebrow {
    font-size: var(--eyebrow-lg);
  }

  /* Calendar-style grid for day list */
  .detail__days :deep(.list) {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--space-3);
    background: transparent;
    border: none;
    border-radius: 0;
    overflow: visible;
  }

  .detail__days :deep(.list-item) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--space-4) var(--space-2);
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    min-height: auto;
    gap: var(--space-2);
    transition: border-color var(--transition-fast), background var(--transition-fast);
  }

  @media (hover: hover) {
    .detail__days :deep(.list-item:hover) {
      border-color: var(--color-border);
    }
  }

  .detail__days :deep(.list-item__content) {
    align-items: center;
    min-height: auto;
  }

  .detail__days :deep(.list-item__label) {
    font-size: var(--text-sm);
    line-height: var(--leading-snug);
  }

  .detail__days :deep(.list-item__chevron) {
    display: none;
  }
}

/* ─── Error state ─── */
.program__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.program__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.program__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.program__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
