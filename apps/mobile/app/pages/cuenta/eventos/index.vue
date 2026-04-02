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
      <template v-else>
        <!-- Upcoming -->
        <section class="events__section">
          <p class="eyebrow">PRÓXIMOS</p>
          <div class="events__list">
            <div
              v-for="event in upcomingEvents"
              :key="event.id"
              :class="['events__card', { 'events__card--locked': isEventLocked(event) }]"
              @click="handleEventClick(event)"
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
                <div v-if="event.requiresSub || isEventLocked(event)" class="events__card-footer">
                  <span v-if="event.requiresSub" class="events__tag events__tag--member">Solo miembros</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Past -->
        <section class="events__section">
          <p class="eyebrow">PASADOS</p>
          <div class="events__past-list">
            <div
              v-for="event in pastEvents"
              :key="event.id"
              :class="['events__past-card', { 'events__past-card--locked': isEventLocked(event) }]"
              @click="handleEventClick(event)"
            >
              <div class="events__past-img-wrap">
                <img :src="event.img" alt="" class="events__past-img" />
                <EntitlementLockBadge :locked="isEventLocked(event)" />
              </div>
              <div class="events__past-body">
                <span class="events__past-title">{{ event.title }}</span>
                <span class="events__past-meta">GRABACIÓN · {{ event.dateLabel }}</span>
              </div>
              <svg class="events__past-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </section>

        <EntitlementPurchaseModal v-model="showPurchaseModal" :addon="selectedAddon" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const client = useSupabaseClient()
const { isSubscriber } = useAuth()
const { isLocked, getAddonForEntitlement } = useEntitlementGating()

const showPurchaseModal = ref(false)
const selectedAddon = ref<{ id: string; title: string; description: string | null } | null>(null)
const dateFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' })
const dateFmtFull = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
const dayTimeFmt = new Intl.DateTimeFormat('es-MX', { weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' })

const { data: events, status: eventosStatus } = useAsyncData('mobile-events', async () => {
  const { data } = await client.from('events').select('id, title, description, start_at, cover_url, requires_subscription, entitlement_key, plan, status').in('status', ['published']).order('start_at')
  return data ?? []
}, { lazy: true })

const upcomingEvents = computed(() =>
  (events.value ?? [])
    .filter(e => new Date(e.start_at) > new Date())
    .map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      dateLabel: dateFmt.format(new Date(e.start_at)),
      timeLabel: dayTimeFmt.format(new Date(e.start_at)).toUpperCase() + ' CDMX',
      img: e.cover_url ?? null,
      requiresSub: e.requires_subscription,
      entitlement_key: e.entitlement_key,
      plan: e.plan,
    })),
)

const pastEvents = computed(() =>
  (events.value ?? [])
    .filter(e => new Date(e.start_at) <= new Date())
    .map(e => ({
      id: e.id,
      title: e.title,
      dateLabel: dateFmtFull.format(new Date(e.start_at)),
      img: e.cover_url ?? null,
      entitlement_key: e.entitlement_key,
      plan: e.plan,
      requiresSub: e.requires_subscription,
    })),
)

function isEventLocked(event: { entitlement_key: string | null; plan?: string; requiresSub?: boolean }) {
  if (isLocked(event.entitlement_key)) return true
  if (event.plan === 'core' && !isSubscriber.value) return true
  if (event.requiresSub && !isSubscriber.value) return true
  return false
}

function handleEventClick(event: { id: string; entitlement_key: string | null; plan?: string; requiresSub?: boolean }) {
  if (isLocked(event.entitlement_key)) {
    selectedAddon.value = getAddonForEntitlement(event.entitlement_key!)
    showPurchaseModal.value = true
    return
  }
  if ((event.plan === 'core' || event.requiresSub) && !isSubscriber.value) {
    selectedAddon.value = { id: 'core', title: 'Plan Core', description: 'Suscríbete al plan Core para acceder a este evento.' }
    showPurchaseModal.value = true
    return
  }
  router.push(`/cuenta/eventos/${event.id}`)
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
