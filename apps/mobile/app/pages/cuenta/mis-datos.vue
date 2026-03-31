<template>
  <div class="screen">
    <div class="screen__content">
      <!-- Standard header -->
      <header class="profile__header">
        <button class="profile__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="profile__header-title">Mis Datos</h1>
      </header>

      <!-- Desktop two-column layout wrapper -->
      <div class="profile__top-grid">
        <!-- Left column: Avatar + Form -->
        <div class="profile__top-left">
          <!-- Avatar with camera overlay -->
          <div class="profile__avatar-area">
            <div class="profile__avatar">
              <span class="profile__avatar-initials">{{ initials }}</span>
            </div>
            <button type="button" class="profile__camera" aria-label="Subir foto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form class="profile__form" @submit.prevent="handleSave">
            <UiInput v-model="displayName" label="Nombre" placeholder="Tu nombre" />
            <UiSelect v-model="segment" label="Comunidad" :options="segmentOptions" />
            <p v-if="formError" class="form-error">{{ formError }}</p>
            <UiButton type="submit" block variant="secondary" :loading="saving">Guardar cambios</UiButton>
          </form>
        </div>

        <!-- Right column: Membership + Accesos VIP -->
        <div class="profile__top-right">
          <hr class="profile__divider" />

          <section class="profile__section">
            <p class="eyebrow">MEMBRESÍA</p>
            <div class="profile__membership">
              <div class="profile__membership-info">
                <span :class="['profile__membership-tag', isSubscriber ? 'profile__membership-tag--core' : 'profile__membership-tag--gratis']">
                  {{ isSubscriber ? 'Core' : 'Gratis' }}
                </span>
                <span v-if="!isSubscriber" class="profile__membership-detail">Suscríbete para desbloquear todo</span>
              </div>
              <span v-if="isSubscriber" class="profile__membership-renewal">Renovación: 15 Mar 2026</span>
            </div>
            <UiButton v-if="isSubscriber" block variant="outline" @click="handleManageSub">
              Administrar suscripción
            </UiButton>
          </section>

          <!-- Accesos VIP -->
          <section v-if="vipAccesos.length" class="profile__section">
            <p class="eyebrow">ACCESOS VIP</p>
            <div class="profile__accesos-list">
              <NuxtLink
                v-for="item in vipAccesos"
                :key="item.id"
                :to="`/cuenta/complementos/${item.id}`"
                class="profile__acceso"
              >
                <img :src="item.img" :alt="item.title" class="profile__acceso-img" />
                <div class="profile__acceso-body">
                  <span class="profile__acceso-title">{{ item.title }}</span>
                  <span class="profile__acceso-meta">{{ item.typeLabel }}</span>
                </div>
                <svg class="profile__acceso-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </NuxtLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const { user, isSubscriber, updateProfile, setSegment } = useAuth()
const toast = useToast()

const displayName = ref(user.value?.display_name || '')
const segment = ref(user.value?.community_segment || '')
const saving = ref(false)
const formError = ref('')

const segmentOptions = [
  { value: 'gabriel', label: 'Gabriel' },
  { value: 'carlotta', label: 'Carlotta' },
  { value: 'conjunta', label: 'Combinada' },
]

const initials = computed(() => {
  const name = displayName.value || '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})

const { data: vipAccesos } = await useAsyncData('profile-vip-accesos', async () => {
  if (!user.value?.id) return []
  const { data } = await client
    .from('addon_purchases')
    .select('addon_id, addons(id, title, plan, cover_url)')
    .eq('user_id', user.value.id)
  return (data ?? []).map(p => ({
    id: (p.addons as any)?.id ?? p.addon_id,
    title: (p.addons as any)?.title ?? '',
    typeLabel: 'CONTENIDO PREMIUM',
    img: (p.addons as any)?.cover_url ?? '/images/lib-8.jpg',
  }))
}, { watch: [() => user.value?.id] })

async function handleSave() {
  formError.value = ''
  saving.value = true
  try {
    await updateProfile({ display_name: displayName.value })
    if (segment.value) await setSegment(segment.value as any)
    toast.show('Perfil actualizado', 'success')
  } catch (err) {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

function handleManageSub() {
  window.open('https://tupotencial.com/cuenta', '_blank')
}
</script>

<style scoped>
.form-error {
  font-size: var(--text-sm);
  color: var(--color-danger);
  text-align: center;
}

/* ─── Header (standard) ─── */
.profile__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.profile__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.profile__back {
  position: absolute;
  left: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-dark-lighter);
  cursor: pointer;
  border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .profile__back:hover { background: rgba(var(--tint-rgb), 0.05); }
}

/* ─── Avatar with camera overlay (profile-setup style) ─── */
.profile__avatar-area {
  position: relative;
  width: fit-content;
  margin-bottom: var(--space-6);
}

.profile__avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--color-sand);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile__avatar-initials {
  font-family: var(--font-title);
  font-size: var(--title-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-dark);
}

.profile__camera {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text);
  transition: background var(--transition-fast);
}
@media (hover: hover) {
  .profile__camera:hover { background: var(--color-surface-alt); }
}

/* ─── Form (profile-setup style) ─── */
.profile__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  margin-bottom: var(--space-8);
}

.profile__form :deep(.input-field__label) {
  color: var(--color-text);
}

.profile__form :deep(.input-field__wrapper) {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  transition: border-color var(--transition-fast);
}

.profile__form :deep(.input-field__input) {
  color: var(--color-text);
}

.profile__form :deep(.select-field__label) {
  color: var(--color-text);
}

.profile__form :deep(.select-field__input) {
  border-radius: var(--radius-lg);
  color: var(--color-text);
}


.profile__form :deep(.select-field__input option) {
  background: var(--color-surface);
  color: var(--color-text);
}

.profile__form :deep(.select-field__chevron) {
  color: var(--color-muted);
}

/* ─── Sections ─── */
/* ─── Divider ─── */
.profile__divider {
  border: none;
  border-top: 1px solid rgba(var(--tint-rgb), 0.04);
  margin: 0 0 var(--space-6);
}

.profile__section { margin-bottom: var(--space-6); }
.profile__section > .eyebrow { margin-bottom: var(--space-3); }

/* ─── Membership (golden for Core) ─── */
.profile__membership {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  background: rgba(var(--tint-rgb), 0.04);
  border-radius: var(--radius-xl);
}

.profile__membership-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile__membership-tag {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-eyebrow);
  font-size: 10px;
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  width: fit-content;
  white-space: nowrap;
}

.profile__membership-tag--core {
  background: var(--color-gold-bg);
  color: var(--color-gold);
}

.profile__membership-tag--gratis {
  background: var(--color-silver-bg);
  color: var(--color-silver);
}

.profile__membership-detail {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.profile__membership-renewal {
  font-size: var(--text-xs);
  color: var(--color-muted);
  white-space: nowrap;
}

.profile__section :deep(.btn--outline) {
  margin-top: var(--space-3);
}

/* ─── Accesos VIP (progress__card style) ─── */
.profile__accesos-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.profile__acceso {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  text-decoration: none;
  color: var(--color-text);
  border-radius: var(--radius-xl);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  background: rgba(var(--tint-rgb), 0.04);
  transition: background var(--transition-fast);
}
@media (hover: hover) {
  .profile__acceso:hover { background: rgba(var(--tint-rgb), 0.06); }
}

.profile__acceso-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  object-fit: cover;
  flex-shrink: 0;
}

.profile__acceso-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile__acceso-title {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile__acceso-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--color-muted);
  font-family: var(--font-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.profile__acceso-chevron {
  flex-shrink: 0;
  color: var(--color-muted);
}

/* ─── Desktop SaaS (Wise-style single column) ─── */
@media (min-width: 1024px) {
  .profile__header {
    justify-content: flex-start;
  }

  .profile__header-title {
    display: none;
  }

  .profile__back {
    display: none;
  }

  /* Single centered column */
  .profile__top-grid {
    max-width: 640px;
    margin: 0 auto;
  }

  .profile__top-right .profile__divider {
    display: none;
  }

  /* Form: clean, no max-width constraint */
  .profile__form {
    margin-bottom: var(--space-6);
  }

  /* Section eyebrows: Wise-style with bottom border */
  .profile__section > .eyebrow {
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--color-desktop-border);
    margin-bottom: 0;
  }

  /* Membership row: flat, no card bg, bottom border */
  .profile__membership {
    background: none;
    border-radius: 0;
    padding: var(--space-5) 0 0;
  }

  .profile__section :deep(.btn--outline) {
    margin-top: var(--space-4);
    max-width: 240px;
  }

  /* Accesos VIP rows: flat with bottom borders */
  .profile__accesos-list {
    gap: 0;
  }

  .profile__acceso {
    background: none;
    border-radius: 0;
    padding: var(--space-4) 0;
    border-bottom: 1px solid var(--color-desktop-border);
  }

  @media (hover: hover) {
    .profile__acceso:hover {
      background: none;
    }
  }

  .profile__acceso:last-child {
    border-bottom: none;
  }
}
</style>
