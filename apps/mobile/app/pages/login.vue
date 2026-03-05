<template>
  <div class="login">
    <!-- Screen 1: Full-screen hero (mobile only) -->
    <div class="login__hero">
      <div class="login__hero-content">
        <img src="/logo-word/logo-word-black.png" alt="Tu Potencial" class="login__wordmark" />
        <div class="login__logo">
          <img src="/logo-icon/logo-running.png" alt="Tu Potencial" class="login__logo-img" />
        </div>
        <p class="login__tagline">
          Un espacio seguro para <br> tu crecimiento integral.
        </p>
      </div>

      <!-- Bottom CTA area -->
      <div class="login__cta-area">
        <UiButton variant="primary" block @click="activeSheet = 'login'">
          Iniciar con correo
        </UiButton>
        <UiButton variant="outline" block @click="activeSheet = 'register'">
          No tengo cuenta
        </UiButton>
        <p class="login__legal">
          Al continuar aceptas <NuxtLink to="/terms" class="login__legal-link">términos de uso</NuxtLink> y confirmas que leíste el <NuxtLink to="/privacy" class="login__legal-link">aviso de privacidad</NuxtLink>.
        </p>
      </div>
    </div>

    <!-- Login sheet overlay -->
    <div
      class="login__overlay"
      :class="{ 'login__overlay--active': activeSheet === 'login' }"
      @click.self="activeSheet = 'none'"
    >
      <div class="login__sheet">
        <div class="login__sheet-header">
          <div class="login__handle" />
          <button class="login__close" aria-label="Cerrar" @click="activeSheet = 'none'">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <h1 class="login__sheet-title">Comencemos con<br />tu correo</h1>
        <p class="login__sheet-subtitle">Usa tu correo para guardar tu progreso y acceder a tu plan de transformación diaria.</p>

        <form class="login__form" @submit.prevent="handleLogin">
          <UiInput
            v-model="loginEmail"
            label="Correo electrónico"
            type="email"
            placeholder="Ingresa tu correo"
            autocomplete="email"
            :error="loginErrors.email"
          />

          <Transition name="fade">
            <UiInput
              v-if="showPassword"
              v-model="loginPassword"
              label="Contraseña"
              type="password"
              placeholder="Tu contraseña"
              autocomplete="current-password"
              :error="loginErrors.password"
            />
          </Transition>

          <UiButton
            type="submit"
            block
            :loading="loginLoading"
            :disabled="!loginEmail"
            variant="secondary"
          >
            Continuar
          </UiButton>
        </form>

        <!-- Desktop-only: register link + legal -->
        <div class="login__desktop-links">
          <p class="login__register-link">
            ¿No tienes cuenta? <NuxtLink to="/register">Regístrate</NuxtLink>
          </p>
          <p class="login__desktop-legal">
            Al continuar aceptas <NuxtLink to="/terms" class="login__legal-link">términos de uso</NuxtLink> y confirmas que leíste el <NuxtLink to="/privacy" class="login__legal-link">aviso de privacidad</NuxtLink>.
          </p>
        </div>

        <p class="login__sheet-help">
          ¿Necesitas ayuda? Escríbenos a <strong>soporte@tupotencial.app</strong>
        </p>
      </div>
    </div>

    <!-- Register sheet overlay (mobile only, hidden on desktop) -->
    <div
      class="login__overlay login__overlay--alt"
      :class="{ 'login__overlay--active': activeSheet === 'register' }"
      @click.self="activeSheet = 'none'"
    >
      <div class="login__sheet">
        <div class="login__sheet-header">
          <div class="login__handle" />
          <button class="login__close" aria-label="Cerrar" @click="activeSheet = 'none'">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <h1 class="login__sheet-title">Crea tu cuenta</h1>
        <p class="login__sheet-subtitle">Regístrate gratis y explora Tu Potencial.</p>

        <form class="login__form" @submit.prevent="handleRegister">
          <UiInput
            v-model="regEmail"
            label="Correo electrónico"
            type="email"
            placeholder="tu@correo.com"
            autocomplete="email"
            :error="regErrors.email"
          />
          <UiInput
            v-model="regPassword"
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            :error="regErrors.password"
          />
          <UiInput
            v-model="regConfirm"
            label="Confirmar contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            autocomplete="new-password"
            :error="regErrors.confirm"
          />

          <UiButton
            type="submit"
            block
            :loading="regLoading"
            :disabled="!regEmail || !regPassword || !regConfirm"
            variant="secondary"
          >
            Crear cuenta
          </UiButton>
        </form>

        <p class="login__sheet-switch">
          ¿Ya tienes cuenta?
          <button type="button" class="login__sheet-switch-btn" @click="activeSheet = 'login'">Inicia sesión</button>
        </p>

        <p class="login__sheet-help">
          ¿Necesitas ayuda? Escríbenos a <strong>soporte@tupotencial.app</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login, register } = useAuth()

const activeSheet = ref<'none' | 'login' | 'register'>('none')

// ─── Login state ───
const showPassword = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const loginLoading = ref(false)
const loginErrors = ref<{ email?: string; password?: string }>({})

// ─── Register state ───
const regEmail = ref('')
const regPassword = ref('')
const regConfirm = ref('')
const regLoading = ref(false)
const regErrors = ref<{ email?: string; password?: string; confirm?: string }>({})

async function handleLogin() {
  loginErrors.value = {}

  if (!loginEmail.value) {
    loginErrors.value.email = 'Ingresa tu correo electrónico'
    return
  }

  if (!showPassword.value) {
    showPassword.value = true
    return
  }

  if (!loginPassword.value) {
    loginErrors.value.password = 'Ingresa tu contraseña'
    return
  }

  loginLoading.value = true
  try {
    await login(loginEmail.value, loginPassword.value)
    const { user } = useAuth()
    if (!user.value?.community_segment) {
      navigateTo('/account/onboarding/segment')
    } else {
      navigateTo('/account/hoy')
    }
  } catch {
    loginErrors.value.email = 'Correo o contraseña incorrectos'
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  regErrors.value = {}
  if (!regEmail.value) { regErrors.value.email = 'Ingresa tu correo electrónico'; return }
  if (regPassword.value.length < 8) { regErrors.value.password = 'Mínimo 8 caracteres'; return }
  if (regPassword.value !== regConfirm.value) { regErrors.value.confirm = 'Las contraseñas no coinciden'; return }

  regLoading.value = true
  try {
    await register(regEmail.value, regPassword.value)
    navigateTo('/profile-setup')
  } catch {
    regErrors.value.email = 'Error al crear la cuenta'
  } finally {
    regLoading.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ─── Hero (Screen 1 — mobile only) ─── */
.login__hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100dvh;
}


.login__hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: var(--space-10) var(--space-6);
}

.login__logo {
  margin-bottom: var(--space-8);
  border-radius: 1rem;
}

.login__logo-img {
  height: 160px;
  width: auto;
  border-radius: var(--radius-xl);
  opacity: 0.75;
}

.login__wordmark {
  height: 18px;
  width: auto;
  display: block;
  margin-bottom: var(--space-8);
}

.login__tagline {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  text-align: center;
  line-height: var(--leading-snug);
}

/* ─── CTA area at bottom of hero ─── */
.login__cta-area {
  position: relative;
  z-index: 1;
  padding: 0 var(--space-6) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}


.login__legal {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-dark-lighter);
  line-height: var(--leading-normal);
  margin-top: var(--space-2);
}

.login__legal-link {
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ─── Sheet overlay (shared by login + register) ─── */
.login__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(var(--tint-rgb), 0);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  pointer-events: none;
  transition: background var(--transition-base);
}

.login__overlay--active {
  background: rgba(var(--tint-rgb), 0.4);
  pointer-events: auto;
}

.login__sheet {
  background: var(--color-accent);
  color: var(--color-text);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--space-2) var(--space-6) var(--space-10);
  max-height: 85dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.login__overlay--active .login__sheet {
  transform: translateY(0);
}

.login__sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.login__handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin-top: var(--space-2);
}

.login__close {
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
.login__close:hover {
  background: var(--color-border-light);
}

.login__sheet-title {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-3);
  font-weight: 100;
}

.login__sheet-subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-8);
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login__sheet-help {
  margin-top: var(--space-8);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
}

/* ─── Sheet switch link (register → login) ─── */
.login__sheet-switch {
  margin-top: var(--space-6);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.login__sheet-switch-btn {
  background: none;
  border: none;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: none;
  padding: 0;
}
.login__sheet-switch-btn:hover {
  text-decoration: underline;
}

/* Desktop-only links (hidden on mobile) */
.login__desktop-links {
  display: none;
}

/* ─── Fade transition for password field ─── */
.fade-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.fade-enter-from { opacity: 0; transform: translateY(8px); }

/* ─── Tablet (768px–1023px) ─── */
@media (min-width: 768px) and (max-width: 1023px) {
  .login__overlay--active {
    align-items: center;
    justify-content: center;
  }

  .login__sheet {
    max-width: 440px;
    width: 100%;
    border-radius: var(--radius-2xl);
    max-height: 90dvh;
  }
}

/* ─── Desktop (≥1024px) ─── */
@media (min-width: 1024px) {
  .login {
    background: transparent;
    min-height: auto;
    flex: 1;
  }

  .login__hero {
    display: none;
  }

  /* Login overlay: static, always visible */
  .login__overlay:not(.login__overlay--alt) {
    position: static;
    inset: auto;
    z-index: auto;
    background: none !important;
    pointer-events: auto !important;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .login__overlay:not(.login__overlay--alt) .login__sheet {
    transform: none !important;
    max-width: 440px;
    width: 100%;
    border-radius: var(--radius-2xl);
    box-shadow: none;
    padding: var(--space-8);
    max-height: none;
    overflow-y: visible;
  }

  /* Hide mobile sheet chrome */
  .login__overlay:not(.login__overlay--alt) .login__sheet-header {
    display: none;
  }

  /* Register overlay: hidden on desktop (register has its own page) */
  .login__overlay--alt {
    display: none !important;
  }

  /* Show desktop links */
  .login__desktop-links {
    display: block;
    margin-top: var(--space-6);
    text-align: center;
  }

  .login__register-link {
    font-size: var(--text-sm);
    color: var(--color-muted);
  }

  .login__register-link a {
    color: var(--color-primary);
    font-weight: var(--weight-medium);
    text-decoration: none;
  }
  .login__register-link a:hover {
    text-decoration: underline;
  }

  .login__desktop-legal {
    font-size: var(--text-xs);
    color: var(--color-muted);
    margin-top: var(--space-3);
    line-height: var(--leading-normal);
  }

  .login__desktop-legal .login__legal-link {
    color: var(--color-primary);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login__overlay,
  .login__sheet,
  .fade-enter-active {
    transition-duration: 0.01ms !important;
  }
}
</style>
