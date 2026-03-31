<template>
  <div class="screen">
    <div class="edetail">
      <!-- Media -->
      <div class="edetail__media">
        <img :src="event.img" alt="" class="edetail__img" />
        <div class="edetail__overlay" />
        <div class="edetail__nav safe-top">
          <button class="edetail__back" aria-label="Volver" @click="$router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="edetail__info">
        <button class="edetail__back-link" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <p class="eyebrow">{{ event.dateLabel }}</p>
        <h1 class="title title--lg edetail__title">{{ event.title }}</h1>

        <div class="edetail__actions">
          <UiButton variant="outline" block :to="`/cuenta/eventos/${id}/ver`">
            {{ event.isLive ? 'Ver en vivo' : 'Ver grabación' }}
          </UiButton>
        </div>

        <p class="edetail__desc">{{ event.description }}</p>

        <div class="edetail__meta">
          <span v-if="event.requiresSub" class="edetail__tag edetail__tag--member">Solo miembros</span>
          <UiTag>{{ event.status }}</UiTag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const id = route.params.id as string
const client = useSupabaseClient()

const dayTimeFmt = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Mexico_City',
})

const statusLabels: Record<string, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  cancelled: 'Cancelado',
}

const { data: eventData } = await useAsyncData(`event-${id}`, async () => {
  const { data } = await client.rpc('get_secure_event', { p_event_id: id })
  return data
})

const event = computed(() => {
  const e = eventData.value
  if (!e) return { title: '', description: '', dateLabel: '', img: '/images/lib-4.jpg', requiresSub: false, status: '', isLive: false, accessGranted: false }
  const startDate = new Date(e.start_at)
  return {
    title: e.title,
    description: e.description ?? '',
    dateLabel: dayTimeFmt.format(startDate).toUpperCase() + ' CDMX',
    img: e.cover_url ?? '/images/lib-4.jpg',
    requiresSub: e.requires_subscription,
    status: statusLabels[e.status] ?? e.status,
    isLive: startDate > new Date() && e.status === 'published',
    accessGranted: e.access_granted,
  }
})
</script>

<style scoped>
/* ─── Mobile layout ─── */
.edetail {
  display: flex;
  flex-direction: column;
}

/* ─── Media ─── */
.edetail__media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.edetail__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edetail__overlay {
  position: absolute;
  inset: 0;
}

/* ─── Nav (mobile back) ─── */
.edetail__nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: var(--space-3) var(--space-4);
}

.edetail__back {
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
  .edetail__back:hover { background: rgba(var(--tint-inverse-rgb), 1); }
}

/* ─── Back link (desktop only) ─── */
.edetail__back-link {
  display: none;
}

/* ─── Info ─── */
.edetail__info {
  padding: var(--space-4);
  padding-bottom: 2rem;
  width: 100%;
  max-width: var(--max-content-width);
  margin: 0 auto;
}

.edetail__title {
  margin-top: var(--space-1);
  margin-bottom: var(--space-2);
}

/* ─── Actions ─── */
.edetail__actions { margin: var(--space-5) 0; }

/* ─── Description ─── */
.edetail__desc {
  font-size: var(--text-base);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-5);
}

/* ─── Meta ─── */
.edetail__meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-8);
}

.edetail__tag {
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

.edetail__tag--member {
  background: var(--color-gold-bg);
  color: var(--color-gold);
}

.edetail__meta :deep(.tag) {
  background: var(--color-sand);
  color: var(--color-white);
}

/* ─── Tablet ─── */
@media (min-width: 768px) {
  .edetail__info {
    max-width: var(--max-page-width);
    padding: var(--space-6);
  }
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .edetail {
    display: grid;
    grid-template-columns: 55fr 45fr;
    background: var(--color-desktop-card);
    border-radius: var(--radius-2xl);
    overflow: hidden;
    border: 1px solid var(--color-desktop-border);
    margin: var(--space-6);
    min-height: 480px;
    max-width: 1100px;
  }

  .edetail__media {
    order: 2;
    aspect-ratio: unset;
  }

  .edetail__nav { display: none; }

  .edetail__back-link {
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
    .edetail__back-link:hover { background: rgba(var(--tint-rgb), 0.06); }
  }

  .edetail__info {
    order: 1;
    max-width: none;
    margin: 0;
    padding: var(--space-10);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .edetail__title {
    font-size: var(--title-xl);
  }

  .edetail__desc {
    font-size: var(--text-lg);
  }

  .edetail__info > .eyebrow {
    font-size: var(--eyebrow-lg);
  }

  .edetail__actions :deep(.btn) {
    width: auto;
    display: inline-flex;
  }
}
</style>
