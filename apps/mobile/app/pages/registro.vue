<template>
  <div class="register">
    <!-- Screen 1: Full-screen hero (mobile only) -->
    <div class="register__hero">
      <div class="register__hero-content">
        <img src="/logo-word/logo-word-black.png" alt="Tu Potencial" class="register__wordmark" />
        <div class="register__logo">
          <img src="/logo-icon/logo-running.png" alt="Tu Potencial" class="register__logo-img" />
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
        <UiButton variant="outline" block to="/iniciar-sesion">
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
            @update:model-value="scheduleValidation"
          />
          <UiInput
            v-model="password"
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            :error="errors.password"
            @update:model-value="scheduleValidation"
          />
          <UiInput
            v-model="confirmPassword"
            label="Confirmar contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            autocomplete="new-password"
            :error="errors.confirm"
            @update:model-value="scheduleValidation"
          />

          <UiButton
            type="submit"
            block
            :loading="loading"
            :disabled="!email || !password || !confirmPassword"
            variant="secondary"
          >
            Crear cuenta
          </UiButton>
        </form>

        <!-- Desktop-only: login link -->
        <div class="register__desktop-links">
          <p class="register__login-link">
            ¿Ya tienes cuenta? <NuxtLink to="/iniciar-sesion">Inicia sesión</NuxtLink>
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
const toast = useToast()

const showSheet = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errors = reactive<{ email?: string; password?: string; confirm?: string }>({})

// Debounced live validation
let validateTimer: ReturnType<typeof setTimeout> | null = null

function scheduleValidation() {
  if (validateTimer) clearTimeout(validateTimer)
  validateTimer = setTimeout(() => {
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      errors.email = 'Correo electrónico no válido'
    } else {
      errors.email = undefined
    }
    if (password.value && password.value.length < 8) {
      errors.password = 'Mínimo 8 caracteres'
    } else {
      errors.password = undefined
    }
    if (confirmPassword.value && password.value !== confirmPassword.value) {
      errors.confirm = 'Las contraseñas no coinciden'
    } else {
      errors.confirm = undefined
    }
  }, 1000)
}


async function handleRegister() {
  errors.email = undefined; errors.password = undefined; errors.confirm = undefined
  if (!email.value) { errors.email = 'Ingresa tu correo electrónico'; return }
  if (password.value.length < 8) { errors.password = 'Mínimo 8 caracteres'; return }
  if (password.value !== confirmPassword.value) { errors.confirm = 'Las contraseñas no coinciden'; return }

  loading.value = true
  try {
    await register(email.value, password.value)
    navigateTo('/configurar-perfil')
  } catch (err: any) {
    const msg = err?.code === 'user_already_exists' ? 'Tu usuario ya está registrado' : 'Error al crear la cuenta'
    errors.email = msg
    toast.show(msg, 'error')
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
  width: 170px;
  height: 170px;
  overflow: hidden;
  animation:
    blob-shape 23s ease-in-out infinite,
    blob-drift 19s ease-in-out infinite,
    blob-reveal 1s cubic-bezier(0.22, 1, 0.36, 1) both;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  flex-shrink: 0;
}

.register__logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  animation: blob-img-reveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
}

@keyframes blob-shape {
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

@keyframes blob-drift {
  0%, 100% { transform: rotate(0deg)   scale(1); }
  25%      { transform: rotate(3deg)   scale(1.02); }
  50%      { transform: rotate(-2deg)  scale(0.98); }
  75%      { transform: rotate(2deg)   scale(1.01); }
}

@keyframes blob-reveal {
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes blob-img-reveal {
  0% {
    opacity: 0;
    transform: scale(1.3);
  }
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
}

.register__wordmark {
  height: 18px;
  width: auto;
  display: block;
  margin-bottom: var(--space-8);
}

.register__tagline {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
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

/* ─── Sheet overlay (mobile: slides up) ─── */
.register__overlay {
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

.register__overlay--active {
  background: rgba(var(--tint-rgb), 0.4);
  pointer-events: auto;
}

.register__sheet {
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
@media (hover: hover) {
  .register__close:hover {
    background: var(--color-border-light);
  }
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
    box-shadow: none;
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
  @media (hover: hover) {
    .register__login-link a:hover {
      text-decoration: underline;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .register__overlay,
  .register__sheet {
    transition-duration: 0.01ms !important;
  }
}
</style>
