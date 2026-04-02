<template>
  <Teleport to="body">
    <Transition name="share-fade">
      <div v-if="modelValue" class="share-overlay" @click.self="close">
        <!-- ═══ Capture card (360×640, scaled to fit viewport — WYSIWYG) ═══ -->
        <div ref="captureRef" class="share-capture" :style="{ '--capture-scale': captureScale }" aria-hidden="true" @click.stop>
          <div class="share-capture__top">
            <img src="/logo-word/logo-word-white.png" alt="Tu Potencial" class="share-capture__logo" crossorigin="anonymous" />
            <span class="share-capture__date">{{ formattedDate }}</span>
          </div>
          <div class="share-capture__center">
            <img src="/logo-icon/logo-fire.png" alt="" class="share-capture__badge-icon" crossorigin="anonymous" />
            <span class="share-capture__eyebrow">{{ eyebrow }}</span>
            <h2 class="share-capture__title">{{ actionTitle }}</h2>
            <p class="share-capture__text">{{ resolvedShareText }}</p>
          </div>
          <div class="share-capture__streak">
            <img class="share-capture__flame-icon" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23ffaa32' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'/%3E%3C/svg%3E" alt="" width="20" height="20" />
            <span class="share-capture__count">{{ streakCount }}</span>
            <span class="share-capture__label">días</span>
          </div>
          <div class="share-capture__bottom">
            <span class="share-capture__url">tupotencial.app</span>
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

}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: 'ACCIÓN DEL DÍA',

})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const captureRef = ref<HTMLElement | null>(null)
const { isCapturing, saveImage, shareImage } = useShareBadge()

const captureScale = ref(1)

function updateCaptureScale() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const availW = vw - 32
  const availH = vh - 160
  captureScale.value = Math.min(availW / 360, availH / 640, 1)
}

watch(() => props.modelValue, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    updateCaptureScale()
    window.addEventListener('resize', updateCaptureScale)
  } else {
    window.removeEventListener('resize', updateCaptureScale)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('resize', updateCaptureScale)
})

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const resolvedShareText = computed(() => {
  if (props.shareText) return props.shareText
  return props.outcome === 'done'
    ? 'Hoy cumplí con mi acción del día.'
    : 'Mañana es una nueva oportunidad.'
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
   Capture card — 360×640 (×3 = 1080×1920 IG Story)
   Scaled to fit viewport via --capture-scale (WYSIWYG)
   ALL values hardcoded for html2canvas
   ═══════════════════════════════════════════════════════ */
.share-capture {
  position: absolute;
  left: 50%;
  top: calc(50% - 20px);
  transform: translate(-50%, -50%) scale(var(--capture-scale, 1));
  transform-origin: center center;
  width: 360px;
  height: 640px;
  background: linear-gradient(160deg, #282828 0%, var(--color-dark) 100%);
  border-radius: 0;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: 'Founders Grotesk', sans-serif;
  color: #E8E6E2;
  overflow: hidden;
  box-sizing: border-box;
  pointer-events: auto;
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

.share-capture__logo { display: block; height: 22px; width: auto; }

.share-capture__date {
  font-family: 'Neue DIN XXWide', sans-serif;
  font-size: 8px;
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

.share-capture__badge-icon {
  height: 70px;
  width: auto;
}

.share-capture__eyebrow {
  font-family: 'Neue DIN XXWide', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #e87d4d;
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

/* Streak — inline-block layout (html2canvas renders this more reliably than flex) */
.share-capture__streak {
  text-align: center;
  position: relative;
  z-index: 1;
  line-height: 20px;
}

.share-capture__flame-icon {
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
  margin-right: 4px;
}

.share-capture__count {
  display: inline-block;
  vertical-align: middle;
  font-family: 'Neue DIN XXWide', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #e87d4d;
  letter-spacing: 0.02em;
  line-height: 20px;
}

.share-capture__label {
  display: inline-block;
  vertical-align: middle;
  font-family: 'Neue DIN XXWide', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #e87d4d;
  letter-spacing: 0.02em;
  line-height: 20px;
  margin-left: 2px;
}

.share-capture__bottom {
  text-align: center;
  position: relative;
  z-index: 1;
  margin-top: 1rem;
  line-height: 30px;
}

.share-capture__icon {
  display: inline-block;
  vertical-align: middle;
  height: 30px;
  width: auto;
  opacity: 0.5;
  margin-right: 8px;
}

.share-capture__url {
  display: inline-block;
  vertical-align: middle;
  color: rgba(232, 230, 226, 0.4);
  letter-spacing: 0.02em;
  line-height: 30px;
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

@media (hover: hover) {
  .share-overlay__close:hover {
    background: rgba(0, 0, 0, 0.5);
  }
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

@media (hover: hover) {
  .share-overlay__btn:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.35);
  }
  .share-overlay__btn--primary:hover {
    background: rgba(255, 255, 255, 0.85);
  }
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

  .share-overlay__close {
    position: absolute;
    top: var(--space-5);
    right: var(--space-5);
  }

  .share-overlay__actions {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: 360px;
    background: none;
    padding: var(--space-4) 0;
  }
}
</style>
