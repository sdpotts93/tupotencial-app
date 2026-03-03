<template>
  <Teleport to="body">
    <Transition name="share-fade">
      <div v-if="modelValue" class="share-overlay" @click.self="close">
        <!-- ═══ Hidden capture target (fixed 360×640 for html2canvas) ═══ -->
        <div ref="captureRef" class="share-capture" aria-hidden="true">
          <div class="share-capture__top">
            <img src="/logo-word/logo-word-white.png" alt="Tu Potencial" class="share-capture__logo" crossorigin="anonymous" />
            <span class="share-capture__date">{{ formattedDate }}</span>
          </div>
          <div class="share-capture__center">
            <span class="share-capture__eyebrow">{{ eyebrow }}</span>
            <h2 class="share-capture__title">{{ actionTitle }}</h2>
            <p v-if="resolvedShareText" class="share-capture__text">{{ resolvedShareText }}</p>
          </div>
          <div class="share-capture__streak">
            <svg class="share-capture__flame-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffaa32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
            <span class="share-capture__count">{{ streakCount }}</span>
            <span class="share-capture__label">días</span>
          </div>
          <div class="share-capture__bottom">
            <img src="/logo-icon/logo-icon-white.png" alt="" class="share-capture__icon" crossorigin="anonymous" />
            <span class="share-capture__url">tupotencial.app</span>
          </div>
        </div>

        <!-- ═══ Full-screen visible card ═══ -->
        <div class="share-screen">
          <div class="share-screen__top">
            <img src="/logo-word/logo-word-white.png" alt="Tu Potencial" class="share-screen__logo" />
            <span class="share-screen__date">{{ formattedDate }}</span>
          </div>
          <div class="share-screen__center">
            <span class="share-screen__eyebrow">{{ eyebrow }}</span>
            <h2 class="share-screen__title">{{ actionTitle }}</h2>
            <p v-if="resolvedShareText" class="share-screen__text">{{ resolvedShareText }}</p>
          </div>
          <div class="share-screen__streak">
            <Icon name="lucide:flame" size="16" class="share-screen__flame-icon" />
            <span class="share-screen__count">{{ streakCount }}</span>
            <span class="share-screen__streak-label">días</span>
          </div>
          <div class="share-screen__bottom">
            <img src="/logo-icon/logo-icon-white.png" alt="" class="share-screen__icon" />
            <span class="share-screen__url">tupotencial.app</span>
          </div>
        </div>

        <!-- ═══ Floating controls ═══ -->
        <button class="share-overlay__close" aria-label="Cerrar" @click="close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <div class="share-overlay__actions">
          <button class="share-overlay__btn" :disabled="isCapturing" @click="handleSave">
            <Icon name="lucide:download" size="22" />
            <span>Guardar</span>
          </button>
          <button class="share-overlay__btn share-overlay__btn--primary" :disabled="isCapturing" @click="handleShare">
            <Icon name="lucide:share-2" size="22" />
            <span>Compartir</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  eyebrow?: string
  actionTitle: string
  streakCount: number
  shareText: string | null
  outcome: 'done' | 'skip'
  date?: string
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: '{{ eyebrow }}',
  date: () => new Date().toISOString().slice(0, 10),
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const captureRef = ref<HTMLElement | null>(null)
const { isCapturing, saveImage, shareImage } = useShareBadge()

watch(() => props.modelValue, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

const formattedDate = computed(() => {
  return new Date(props.date + 'T12:00:00').toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const resolvedShareText = computed(() => {
  if (props.shareText) return props.shareText
  return props.outcome === 'done'
    ? 'Hoy cumpli con mi accion del dia.'
    : 'Manana es una nueva oportunidad.'
})

function close() {
  emit('update:modelValue', false)
}

function handleSave() {
  if (!captureRef.value) return
  saveImage(captureRef.value)
}

function handleShare() {
  if (!captureRef.value) return
  shareImage(captureRef.value, resolvedShareText.value)
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════
   Overlay — covers the entire viewport
   ═══════════════════════════════════════════════════════ */
.share-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: #111;
  overflow: hidden;
}

/* ═══════════════════════════════════════════════════════
   Hidden capture card — 360×640 (×3 = 1080×1920 IG Story)
   ALL values hardcoded for html2canvas
   ═══════════════════════════════════════════════════════ */
.share-capture {
  position: fixed;
  left: -9999px;
  top: 0;
  width: 360px;
  height: 640px;
  background: linear-gradient(160deg, #282828 0%, #28374A 100%);
  border-radius: 0;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: 'Founders Grotesk', sans-serif;
  color: #E8E6E2;
  overflow: hidden;
  box-sizing: border-box;
  pointer-events: none;
}

.share-capture::before {
  content: '';
  position: absolute;
  top: -25%;
  right: -25%;
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(255, 170, 50, 0.12) 0%, transparent 70%);
  border-radius: 50%;
}

.share-capture__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.share-capture__logo { height: 22px; width: auto; }

.share-capture__date {
  font-family: 'Neue DIN XXWide', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(232, 230, 226, 0.6);
}

.share-capture__center {
  text-align: center;
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.share-capture__eyebrow {
  font-family: 'Neue DIN XXWide', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #ffaa32;
}

.share-capture__title {
  font-family: 'IvyPresto Headline', serif;
  font-size: 36px;
  font-weight: 400;
  line-height: 1.15;
  color: #E8E6E2;
  max-width: 300px;
  margin: 0;
}

.share-capture__text {
  font-size: 15px;
  line-height: 1.5;
  color: rgba(232, 230, 226, 0.7);
  max-width: 280px;
  margin: 4px 0 0;
}

/* Streak — pill style matching navbar */
.share-capture__streak {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  position: relative;
  z-index: 1;
}

.share-capture__flame-icon {
  flex-shrink: 0;
}

.share-capture__count {
  font-family: 'Neue DIN XXWide', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #ffaa32;
  letter-spacing: 0.02em;
  line-height: 1;
}

.share-capture__label {
  font-family: 'Neue DIN XXWide', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #ffaa32;
  letter-spacing: 0.02em;
  line-height: 1;
}

.share-capture__bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.share-capture__icon { height: 16px; width: auto; opacity: 0.5; }

.share-capture__url {
  font-size: 11px;
  color: rgba(232, 230, 226, 0.4);
  letter-spacing: 0.02em;
}

/* ═══════════════════════════════════════════════════════
   Full-screen visible card — fills the viewport
   ═══════════════════════════════════════════════════════ */
.share-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, var(--color-dark) 0%, var(--color-navy) 100%);
  padding: calc(var(--safe-area-top) + var(--space-6)) var(--space-6) calc(100px + var(--safe-area-bottom)) var(--space-6);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--color-light);
  overflow: hidden;
}

.share-screen::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -20%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(255, 170, 50, 0.10) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.share-screen__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.share-screen__logo {
  height: 18px;
  width: auto;
  opacity: 0.7;
}

.share-screen__date {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(232, 230, 226, 0.5);
}

.share-screen__center {
  text-align: center;
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.share-screen__eyebrow {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-lg);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-pro);
}

.share-screen__title {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  font-weight: var(--weight-regular);
  line-height: var(--leading-tight);
  color: var(--color-light);
  max-width: 340px;
  margin: 0;
}

.share-screen__text {
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: rgba(232, 230, 226, 0.6);
  max-width: 300px;
  margin: 0;
}

/* Streak — matches navbar .hoy__streak-badge style */
.share-screen__streak {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  position: relative;
  z-index: 1;
}

.share-screen__flame-icon {
  color: var(--color-pro);
}

.share-screen__count {
  font-family: var(--font-eyebrow);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--color-pro);
  letter-spacing: 0.02em;
}

.share-screen__streak-label {
  font-family: var(--font-eyebrow);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--color-pro);
  letter-spacing: 0.02em;
}

.share-screen__bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  position: relative;
  z-index: 1;
}

.share-screen__icon {
  height: 14px;
  width: auto;
  opacity: 0.4;
}

.share-screen__url {
  font-size: var(--eyebrow-sm);
  color: rgba(232, 230, 226, 0.35);
  letter-spacing: 0.02em;
}

/* ═══════════════════════════════════════════════════════
   Floating controls — on top of the card
   ═══════════════════════════════════════════════════════ */
.share-overlay__close {
  position: fixed;
  top: calc(var(--safe-area-top) + var(--space-3));
  right: var(--space-4);
  z-index: 10000;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.share-overlay__close:hover {
  background: rgba(0, 0, 0, 0.5);
}

.share-overlay__actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5) calc(var(--safe-area-bottom) + var(--space-5));
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
}

.share-overlay__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #fff;
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}

.share-overlay__btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.35);
}

.share-overlay__btn:active {
  transform: scale(0.97);
}

.share-overlay__btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.share-overlay__btn--primary {
  background: rgba(255, 255, 255, 0.95);
  color: #282828;
  border-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.share-overlay__btn--primary:hover {
  background: rgba(255, 255, 255, 0.85);
}

/* ═══════════════════════════════════════════════════════
   Transitions
   ═══════════════════════════════════════════════════════ */
.share-fade-enter-active {
  transition: opacity 0.25s ease;
}
.share-fade-leave-active {
  transition: opacity 0.2s ease;
}
.share-fade-enter-from,
.share-fade-leave-to {
  opacity: 0;
}

/* ═══════════════════════════════════════════════════════
   Desktop: device simulation
   ═══════════════════════════════════════════════════════ */
@media (min-width: 1024px) {
  .share-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0a;
  }

  .share-screen {
    position: relative;
    top: auto;
    left: auto;
    width: 375px;
    height: 812px;
    border-radius: 44px;
    padding: 56px 24px 110px;
    box-shadow: 0 0 80px rgba(0, 0, 0, 0.5);
  }

  .share-overlay__close {
    position: absolute;
    top: var(--space-5);
    right: var(--space-5);
  }

  .share-overlay__actions {
    position: absolute;
    bottom: auto;
    left: 50%;
    transform: translateX(-50%);
    margin-top: var(--space-6);
    width: 375px;
    top: calc(50% + 406px + var(--space-4));
    background: none;
    padding: 0;
  }
}
</style>
