<template>
  <div class="screen">
    <div class="screen__content">
      <header class="retos__header">
        <h1 class="retos__title">Programas / Retos / Bootcamps</h1>
      </header>

      <p class="retos__subtitle">Programas guiados para construir hábitos con estructura y constancia.</p>

      <!-- Tabs -->
      <UiTabs v-model="activeTab" :tabs="tabs" />

      <!-- Loading skeleton -->
      <div v-if="retosStatus === 'pending'" class="retos__list">
        <div v-for="i in 3" :key="i" style="display: flex; flex-direction: column;">
          <UiSkeleton variant="rect" width="100%" height="0" radius="var(--radius-2xl)" style="padding-bottom: 75%; margin-bottom: var(--space-4);" />
          <UiSkeleton variant="text" width="30%" height="10px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="70%" height="20px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="90%" height="12px" style="margin-bottom: var(--space-3);" />
          <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="retosStatus === 'error'">
        <div class="retos__error">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="retos__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
          <h2 class="retos__error-title">No pudimos cargar los programas</h2>
          <p class="retos__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
          <UiButton variant="primary-outline" size="sm" @click="refreshRetos()">Reintentar</UiButton>
        </div>
      </div>

      <!-- Programs list -->
      <div v-else class="retos__list">
        <div
          v-for="item in filteredPrograms"
          :key="item.id"
          :class="['retos__card', { 'retos__card--locked': isProgramLocked(item) }]"
          @click="handleCardClick(item)"
        >
          <div class="retos__card-img-wrap">
            <img :src="item.img" alt="" class="retos__card-img" />
            <EntitlementLockBadge :locked="isProgramLocked(item)" />
          </div>
          <div class="retos__card-info">
            <span class="retos__card-eyebrow">{{ item.typeLabel }} · {{ item.duration }}</span>
            <h3 class="retos__card-name">{{ item.title }}</h3>
            <p class="retos__card-desc">{{ item.description }}</p>
            <div class="retos__card-footer">
              <span v-if="isProgramLocked(item)" class="retos__tag retos__tag--locked">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Complemento
              </span>
              <span v-else :class="['retos__tag', item.enrolled ? 'retos__tag--inscrito' : (item.free ? 'retos__tag--gratis' : 'retos__tag--core')]">
                {{ item.enrolled ? 'Inscrito' : (item.free ? 'Gratis' : 'Core') }}
              </span>
              <span v-if="item.progress" class="retos__progress-text">{{ item.progress }}</span>
            </div>
          </div>
        </div>
      </div>

      <EntitlementPurchaseModal v-model="showPurchaseModal" :addon="selectedAddon" />
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { user, isSubscriber } = useAuth()
const { isLocked, getAddonForEntitlement } = useEntitlementGating()
const client = useSupabaseClient()

const activeTab = ref('all')
const showPurchaseModal = ref(false)
const selectedAddon = ref<{ id: string; title: string; description: string | null } | null>(null)

const tabs = [
  { value: 'all', label: 'Todos' },
  { value: 'program', label: 'Programas' },
  { value: 'reto', label: 'Retos' },
  { value: 'bootcamp', label: 'Bootcamps' },
]

const { data: programs, status: retosStatus, refresh: refreshRetos } = useAsyncData('mobile-programs', async () => {
  const { data: progs } = await client.from('programs').select('*').eq('is_active', true).order('created_at')
  // Get program total days (no user needed)
  const { data: days } = await client.from('program_days').select('program_id, day_index')
  const totalDaysMap = new Map<string, number>()
  for (const d of days ?? []) {
    totalDaysMap.set(d.program_id, Math.max(totalDaysMap.get(d.program_id) ?? 0, d.day_index))
  }
  // User-specific data (enrollments, checkins)
  let enrollMap = new Map<string, any>()
  const checkinMap = new Map<string, number>()
  if (user.value?.id) {
    const { data: enrollments } = await client.from('program_enrollments').select('program_id, status').eq('user_id', user.value.id)
    enrollMap = new Map((enrollments ?? []).map(e => [e.program_id, e]))
    const { data: checkins } = await client.from('program_checkins').select('program_id, day_index').eq('user_id', user.value.id)
    for (const c of checkins ?? []) {
      checkinMap.set(c.program_id, Math.max(checkinMap.get(c.program_id) ?? 0, c.day_index))
    }
  }
  return (progs ?? []).map(p => {
    const enrollment = enrollMap.get(p.id)
    const currentDay = checkinMap.get(p.id) ?? 0
    const totalDays = totalDaysMap.get(p.id) ?? 0
    return {
      ...p,
      typeLabel: p.type.toUpperCase(),
      img: p.cover_url ?? undefined,
      duration: `${totalDays} días`,
      enrolled: !!enrollment,
      free: p.plan === 'free',
      progress: enrollment ? `Día ${currentDay}/${totalDays}` : null,
    }
  })
}, { watch: [() => user.value?.id], lazy: true })

const filteredPrograms = computed(() => {
  if (activeTab.value === 'all') return programs.value ?? []
  return (programs.value ?? []).filter(p => p.type === activeTab.value)
})

function isProgramLocked(item: { entitlement_key: string | null; free: boolean }) {
  if (isLocked(item.entitlement_key)) return true
  if (!item.free && !isSubscriber.value) return true
  return false
}

function handleCardClick(item: NonNullable<typeof programs.value>[number]) {
  if (isLocked(item.entitlement_key)) {
    selectedAddon.value = getAddonForEntitlement(item.entitlement_key!)
    showPurchaseModal.value = true
    return
  }
  if (!item.free && !isSubscriber.value) {
    selectedAddon.value = { id: 'core', title: 'Plan Core', description: 'Suscríbete al plan Core para acceder a este contenido.' }
    showPurchaseModal.value = true
    return
  }
  router.push(`/cuenta/retos/${item.id}`)
}
</script>

<style scoped>
/* ─── Header (matches library) ─── */
.retos__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
  position: relative;
}

.retos__title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.retos__subtitle {
  font-size: var(--text-md);
  color: var(--color-muted);
  margin: 0 0 var(--space-5);
  text-align: left;
  line-height: var(--leading-normal);
}

/* ─── Cards list ─── */
.retos__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  margin-top: var(--space-5);
}

/* ─── Card ─── */
.retos__card {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-decoration: none;
  color: var(--color-text);
}
.retos__card + .retos__card {
  border-top: 1px solid rgba(var(--tint-rgb), 0.1);
  padding-top: var(--space-8);
}

.retos__card-img-wrap {
  position: relative;
}

.retos__card-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-2xl);
}

.retos__card--locked .retos__card-img {
  opacity: 0.65;
  filter: grayscale(20%);
}

.retos__card-info {
  padding: var(--space-4) var(--space-1) 0;
}

.retos__card-eyebrow {
  display: block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.retos__card-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  margin: 0 0 var(--space-1);
  line-height: var(--leading-snug);
}

.retos__card-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

/* ─── Card footer ─── */
.retos__card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-3);
}

.retos__progress-text {
  font-size: var(--eyebrow-sm);
  font-family: var(--font-eyebrow);
  font-weight: var(--weight-medium);
  color: var(--color-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ─── Tags (per plan type) ─── */
.retos__tag {
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

.retos__tag--core {
  background: var(--color-gold-bg);
  color: var(--color-gold);
}

.retos__tag--gratis {
  background: var(--color-silver-bg);
  color: var(--color-silver);
}

.retos__tag--inscrito {
  background: var(--color-complete-bg);
  color: var(--color-complete);
}

.retos__tag--locked {
  background: var(--color-surface-alt);
  color: var(--color-muted);
}

.retos__card--locked {
  cursor: pointer;
}

/* ─── Error state ─── */
.retos__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.retos__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.retos__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.retos__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}

/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .retos__header {
    justify-content: flex-start;
  }

  .retos__title {
    display: none; /* shown in top bar */
  }

  .retos__list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }

  .retos__card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: border-color var(--transition-fast);
  }

  @media (hover: hover) {
    .retos__card:hover {
      border-color: var(--color-border);
    }
  }

  .retos__card + .retos__card {
    border-top: none;
    padding-top: 0;
  }

  .retos__card-img {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    aspect-ratio: 16 / 9;
  }

  .retos__card-info {
    padding: var(--space-4) var(--space-5);
  }
}
</style>
