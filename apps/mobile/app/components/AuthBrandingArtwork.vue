<template>
  <div class="auth-branding-artwork" :class="{ 'auth-branding-artwork--ghost-text': ghostText }">
    <div class="auth-branding-artwork__media">
      <slot>
        <BlobLogo />
      </slot>
    </div>
    <p class="auth-branding-artwork__tagline">
      Un espacio seguro para tu crecimiento integral.
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
.auth-branding-artwork {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-10);
  --auth-branding-media-width: 250px;
  --auth-branding-media-height: 250px;
}

.auth-branding-artwork__media {
  width: var(--auth-branding-media-width);
  height: var(--auth-branding-media-height);
  flex-shrink: 0;
}

.auth-branding-artwork__media :deep(*) {
  width: 100%;
  height: 100%;
  display: block;
}

.auth-branding-artwork__media :deep(img) {
  object-fit: cover;
}

.auth-branding-artwork__tagline {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  text-align: center;
  line-height: var(--leading-snug);
  max-width: 320px;
}

.auth-branding-artwork--ghost-text .auth-branding-artwork__tagline {
  opacity: 0;
}
</style>
