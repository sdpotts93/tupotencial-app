<template>
  <div class="confirmacion">
    <div class="confirmacion__card">
      <img src="/logo-word/logo-word-black.png" alt="Tu Potencial" class="confirmacion__wordmark" />
      <BlobLoader v-if="status === 'loading'" class="confirmacion__loader" />
      <BlobLogo v-else class="confirmacion__logo" />

      <template v-if="status === 'loading'">
        <h1 class="confirmacion__title">Confirmando<br />invitación</h1>
        <p class="confirmacion__subtitle">Estamos preparando tu acceso al panel. Esto puede tardar unos segundos.</p>
      </template>

      <template v-else-if="status === 'error'">
        <h1 class="confirmacion__title">No pudimos<br />confirmar</h1>
        <p class="confirmacion__subtitle">{{ errorMessage }}</p>

        <UiButton variant="secondary" block to="/iniciar-sesion">
          Ir a iniciar sesión
        </UiButton>
      </template>
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
  min-height: 100%;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
}

.confirmacion__card {
  background: var(--color-accent);
  color: var(--color-text);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.confirmacion__wordmark {
  height: 18px;
  width: auto;
  display: block;
  margin-bottom: var(--space-8);
}

.confirmacion__loader,
.confirmacion__logo {
  margin-bottom: var(--space-6);
}

.confirmacion__logo {
  width: 88px;
  height: 88px;
}

.confirmacion__title {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  line-height: 0.95;
  margin-bottom: var(--space-3);
}

.confirmacion__subtitle {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

@media (min-width: 1024px) {
  .confirmacion {
    padding: 0;
  }
}
</style>
