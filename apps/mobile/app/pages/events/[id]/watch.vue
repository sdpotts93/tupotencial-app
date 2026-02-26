<template>
  <div class="watch">
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
        <svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><polygon points="5,3 19,12 5,21"/></svg>
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

const event = ref({
  title: 'Meditación grupal',
  subtitle: 'Con Carlotta · Jueves 28 Feb',
  isLive: true,
})
</script>

<style scoped>
.watch {
  position: relative;
  width: 100%;
  height: 100dvh;
  background: #000;
  color: white;
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
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: white;
  -webkit-tap-highlight-color: transparent;
}
.watch__back:hover { background: rgba(0, 0, 0, 0.6); }

.watch__badge {
  font-size: 10px;
  font-family: var(--font-eyebrow);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.6);
}

.watch__badge--live {
  background: rgba(220, 38, 38, 0.8);
  color: white;
}

/* ─── Player (fullscreen, centered) ─── */
.watch__player {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.watch__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  color: rgba(255, 255, 255, 0.5);
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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 100%);
}

.watch__title {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  color: white;
}

.watch__subtitle {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.6);
  margin-top: var(--space-1);
}
</style>
