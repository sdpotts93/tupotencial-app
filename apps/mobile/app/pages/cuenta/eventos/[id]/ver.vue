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
      <span :class="['watch__badge', { 'watch__badge--live': event.isLive }]">
        {{ event.isLive ? 'EN VIVO' : 'GRABACIÓN' }}
      </span>
    </div>

    <!-- Fullscreen player -->
    <div class="watch__player">
      <div class="watch__placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
        <p>Vimeo embed</p>
        <p class="watch__hint">Aquí se cargará el video de Vimeo</p>
      </div>
    </div>

    <!-- Info overlaid at bottom -->
    <div class="watch__info safe-bottom">
      <h2 class="watch__title">{{ event.title }}</h2>
      <p class="watch__subtitle">{{ event.subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const id = route.params.id as string
const client = useSupabaseClient()

const { data: eventData, status: watchStatus, refresh: refreshWatch } = useAsyncData(`event-watch-${id}`, async () => {
  const { data } = await client.rpc('get_secure_event', { p_event_id: id })
  if (!data || !data.access_granted) {
    navigateTo(`/cuenta/eventos/${id}`)
    return null
  }
  return data
}, { lazy: true })

const event = computed(() => {
  const e = eventData.value
  if (!e) return { title: '', subtitle: '', isLive: false }
  const startDate = new Date(e.start_at)
  return {
    title: e.title,
    subtitle: e.description ?? '',
    isLive: startDate > new Date() && e.status === 'published',
  }
})
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

/* ─── Player (fullscreen, centered) ─── */
.watch__player {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-black);
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

.watch__hint { font-size: var(--text-xs); }

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
