<template>
  <div class="auth-hero-artwork" :class="{ 'auth-hero-artwork--ghost-text': ghostText }">
    <img src="/logo-word/logo-word-black.png" alt="Tu Potencial" class="auth-hero-artwork__wordmark">
    <div class="auth-hero-artwork__media">
      <slot>
        <BlobLogo />
      </slot>
    </div>
    <p class="auth-hero-artwork__tagline">
      Un espacio seguro para <br> tu crecimiento integral.
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  ghostText?: boolean
}>(), {
  ghostText: false,
})
</script>

<style scoped>
.auth-hero-artwork {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: var(--space-10) var(--space-6);
  --auth-hero-media-width: 200px;
  --auth-hero-media-height: 200px;
  --auth-hero-media-min-width: auto;
  --auth-hero-media-max-width: 100%;
  --auth-hero-media-aspect-ratio: auto;
  --auth-hero-media-position: static;
  --auth-hero-media-top: auto;
  --auth-hero-media-left: auto;
  --auth-hero-media-transform: none;
}

.auth-hero-artwork__wordmark {
  height: 18px;
  width: auto;
  display: block;
  margin-bottom: var(--space-8);
}

.auth-hero-artwork__media {
  margin-bottom: var(--space-8);
  width: var(--auth-hero-media-width);
  height: var(--auth-hero-media-height);
  min-width: var(--auth-hero-media-min-width);
  max-width: var(--auth-hero-media-max-width);
  aspect-ratio: var(--auth-hero-media-aspect-ratio);
  position: var(--auth-hero-media-position);
  top: var(--auth-hero-media-top);
  left: var(--auth-hero-media-left);
  transform: var(--auth-hero-media-transform);
  flex-shrink: 0;
}

.auth-hero-artwork__media :deep(*) {
  width: 100%;
  height: 100%;
  display: block;
}

.auth-hero-artwork__media :deep(img) {
  object-fit: cover;
}

.auth-hero-artwork__tagline {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  text-align: center;
  line-height: var(--leading-snug);
}

.auth-hero-artwork--ghost-text .auth-hero-artwork__wordmark,
.auth-hero-artwork--ghost-text .auth-hero-artwork__tagline {
  opacity: 0;
}
</style>
