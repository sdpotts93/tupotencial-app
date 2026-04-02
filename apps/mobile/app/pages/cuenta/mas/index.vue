<template>
  <div class="screen">
    <div class="screen__content">
      <template v-if="masStatus === 'pending'">
        <div class="more__profile">
          <UiSkeleton variant="circle" width="56px" height="56px" />
          <div class="more__info">
            <UiSkeleton variant="text" width="120px" height="18px" style="margin-bottom: 4px;" />
            <UiSkeleton variant="text" width="50px" height="20px" style="border-radius: var(--radius-full);" />
          </div>
        </div>

        <UiSkeleton variant="text" width="30%" height="10px" style="margin-bottom: var(--space-3);" />
        <div style="display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-6);">
          <div v-for="i in 4" :key="i" style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) 0;">
            <UiSkeleton variant="circle" width="20px" height="20px" />
            <div style="flex: 1;">
              <UiSkeleton variant="text" width="40%" height="14px" style="margin-bottom: 4px;" />
              <UiSkeleton variant="text" width="70%" height="12px" />
            </div>
          </div>
        </div>

        <UiSkeleton variant="text" width="25%" height="10px" style="margin-bottom: var(--space-3); margin-top: var(--space-6);" />
        <div style="display: flex; flex-direction: column; gap: var(--space-1);">
          <div v-for="i in 4" :key="i" style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) 0;">
            <UiSkeleton variant="circle" width="20px" height="20px" />
            <div style="flex: 1;">
              <UiSkeleton variant="text" width="35%" height="14px" style="margin-bottom: 4px;" />
              <UiSkeleton variant="text" width="65%" height="12px" />
            </div>
          </div>
        </div>
      </template>
      <template v-else>

      <!-- Profile header -->
      <div class="more__profile">
        <div class="more__avatar"><span>{{ initials }}</span></div>
        <div class="more__info">
          <h2 class="more__name">{{ user?.display_name || user?.email?.split('@')[0] || 'Sin nombre' }}</h2>
          <UiTag v-if="isSubscriber" variant="accent" size="md">Core</UiTag>
          <UiTag v-else variant="default" size="md">Gratis</UiTag>
        </div>
      </div>

      <!-- Suscripción -->
      <p class="more__section-title">Suscripción</p>
      <UiList>
        <UiListItem label="Suscripción" :description="currentPlanName" to="/cuenta/suscripcion">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 100 4h4v-4z"/></svg>
          </template>
          <template #suffix>
            <UiTag :variant="isSubscriber ? 'accent' : 'default'" size="sm">{{ isSubscriber ? 'Core' : 'Gratis' }}</UiTag>
          </template>
        </UiListItem>
        <UiListItem label="VIP" description="Mentorías, retiros y experiencias premium" to="/cuenta/complementos">
          <template #icon>
            <svg class="more__icon--vip" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Beneficios" description="Alianzas y descuentos exclusivos para miembros" to="/cuenta/beneficios">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          </template>
        </UiListItem>
        <UiListItem v-if="isSubscriber && !isNative" label="Gestionar suscripción" description="Cambiar método de pago o cancelar" @click="openPortal">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </template>
        </UiListItem>
      </UiList>

      <!-- Cuenta -->
      <p class="more__section-title">Cuenta</p>
      <UiList>
        <UiListItem label="Mi Coach IA" description="Tu coach personal con inteligencia artificial" to="/cuenta/ia">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Mi Progreso" description="Racha, estadísticas y logros" to="/cuenta/hoy/progreso">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Mis datos" description="Edita tu nombre, foto y segmento" to="/cuenta/mis-datos">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Configuración" description="Notificaciones y preferencias" to="/cuenta/ajustes">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </template>
        </UiListItem>
        <UiListItem label="Cerrar sesión" @click="handleLogout">
          <template #icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </template>
        </UiListItem>
      </UiList>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isSubscriber, logout } = useAuth()
const { isNative } = useNativePlatform()
const client = useSupabaseClient()
const config = useRuntimeConfig()
const portalLoading = ref(false)

const initials = computed(() => {
  const name = user.value?.display_name || user.value?.email?.split('@')[0] || '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})

const { data: currentPlan, status: masStatus } = useAsyncData('current-plan', async () => {
  const planId = isSubscriber.value ? 'core' : 'free'
  const { data } = await client.from('subscription_plans').select('title').eq('id', planId).single()
  return data
}, { lazy: true, watch: [isSubscriber] })

const currentPlanName = computed(() => currentPlan.value?.title ?? (isSubscriber.value ? 'Core' : 'Gratis'))

async function openPortal() {
  const { data: { session } } = await client.auth.getSession()
  if (!session) return

  const workerUrl = config.public.stripeWorkerUrl
  if (!workerUrl) return

  portalLoading.value = true
  try {
    const res = await fetch(`${workerUrl}/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        returnUrl: window.location.origin + '/cuenta/mas',
      }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  } finally {
    portalLoading.value = false
  }
}

function handleLogout() {
  logout()
}
</script>

<style scoped>
.more__profile {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding: var(--space-4) 0;
}

.more__avatar {
  width: 56px; 
  height: 56px; 
  border-radius: 50%; 
  background: var(--color-sand);
  display: flex; align-items: center; 
  justify-content: center;
  font-family: var(--font-title);
  font-weight: var(--weight-semibold);
  color: var(--color-dark);
}

.more__info { display: flex; flex-direction: column; gap: var(--space-1); }
.more__name { font-size: var(--text-lg); font-weight: var(--weight-semibold); }

.more__section-title {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--space-3);
  margin-top: var(--space-6);
}

.more__section-title:first-of-type { margin-top: 0; }

/* Plan tier tag colors */
.more__info :deep(.tag--accent) { width: fit-content; background: var(--color-gold-bg); color: var(--color-gold); }
.more__info :deep(.tag--default) {  background: var(--color-silver-bg); color: var(--color-text-secondary); }

/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .more__profile {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
  }

  .more__avatar {
    width: 48px;
    height: 48px;
  }
}
</style>
