<template>
  <div class="screen">
    <UiTopNav title="Check-in diario" show-back />
    <div class="screen__content">
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
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const selectedMood = ref<string | null>(null)
const reflection = ref('')
const loading = ref(false)
const showSuccess = ref(false)
const streak = ref(7)

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
  // Mock async submit
  await new Promise(r => setTimeout(r, 800))
  loading.value = false
  showSuccess.value = true
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

.checkin__mood:hover { border-color: rgba(var(--tint-rgb), 0.2); }

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
