<template>
  <div class="player" @click="toggleControls">
    <!-- Video element -->
    <video
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

    <!-- Center: buffering spinner only (play/pause lives in bottom controls) -->
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
definePageMeta({ layout: 'blank' })

const route = useRoute()
const contentId = route.params.id as string
const client = useSupabaseClient()

// ── Video refs ──
const videoRef = ref<HTMLVideoElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)

// ── Video state ──
const isPlaying = ref(false)
const isBuffering = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isScrubbing = ref(false)

// ── Controls visibility ──
const controlsVisible = ref(true)
let hideTimer: ReturnType<typeof setTimeout> | null = null

// ── Content from DB ──
const { data: contentData } = await useAsyncData(`content-player-${contentId}`, async () => {
  const { data } = await client
    .from('content_items')
    .select('id, title, subtitle, type, duration_seconds, media_url')
    .eq('id', contentId)
    .single()
  if (!data) return null
  const durationLabel = data.duration_seconds
    ? `${Math.round(data.duration_seconds / 60)} min`
    : ''
  const typeLabel = data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : ''
  return {
    title: data.title,
    subtitle: [typeLabel, durationLabel].filter(Boolean).join(' \u2022 '),
    mediaUrl: data.media_url ?? '/videos/helmet-short-coded.mp4',
  }
})

const content = computed(() => contentData.value ?? {
  title: '',
  subtitle: '',
  mediaUrl: '/videos/helmet-short-coded.mp4',
})

// ── Computed ──
const progressPercent = computed(() =>
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0,
)

const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))

// ── Time formatter ──
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── Play / Pause ──
function togglePlayPause() {
  const video = videoRef.value
  if (!video) return
  if (video.paused) {
    video.play()
  } else {
    video.pause()
  }
  resetHideTimer()
}

// ── Skip ±15s ──
function skip(seconds: number) {
  const video = videoRef.value
  if (!video) return
  video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration || 0))
  resetHideTimer()
}

// ── Video events ──
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
  if (isPlaying.value) {
    hideTimer = setTimeout(() => {
      controlsVisible.value = false
    }, 3000)
  }
}

function toggleControls() {
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
  const video = videoRef.value
  if (!video || !duration.value) return
  video.currentTime = ratio * duration.value
  currentTime.value = video.currentTime
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
onMounted(() => {
  const video = videoRef.value
  if (!video) return

  // Metadata may already be loaded (SSR hydration / fast cache)
  if (video.readyState >= 1) {
    duration.value = video.duration
  }

  video.play()
    .then(() => resetHideTimer())
    .catch(() => {
      // Autoplay blocked — keep controls visible
      isPlaying.value = false
      controlsVisible.value = true
    })
})

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer)
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
</style>
