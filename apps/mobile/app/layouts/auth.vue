<template>
  <div class="auth-layout">
    <!-- Desktop branding panel (hidden on mobile) -->
    <div class="auth-layout__branding">
      <div class="auth-layout__branding-bg" />
      <div class="auth-layout__branding-content">
        <img src="/logo-icon/logo-running.png" alt="Tu Potencial" class="auth-layout__branding-logo" />
        <p class="auth-layout__branding-tagline">
          Un espacio seguro para tu crecimiento integral.
        </p>
      </div>
    </div>

    <!-- Content area -->
    <div class="auth-layout__content">
      <slot />
    </div>
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

  .auth-layout__branding-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-8);
    padding: var(--space-10);
  }

  .auth-layout__branding-logo {
    height: 200px;
    width: auto;
    border-radius: var(--radius-xl);
  }

  .auth-layout__branding-tagline {
    font-family: var(--font-title);
    font-size: var(--title-md);
    color: var(--color-text);
    text-align: center;
    line-height: var(--leading-snug);
    max-width: 320px;
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
