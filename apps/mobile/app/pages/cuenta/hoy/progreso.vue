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
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const client = useSupabaseClient()
const { user } = useAuth()

const { data: streakData } = await useAsyncData('mobile-streak', async () => {
  if (!user.value?.id) return null
  const { data } = await client.from('user_streaks').select('*').eq('user_id', user.value.id).maybeSingle()
  return data
}, { watch: [() => user.value?.id] })

const currentStreak = computed(() => streakData.value?.current_streak ?? 0)
const bestStreak = computed(() => streakData.value?.best_streak ?? 0)

const { data: totalCheckins } = await useAsyncData('mobile-total-checkins', async () => {
  if (!user.value?.id) return 0
  const { count } = await client.from('daily_checkins').select('id', { count: 'exact', head: true }).eq('user_id', user.value.id).eq('type', 'checkin')
  return count ?? 0
}, { watch: [() => user.value?.id] })

const { data: activeEnrollments } = await useAsyncData('mobile-active-programs', async () => {
  if (!user.value?.id) return []
  const { data: enrollments } = await client.from('program_enrollments').select('program_id, programs(id, title, type, cover_url)').eq('user_id', user.value.id).eq('status', 'active')
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
    return {
      id: pid,
      title: prog?.title ?? '',
      currentDay: checkinCountMap[pid] ?? 0,
      totalDays: dayCountMap[pid] ?? 0,
      img: prog?.cover_url ?? null,
    }
  })
}, { watch: [() => user.value?.id] })

const activeProgramsCount = computed(() => activeEnrollments.value?.length ?? 0)

const activePrograms = computed(() => activeEnrollments.value ?? [])

// ─── Today's completion check ───
const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

const { data: todayRetos } = await useAsyncData('mobile-today-retos', async () => {
  if (!user.value?.id) return { checkin: false, accion: false }
  const { data } = await client.from('daily_checkins').select('type').eq('user_id', user.value.id).eq('date', today)
  const types = (data ?? []).map(r => r.type)
  return { checkin: types.includes('checkin'), accion: types.includes('accion') }
}, { watch: [() => user.value?.id] })

const dayComplete = computed(() => todayRetos.value?.checkin && todayRetos.value?.accion)
const showShareBadge = ref(false)

// Badge info from hoy page data
const { data: hoyPage } = await useAsyncData('progreso-hoy-page', async () => {
  const { data } = await client.rpc('get_hoy_page', { p_date: today })
  return data as { settings: Record<string, any>; daily_plan: Record<string, any> | null } | null
})

const hoyDefaults = computed(() => hoyPage.value?.settings?.hoy_defaults ?? {})
const badgeTitle = computed(() => hoyPage.value?.daily_plan?.badge_title || hoyDefaults.value.badge_title || 'Día completado')
const badgeSubtitle = computed(() => hoyPage.value?.daily_plan?.badge_subtitle || hoyDefaults.value.badge_subtitle || null)

// Content viewed count (count content_item_categories or benefit_clicks as a proxy; fallback to 0)
const { data: contentViewed } = await useAsyncData('mobile-content-viewed', async () => {
  if (!user.value?.id) return 0
  // No dedicated content_views table; count the user's unique form_submissions as an activity proxy
  const { count } = await client.from('form_submissions').select('id', { count: 'exact', head: true }).eq('user_id', user.value.id)
  return count ?? 0
}, { watch: [() => user.value?.id] })
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
