<template>
  <div class="billing-return">
    <div class="billing-return__content">
      <div v-if="status === 'loading'" class="billing-return__state">
        <div class="billing-return__spinner" />
        <h1 class="title title--lg">Procesando tu membresía…</h1>
        <p>Estamos confirmando tu pago. Esto puede tardar unos segundos.</p>
      </div>

      <div v-else-if="status === 'success'" class="billing-return__state">
        <span class="billing-return__icon"><Icon name="lucide:party-popper" size="48" /></span>
        <h1 class="title title--lg">¡Bienvenida a Core!</h1>
        <p>Tu membresía está activa. Aquí tienes los siguientes pasos:</p>

        <div class="billing-return__steps">
          <div class="billing-return__step">
            <span class="billing-return__step-num">1</span>
            <div>
              <strong>Descarga la app</strong>
              <p>Disponible en App Store y Google Play.</p>
            </div>
          </div>
          <div class="billing-return__step">
            <span class="billing-return__step-num">2</span>
            <div>
              <strong>Inicia sesión</strong>
              <p>Usa el mismo correo que usaste para pagar.</p>
            </div>
          </div>
          <div class="billing-return__step">
            <span class="billing-return__step-num">3</span>
            <div>
              <strong>Completa tu primer check-in</strong>
              <p>Abre "Hoy" y empieza tu camino.</p>
            </div>
          </div>
        </div>

        <p class="billing-return__note">
          Las compras se realizan en la web. La app móvil es para miembros: inicia sesión y consume contenido (no hay botones de compra dentro de la app).
        </p>

        <UiButton block to="/cuenta/hoy">Continuar en la web</UiButton>
      </div>

      <div v-else class="billing-return__state">
        <span class="billing-return__icon"><Icon name="lucide:triangle-alert" size="48" /></span>
        <h1 class="title title--lg">Hubo un problema</h1>
        <p>No pudimos confirmar tu pago. Si crees que es un error, contacta a soporte.</p>
        <p><strong>soporte@tupotencial.app</strong></p>
        <UiButton block variant="outline" to="/cuenta/complementos">Volver a VIP</UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const client = useSupabaseClient()
const { user } = useAuth()
const status = ref<'loading' | 'success' | 'error'>('loading')

onMounted(async () => {
  const maxAttempts = 10
  const intervalMs = 2000

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data } = await client
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.value?.id ?? '')
      .in('status', ['active', 'trialing'])
      .maybeSingle()

    if (data) {
      status.value = 'success'
      return
    }

    await new Promise(r => setTimeout(r, intervalMs))
  }

  status.value = 'error'
})
</script>

<style scoped>
.billing-return {
  min-height: 100dvh; display: flex; align-items: center; justify-content: center;
  padding: var(--space-6); background: var(--color-light);
}

.billing-return__content {
  max-width: var(--max-content-width); width: 100%;
}

.billing-return__state {
  text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-3);
}

.billing-return__state p {
  font-size: var(--text-sm); color: var(--color-muted); max-width: 300px;
  line-height: var(--leading-relaxed);
}

.billing-return__spinner {
  width: 48px; height: 48px; border: 3px solid var(--color-border);
  border-top-color: var(--color-primary); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.billing-return__icon { font-size: 3rem; }

.billing-return__steps {
  display: flex; flex-direction: column; gap: var(--space-4);
  text-align: left; width: 100%; margin: var(--space-5) 0;
}

.billing-return__step {
  display: flex; gap: var(--space-3); align-items: flex-start;
}

.billing-return__step-num {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--color-primary); color: var(--color-primary-contrast);
  display: flex; align-items: center; justify-content: center;
  font-weight: var(--weight-bold); font-size: var(--text-sm); flex-shrink: 0;
}

.billing-return__step strong { font-size: var(--text-md); display: block; }
.billing-return__step p { font-size: var(--text-sm); color: var(--color-muted); margin-top: 2px; }

.billing-return__note {
  background: var(--color-surface-alt); border-radius: var(--radius-lg);
  padding: var(--space-4); font-size: var(--text-xs) !important;
  margin-bottom: var(--space-4);
}
</style>
