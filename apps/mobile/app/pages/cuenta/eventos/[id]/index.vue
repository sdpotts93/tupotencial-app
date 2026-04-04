<template>
  <div class="screen">
    <!-- Skeleton -->
    <template v-if="eventStatus === 'pending'">
      <div class="edetail">
        <div class="edetail__media">
          <UiSkeleton variant="rect" width="100%" height="100%" />
        </div>
        <div class="edetail__info">
          <UiSkeleton variant="text" width="50%" height="10px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="80%" height="24px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="rect" width="100%" height="44px" radius="var(--radius-lg)" style="margin: var(--space-5) 0;" />
          <UiSkeleton variant="text" width="100%" height="14px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="85%" height="14px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="60%" height="14px" style="margin-bottom: var(--space-5);" />
          <div style="display: flex; gap: var(--space-2);">
            <UiSkeleton variant="text" width="90px" height="24px" radius="var(--radius-full)" />
            <UiSkeleton variant="text" width="70px" height="24px" radius="var(--radius-full)" />
          </div>
        </div>
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="eventStatus === 'error'">
      <div class="event__error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="event__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="event__error-title">No pudimos cargar el evento</h2>
        <p class="event__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refreshEvent()">Reintentar</UiButton>
      </div>
    </template>

    <!-- Content -->
    <template v-else>
    <div class="edetail">
      <!-- Media -->
      <div class="edetail__media">
        <img :src="event.img" alt="" class="edetail__img" />
        <div class="edetail__overlay" />
        <div class="edetail__nav safe-top">
          <button class="edetail__back" aria-label="Volver" @click="$router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="edetail__info">
        <button class="edetail__back-link" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <p class="eyebrow">{{ event.dateLabel }}</p>
        <h1 class="title title--lg edetail__title">{{ event.title }}</h1>

        <div class="edetail__actions">
          <!-- Not accessible (locked by plan/entitlement) -->
          <template v-if="!event.accessGranted">
            <UiButton variant="outline" block @click="handleLockedClick">
              {{ event.isLive ? 'Ver en vivo' : 'Ver evento' }}
            </UiButton>
          </template>

          <!-- Accessible but not registered -->
          <template v-else-if="!isRegistered">
            <UiButton
              variant="outline"
              block
              :loading="registering"
              @click="register"
            >
              Registrarme
            </UiButton>
          </template>

          <!-- Registered -->
          <template v-else>
            <UiButton variant="primary" block :to="`/cuenta/eventos/${id}/ver`">
              {{ event.isLive ? 'Ver en vivo' : 'Ver evento' }}
            </UiButton>
            <UiButton
              variant="ghost"
              block
              :loading="registering"
              @click="unregister"
              style="margin-top: var(--space-2);"
            >
              Cancelar registro
            </UiButton>
          </template>
        </div>

        <p class="edetail__desc">{{ event.description }}</p>

        <div class="edetail__meta">
          <span v-if="event.plan === 'core'" class="edetail__tag edetail__tag--member">Solo miembros</span>
        </div>
      </div>
    </div>

    <EntitlementPurchaseModal v-model="showPurchaseModal" :addon="selectedAddon" />
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const id = route.params.id as string
const client = useSupabaseClient()
const { isSubscriber } = useAuth()
const { isLocked, getAddonForEntitlement } = useEntitlementGating()

const showPurchaseModal = ref(false)
const selectedAddon = ref<{ id: string; title: string; description: string | null } | null>(null)

const dayTimeFmt = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Mexico_City',
})

const statusLabels: Record<string, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  cancelled: 'Cancelado',
}

const user = useSupabaseUser()

// Registration state
const isRegistered = ref(false)
const registering = ref(false)

const { data: regData } = useAsyncData(`event-reg-${id}`, async () => {
  if (!user.value) return null
  const { data } = await client
    .from('event_registrations')
    .select('id, status')
    .eq('event_id', id)
    .eq('user_id', user.value.id)
    .single()
  return data
}, { lazy: true })

watch(regData, (d) => {
  isRegistered.value = !!d && d.status === 'registered'
}, { immediate: true })

async function register() {
  if (!user.value) return
  registering.value = true
  try {
    // Try insert first; if already exists, update status back to registered
    const { error } = await client.from('event_registrations').insert({
      event_id: id,
      user_id: user.value.id,
      status: 'registered',
    })
    if (error?.code === '23505') {
      // Unique violation — row exists (previously cancelled), update it
      await client.from('event_registrations')
        .update({ status: 'registered' })
        .eq('event_id', id)
        .eq('user_id', user.value.id)
    }
    isRegistered.value = true
  } finally {
    registering.value = false
  }
}

async function unregister() {
  if (!user.value) return
  registering.value = true
  try {
    await client.from('event_registrations')
      .update({ status: 'cancelled' })
      .eq('event_id', id)
      .eq('user_id', user.value.id)
    isRegistered.value = false
  } finally {
    registering.value = false
  }
}

const { data: eventData, status: eventStatus, refresh: refreshEvent } = useAsyncData(`event-${id}`, async () => {
  const { data } = await (client.rpc as any)('get_secure_event', { p_event_id: id })
  return data as Record<string, any> | null
}, { lazy: true })

function handleLockedClick() {
  const e = eventData.value
  if (e?.entitlement_key && isLocked(e.entitlement_key)) {
    selectedAddon.value = getAddonForEntitlement(e.entitlement_key)
    showPurchaseModal.value = true
    return
  }
  if (e?.plan === 'core' && !isSubscriber.value) {
    selectedAddon.value = { id: 'core', title: 'Plan Core', description: 'Suscríbete al plan Core para acceder a este evento.' }
    showPurchaseModal.value = true
  }
}

const event = computed(() => {
  const e = eventData.value
  if (!e) return { title: '', description: '', dateLabel: '', img: null, plan: 'free', status: '', isLive: false, accessGranted: false }
  const startDate = new Date(e.start_at)
  return {
    title: e.title,
    description: e.description ?? '',
    dateLabel: dayTimeFmt.format(startDate).toUpperCase() + ' CDMX',
    img: e.cover_url ?? null,
    plan: e.plan ?? 'free',
    status: statusLabels[e.status] ?? e.status,
    isLive: startDate > new Date() && e.status === 'published',
    accessGranted: e.access_granted,
  }
})
</script>

<style scoped>
/* ─── Mobile layout ─── */
.edetail {
  display: flex;
  flex-direction: column;
}

/* ─── Media ─── */
.edetail__media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.edetail__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edetail__overlay {
  position: absolute;
  inset: 0;
}

/* ─── Nav (mobile back) ─── */
.edetail__nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: var(--space-3) var(--space-4);
}

.edetail__back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dark-lighter);
  background: rgba(var(--tint-inverse-rgb), 0.85);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .edetail__back:hover { background: rgba(var(--tint-inverse-rgb), 1); }
}

/* ─── Back link (desktop only) ─── */
.edetail__back-link {
  display: none;
}

/* ─── Info ─── */
.edetail__info {
  padding: var(--space-4);
  padding-bottom: 2rem;
  width: 100%;
  max-width: var(--max-content-width);
  margin: 0 auto;
}

.edetail__title {
  margin-top: var(--space-1);
  margin-bottom: var(--space-2);
}

/* ─── Actions ─── */
.edetail__actions { margin: var(--space-5) 0; }

/* ─── Description ─── */
.edetail__desc {
  font-size: var(--text-base);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-5);
}

/* ─── Meta ─── */
.edetail__meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-8);
}

.edetail__tag {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
  white-space: nowrap;
}

.edetail__tag--member {
  background: var(--color-gold-bg);
  color: var(--color-gold);
}

.edetail__meta :deep(.tag) {
  background: var(--color-sand);
  color: var(--color-white);
}

/* ─── Tablet ─── */
@media (min-width: 768px) {
  .edetail__info {
    max-width: var(--max-page-width);
    padding: var(--space-6);
  }
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .edetail {
    display: grid;
    grid-template-columns: 55fr 45fr;
    background: var(--color-desktop-card);
    border-radius: var(--radius-2xl);
    overflow: hidden;
    border: 1px solid var(--color-desktop-border);
    margin: var(--space-6);
    min-height: 480px;
    max-width: 1100px;
  }

  .edetail__media {
    order: 2;
    aspect-ratio: unset;
  }

  .edetail__nav { display: none; }

  .edetail__back-link {
    display: flex;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    color: var(--color-dark-lighter);
    background: none;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    padding: 0;
    margin-bottom: var(--space-6);
  }
  @media (hover: hover) {
    .edetail__back-link:hover { background: rgba(var(--tint-rgb), 0.06); }
  }

  .edetail__info {
    order: 1;
    max-width: none;
    margin: 0;
    padding: var(--space-10);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .edetail__title {
    font-size: var(--title-xl);
  }

  .edetail__desc {
    font-size: var(--text-lg);
  }

  .edetail__info > .eyebrow {
    font-size: var(--eyebrow-lg);
  }

  .edetail__actions :deep(.btn) {
    width: auto;
    display: inline-flex;
  }
}

/* ─── Error state ─── */
.event__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.event__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.event__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.event__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
