<template>
  <div class="auth-layout">
    <!-- Desktop branding panel (hidden on mobile) -->
    <div class="auth-layout__branding">
      <div class="auth-layout__branding-bg" />
      <AuthBrandingArtwork />
    </div>

    <!-- Content area -->
    <div class="auth-layout__content">
      <slot />
    </div>
    <UiToast />
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Hidden on mobile */
.auth-layout__branding {
  display: none;
}

.auth-layout__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ─── Desktop split layout ─── */
@media (min-width: 1024px) {
  .auth-layout {
    flex-direction: row;
  }

  .auth-layout__branding {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50%;
    position: relative;
    overflow: hidden;
  }

  .auth-layout__branding-bg {
    position: absolute;
    inset: 0;
    background: var(--color-light);
  }

  .auth-layout__content {
    width: 50%;
    justify-content: center;
    padding: var(--space-8);
    background: var(--color-surface-alt);
    color: var(--color-text);
  }
}
</style>
