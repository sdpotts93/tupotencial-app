<template>
  <div class="newpw">
    <div
      class="newpw__overlay newpw__overlay--active"
    >
      <div class="newpw__sheet">
        <div class="newpw__sheet-header">
          <div class="newpw__handle" />
        </div>

        <template v-if="!done">
          <h1 class="newpw__sheet-title">Nueva<br />contraseña</h1>
          <p class="newpw__sheet-subtitle">Crea una nueva contraseña para tu cuenta.</p>

          <form class="newpw__form" @submit.prevent="handleSubmit">
            <UiInput
              v-model="password"
              label="Nueva contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autocomplete="new-password"
              :error="errors.password"
            />
            <UiInput
              v-model="confirm"
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
              variant="secondary"
            >
              Guardar contraseña
            </UiButton>
          </form>
        </template>

        <template v-else>
          <h1 class="newpw__sheet-title">Contraseña<br />actualizada</h1>
          <p class="newpw__sheet-subtitle">Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.</p>

          <UiButton variant="secondary" block to="/iniciar-sesion">
            Iniciar sesión
          </UiButton>
        </template>

        <p class="newpw__sheet-help">
          ¿Necesitas ayuda? Escríbenos a <strong>soporte@tupotencial.app</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { updatePassword } = useAuth()
const client = useSupabaseClient()
const toast = useToast()

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const done = ref(false)
const errors = reactive<{ password?: string; confirm?: string }>({})

// Listen for the PASSWORD_RECOVERY event from the email link token exchange
onMounted(() => {
  client.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      // Session is set — the form is ready to use
    }
  })
})

async function handleSubmit() {
  errors.password = undefined
  errors.confirm = undefined

  if (!password.value || password.value.length < 8) {
    errors.password = 'Mínimo 8 caracteres'
    return
  }
  if (password.value !== confirm.value) {
    errors.confirm = 'Las contraseñas no coinciden'
    return
  }

  loading.value = true
  try {
    await updatePassword(password.value)
    // Sign out the recovery session so the user logs in fresh
    await client.auth.signOut()
    done.value = true
  } catch {
    toast.show('Error al actualizar la contraseña. Intenta de nuevo.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.newpw {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ─── Sheet overlay ─── */
.newpw__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  pointer-events: auto;
}

.newpw__sheet {
  background: var(--color-accent);
  color: var(--color-text);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--space-2) var(--space-6) var(--space-10);
  max-height: 85dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.newpw__sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.newpw__handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin-top: var(--space-2);
}

.newpw__sheet-title {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-3);
  font-weight: 100;
}

.newpw__sheet-subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-8);
}

.newpw__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.newpw__sheet-help {
  margin-top: var(--space-8);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
}

/* ─── Tablet (768px–1023px) ─── */
@media (min-width: 768px) and (max-width: 1023px) {
  .newpw__overlay {
    align-items: center;
    justify-content: center;
  }

  .newpw__sheet {
    max-width: 440px;
    width: 100%;
    border-radius: var(--radius-2xl);
    max-height: 90dvh;
  }
}

/* ─── Desktop (≥1024px) ─── */
@media (min-width: 1024px) {
  .newpw {
    background: transparent;
    min-height: auto;
    flex: 1;
  }

  .newpw__overlay {
    position: static;
    inset: auto;
    z-index: auto;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .newpw__sheet {
    max-width: 440px;
    width: 100%;
    border-radius: var(--radius-2xl);
    box-shadow: none;
    padding: var(--space-8);
    max-height: none;
    overflow-y: visible;
  }

  .newpw__sheet-header {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .newpw__overlay,
  .newpw__sheet {
    transition-duration: 0.01ms !important;
  }
}
</style>
