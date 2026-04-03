<template>
  <div class="screen">
    <UiTopNav title="Check-in diario" show-back />
    <div class="screen__content">
      <!-- Skeleton -->
      <template v-if="checkinStatus === 'pending'">
        <h1 class="title title--lg">¿Cómo te sientes hoy?</h1>
        <UiSkeleton variant="text" width="70%" height="14px" style="margin: var(--space-2) 0 var(--space-8);" />
        <div style="display: flex; justify-content: space-between; gap: var(--space-2); margin-bottom: var(--space-6);">
          <div v-for="i in 5" :key="i" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-3);">
            <UiSkeleton variant="circle" width="36px" height="36px" />
            <UiSkeleton variant="text" width="80%" height="10px" />
          </div>
        </div>
        <UiSkeleton variant="rect" width="100%" height="80px" radius="var(--radius-lg)" style="margin-bottom: var(--space-6);" />
        <UiSkeleton variant="rect" width="100%" height="44px" radius="var(--radius-lg)" />
      </template>

      <!-- Error state -->
      <template v-else-if="checkinStatus === 'error'">
        <div class="checkin__error">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="checkin__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
          <h2 class="checkin__error-title">No pudimos cargar</h2>
          <p class="checkin__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
          <UiButton variant="primary-outline" size="sm" @click="refreshCheckin()">Reintentar</UiButton>
        </div>
      </template>

      <!-- Content -->
      <template v-else>
      <h1 class="title title--lg">¿Cómo te sientes hoy?</h1>
      <p class="checkin__subtitle">Tómate un momento para reflexionar sobre tu estado actual.</p>

      <!-- Mood selector -->
      <div class="checkin__moods">
        <button
          v-for="mood in moods"
          :key="mood.value"
          :class="['checkin__mood', { 'checkin__mood--selected': selectedMood === mood.value }]"
          @click="selectedMood = mood.value"
        >
          <span class="checkin__mood-emoji"><Icon :name="mood.emoji" size="24" /></span>
          <span class="checkin__mood-label">{{ mood.label }}</span>
        </button>
      </div>

      <!-- Reflection -->
      <UiTextarea
        v-model="reflection"
        label="Reflexión (opcional)"
        placeholder="¿Qué quieres lograr hoy?"
        :rows="3"
      />

      <UiButton block :loading="loading" :disabled="!selectedMood" class="checkin__submit" @click="handleSubmit">
        Completar check-in
      </UiButton>

      <!-- Success modal -->
      <UiModal v-model="showSuccess" title="¡Check-in completado!" variant="center" :show-handle="false">
        <div class="checkin__success">
          <div class="checkin__success-badge"><Icon name="lucide:trophy" size="48" /></div>
          <p>Tu racha es de <strong>{{ streak + 1 }} días</strong>. ¡Sigue así!</p>
        </div>
        <template #footer>
          <UiButton block @click="navigateTo('/cuenta/hoy')">Volver a Hoy</UiButton>
        </template>
      </UiModal>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const client = useSupabaseClient()
const { user } = useAuth()
const toast = useToast()

const selectedMood = ref<string | null>(null)
const reflection = ref('')
const loading = ref(false)
const showSuccess = ref(false)

const _now = new Date()
const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`

// ── Fetch current streak ──
const { data: streakData, status: checkinStatus, refresh: refreshCheckin } = useAsyncData('checkin-streak', async () => {
  if (!user.value?.id) return null
  const { data } = await client.from('user_streaks').select('current_streak').eq('user_id', user.value.id).maybeSingle()
  return data?.current_streak ?? 0
}, { lazy: true, watch: [() => user.value?.id] })
const streak = computed(() => streakData.value ?? 0)

const moods = [
  { value: 'great', emoji: 'lucide:laugh', label: 'Increíble' },
  { value: 'good', emoji: 'lucide:smile', label: 'Bien' },
  { value: 'ok', emoji: 'lucide:meh', label: 'Regular' },
  { value: 'low', emoji: 'lucide:frown', label: 'Bajo' },
  { value: 'tough', emoji: 'lucide:annoyed', label: 'Difícil' },
]

async function handleSubmit() {
  if (!selectedMood.value) return
  loading.value = true
  try {
    await client.from('daily_checkins').insert({
      date: today,
      user_id: user.value!.id,
      type: 'checkin',
      payload: { mood: selectedMood.value, reflection: reflection.value },
    })
    showSuccess.value = true
  } catch {
    toast.show('Error al guardar', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.checkin__subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-2) 0 var(--space-8);
  line-height: var(--leading-relaxed);
}

.checkin__moods {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.checkin__mood {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3);
  border: 2px solid rgba(var(--tint-rgb), 0.075);
  border-radius: var(--radius-xl);
  background: rgba(var(--tint-rgb), 0.04);
  color: var(--color-text);
  cursor: pointer;
  flex: 1;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

@media (hover: hover) {
  .checkin__mood:hover { border-color: rgba(var(--tint-rgb), 0.2); }
}

.checkin__mood--selected {
  border-color: var(--color-accent);
  background: rgba(var(--tint-rgb), 0.08);
}

.checkin__mood-emoji { font-size: 1.5rem; }

.checkin__mood-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
}

.checkin__submit { margin-top: var(--space-6); }

.checkin__success {
  text-align: center;
  padding: var(--space-4) 0;
}

.checkin__success-badge {
  font-size: 3rem;
  margin-bottom: var(--space-3);
}

.checkin__success p {
  font-size: var(--text-md);
  color: var(--color-text-secondary);
}

/* ─── Error state ─── */
.checkin__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.checkin__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.checkin__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.checkin__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
