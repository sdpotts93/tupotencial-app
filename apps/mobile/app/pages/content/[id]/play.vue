<template>
  <div class="player">
    <UiTopNav show-back @back="navigateTo(`/content/${id}`)">
      <template #right>
        <span class="player__time">{{ currentTime }} / {{ totalTime }}</span>
      </template>
    </UiTopNav>

    <!-- Player area (inspired by inspiration-content-[id]-play) -->
    <div class="player__media">
      <div class="player__video-placeholder">
        <img src="/logo-icon/logo-icon-white.png" alt="" style="height: 48px; opacity: 0.3;" />
        <p class="player__playing-label">Reproduciendo...</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="player__controls">
      <h2 class="player__title">{{ content.title }}</h2>
      <p class="player__subtitle">{{ content.subtitle }}</p>

      <!-- Progress bar -->
      <div class="player__progress">
        <div class="player__progress-bar">
          <div class="player__progress-fill" :style="{ width: progressPercent + '%' }" />
        </div>
        <div class="player__progress-times">
          <span>{{ currentTime }}</span>
          <span>{{ totalTime }}</span>
        </div>
      </div>

      <!-- Buttons -->
      <div class="player__buttons">
        <button class="player__btn" aria-label="Retroceder 15s">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/><text x="12" y="16" text-anchor="middle" font-size="8" fill="currentColor" stroke="none">15</text></svg>
        </button>
        <button class="player__btn player__btn--play" :aria-label="playing ? 'Pausar' : 'Reproducir'" @click="playing = !playing">
          <svg v-if="playing" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
        </button>
        <button class="player__btn" aria-label="Adelantar 15s">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/><text x="12" y="16" text-anchor="middle" font-size="8" fill="currentColor" stroke="none">15</text></svg>
        </button>
      </div>
    </div>

    <!-- Done button -->
    <div class="player__footer">
      <UiButton block variant="secondary" @click="navigateTo(`/content/${id}`)">
        Terminé
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const id = route.params.id as string

const playing = ref(true)
const progressPercent = ref(35)

const content = ref({
  title: 'Respiración consciente',
  subtitle: 'Meditación guiada • 10 min',
})

const currentTime = ref('3:31')
const totalTime = ref('10:00')
</script>

<style scoped>
.player {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-dark);
  color: var(--color-light);
}

.player__time {
  font-size: var(--text-xs);
  color: var(--color-sand);
  font-family: var(--font-eyebrow);
}

.player__media {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player__video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.player__playing-label {
  font-size: var(--text-sm);
  color: var(--color-sand);
}

.player__controls {
  padding: var(--space-6);
}

.player__title {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  color: var(--color-light);
}

.player__subtitle {
  font-size: var(--text-sm);
  color: var(--color-sand);
  margin-top: var(--space-1);
}

.player__progress { margin-top: var(--space-5); }

.player__progress-bar {
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.player__progress-fill {
  height: 100%;
  background: var(--color-light);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.player__progress-times {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-sand);
}

.player__buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
  margin-top: var(--space-6);
}

.player__btn {
  background: none;
  border: none;
  color: var(--color-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player__btn--play {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-light);
  color: var(--color-dark);
}

.player__footer {
  padding: var(--space-4) var(--space-6);
  padding-bottom: calc(var(--space-4) + var(--safe-area-bottom));
}

:deep(.top-nav) { background: var(--color-dark); }
:deep(.top-nav__back) { color: var(--color-light); }

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .player {
    max-width: 720px;
    margin: 0 auto;
  }
}
</style>
