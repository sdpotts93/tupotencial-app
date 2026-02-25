<template>
  <div class="register">
    <!-- Screen 1: Full-screen hero (mobile only) -->
    <div class="register__hero">
      <div class="register__hero-bg" />
      <div class="register__hero-content">
        <div class="register__logo">
          <img src="/logo-icon/logo-icon-black.png" alt="Tu Potencial" class="register__logo-img" />
        </div>
        <p class="register__tagline">
          Un espacio seguro para <br> tu crecimiento integral.
        </p>
      </div>

      <!-- Bottom CTA area -->
      <div class="register__cta-area">
        <UiButton variant="primary" block @click="showSheet = true">
          Crear cuenta
        </UiButton>
        <UiButton variant="outline" block to="/auth/login">
          Ya tengo cuenta
        </UiButton>
      </div>
    </div>

    <!-- Screen 2: Slide-up sheet (mobile) / Static card (desktop) -->
    <div
      class="register__overlay"
      :class="{ 'register__overlay--active': showSheet }"
      @click.self="showSheet = false"
    >
      <div class="register__sheet">
        <div class="register__sheet-header">
          <div class="register__handle" />
          <button class="register__close" aria-label="Cerrar" @click="showSheet = false">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <h1 class="register__sheet-title">Crea tu cuenta</h1>
        <p class="register__sheet-subtitle">Regístrate gratis y explora Tu Potencial.</p>

        <form class="register__form" @submit.prevent="handleRegister">
          <UiInput
            v-model="email"
            label="Correo electrónico"
            type="email"
            placeholder="tu@correo.com"
            autocomplete="email"
            :error="errors.email"
          />
          <UiInput
            v-model="password"
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            :error="errors.password"
          />
          <UiInput
            v-model="confirmPassword"
            label="Confirmar contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            autocomplete="new-password"
            :error="errors.confirm"
          />

          <UiButton
            type="submit"
            block
            :loading="loading"
            :disabled="!email || !password || !confirmPassword"
            :variant="email && password && confirmPassword ? 'primary' : 'secondary'"
          >
            Crear cuenta
          </UiButton>
        </form>

        <!-- Desktop-only: login link -->
        <div class="register__desktop-links">
          <p class="register__login-link">
            ¿Ya tienes cuenta? <NuxtLink to="/auth/login">Inicia sesión</NuxtLink>
          </p>
        </div>

        <p class="register__sheet-help">
          ¿Necesitas ayuda? Escríbenos a <strong>soporte@tupotencial.app</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { register } = useAuth()

const showSheet = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errors = ref<{ email?: string; password?: string; confirm?: string }>({})

async function handleRegister() {
  errors.value = {}
  if (!email.value) { errors.value.email = 'Ingresa tu correo electrónico'; return }
  if (password.value.length < 8) { errors.value.password = 'Mínimo 8 caracteres'; return }
  if (password.value !== confirmPassword.value) { errors.value.confirm = 'Las contraseñas no coinciden'; return }

  loading.value = true
  try {
    await register(email.value, password.value)
    navigateTo('/auth/profile-setup')
  } catch {
    errors.value.email = 'Error al crear la cuenta'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-dark);
  position: relative;
}

/* ─── Hero (Screen 1 — mobile only) ─── */
.register__hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100dvh;
}

.register__hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, var(--color-navy) 0%, var(--color-dark) 50%, var(--color-green) 100%);
  opacity: 0.9;
}

.register__hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: var(--space-10) var(--space-6);
}

.register__logo {
  margin-bottom: var(--space-8);
  background: var(--color-sand);
  padding: 1rem;
  border-radius: 1rem;
}

.register__logo-img {
  height: 80px;
  width: auto;
  border-radius: var(--radius-xl);
  opacity: 0.75;
}

.register__tagline {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-light);
  text-align: center;
  line-height: var(--leading-snug);
}

/* ─── CTA area at bottom of hero ─── */
.register__cta-area {
  position: relative;
  z-index: 1;
  padding: 0 var(--space-6) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.register__cta-area :deep(.btn--primary) {
  background: #FFFFFF;
  color: var(--color-text);
  border-color: #FFFFFF;
}
.register__cta-area :deep(.btn--primary:hover) {
  background: var(--color-light);
  border-color: var(--color-light);
}

.register__cta-area :deep(.btn--outline) {
  background: transparent;
  color: var(--color-light);
  border-color: var(--color-light);
}
.register__cta-area :deep(.btn--outline:hover) {
  background: rgba(255, 255, 255, 0.1);
}

/* ─── Sheet overlay (mobile: slides up) ─── */
.register__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  pointer-events: none;
  transition: background var(--transition-base);
}

.register__overlay--active {
  background: rgba(0, 0, 0, 0.4);
  pointer-events: auto;
}

.register__sheet {
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--space-2) var(--space-6) var(--space-10);
  max-height: 85dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.register__overlay--active .register__sheet {
  transform: translateY(0);
}

.register__sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.register__handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin-top: var(--space-2);
}

.register__close {
  position: absolute;
  right: 0;
  top: 10px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.register__close:hover {
  background: var(--color-border-light);
}

.register__sheet-title {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-3);
  font-weight: 100;
}

.register__sheet-subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-8);
}

.register__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.register__sheet-help {
  margin-top: var(--space-8);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
}

/* Desktop-only links (hidden on mobile) */
.register__desktop-links {
  display: none;
}

/* ─── Tablet (768px–1023px) ─── */
@media (min-width: 768px) and (max-width: 1023px) {
  .register__overlay--active {
    align-items: center;
    justify-content: center;
  }

  .register__sheet {
    max-width: 440px;
    width: 100%;
    border-radius: var(--radius-2xl);
    max-height: 90dvh;
  }
}

/* ─── Desktop (≥1024px) ─── */
@media (min-width: 1024px) {
  .register {
    background: transparent;
    min-height: auto;
    flex: 1;
  }

  /* Hide mobile hero — branding panel is in the layout */
  .register__hero {
    display: none;
  }

  /* Form is always visible, static positioning */
  .register__overlay {
    position: static;
    inset: auto;
    z-index: auto;
    background: none !important;
    pointer-events: auto !important;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .register__sheet {
    transform: none !important;
    max-width: 440px;
    width: 100%;
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-2);
    padding: var(--space-8);
    max-height: none;
    overflow-y: visible;
  }

  /* Hide mobile sheet chrome */
  .register__sheet-header {
    display: none;
  }

  /* Show desktop links */
  .register__desktop-links {
    display: block;
    margin-top: var(--space-6);
    text-align: center;
  }

  .register__login-link {
    font-size: var(--text-sm);
    color: var(--color-muted);
  }

  .register__login-link a {
    color: var(--color-primary);
    font-weight: var(--weight-medium);
    text-decoration: none;
  }
  .register__login-link a:hover {
    text-decoration: underline;
  }
}

@media (prefers-reduced-motion: reduce) {
  .register__overlay,
  .register__sheet {
    transition-duration: 0.01ms !important;
  }
}
</style>
