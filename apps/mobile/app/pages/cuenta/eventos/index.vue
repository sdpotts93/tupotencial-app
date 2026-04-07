<template>
  <div class="screen">
    <div class="screen__content">
      <header class="events__header">
        <button class="events__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="events__header-title">Eventos y Lives</h1>
      </header>

      <template v-if="eventosStatus === 'pending'">
        <!-- Upcoming skeleton -->
        <section class="events__section">
          <UiSkeleton variant="text" width="30%" height="10px" style="margin-bottom: var(--space-3);" />
          <div class="events__list">
            <div v-for="i in 2" :key="i" style="margin-bottom: var(--space-4);">
              <UiSkeleton variant="rect" width="100%" height="180px" radius="var(--radius-2xl)" style="margin-bottom: var(--space-3);" />
              <UiSkeleton variant="text" width="40%" height="10px" style="margin-bottom: var(--space-2);" />
              <UiSkeleton variant="text" width="70%" height="16px" style="margin-bottom: var(--space-2);" />
              <UiSkeleton variant="text" width="90%" height="12px" />
            </div>
          </div>
        </section>
        <!-- Past skeleton -->
        <section class="events__section">
          <UiSkeleton variant="text" width="25%" height="10px" style="margin-bottom: var(--space-3);" />
          <div v-for="i in 3" :key="i" style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) 0; border-bottom: 1px solid rgba(var(--tint-rgb), 0.06);">
            <UiSkeleton variant="rect" width="64px" height="48px" radius="var(--radius-md)" />
            <div style="flex: 1;">
              <UiSkeleton variant="text" width="60%" height="14px" style="margin-bottom: 4px;" />
              <UiSkeleton variant="text" width="40%" height="10px" />
            </div>
          </div>
        </section>
      </template>
      <!-- Error state -->
      <template v-else-if="eventosStatus === 'error'">
        <div class="screen__content">
          <div class="events__error">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="events__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
            <h2 class="events__error-title">No pudimos cargar los eventos</h2>
            <p class="events__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
            <UiButton variant="primary-outline" size="sm" @click="refreshEventos()">Reintentar</UiButton>
          </div>
        </div>
      </template>

      <template v-else>
        <!-- Registered events -->
        <section v-if="myEvents.length" class="events__section">
          <p class="eyebrow">TUS EVENTOS</p>
          <div class="events__list">
            <div
              v-for="event in myEvents"
              :key="event.id"
              class="events__card"
              @click="router.push(`/cuenta/eventos/${event.id}`)"
            >
              <div class="events__card-hero">
                <img :src="event.img" alt="" class="events__card-img" />
                <span class="events__card-date">{{ event.dateLabel }}</span>
              </div>
              <div class="events__card-info">
                <span class="events__card-eyebrow">{{ event.timeLabel }}</span>
                <h3 class="events__card-name">{{ event.title }}</h3>
                <div class="events__card-footer">
                  <span class="events__tag events__tag--registered">Registrado</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Upcoming -->
        <section class="events__section">
          <p class="eyebrow">PRÓXIMOS</p>
          <div v-if="upcomingEvents.length" class="events__list">
            <div
              v-for="event in upcomingEvents"
              :key="event.id"
              :class="['events__card', { 'events__card--locked': isEventLocked(event) }]"
              @click="handleUpcomingClick(event)"
            >
              <div class="events__card-hero">
                <img :src="event.img" alt="" class="events__card-img" />
                <span class="events__card-date">{{ event.dateLabel }}</span>
                <EntitlementLockBadge :locked="isEventLocked(event)" />
              </div>
              <div class="events__card-info">
                <span class="events__card-eyebrow">{{ event.timeLabel }}</span>
                <h3 class="events__card-name">{{ event.title }}</h3>
                <p class="events__card-desc">{{ event.description }}</p>
                <div v-if="event.plan === 'core'" class="events__card-footer">
                  <span class="events__tag events__tag--member">Solo miembros</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="events__empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="events__empty-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <p class="events__empty-text">No hay eventos programados</p>
          </div>
        </section>

        <!-- Past -->
        <section class="events__section">
          <p class="eyebrow">PASADOS</p>
          <div v-if="allPastEvents.length" class="events__past-list">
            <div
              v-for="event in allPastEvents"
              :key="event.id"
              :class="['events__past-card', { 'events__past-card--locked': isEventLocked(event) }]"
              @click="handleRecordedClick(event)"
            >
              <div class="events__past-img-wrap">
                <img :src="event.img" alt="" class="events__past-img" />
                <EntitlementLockBadge :locked="isEventLocked(event)" />
              </div>
              <div class="events__past-body">
                <span class="events__past-title">{{ event.title }}</span>
                <span class="events__past-meta">GRABACIÓN</span>
              </div>
              <svg class="events__past-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <!-- Infinite scroll sentinel -->
          <div v-if="pastHasMore" ref="pastSentinelRef" class="events__past-sentinel">
            <div v-for="i in 2" :key="i" style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) 0;">
              <UiSkeleton variant="rect" width="56px" height="56px" radius="var(--radius-lg)" />
              <div style="flex: 1;">
                <UiSkeleton variant="text" width="60%" height="14px" style="margin-bottom: 4px;" />
                <UiSkeleton variant="text" width="40%" height="10px" />
              </div>
            </div>
          </div>
          <div v-if="!allPastEvents.length && !pastHasMore" class="events__empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="events__empty-icon"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
            <p class="events__empty-text">Aún no hay eventos pasados</p>
          </div>
        </section>

        <EntitlementPurchaseModal v-model="showPurchaseModal" :addon="selectedAddon" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const PAST_PAGE_SIZE = 20

const router = useRouter()
const client = useSupabaseClient()
const { isSubscriber } = useAuth()
const { isLocked, getAddonForEntitlement } = useEntitlementGating()

const showPurchaseModal = ref(false)
const selectedAddon = ref<{ id: string; title: string; description: string | null } | null>(null)
const dateFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' })
const dayTimeFmt = new Intl.DateTimeFormat('es-MX', { weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' })

// Fetch user's registered event IDs (RLS scopes to current user automatically)
const { data: registeredEventIds } = useAsyncData('mobile-my-event-ids', async () => {
  const { data } = await client
    .from('event_registrations')
    .select('event_id')
    .eq('status', 'registered')
  return (data ?? []).map(r => r.event_id)
}, { lazy: true })

const { data: events, status: eventosStatus, refresh: refreshEventos } = useAsyncData('mobile-events', async () => {
  const { data } = await client.from('events').select('id, title, description, start_at, cover_url, entitlement_key, plan, status').in('status', ['published']).order('start_at')
  return data ?? []
}, { lazy: true })

const upcomingMapped = computed(() =>
  (events.value ?? [])
    .filter(e => new Date(e.start_at) > new Date())
    .map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      dateLabel: dateFmt.format(new Date(e.start_at)),
      timeLabel: dayTimeFmt.format(new Date(e.start_at)).toUpperCase() + ' CDMX',
      img: e.cover_url ?? undefined,
      entitlement_key: e.entitlement_key,
      plan: e.plan,
    })),
)

const myEventIds = computed(() => new Set(registeredEventIds.value ?? []))

const myEvents = computed(() =>
  upcomingMapped.value.filter(e => myEventIds.value.has(e.id)),
)

const upcomingEvents = computed(() =>
  upcomingMapped.value.filter(e => !myEventIds.value.has(e.id)),
)

const { data: pastEventsData } = useAsyncData('mobile-events-recorded', async () => {
  const { data: cat } = await client
    .from('content_categories')
    .select('id')
    .eq('slug', 'eventos-grabados')
    .single()
  if (!cat) return { categoryId: null, items: [], hasMore: false }
  const { data: itemCats } = await client
    .from('content_item_categories')
    .select('position, content_items(id, title, type, plan, duration_seconds, thumbnail_url, entitlement_key, status)')
    .eq('category_id', cat.id)
    .order('position')
    .range(0, PAST_PAGE_SIZE - 1)
  const items = (itemCats ?? [])
    .map(ic => ic.content_items as any)
    .filter((item: any) => item && item.status === 'published')
    .map((item: any) => ({
      id: item.id,
      title: item.title,
      img: item.thumbnail_url ?? undefined,
      entitlement_key: item.entitlement_key,
      plan: item.plan,
    }))
  return { categoryId: cat.id, items, hasMore: items.length >= PAST_PAGE_SIZE }
}, { lazy: true })

// ── Past events infinite scroll ──
const extraPastEvents = ref<any[]>([])
const pastHasMore = ref(false)
const pastLoadingMore = ref(false)
const pastOffset = ref(0)

watch(() => pastEventsData.value, (val) => {
  extraPastEvents.value = []
  pastHasMore.value = val?.hasMore ?? false
  pastOffset.value = val?.items.length ?? 0
}, { immediate: true })

const allPastEvents = computed(() => [...(pastEventsData.value?.items ?? []), ...extraPastEvents.value])

async function loadMorePast() {
  const categoryId = pastEventsData.value?.categoryId
  if (!categoryId || pastLoadingMore.value || !pastHasMore.value) return
  pastLoadingMore.value = true

  const { data: itemCats } = await client
    .from('content_item_categories')
    .select('position, content_items(id, title, type, plan, duration_seconds, thumbnail_url, entitlement_key, status)')
    .eq('category_id', categoryId)
    .order('position')
    .range(pastOffset.value, pastOffset.value + PAST_PAGE_SIZE - 1)

  const batch = (itemCats ?? [])
    .map(ic => ic.content_items as any)
    .filter((item: any) => item && item.status === 'published')
    .map((item: any) => ({
      id: item.id,
      title: item.title,
      img: item.thumbnail_url ?? undefined,
      entitlement_key: item.entitlement_key,
      plan: item.plan,
    }))
  extraPastEvents.value.push(...batch)
  pastOffset.value += batch.length
  pastHasMore.value = batch.length >= PAST_PAGE_SIZE
  pastLoadingMore.value = false
}

// ── IntersectionObserver for past events sentinel ──
const pastSentinelRef = ref<HTMLElement | null>(null)
let pastObserver: IntersectionObserver | null = null

onMounted(() => {
  pastObserver = new IntersectionObserver(
    (entries) => { if (entries[0]?.isIntersecting) loadMorePast() },
    { rootMargin: '200px' },
  )
  watchEffect(() => {
    pastObserver?.disconnect()
    if (pastSentinelRef.value) pastObserver?.observe(pastSentinelRef.value)
  })
})

onBeforeUnmount(() => pastObserver?.disconnect())

function isEventLocked(event: { entitlement_key: string | null; plan?: string | null }) {
  if (isLocked(event.entitlement_key)) return true
  if (event.plan === 'core' && !isSubscriber.value) return true
  return false
}

function handleUpcomingClick(event: { id: string; entitlement_key: string | null; plan?: string | null }) {
  if (isLocked(event.entitlement_key)) {
    selectedAddon.value = getAddonForEntitlement(event.entitlement_key!)
    showPurchaseModal.value = true
    return
  }
  if (event.plan === 'core' && !isSubscriber.value) {
    selectedAddon.value = { id: 'core', title: 'Plan Core', description: 'Suscríbete al plan Core para acceder a este evento.' }
    showPurchaseModal.value = true
    return
  }
  router.push(`/cuenta/eventos/${event.id}`)
}

function handleRecordedClick(item: { id: string; entitlement_key: string | null; plan?: string | null }) {
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
</script>

<style scoped>
/* ─── Header (matches retos) ─── */
.events__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.events__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.events__back {
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
  .events__back:hover { background: rgba(var(--tint-rgb), 0.04); }
}

/* ─── Sections ─── */
.events__section { margin-bottom: var(--space-8); }
.events__section > .eyebrow { margin-bottom: var(--space-3); }

/* ─── Upcoming cards ─── */
.events__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.events__card {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-decoration: none;
  color: var(--color-text);
}
.events__card + .events__card {
  border-top: 1px solid rgba(var(--tint-rgb), 0.1);
  padding-top: var(--space-8);
}

.events__card-hero {
  position: relative;
}

.events__card--locked .events__card-img {
  opacity: 0.65;
  filter: grayscale(20%);
}

.events__card-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-2xl);
}

.events__card-info {
  padding: var(--space-4) var(--space-1) 0;
}

.events__card-date {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-md);
  font-weight: var(--weight-bold);
  background: rgba(var(--tint-rgb), 0.5);
  color: var(--color-white);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  backdrop-filter: blur(4px);
}

.events__card-eyebrow {
  display: block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.events__card-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  margin: 0 0 var(--space-1);
  line-height: var(--leading-snug);
}

.events__card-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

.events__card-footer {
  margin-top: var(--space-3);
}

.events__tag {
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

.events__tag--member {
  background: var(--color-gold-bg);
  color: var(--color-gold);
}

.events__tag--registered {
  background: rgba(var(--color-success-rgb, 34, 197, 94), 0.12);
  color: var(--color-success, #16a34a);
}

/* ─── Past events (day__card style) ─── */
.events__past-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.events__past-card {
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
  .events__past-card:hover { background: rgba(var(--tint-rgb), 0.06); }
}
.events__past-card:active { background: rgba(var(--tint-rgb), 0.08); }

.events__past-img-wrap {
  position: relative;
  flex-shrink: 0;
}

.events__past-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.events__past-card--locked .events__past-img {
  opacity: 0.65;
  filter: grayscale(20%);
}

.events__past-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.events__past-title {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.events__past-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--color-muted);
  font-family: var(--font-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.events__past-chevron {
  flex-shrink: 0;
  color: var(--color-muted);
}

/* ─── Empty state ─── */
.events__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-8) var(--space-4);
  gap: var(--space-3);
}

.events__empty-icon {
  color: var(--color-muted);
  opacity: 0.5;
}

.events__empty-text {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

/* ─── Error state ─── */
.events__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.events__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.events__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.events__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}

/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .events__header {
    justify-content: flex-start;
  }

  .events__header-title {
    display: none;
  }

  .events__back {
    display: none;
  }

  .events__list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }

  .events__card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: border-color var(--transition-fast);
  }

  @media (hover: hover) {
    .events__card:hover {
      border-color: var(--color-border);
    }
  }

  .events__card + .events__card {
    border-top: none;
    padding-top: 0;
  }

  .events__card-img {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    aspect-ratio: 16 / 9;
  }

  .events__card-info {
    padding: var(--space-4) var(--space-5);
  }

  .events__past-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .events__past-card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
  }

  @media (hover: hover) {
    .events__past-card:hover {
      background: var(--color-desktop-card);
      border-color: var(--color-border);
    }
  }
}
</style>
