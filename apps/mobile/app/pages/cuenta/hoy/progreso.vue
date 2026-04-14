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

      <template v-if="progresoStatus === 'pending'">
        <!-- Hero circle skeleton -->
        <div class="progress__hero">
          <UiSkeleton variant="circle" width="120px" height="120px" style="margin-bottom: var(--space-4);" />
          <UiSkeleton variant="text" width="40%" height="18px" style="margin-bottom: var(--space-1);" />
          <UiSkeleton variant="text" width="50%" height="12px" />
        </div>
        <!-- Stats skeleton -->
        <section class="progress__stats">
          <div v-for="i in 3" :key="i" class="progress__stat">
            <UiSkeleton variant="text" width="40px" height="28px" />
            <UiSkeleton variant="text" width="80%" height="10px" />
          </div>
        </section>
        <!-- Programs skeleton -->
        <section class="progress__programs">
          <UiSkeleton variant="text" width="50%" height="10px" style="margin-bottom: var(--space-3);" />
          <div class="progress__programs-list">
            <div v-for="i in 2" :key="i" style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) var(--space-4); background: rgba(var(--tint-rgb), 0.04); border-radius: var(--radius-xl);">
              <UiSkeleton variant="rect" width="56px" height="56px" radius="var(--radius-lg)" />
              <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                <UiSkeleton variant="text" width="70%" height="14px" />
                <UiSkeleton variant="text" width="40%" height="10px" />
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- Error state -->
      <template v-else-if="progresoStatus === 'error'">
        <div class="screen__content">
          <div class="progress__error">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="progress__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
            <h2 class="progress__error-title">No pudimos cargar tu progreso</h2>
            <p class="progress__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
            <UiButton variant="primary-outline" size="sm" @click="refreshProgreso()">Reintentar</UiButton>
          </div>
        </div>
      </template>

      <template v-else>
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

      <!-- Share today's badge (when both retos completed) -->
      <section v-if="dayComplete" class="progress__share">
        <UiButton block variant="outline" @click="showShareBadge = true">
          <template #icon><Icon name="lucide:share-2" size="18" /></template>
          Compartir logro de hoy
        </UiButton>
        <ShareBadge
          v-model="showShareBadge"
          eyebrow="ACCIÓN DEL DÍA"
          :action-title="badgeTitle"
          :streak-count="currentStreak"
          :share-text="badgeSubtitle"
          outcome="done"
        />
      </section>

      <!-- Stats -->
      <section class="progress__stats">
        <div class="progress__stat">
          <span class="progress__stat-value progress__stat-value--checkins">{{ completedDays }}</span>
          <span class="progress__stat-label">Días completados</span>
        </div>
        <div class="progress__stat">
          <span class="progress__stat-value progress__stat-value--programs">{{ activeProgramsCount }}</span>
          <span class="progress__stat-label">Programas activos</span>
        </div>
        <div class="progress__stat">
          <span class="progress__stat-value progress__stat-value--content">{{ completedPrograms.length }}</span>
          <span class="progress__stat-label">Programas completados</span>
        </div>
      </section>

      <!-- Active programs (day__card style) -->
      <section v-if="activePrograms.length" class="progress__programs">
        <p class="eyebrow">PROGRAMAS ACTIVOS</p>
        <div class="progress__programs-list">
          <NuxtLink
            v-for="prog in activePrograms"
            :key="prog.id"
            :to="`/cuenta/retos/${prog.id}`"
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

      <!-- Completed programs -->
      <section v-if="completedPrograms.length" class="progress__programs">
        <p class="eyebrow">PROGRAMAS COMPLETADOS</p>
        <div class="progress__programs-list">
          <NuxtLink
            v-for="prog in completedPrograms"
            :key="prog.id"
            :to="`/cuenta/retos/${prog.id}`"
            class="progress__card progress__card--completed"
          >
            <img :src="prog.img" :alt="prog.title" class="progress__card-img" />
            <div class="progress__card-body">
              <span class="progress__card-title">{{ prog.title }}</span>
              <span class="progress__card-meta progress__card-meta--done">{{ prog.totalDays }} de {{ prog.totalDays }} días</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="progress__card-check">
              <circle cx="10" cy="10" r="9" stroke="var(--color-complete)" stroke-width="1.5"/>
              <path d="M6 10.5l2.5 2.5L14 7.5" stroke="var(--color-complete)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </NuxtLink>
        </div>
      </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  hideBottomNav: true,
})

const client = useSupabaseClient()
const { user } = useAuth()

const { data: streakData, status: progresoStatus, refresh: refreshProgreso } = useAsyncData('mobile-streak', async () => {
  if (!user.value?.id) return null
  const { data } = await client.from('user_streaks').select('*').eq('user_id', user.value.id).maybeSingle()
  return data
}, { watch: [() => user.value?.id], lazy: true })

const currentStreak = computed(() => streakData.value?.current_streak ?? 0)
const bestStreak = computed(() => streakData.value?.best_streak ?? 0)

const { data: completedDays } = useAsyncData('mobile-completed-days', async () => {
  if (!user.value?.id) return 0
  const { data } = await (client.rpc as any)('count_completed_days')
  return data ?? 0
}, { watch: [() => user.value?.id], lazy: true })

const { data: activeEnrollments } = useAsyncData('mobile-active-programs', async () => {
  if (!user.value?.id) return []
  const { data: enrollments } = await client.from('program_enrollments').select('program_id, enrolled_at, run, status, programs(id, title, type, cover_url)').eq('user_id', user.value.id).in('status', ['active', 'completed'])
  if (!enrollments?.length) return []

  const programIds = enrollments.map(e => (e.programs as any)?.id ?? e.program_id)

  // Count total days per program
  const { data: days } = await client.from('program_days').select('program_id').in('program_id', programIds)
  const dayCountMap: Record<string, number> = {}
  for (const d of days ?? []) {
    dayCountMap[d.program_id] = (dayCountMap[d.program_id] ?? 0) + 1
  }

  // Get user's checkins per program (filtered by current run)
  const { data: checkins } = await client.from('program_checkins').select('program_id, day_index, run').eq('user_id', user.value.id).in('program_id', programIds)

  const { getCurrentDay } = useProgramProgression()

  // Build checkins grouped by program + run
  const checkinsByRun: Record<string, Set<number>> = {}
  for (const c of checkins ?? []) {
    const key = `${c.program_id}:${c.run}`
    if (!checkinsByRun[key]) checkinsByRun[key] = new Set()
    checkinsByRun[key].add(c.day_index)
  }

  const results: Array<{ id: string; title: string; currentDay: number; totalDays: number; completedCount: number; allComplete: boolean; img?: string }> = []

  for (const e of enrollments) {
    const prog = e.programs as any
    const pid = prog?.id ?? e.program_id
    const totalDays = dayCountMap[pid] ?? 0
    const currentRunDays = checkinsByRun[`${pid}:${e.run}`] ?? new Set<number>()
    const currentRunComplete = e.status === 'completed' || (totalDays > 0 && currentRunDays.size >= totalDays)

    // Check if any previous run was fully completed
    let hasCompletedRun = false
    if (e.run > 1) {
      for (let r = 1; r < e.run; r++) {
        const prevDays = checkinsByRun[`${pid}:${r}`]
        if (prevDays && totalDays > 0 && prevDays.size >= totalDays) {
          hasCompletedRun = true
          break
        }
      }
    }

    // Current run entry (active or completed)
    results.push({
      id: pid,
      title: prog?.title ?? '',
      currentDay: getCurrentDay(e.enrolled_at, currentRunDays, totalDays),
      totalDays,
      completedCount: currentRunDays.size,
      allComplete: currentRunComplete,
      img: prog?.cover_url ?? undefined,
    })

    // Add a separate completed entry for a past run if currently active on a new run
    if (hasCompletedRun && !currentRunComplete) {
      results.push({
        id: pid,
        title: prog?.title ?? '',
        currentDay: totalDays,
        totalDays,
        completedCount: totalDays,
        allComplete: true,
        img: prog?.cover_url ?? undefined,
      })
    }
  }

  return results
}, { watch: [() => user.value?.id], lazy: true })

const activeProgramsCount = computed(() => activePrograms.value.length)

const activePrograms = computed(() => (activeEnrollments.value ?? []).filter(p => !p.allComplete))

const completedPrograms = computed(() => (activeEnrollments.value ?? []).filter(p => p.allComplete))

// ─── Today's completion check ───
const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

const { data: todayRetos } = useAsyncData('mobile-today-retos', async () => {
  if (!user.value?.id) return { checkin: false, accion: false }
  const { data } = await (client.from as any)('daily_checkins').select('type').eq('user_id', user.value.id).eq('date', today)
  const types = (data ?? []).map((r: any) => r.type)
  return { checkin: types.includes('checkin'), accion: types.includes('accion') }
}, { watch: [() => user.value?.id], lazy: true })

const dayComplete = computed(() => todayRetos.value?.checkin && todayRetos.value?.accion)
const showShareBadge = ref(false)

// Badge info from hoy page data
const { data: hoyPage } = useAsyncData('progreso-hoy-page', async () => {
  const { data } = await client.rpc('get_hoy_page', { p_date: today })
  return data as { settings: Record<string, any>; daily_plan: Record<string, any> | null } | null
}, { lazy: true })

const hoyDefaults = computed(() => hoyPage.value?.settings?.hoy_defaults ?? {})
function resolveText(value: unknown, fallback: unknown, defaultValue: string | null = null) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof fallback === 'string' && fallback.trim()) return fallback.trim()
  return defaultValue
}
const badgeTitle = computed(() => resolveText(hoyPage.value?.daily_plan?.badge_title, hoyDefaults.value.badge_title, 'Día completado') ?? 'Día completado')
const badgeSubtitle = computed(() => resolveText(hoyPage.value?.daily_plan?.badge_subtitle, hoyDefaults.value.badge_subtitle, null))

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
@media (hover: hover) {
  .progress__back:hover { background: rgba(var(--tint-rgb), 0.05); }
}

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

/* ─── Share CTA ─── */
.progress__share {
  margin-bottom: var(--space-6);
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
@media (hover: hover) {
  .progress__card:hover { background: rgba(var(--tint-rgb), 0.06); }
}

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

.progress__card-check {
  flex-shrink: 0;
}

.progress__card-meta--done {
  color: var(--color-complete);
}

/* ─── Error state ─── */
.progress__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.progress__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.progress__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.progress__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .progress__share {
    display: flex;
    justify-content: center;
  }
  .progress__share :deep(.btn--block) {
    width: fit-content;
  }

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

  @media (hover: hover) {
    .progress__card:hover {
      background: var(--color-desktop-card);
      border-color: var(--color-border);
    }
  }
}
</style>
