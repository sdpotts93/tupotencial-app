<template>
  <div class="register">
    <!-- Screen 1: Full-screen hero (mobile only) -->
    <AuthMobileHero class="register__hero">
      <template #cta>
        <UiButton variant="primary" block @click="showSheet = true">
          Crear cuenta
        </UiButton>
        <UiButton variant="outline" block to="/iniciar-sesion">
          Ya tengo cuenta
        </UiButton>
      </template>
    </AuthMobileHero>

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
            type="text"
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
            variant="secondary"
          >
            Crear cuenta
          </UiButton>

          <p class="register__legal">
            Al crear tu cuenta aceptas los <NuxtLink to="/terminos" class="register__legal-link">términos y condiciones</NuxtLink> y confirmas que leíste el <NuxtLink to="/privacidad" class="register__legal-link">aviso de privacidad</NuxtLink>.
          </p>
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


const route = useRoute()
const showSheet = ref(true)
const email = ref((route.query.email as string) || '')
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
  email.value = email.value.trim()
  password.value = password.value.trim()
  confirmPassword.value = confirmPassword.value.trim()
  if (!email.value) { errors.email = 'Ingresa tu correo electrónico'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { errors.email = 'Correo electrónico no válido'; return }
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
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ─── Hero (Screen 1 — mobile only) ─── */
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

.register__legal {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-top: var(--space-2);
}

.register__legal-link {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
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
    width: min(440px, 80%);
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
    width: min(440px, 80%);
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
