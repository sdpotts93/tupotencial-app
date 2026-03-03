<template>
  <div class="profile-setup">
    <!-- Header: back + progress -->
    <div class="profile-setup__header">
      <button class="profile-setup__back" aria-label="Volver" @click="navigateTo('/auth/register')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="profile-setup__progress">
        <div class="profile-setup__progress-fill" />
      </div>
    </div>

    <div class="profile-setup__card">
      <!-- Avatar with camera overlay -->
      <div class="profile-setup__avatar-area">
        <div class="profile-setup__avatar">
          <span class="profile-setup__avatar-initials">{{ initials }}</span>
        </div>
        <button type="button" class="profile-setup__camera" aria-label="Subir foto">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
      </div>

      <!-- Title + subtitle -->
      <h1 class="title title--xl profile-setup__title">Personaliza tu perfil</h1>
      <p class="profile-setup__subtitle">Prepárate para conectar con la comunidad.</p>

      <!-- Name field -->
      <form class="profile-setup__form" @submit.prevent="handleSave">
        <UiInput
          v-model="displayName"
          label="Tu nombre"
          placeholder="Tu nombre"
          :error="error"
        />

        <!-- Desktop: button inside card -->
        <UiButton
          type="submit"
          block
          variant="secondary"
          :loading="loading"
          :disabled="!displayName.trim()"
          class="profile-setup__desktop-btn"
        >
          Continuar
        </UiButton>
      </form>
    </div>

    <!-- Mobile: bottom-pinned button -->
    <div class="profile-setup__footer">
      <UiButton
        block
        variant="secondary"
        :loading="loading"
        :disabled="!displayName.trim()"
        @click="handleSave"
      >
        Continuar
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { updateProfile, user } = useAuth()

const displayName = ref(user.value?.display_name || '')
const loading = ref(false)
const error = ref('')

const initials = computed(() => {
  const name = displayName.value.trim()
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})

async function handleSave() {
  if (!displayName.value.trim()) { error.value = 'Ingresa tu nombre'; return }

  loading.value = true
  updateProfile({ display_name: displayName.value.trim() })
  loading.value = false
  navigateTo('/onboarding/segment')
}
</script>

<style scoped>
.profile-setup {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
}

/* ─── Header ─── */
.profile-setup__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) var(--space-3);
  flex-shrink: 0;
}

.profile-setup__back {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  color: var(--color-dark-lighter);
  cursor: pointer;
  flex-shrink: 0;
}

/* ─── Progress bar ─── */
.profile-setup__progress {
  flex: 1;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.profile-setup__progress-fill {
  height: 100%;
  width: 20%;
  background: var(--color-dark-lighter);
  border-radius: var(--radius-full);
}

/* ─── Card (body content) ─── */
.profile-setup__card {
  flex: 1;
  padding: var(--space-6);
  max-width: var(--max-content-width);
  width: 100%;
  margin: 0 auto;
}

/* ─── Avatar with camera overlay ─── */
.profile-setup__avatar-area {
  position: relative;
  width: fit-content;
  margin-bottom: var(--space-6);
}

.profile-setup__avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--color-sand);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-setup__avatar-initials {
  font-family: var(--font-title);
  font-size: var(--title-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-dark);
}

.profile-setup__camera {
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
.profile-setup__camera:hover {
  background: var(--color-surface-alt);
}

/* ─── Title + subtitle ─── */
.profile-setup__title {
  margin-bottom: var(--space-2);
}

.profile-setup__subtitle {
  font-size: var(--text-base);
  color: var(--color-muted);
  margin-bottom: var(--space-8);
  line-height: var(--leading-relaxed);
}

/* ─── Form ─── */
.profile-setup__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Hide desktop button on mobile */
.profile-setup__desktop-btn {
  display: none;
}

/* ─── Footer (mobile bottom-pinned) ─── */
.profile-setup__footer {
  padding: var(--space-4) var(--space-6);
  padding-bottom: calc(var(--space-6) + var(--safe-area-bottom));
  max-width: var(--max-content-width);
  width: 100%;
  margin: 0 auto;
}

.profile-setup__card :deep(.input-field__label) {
  color: var(--color-text);
}


/* .profile-setup__card :deep(.input-field__wrapper:focus-within) {
  border-color: white;
} */

.profile-setup__card :deep(.input-field__input) {
  color: var(--color-text);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .profile-setup {
    min-height: auto;
    background: transparent;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .profile-setup__header {
    max-width: 440px;
    width: 100%;
    padding: 0 0 var(--space-4);
  }

  .profile-setup__card {
    background: var(--color-accent);
    color: var(--color-text);
    border-radius: var(--radius-2xl);
    box-shadow: none;
    padding: var(--space-8);
    max-width: 440px;
    flex: none;
    min-height: 540px;
    display: flex;
    flex-direction: column;
  }

  .profile-setup__form {
    margin-top: auto;
  }

  .profile-setup__desktop-btn {
    display: flex;
  }

  .profile-setup__progress {
    background: var(--color-border);
  }

  .profile-setup__progress-fill {
    background: var(--color-dark);
  }

  .profile-setup__card :deep(.input-field__label) {
    color: var(--color-text);
  }


  .profile-setup__card :deep(.input-field__wrapper:focus-within) {
    border-color: var(--color-primary);
  }

  .profile-setup__card :deep(.input-field__input) {
    color: var(--color-text);
  }

  .profile-setup__footer {
    display: none;
  }
}
</style>
