<template>
  <div v-if="playerStatus === 'pending'" class="player" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
    <UiSkeleton variant="rect" width="80%" height="60%" radius="var(--radius-lg)" style="margin-bottom: var(--space-6);" />
    <UiSkeleton variant="text" width="50%" height="20px" style="margin-bottom: var(--space-2);" />
    <UiSkeleton variant="text" width="30%" height="14px" />
  </div>
  <div v-else-if="playerStatus === 'error'" class="player" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
    <div class="player__error">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="player__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
      <h2 class="player__error-title">No pudimos cargar el reproductor</h2>
      <p class="player__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
      <UiButton variant="primary-outline" size="sm" @click="refreshPlayer()">Reintentar</UiButton>
    </div>
  </div>
  <div v-else class="player" :class="{ 'player--audio': isAudio, 'player--vimeo': isVimeo }" @click="toggleControls">
    <!-- Audio mode: cover image + hidden audio element -->
    <template v-if="isAudio">
      <img v-if="content.thumbnail" :src="content.thumbnail" alt="" class="player__cover" />
      <audio
        ref="videoRef"
        :src="content.mediaUrl"
        preload="metadata"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @ended="onEnded"
        @waiting="isBuffering = true"
        @canplay="isBuffering = false"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      />
    </template>
    <!-- Vimeo embed (chromeless — our controls handle UI) -->
    <iframe
      v-else-if="content.vimeoId"
      ref="vimeoIframe"
      class="player__video"
      :src="`https://player.vimeo.com/video/${content.vimeoId}?controls=0&autoplay=1&title=0&byline=0&portrait=0&transparent=1`"
      frameborder="0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen
    />
    <!-- Fallback: native video -->
    <video
      v-else
      ref="videoRef"
      class="player__video"
      :src="content.mediaUrl"
      playsinline
      preload="metadata"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @waiting="isBuffering = true"
      @canplay="isBuffering = false"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    />

    <!-- Gradient scrims -->
    <div class="player__scrims" :class="{ 'player__scrims--visible': controlsVisible }">
      <div class="player__scrim-top" />
      <div class="player__scrim-bottom" />
    </div>

    <!-- Top bar: back + time -->
    <Transition name="fade">
      <div v-show="controlsVisible" class="player__top safe-top" @click.stop>
        <button class="player__back-btn" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Center: buffering spinner -->
    <Transition name="fade">
      <div v-show="isBuffering" class="player__center-spinner">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="player__spinner">
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
        </svg>
      </div>
    </Transition>

    <!-- Bottom controls -->
    <Transition name="fade">
      <div v-show="controlsVisible" class="player__bottom" @click.stop>
        <h2 class="player__title">{{ content.title }}</h2>
        <p class="player__subtitle">{{ content.subtitle }}</p>

        <!-- Progress bar -->
        <div class="player__progress" ref="progressRef">
          <div
            class="player__progress-track"
            @click="onProgressClick"
            @touchstart.prevent="onProgressTouchStart"
            @touchmove.prevent="onProgressTouchMove"
            @touchend="onProgressTouchEnd"
          >
            <div class="player__progress-fill" :style="{ width: progressPercent + '%' }" />
            <div
              class="player__progress-thumb"
              :class="{ 'player__progress-thumb--active': isScrubbing }"
              :style="{ left: progressPercent + '%' }"
            />
          </div>
          <div class="player__progress-times">
            <span>{{ formattedCurrentTime }}</span>
            <span>{{ formattedDuration }}</span>
          </div>
        </div>

        <!-- Transport buttons -->
        <div class="player__buttons">
          <button class="player__btn" aria-label="Retroceder 15s" @click="skip(-15)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/><text x="12" y="16" text-anchor="middle" font-size="8" fill="currentColor" stroke="none">15</text></svg>
          </button>
          <button class="player__btn player__btn--play" :aria-label="isPlaying ? 'Pausar' : 'Reproducir'" @click="togglePlayPause">
            <svg v-if="isPlaying" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </button>
          <button class="player__btn" aria-label="Adelantar 15s" @click="skip(15)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/><text x="12" y="16" text-anchor="middle" font-size="8" fill="currentColor" stroke="none">15</text></svg>
          </button>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import Player from '@vimeo/player'

definePageMeta({ layout: 'blank' })

const route = useRoute()
const contentId = route.params.id as string
const client = useSupabaseClient()

// ── Refs ──
const videoRef = ref<HTMLVideoElement | null>(null)
const vimeoIframe = ref<HTMLIFrameElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)

// ── Playback state ──
const isPlaying = ref(false)
const isBuffering = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isScrubbing = ref(false)

// ── Controls visibility ──
const controlsVisible = ref(true)
let hideTimer: ReturnType<typeof setTimeout> | null = null

// ── Vimeo SDK instance ──
let vimeoPlayer: Player | null = null

// ── Content from DB ──
const { data: contentData, status: playerStatus, refresh: refreshPlayer } = useAsyncData(`content-player-${contentId}`, async () => {
  const { data } = await (client.rpc as any)('get_secure_content', { p_content_id: contentId })
  if (!data) return null
  if (!data.access_granted) {
    navigateTo(`/cuenta/contenido/${contentId}`)
    return null
  }
  const durationLabel = data.duration_seconds
    ? `${Math.round(data.duration_seconds / 60)} min`
    : ''
  const typeLabel = data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : ''

  return {
    title: data.title as string,
    subtitle: [typeLabel, durationLabel].filter(Boolean).join(' \u2022 '),
    vimeoId: (data.vimeo_id as string) ?? null,
    mediaPath: (data.media_url as string) ?? null,
    type: data.type as 'video' | 'audio',
    thumbnail: (data.thumbnail_url as string) ?? null,
  }
}, { lazy: true })

const contentBase = computed(() => contentData.value ?? {
  title: '',
  subtitle: '',
  vimeoId: null as string | null,
  mediaPath: null as string | null,
  type: 'video' as const,
  thumbnail: null as string | null,
})

// Resolve storage path to signed URL on client side
const mediaUrl = ref('')

const content = computed(() => ({
  ...contentBase.value,
  mediaUrl: mediaUrl.value,
}))

const isVimeo = computed(() => !!content.value.vimeoId)
const isAudio = computed(() => content.value.type === 'audio')

// ── Computed ──
const progressPercent = computed(() =>
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0,
)

const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── Play / Pause (works for all modes) ──
async function togglePlayPause() {
  if (isVimeo.value && vimeoPlayer) {
    const paused = await vimeoPlayer.getPaused()
    paused ? vimeoPlayer.play() : vimeoPlayer.pause()
  } else {
    const video = videoRef.value
    if (!video) return
    video.paused ? video.play() : video.pause()
  }
  resetHideTimer()
}

// ── Skip ±15s ──
async function skip(seconds: number) {
  if (isVimeo.value && vimeoPlayer) {
    const time = await vimeoPlayer.getCurrentTime()
    const dur = await vimeoPlayer.getDuration()
    vimeoPlayer.setCurrentTime(Math.max(0, Math.min(time + seconds, dur)))
  } else {
    const video = videoRef.value
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration || 0))
  }
  resetHideTimer()
}

// ── Native video events ──
function onLoadedMetadata() {
  const video = videoRef.value
  if (!video) return
  duration.value = video.duration
}

function onTimeUpdate() {
  if (isScrubbing.value) return
  const video = videoRef.value
  if (!video) return
  currentTime.value = video.currentTime
}

function onEnded() {
  isPlaying.value = false
  controlsVisible.value = true
  if (hideTimer) clearTimeout(hideTimer)
}

// ── Controls auto-hide ──
function resetHideTimer() {
  if (hideTimer) clearTimeout(hideTimer)
  controlsVisible.value = true
  if (isPlaying.value && !isAudio.value) {
    hideTimer = setTimeout(() => {
      controlsVisible.value = false
    }, 3000)
  }
}

function toggleControls() {
  if (isAudio.value) return
  if (controlsVisible.value) {
    controlsVisible.value = false
    if (hideTimer) clearTimeout(hideTimer)
  } else {
    resetHideTimer()
  }
}

// ── Progress bar interaction ──
function calcProgressFromX(clientX: number): number {
  const el = progressRef.value
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
}

function seekToRatio(ratio: number) {
  if (isVimeo.value && vimeoPlayer) {
    vimeoPlayer.setCurrentTime(ratio * duration.value)
    currentTime.value = ratio * duration.value
  } else {
    const video = videoRef.value
    if (!video || !duration.value) return
    video.currentTime = ratio * duration.value
    currentTime.value = video.currentTime
  }
}

function onProgressClick(e: MouseEvent) {
  seekToRatio(calcProgressFromX(e.clientX))
  resetHideTimer()
}

function onProgressTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (!touch) return
  isScrubbing.value = true
  seekToRatio(calcProgressFromX(touch.clientX))
}

function onProgressTouchMove(e: TouchEvent) {
  const touch = e.touches[0]
  if (!isScrubbing.value || !touch) return
  seekToRatio(calcProgressFromX(touch.clientX))
}

function onProgressTouchEnd() {
  isScrubbing.value = false
  resetHideTimer()
}

// ── Lifecycle ──
onMounted(async () => {
  const today = new Date().toISOString().slice(0, 10)
  localStorage.setItem(`hoy-content-done-${today}`, contentId)

  // Mark program day item as completed when navigating from a program day
  const dayItemId = route.query.dayItemId as string | undefined
  const programIdParam = route.query.programId as string | undefined
  const dayIndexParam = route.query.dayIndex as string | undefined
  const runParam = route.query.run as string | undefined
  if (dayItemId && programIdParam && dayIndexParam && runParam) {
    const { markDayItemCompleted } = useDayItemCompletion()
    markDayItemCompleted({ programId: programIdParam, dayIndex: Number(dayIndexParam), dayItemId, run: Number(runParam) })
  }

  // Resolve storage path to signed URL
  const path = contentBase.value.mediaPath
  if (path && !path.startsWith('http')) {
    const { data: signed } = await client.storage
      .from('content-media')
      .createSignedUrl(path, 3600)
    if (signed?.signedUrl) mediaUrl.value = signed.signedUrl
  } else if (path) {
    mediaUrl.value = path
  }

  // Wait a tick for the media element to update its src
  await nextTick()

  if (isVimeo.value && vimeoIframe.value) {
    // ── Init Vimeo SDK ──
    vimeoPlayer = new Player(vimeoIframe.value)

    vimeoPlayer.getDuration().then((d) => { duration.value = d })

    vimeoPlayer.on('play', () => {
      isPlaying.value = true
      isBuffering.value = false
      resetHideTimer()
    })
    vimeoPlayer.on('pause', () => { isPlaying.value = false })
    vimeoPlayer.on('ended', () => onEnded())
    vimeoPlayer.on('bufferstart', () => { isBuffering.value = true })
    vimeoPlayer.on('bufferend', () => { isBuffering.value = false })
    vimeoPlayer.on('timeupdate', (e: { seconds: number; duration: number }) => {
      if (!isScrubbing.value) {
        currentTime.value = e.seconds
        duration.value = e.duration
      }
    })
  } else {
    // ── Native audio/video ──
    const video = videoRef.value
    if (!video) return

    if (video.readyState >= 1) {
      duration.value = video.duration
    }

    if (isAudio.value) {
      controlsVisible.value = true
    }

    video.play()
      .then(() => { if (!isAudio.value) resetHideTimer() })
      .catch(() => {
        isPlaying.value = false
        controlsVisible.value = true
      })
  }
})

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer)
  if (vimeoPlayer) {
    vimeoPlayer.destroy()
    vimeoPlayer = null
  }
})
</script>

<style scoped>
/* ─── Container: black fullscreen ─── */
.player {
  position: relative;
  width: 100%;
  height: 100dvh;
  background: var(--color-black);
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* ─── Video ─── */
.player__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: contain;
}

/* ─── Vimeo: iframe is display-only, controls overlay handles interaction ─── */
.player--vimeo iframe { pointer-events: none; }

/* ─── Audio mode: cover image ─── */
.player__cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(20px) brightness(0.4);
  transform: scale(1.1);
}
.player--audio .player__scrims { display: none; }

/* ─── Gradient scrims ─── */
.player__scrims {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.player__scrim-top,
.player__scrim-bottom {
  position: absolute;
  left: 0;
  right: 0;
  transition: opacity var(--transition-base);
  opacity: 0;
}

.player__scrims--visible .player__scrim-top,
.player__scrims--visible .player__scrim-bottom {
  opacity: 1;
}

.player__scrim-top {
  top: 0;
  height: 120px;
  background: linear-gradient(to bottom, rgba(var(--tint-rgb), 0.7) 0%, transparent 100%);
}

.player__scrim-bottom {
  bottom: 0;
  height: 280px;
  background: linear-gradient(to top, rgba(var(--tint-rgb), 0.85) 0%, transparent 100%);
}

/* ─── Top bar ─── */
.player__top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
}

.player__back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}

/* ─── Center spinner (buffering) ─── */
.player__center-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--z-sticky);
  color: var(--color-white);
  pointer-events: none;
}

.player__spinner {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Bottom controls ─── */
.player__bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: var(--space-6);
  padding-bottom: calc(var(--space-4) + var(--safe-area-bottom));
}

.player__title {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  color: var(--color-white);
}

.player__subtitle {
  font-size: var(--text-sm);
  color: rgba(var(--tint-inverse-rgb), 0.6);
  margin-top: var(--space-1);
}

/* ─── Progress bar ─── */
.player__progress {
  margin-top: var(--space-5);
}

.player__progress-track {
  position: relative;
  height: 32px;
  display: flex;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.player__progress-track::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(var(--tint-inverse-rgb), 0.2);
  border-radius: var(--radius-full);
}

.player__progress-fill {
  position: absolute;
  left: 0;
  height: 4px;
  background: var(--color-white);
  border-radius: var(--radius-full);
  pointer-events: none;
}

.player__progress-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-white);
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  pointer-events: none;
}

.player__progress-thumb--active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.2);
}

.player__progress-times {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: rgba(var(--tint-inverse-rgb), 0.5);
  font-family: var(--font-eyebrow);
}

/* ─── Transport buttons ─── */
.player__buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
  margin-top: var(--space-5);
}

.player__btn {
  background: none;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  -webkit-tap-highlight-color: transparent;
}
.player__btn:active { opacity: 0.7; }

.player__btn--play {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-white);
  color: var(--color-black);
  padding: 0;
}
.player__btn--play:active { transform: scale(0.95); }

/* ─── Fade transition (for controls) ─── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .player {
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
.player__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.player__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.player__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.player__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
