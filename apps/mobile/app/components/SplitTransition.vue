<template>
  <div v-if="phase !== 'idle'" class="split-transition">
    <div
      ref="leftRef"
      class="split-transition__left"
      :class="`split-transition__left--${phase}`"
    >
      <img src="/logo-icon/logo-fire.png" class="split-transition__logo split-transition__logo--left" alt="">
    </div>
    <div
      ref="rightRef"
      class="split-transition__right"
      :class="`split-transition__right--${phase}`"
      @animationend="onAnimationEnd"
    >
      <img src="/logo-icon/logo-fire.png" class="split-transition__logo split-transition__logo--right" alt="">
    </div>
  </div>
</template>

<script setup lang="ts">
const { phase, isTransitioning } = usePageTransition()
const leftRef = ref<HTMLDivElement | null>(null)
const rightRef = ref<HTMLDivElement | null>(null)

function onAnimationEnd() {
  if (phase.value === 'cover') {
    phase.value = 'hold'
    setTimeout(() => {
      phase.value = 'reveal'
    }, 150)
  } else if (phase.value === 'reveal') {
    phase.value = 'idle'
    isTransitioning.value = false
  }
}
</script>

<style scoped>
.split-transition {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: all;
}

.split-transition__left,
.split-transition__right {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background: var(--color-text);
  will-change: transform;
  overflow: hidden;
}

.split-transition__left {
  left: 0;
}

.split-transition__right {
  right: 0;
}

/* Logo centered at the seam — each panel clips its half via overflow:hidden */
.split-transition__logo {
  position: absolute;
  top: 50%;
  width: 120px;
  height: 120px;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Left panel: logo's left edge at (panel-width - half-logo) = right edge at panel boundary */
.split-transition__logo--left {
  right: -60px; /* half the logo width hangs off the right edge */
}

/* Right panel: logo's right edge at (half-logo from left) = left edge at panel boundary */
.split-transition__logo--right {
  left: -60px; /* half the logo width hangs off the left edge */
}

/* ---- Cover: left slides up from bottom, right slides down from top ---- */
.split-transition__left--cover {
  animation: slide-up-in 500ms cubic-bezier(.25, .74, .22, .99) forwards;
}

.split-transition__right--cover {
  animation: slide-down-in 500ms cubic-bezier(.25, .74, .22, .99) forwards;
}

/* ---- Hold: both panels fully cover ---- */
.split-transition__left--hold,
.split-transition__right--hold {
  transform: translateY(0);
}

/* ---- Reveal: right slides up, left slides down ---- */
.split-transition__right--reveal {
  animation: slide-up-out 500ms cubic-bezier(.25, .74, .22, .99) forwards;
}

.split-transition__left--reveal {
  animation: slide-down-out 500ms cubic-bezier(.25, .74, .22, .99) forwards;
}

@keyframes slide-up-in {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

@keyframes slide-down-in {
  from { transform: translateY(-100%); }
  to   { transform: translateY(0); }
}

@keyframes slide-up-out {
  from { transform: translateY(0); }
  to   { transform: translateY(-100%); }
}

@keyframes slide-down-out {
  from { transform: translateY(0); }
  to   { transform: translateY(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .split-transition {
    display: none !important;
  }
}
</style>
