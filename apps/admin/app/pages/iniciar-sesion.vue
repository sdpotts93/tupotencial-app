<template>
  <div class="login">
    <!-- Screen 1: Full-screen hero (mobile only) -->
    <div class="login__hero">
      <div class="login__hero-content">
        <img src="/logo-word/logo-word-black.png" alt="Tu Potencial" class="login__wordmark" />
        <BlobLogo class="login__logo" />
        <p class="login__tagline">
          Panel de administración
        </p>
      </div>

      <!-- Bottom CTA area -->
      <div class="login__cta-area">
        <UiButton variant="primary" block @click="sheetOpen = true">
          Iniciar sesión
        </UiButton>
        <p class="login__legal">
          Acceso exclusivo para administradores de Tu Potencial.
        </p>
      </div>
    </div>

    <!-- Login sheet overlay -->
    <div
      class="login__overlay"
      :class="{ 'login__overlay--active': sheetOpen }"
      @click.self="sheetOpen = false"
    >
      <div class="login__sheet">
        <div class="login__sheet-header">
          <div class="login__handle" />
          <button class="login__close" aria-label="Cerrar" @click="sheetOpen = false">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <h1 class="login__sheet-title">Inicia sesión</h1>
        <p class="login__sheet-subtitle">Accede al panel de administración de Tu Potencial.</p>

        <form class="login__form" @submit.prevent="handleLogin">
          <UiInput
            v-model="email"
            label="Correo electrónico"
            type="text"
            placeholder="admin@tupotencial.app"
            autocomplete="email"
            :error="errors.email"
          />

          <div class="login__password-group">
            <UiInput
              v-model="password"
              label="Contraseña"
              type="password"
              placeholder="Tu contraseña"
              autocomplete="current-password"
              :error="errors.password"
            />
            <NuxtLink to="/restablecer-contrasena" class="login__forgot-link">
              ¿Olvidaste tu contraseña?
            </NuxtLink>
          </div>

          <p v-if="loginError" class="login__error">{{ loginError }}</p>

          <UiButton
            type="submit"
            block
            :loading="isLoading"
            variant="secondary"
          >
            Entrar
          </UiButton>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login, isLoading, isAuthenticated } = useAdminAuth()
const toast = useToast()


const sheetOpen = ref(false)
const email = ref('')
const password = ref('')
const loginError = ref('')
const errors = reactive({ email: '', password: '' })

// Redirect if already authenticated
if (isAuthenticated.value) {
  navigateTo('/admin')
}

async function handleLogin() {
  errors.email = ''
  errors.password = ''
  loginError.value = ''

  if (!email.value) {
    errors.email = 'El correo es obligatorio'
    return
  }
  if (!password.value) {
    errors.password = 'La contraseña es obligatoria'
    return
  }

  const success = await login(email.value, password.value)
  if (success) {
    // Wait for auth cookies to propagate before navigating.
    // The supabase.client.js page:start hook calls getClaims() on navigation —
    // if cookies aren't written yet, it nulls out supaUser and triggers logout.
    await new Promise(r => setTimeout(r, 300))
    navigateTo('/admin')
  } else {
    loginError.value = 'Credenciales incorrectas'
    toast.show('Credenciales incorrectas', 'error')
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
  width: 200px;
  height: 200px;
  flex-shrink: 0;
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

/* ─── Sheet overlay ─── */
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
@media (hover: hover) {
  .login__close:hover {
    background: var(--color-border-light);
  }
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

.login__password-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.login__forgot-link {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
  align-self: flex-end;
}
@media (hover: hover) {
  .login__forgot-link:hover {
    text-decoration: underline;
  }
}

.login__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}

.login__sheet-help {
  margin-top: var(--space-8);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
}

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
  .login__overlay {
    position: static;
    inset: auto;
    z-index: auto;
    background: none !important;
    pointer-events: auto !important;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .login__overlay .login__sheet {
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
  .login__overlay .login__sheet-header {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login__overlay,
  .login__sheet {
    transition-duration: 0.01ms !important;
  }
}
</style>
