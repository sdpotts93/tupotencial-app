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
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    animation:
      blob-shape-desk 23s ease-in-out infinite,
      blob-drift-desk 19s ease-in-out infinite;
  }

  @keyframes blob-shape-desk {
    0%       { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    8%       { border-radius: 45% 55% 60% 40% / 40% 55% 45% 60%; }
    16%      { border-radius: 55% 45% 45% 55% / 65% 38% 62% 42%; }
    25%      { border-radius: 38% 62% 55% 45% / 50% 60% 40% 55%; }
    33%      { border-radius: 62% 38% 40% 60% / 42% 52% 58% 48%; }
    42%      { border-radius: 48% 52% 58% 42% / 58% 42% 48% 52%; }
    50%      { border-radius: 42% 58% 48% 52% / 35% 65% 55% 45%; }
    58%      { border-radius: 55% 45% 38% 62% / 52% 48% 42% 58%; }
    67%      { border-radius: 40% 60% 65% 35% / 48% 55% 50% 45%; }
    75%      { border-radius: 58% 42% 42% 58% / 55% 40% 60% 45%; }
    83%      { border-radius: 45% 55% 50% 50% / 42% 62% 38% 58%; }
    92%      { border-radius: 52% 48% 38% 62% / 58% 35% 65% 42%; }
    100%     { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  }

  @keyframes blob-drift-desk {
    0%, 100% { transform: rotate(0deg)   scale(1); }
    25%      { transform: rotate(3deg)   scale(1.02); }
    50%      { transform: rotate(-2deg)  scale(0.98); }
    75%      { transform: rotate(2deg)   scale(1.01); }
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
