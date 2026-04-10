<template>
  <div class="auth-branding-artwork">
    <AnimatedBlobStage
      v-if="isDesktop"
      class="auth-branding-artwork__stage"
      image-src="/complete-layout-desktop.webp"
      stage-preserve-aspect-ratio="xMidYMin slice"
      :mask-center-y-offset-ratio="-0.25"
      :mask-viewport-max-ratio="0.7"
    />
    <div class="auth-branding-artwork__content">
      <div class="auth-branding-artwork__logo-slot" aria-hidden="true" />
      <p class="auth-branding-artwork__tagline">Un espacio seguro para tu crecimiento integral.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isDesktop } = useDesktopBreakpoint()
</script>

<style scoped>
.auth-branding-artwork {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-branding-artwork__stage {
  z-index: 0;
}

.auth-branding-artwork__content {
  position: relative;
  z-index: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
}

.auth-branding-artwork__tagline {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  text-align: center;
  line-height: var(--leading-snug);
  max-width: 320px;
}

.auth-branding-artwork__logo-slot {
  width: 250px;
  height: 250px;
  flex-shrink: 0;
}
</style>
