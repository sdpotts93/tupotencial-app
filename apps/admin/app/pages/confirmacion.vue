<template>
  <div class="confirmacion">
    <AuthMobileHero class="confirmacion__hero" tagline="Panel de administración" />
    <div class="confirmacion__overlay confirmacion__overlay--active">
      <div class="confirmacion__sheet">
        <div class="confirmacion__sheet-header">
          <div class="confirmacion__handle" />
        </div>

        <template v-if="status === 'loading'">
          <h1 class="confirmacion__sheet-title">Confirmando<br />invitación</h1>
          <p class="confirmacion__sheet-subtitle">Estamos preparando tu acceso al panel. Esto puede tardar unos segundos.</p>
          <BlobLoader class="confirmacion__loader" />
        </template>

        <template v-else-if="status === 'error'">
          <h1 class="confirmacion__sheet-title">No pudimos<br />confirmar</h1>
          <p class="confirmacion__sheet-subtitle">{{ errorMessage }}</p>
          <BlobLogo class="confirmacion__logo" />

          <UiButton variant="secondary" block to="/iniciar-sesion">
            Ir a iniciar sesión
          </UiButton>
        </template>

        <p class="confirmacion__sheet-help">
          ¿Necesitas ayuda? Escríbenos a <strong>soporte@tupotencial.app</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const client = useSupabaseClient()

const status = ref<'loading' | 'error'>('loading')
const errorMessage = ref('El enlace no es válido o ya expiró.')

function goToPasswordReset() {
  navigateTo('/nueva-contrasena', { replace: true })
}

async function establishSessionFromLink() {
  const route = useRoute()
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))

  const queryError = typeof route.query.error_description === 'string' ? route.query.error_description : ''
  const hashError = hash.get('error_description') ?? ''
  const error = queryError || hashError
  if (error) {
    throw new Error(error)
  }

  const code = typeof route.query.code === 'string' ? route.query.code : ''
  const tokenHash = typeof route.query.token_hash === 'string' ? route.query.token_hash : ''
  const inviteType = typeof route.query.type === 'string' ? route.query.type : hash.get('type') ?? ''
  const accessToken = hash.get('access_token') ?? ''
  const refreshToken = hash.get('refresh_token') ?? ''
  const hasAuthPayload = Boolean(code || (tokenHash && inviteType) || (accessToken && refreshToken))

  if (!hasAuthPayload) {
    throw new Error('El enlace no es válido o ya expiró.')
  }

  if (code) {
    const { error: exchangeError } = await client.auth.exchangeCodeForSession(code)
    if (exchangeError) throw exchangeError
  } else if (tokenHash && inviteType) {
    const { error: verifyError } = await client.auth.verifyOtp({
      token_hash: tokenHash,
      type: inviteType as any,
    })
    if (verifyError) throw verifyError
  } else if (accessToken && refreshToken) {
    const { error: sessionError } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (sessionError) throw sessionError
  }

  const { data: sessionData, error: sessionError } = await client.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session?.user) {
    throw new Error('El enlace no es válido o ya expiró.')
  }
}

onMounted(async () => {
  try {
    await establishSessionFromLink()
    goToPasswordReset()
  } catch (error: any) {
    status.value = 'error'
    errorMessage.value = error?.message || 'El enlace no es válido o ya expiró.'
  }
})
</script>

<style scoped>
.confirmacion {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.confirmacion__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  pointer-events: auto;
}

.confirmacion__sheet {
  background: var(--color-accent);
  color: var(--color-text);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--space-2) var(--space-6) var(--space-10);
  max-height: 85dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.confirmacion__sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.confirmacion__handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin-top: var(--space-2);
}

.confirmacion__loader,
.confirmacion__logo {
  margin: 0 auto var(--space-6);
}

.confirmacion__logo {
  width: 88px;
  height: 88px;
}

.confirmacion__sheet-title {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-3);
  font-weight: 100;
}

.confirmacion__sheet-subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-6);
}

.confirmacion__sheet-help {
  margin-top: var(--space-8);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
}

@media (min-width: 768px) and (max-width: 1023px) {
  .confirmacion__overlay {
    align-items: center;
    justify-content: center;
  }

  .confirmacion__sheet {
    width: min(440px, 80%);
    border-radius: var(--radius-2xl);
    max-height: 90dvh;
  }
}

@media (min-width: 1024px) {
  .confirmacion {
    background: transparent;
    min-height: auto;
    flex: 1;
  }

  .confirmacion__hero {
    display: none;
  }

  .confirmacion__overlay {
    position: static;
    inset: auto;
    z-index: auto;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .confirmacion__sheet {
    width: min(440px, 80%);
    border-radius: var(--radius-2xl);
    box-shadow: none;
    padding: var(--space-8);
    max-height: none;
    overflow-y: visible;
  }

  .confirmacion__sheet-header {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .confirmacion__overlay,
  .confirmacion__sheet {
    transition-duration: 0.01ms !important;
  }
}
</style>
