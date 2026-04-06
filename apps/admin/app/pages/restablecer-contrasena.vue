<template>
  <div class="reset">
    <div class="reset__overlay reset__overlay--active">
      <div class="reset__sheet">
        <div class="reset__sheet-header">
          <div class="reset__handle" />
        </div>

        <template v-if="!sent">
          <h1 class="reset__sheet-title">Restablecer<br />contraseña</h1>
          <p class="reset__sheet-subtitle">Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>

          <form class="reset__form" @submit.prevent="handleSubmit">
            <UiInput
              v-model="email"
              label="Correo electrónico"
              type="text"
              placeholder="admin@tupotencial.app"
              autocomplete="email"
              :error="error"
            />

            <UiButton
              type="submit"
              block
              :loading="loading"
              variant="secondary"
            >
              Enviar enlace
            </UiButton>
          </form>
        </template>

        <template v-else>
          <h1 class="reset__sheet-title">Revisa tu<br />correo</h1>
          <p class="reset__sheet-subtitle">
            Te enviamos un enlace a <strong>{{ email }}</strong> para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.
          </p>

          <UiButton variant="outline" block @click="sent = false">
            Reenviar enlace
          </UiButton>
        </template>

        <div class="reset__back">
          <NuxtLink to="/iniciar-sesion" class="reset__back-link">
            Volver a iniciar sesión
          </NuxtLink>
        </div>

        <p class="reset__sheet-help">
          ¿Necesitas ayuda? Escríbenos a <strong>soporte@tupotencial.app</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const client = useSupabaseClient()
const toast = useToast()

const email = ref('')
const loading = ref(false)
const error = ref<string | undefined>()
const sent = ref(false)

async function handleSubmit() {
  error.value = undefined

  if (!email.value) {
    error.value = 'Ingresa tu correo electrónico'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Correo electrónico no válido'
    return
  }

  loading.value = true
  try {
    const redirectTo = `${window.location.origin}/nueva-contrasena`
    const { error: resetError } = await client.auth.resetPasswordForEmail(email.value, { redirectTo })
    if (resetError) throw resetError
    sent.value = true
  } catch {
    toast.show('Error al enviar el enlace. Intenta de nuevo.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.reset__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  pointer-events: auto;
}

.reset__sheet {
  background: var(--color-accent);
  color: var(--color-text);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--space-2) var(--space-6) var(--space-10);
  max-height: 85dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.reset__sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.reset__handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin-top: var(--space-2);
}

.reset__sheet-title {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-3);
  font-weight: 100;
}

.reset__sheet-subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-8);
}

.reset__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.reset__back {
  margin-top: var(--space-6);
  text-align: center;
}

.reset__back-link {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-primary);
  text-decoration: none;
}
@media (hover: hover) {
  .reset__back-link:hover {
    text-decoration: underline;
  }
}

.reset__sheet-help {
  margin-top: var(--space-8);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
}

@media (min-width: 768px) and (max-width: 1023px) {
  .reset__overlay {
    align-items: center;
    justify-content: center;
  }

  .reset__sheet {
    max-width: 440px;
    width: 100%;
    border-radius: var(--radius-2xl);
    max-height: 90dvh;
  }
}

@media (min-width: 1024px) {
  .reset {
    background: transparent;
    min-height: auto;
    flex: 1;
  }

  .reset__overlay {
    position: static;
    inset: auto;
    z-index: auto;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .reset__sheet {
    max-width: 440px;
    width: 100%;
    border-radius: var(--radius-2xl);
    box-shadow: none;
    padding: var(--space-8);
    max-height: none;
    overflow-y: visible;
  }

  .reset__sheet-header {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reset__overlay,
  .reset__sheet {
    transition-duration: 0.01ms !important;
  }
}
</style>
