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
const { data: streakData, status: checkinStatus } = useAsyncData('checkin-streak', async () => {
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
</style>
