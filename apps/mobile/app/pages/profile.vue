<template>
  <div class="screen">
    <UiTopNav title="Mi perfil" show-back @back="navigateTo('/more')" />
    <div class="screen__content">
      <!-- Avatar + name (inspired by inspiration-profile) -->
      <div class="profile__hero">
        <div class="profile__avatar"><span>{{ initials }}</span></div>
        <button class="profile__avatar-edit">Cambiar foto</button>
      </div>

      <form class="profile__form" @submit.prevent="handleSave">
        <UiInput v-model="displayName" label="Nombre" placeholder="Tu nombre" />

        <UiSelect
          v-model="segment"
          label="Comunidad"
          :options="segmentOptions"
        />

        <UiButton type="submit" block :loading="saving">Guardar cambios</UiButton>
      </form>

      <!-- Subscription status -->
      <section class="profile__section">
        <p class="eyebrow">MEMBRESÍA</p>
        <div class="profile__membership">
          <div>
            <span class="profile__membership-status">{{ isSubscriber ? 'Core — Activa' : 'Gratis' }}</span>
            <span class="profile__membership-detail">{{ isSubscriber ? 'Renovación: 15 Mar 2026' : 'Suscríbete para desbloquear todo' }}</span>
          </div>
          <UiTag :variant="isSubscriber ? 'success' : 'default'">{{ isSubscriber ? 'Activa' : 'Gratis' }}</UiTag>
        </div>
      </section>

      <!-- Entitlements -->
      <section v-if="entitlements.length" class="profile__section">
        <p class="eyebrow">ACCESOS</p>
        <UiList>
          <UiListItem v-for="ent in entitlements" :key="ent" :label="ent" />
        </UiList>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const { user, isSubscriber, updateProfile, setSegment } = useAuth()

const displayName = ref(user.value?.display_name || '')
const segment = ref(user.value?.community_segment || '')
const saving = ref(false)

const segmentOptions = [
  { value: 'gabriel', label: 'Gabriel' },
  { value: 'carlotta', label: 'Carlotta' },
  { value: 'conjunta', label: 'Combinada' },
]

const initials = computed(() => {
  const name = displayName.value || '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})

const entitlements = computed(() => user.value?.entitlements || [])

async function handleSave() {
  saving.value = true
  updateProfile({ display_name: displayName.value })
  if (segment.value) setSegment(segment.value as any)
  await new Promise(r => setTimeout(r, 500))
  saving.value = false
}
</script>

<style scoped>
.profile__hero {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--space-3); margin-bottom: var(--space-8);
}

.profile__avatar {
  width: 80px; height: 80px; border-radius: 50%;
  background: var(--color-primary); display: flex; align-items: center; justify-content: center;
  color: var(--color-primary-contrast); font-size: var(--title-md); font-weight: var(--weight-semibold);
}

.profile__avatar-edit {
  background: none; border: none; font-family: var(--font-body);
  font-size: var(--text-sm); color: var(--color-primary); cursor: pointer;
  font-weight: var(--weight-medium);
}

.profile__form { display: flex; flex-direction: column; gap: var(--space-4); margin-bottom: var(--space-8); }

.profile__section { margin-bottom: var(--space-6); }
.profile__section > .eyebrow { margin-bottom: var(--space-3); }

.profile__membership {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-4); background: #ffffff21; color: white;
  border-radius: var(--radius-xl);
}

.profile__membership-status { font-weight: var(--weight-semibold); display: block; }
.profile__membership-detail { font-size: var(--text-xs); color: rgba(255, 255, 255, 0.6); display: block; margin-top: 2px; }
</style>
