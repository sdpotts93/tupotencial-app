<template>
  <div class="watch">
    <UiTopNav show-back>
      <template #right>
        <span style="font-size: var(--text-xs); color: var(--color-sand); font-family: var(--font-eyebrow);">EN VIVO</span>
      </template>
    </UiTopNav>

    <!-- Vimeo embed placeholder -->
    <div class="watch__player">
      <div class="watch__placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><polygon points="5,3 19,12 5,21"/></svg>
        <p>Vimeo embed</p>
        <p class="watch__hint">Aquí se cargará el video de Vimeo</p>
      </div>
    </div>

    <div class="watch__info">
      <h2 class="watch__title">Meditación grupal</h2>
      <p class="watch__subtitle">Con Carlotta • Jueves 28 Feb</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const id = route.params.id as string
</script>

<style scoped>
.watch {
  min-height: 100dvh;
  background: var(--color-dark);
  color: var(--color-light);
}

.watch__player {
  aspect-ratio: 16/9;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.watch__placeholder {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-3);
  color: rgba(255,255,255,0.5); font-size: var(--text-sm);
}

.watch__hint { font-size: var(--text-xs); }

.watch__info { padding: var(--space-5); }

.watch__title { font-family: var(--font-title); font-size: var(--title-sm); }
.watch__subtitle { font-size: var(--text-sm); color: var(--color-sand); margin-top: var(--space-1); }

:deep(.top-nav) { background: var(--color-dark); }
:deep(.top-nav__back) { color: var(--color-light); }
</style>
