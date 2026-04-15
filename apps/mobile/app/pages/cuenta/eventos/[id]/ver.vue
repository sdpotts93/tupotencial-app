<template>
  <div v-if="watchStatus === 'pending'" class="watch" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
    <UiSkeleton variant="rect" width="80%" height="50%" radius="var(--radius-lg)" style="margin-bottom: var(--space-6);" />
    <UiSkeleton variant="text" width="50%" height="20px" style="margin-bottom: var(--space-2);" />
    <UiSkeleton variant="text" width="30%" height="14px" />
  </div>
  <div v-else-if="watchStatus === 'error'" class="watch" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
    <div class="watch__error">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="watch__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
      <h2 class="watch__error-title">No pudimos cargar el video</h2>
      <p class="watch__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
      <UiButton variant="primary-outline" size="sm" @click="refreshWatch()">Reintentar</UiButton>
    </div>
  </div>
  <div v-else class="watch">
    <!-- Nav overlaid on player -->
    <div class="watch__nav safe-top">
      <button class="watch__back" aria-label="Volver" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <span v-if="event.isLive && event.isTransmitting" class="watch__badge watch__badge--live">EN VIVO</span>
    </div>

    <!-- Fullscreen player -->
    <div class="watch__player">
      <!-- Live & Transmitting: Vimeo embed -->
      <iframe
        v-if="event.isLive && event.isTransmitting && event.vimeoEmbedUrl"
        :src="event.vimeoEmbedUrl"
        class="watch__iframe"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      />
      <!-- Upcoming: countdown -->
      <div v-else-if="event.isUpcoming" class="watch__countdown">
        <h2 class="watch__countdown-title">{{ event.title }}</h2>
        <p class="watch__countdown-label">El evento comienza en</p>
        <div class="watch__countdown-timer">
          <div class="watch__countdown-unit">
            <span class="watch__countdown-value">{{ countdown.days }}</span>
            <span class="watch__countdown-suffix">días</span>
          </div>
          <span class="watch__countdown-sep">:</span>
          <div class="watch__countdown-unit">
            <span class="watch__countdown-value">{{ countdown.hours }}</span>
            <span class="watch__countdown-suffix">hrs</span>
          </div>
          <span class="watch__countdown-sep">:</span>
          <div class="watch__countdown-unit">
            <span class="watch__countdown-value">{{ countdown.minutes }}</span>
            <span class="watch__countdown-suffix">min</span>
          </div>
          <span class="watch__countdown-sep">:</span>
          <div class="watch__countdown-unit">
            <span class="watch__countdown-value">{{ countdown.seconds }}</span>
            <span class="watch__countdown-suffix">seg</span>
          </div>
        </div>
        <p class="watch__countdown-date">{{ event.dateLabel }}</p>
      </div>
      <!-- Live but waiting for transmission -->
      <div v-else-if="event.isLive && !event.isTransmitting" class="watch__placeholder">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="watch__spinner">
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
        </svg>
        <p>Esperando transmisión...</p>
      </div>
      <!-- No video available -->
      <div v-else class="watch__placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
        <p>Video no disponible</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const id = route.params.id as string
const client = useSupabaseClient()

const { data: eventData, status: watchStatus, refresh: refreshWatch } = useAsyncData(`event-watch-${id}`, async () => {
  const { data } = await (client.rpc as any)('get_secure_event', { p_event_id: id }) as { data: Record<string, any> | null }
  if (!data || !data.access_granted) {
    navigateTo(`/cuenta/eventos/${id}`)
    return null
  }
  return data
}, { lazy: true })

const now = ref(new Date())
const isTransmitting = ref(false)
let ticker: ReturnType<typeof setInterval> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
let vimeoStatusTimer: ReturnType<typeof setInterval> | null = null

async function checkVimeoStatus() {
  const vimeoId = eventData.value?.vimeo_live_event_id
  if (!vimeoId) return

  try {
    const res = await $fetch<{ is_transmitting: boolean }>(`/api/vimeo/live-status?id=${vimeoId}`)
    isTransmitting.value = res.is_transmitting
  }
  catch {
    // Ignore errors, keep previous state
  }
}

onMounted(() => {
  ticker = setInterval(() => { now.value = new Date() }, 1000)
})
onBeforeUnmount(() => {
  if (ticker) clearInterval(ticker)
  if (pollTimer) clearInterval(pollTimer)
  if (vimeoStatusTimer) clearInterval(vimeoStatusTimer)
})

const dayTimeFmt = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Mexico_City',
})

const event = computed(() => {
  const e = eventData.value
  if (!e) return { title: '', subtitle: '', isLive: false, isUpcoming: false, isTransmitting: false, vimeoEmbedUrl: null as string | null, dateLabel: '', startAt: null as Date | null, vimeoId: null as string | null }
  const startDate = new Date(e.start_at)
  const endDate = e.end_at ? new Date(e.end_at) : new Date(startDate.getTime() + (parseInt(e.duration) || 60) * 60 * 1000)
  const liveId = e.vimeo_live_event_id as string | null
  // isUpcoming: scheduled time hasn't arrived
  const isUpcoming = startDate > now.value
  // isLive: within the event time window and published (but may not be transmitting yet)
  const isLive = e.status === 'published' && now.value < endDate && !isUpcoming
  return {
    title: e.title,
    subtitle: e.description ?? '',
    isLive,
    isUpcoming,
    isTransmitting: isTransmitting.value,
    vimeoEmbedUrl: liveId ? `https://player.vimeo.com/video/${liveId}` : null,
    dateLabel: dayTimeFmt.format(startDate).toUpperCase() + ' CDMX',
    startAt: startDate,
    vimeoId: liveId,
  }
})

const countdown = computed(() => {
  if (!event.value.startAt) return { days: '00', hours: '00', minutes: '00', seconds: '00' }
  const diff = Math.max(0, event.value.startAt.getTime() - now.value.getTime())
  const totalSec = Math.floor(diff / 1000)
  const days = String(Math.floor(totalSec / 86400)).padStart(2, '0')
  const hours = String(Math.floor((totalSec % 86400) / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSec % 60).padStart(2, '0')
  return { days, hours, minutes, seconds }
})

// Poll Vimeo status when event is live but not yet transmitting
watch(
  [
    watchStatus,
    () => event.value.isLive,
    () => event.value.vimeoId,
    () => event.value.isTransmitting,
  ],
  ([status, isLive, vimeoId, transmitting]) => {
    // If no vimeo ID yet, poll for event data to get it
    if (status === 'success' && isLive && !vimeoId) {
      if (!pollTimer) {
        pollTimer = setInterval(refreshWatch, 10_000)
      }
      return
    }

    // Clear event data poll if we have vimeo ID
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }

    // If live with vimeo ID but not transmitting, poll Vimeo status
    const shouldPollVimeo = status === 'success' && isLive && vimeoId && !transmitting
    if (shouldPollVimeo) {
      // Check immediately
      checkVimeoStatus()
      // Then poll every 10 seconds
      if (!vimeoStatusTimer) {
        vimeoStatusTimer = setInterval(checkVimeoStatus, 10_000)
      }
    }
    else {
      if (vimeoStatusTimer) {
        clearInterval(vimeoStatusTimer)
        vimeoStatusTimer = null
      }
    }
  },
  { immediate: true },
)

// Also check when event is upcoming but countdown reaches zero
watch(
  () => event.value.isUpcoming,
  (isUpcoming, wasUpcoming) => {
    if (wasUpcoming && !isUpcoming) {
      // Event just became "live" by time, check vimeo status
      checkVimeoStatus()
    }
  },
)
</script>

<style scoped>
.watch {
  position: relative;
  width: 100%;
  height: 100dvh;
  background: var(--color-black);
  color: var(--color-white);
  overflow: hidden;
}

/* ─── Nav (overlaid top) ─── */
.watch__nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
}

.watch__back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--tint-rgb), 0.4);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--color-white);
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .watch__back:hover { background: rgba(var(--tint-rgb), 0.6); }
}

.watch__badge {
  font-size: 10px;
  font-family: var(--font-eyebrow);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background: rgba(var(--tint-rgb), 0.4);
  backdrop-filter: blur(8px);
  color: rgba(var(--tint-inverse-rgb), 0.6);
}

.watch__badge--live {
  background: var(--color-live);
  color: var(--color-white);
}

/* ─── Player (fullscreen) ─── */
.watch__player {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-black);
}

.watch__iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
}

.watch__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  color: rgba(var(--tint-inverse-rgb), 0.5);
  font-size: var(--text-sm);
  max-width: 100%;
}

/* ─── Countdown ─── */
.watch__countdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--space-4);
  padding: var(--space-6);
}

.watch__countdown-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-white);
  max-width: 30ch;
  line-height: var(--leading-snug);
}

.watch__countdown-label {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--tint-inverse-rgb), 0.5);
}

.watch__countdown-timer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.watch__countdown-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 44px;
}

.watch__countdown-value {
  font-family: var(--font-eyebrow);
  font-size: clamp(24px, 8vw, 40px);
  font-weight: var(--weight-bold);
  color: var(--color-white);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.watch__countdown-suffix {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  text-transform: uppercase;
  color: rgba(var(--tint-inverse-rgb), 0.4);
  margin-top: var(--space-1);
}

.watch__countdown-sep {
  font-size: clamp(20px, 6vw, 32px);
  font-weight: var(--weight-bold);
  color: rgba(var(--tint-inverse-rgb), 0.3);
  line-height: 1;
  margin-bottom: 12px;
}

@media (max-width: 360px) {
  .watch__countdown-timer {
    gap: var(--space-1);
  }
  .watch__countdown-unit {
    min-width: 36px;
  }
}

.watch__countdown-date {
  font-size: var(--text-sm);
  color: rgba(var(--tint-inverse-rgb), 0.5);
}

/* ─── Spinner ─── */
.watch__spinner {
  animation: watch-spin 0.8s linear infinite;
  color: var(--color-white);
}
@keyframes watch-spin {
  to { transform: rotate(360deg); }
}

/* ─── Info (overlaid bottom) ─── */
.watch__info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  padding: var(--space-8) var(--space-5) var(--space-5);
  background: linear-gradient(to top, rgba(var(--tint-rgb), 0.85) 0%, transparent 100%);
}

.watch__title {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  color: var(--color-white);
}

.watch__subtitle {
  font-size: var(--text-sm);
  color: rgba(var(--tint-inverse-rgb), 0.6);
  margin-top: var(--space-1);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .watch {
    position: fixed;
    top: calc(var(--topbar-height) + 16px);
    left: calc(var(--sidebar-width) + 16px);
    right: 16px;
    bottom: 16px;
    width: auto;
    height: auto;
    border-radius: 12px;
  }
}

/* ─── Error state ─── */
.watch__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.watch__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.watch__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.watch__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
