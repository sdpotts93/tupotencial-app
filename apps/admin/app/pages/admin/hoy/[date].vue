<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Plan del día: {{ formatDate(dateParam) }}</h1>
    </div>

    <div class="form-layout__main">

      <!-- 1. Frase del día -->
      <UiCard variant="outlined">
        <div class="form-section">
          <h3 class="section-title">Frase del día</h3>
          <UiTextarea
            v-model="form.phrase_text"
            label="Frase"
            placeholder="Escribe la frase motivacional del día..."
            :rows="3"
          />
          <UiSelect
            v-model="form.phrase_author"
            label="Quién dice la frase"
            :options="authorOptions"
          />
        </div>
      </UiCard>

      <!-- 2. Acción del día -->
      <UiCard variant="outlined">
        <div class="form-section">
          <h3 class="section-title">Acción del día</h3>
          <p class="section-hint">El usuario verá esta acción como su reto principal del día. Selecciona el tipo y configura los detalles.</p>
          <UiSelect
            v-model="form.action_type"
            label="Tipo"
            :options="actionTypeOptions"
          />

          <!-- Contenido -->
          <UiSelect
            v-if="form.action_type === 'contenido'"
            v-model="form.content_id"
            label="Contenido"
            :options="contentOptions"
            placeholder="Selecciona contenido"
          />

          <!-- Formulario -->
          <UiSelect
            v-if="form.action_type === 'formulario'"
            v-model="form.form_id"
            label="Formulario"
            :options="formOptions"
            placeholder="Selecciona formulario"
          />

          <!-- Talk to AI: no extra fields -->
        </div>
      </UiCard>

      <!-- 3. Badge -->
      <UiCard variant="outlined">
        <div class="form-section">
          <h3 class="section-title">Badge</h3>
          <p class="section-hint">El badge aparece después de que el usuario completa la acción del día.</p>
          <UiInput
            v-model="form.badge_title"
            label="Título del badge"
            placeholder="Ej: Día completado"
          />
          <UiInput
            v-model="form.badge_subtitle"
            label="Subtítulo del badge"
            placeholder="Ej: Sigue así, vas genial"
          />
        </div>
      </UiCard>

    </div>

    <div class="page-actions">
      <UiButton variant="soft" size="sm" to="/admin/hoy">Cancelar</UiButton>
      <UiButton variant="primary-outline" size="sm" @click="handleSave">Guardar</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const dateParam = computed(() => route.params.date as string)

const form = reactive({
  phrase_text: 'Cada día es una nueva oportunidad para cuidar de ti.',
  phrase_author: 'gabriel' as 'gabriel' | 'carlotta',
  action_type: 'talk_to_ai' as string,
  content_id: '',
  form_id: '',
  badge_title: 'Día completado',
  badge_subtitle: 'Sigue así, vas genial',
})

const authorOptions = [
  { value: 'gabriel', label: 'Gabriel' },
  { value: 'carlotta', label: 'Carlotta' },
]

const actionTypeOptions = [
  { value: 'talk_to_ai', label: 'Habla con tu Coach IA' },
  { value: 'contenido', label: 'Contenido' },
  { value: 'formulario', label: 'Formulario' },
]

const contentOptions = [
  { value: 'cnt-001', label: '5 pasos para el bienestar emocional' },
  { value: 'cnt-002', label: 'Meditación guiada para la mañana' },
  { value: 'cnt-003', label: 'Nutrición consciente: guía básica' },
  { value: 'cnt-004', label: 'Rutina de yoga para principiantes' },
  { value: 'cnt-005', label: 'Higiene del sueño: consejos prácticos' },
  { value: 'cnt-006', label: 'Cómo manejar el estrés laboral' },
  { value: 'cnt-007', label: 'Ejercicios de respiración 4-7-8' },
  { value: 'cnt-008', label: 'Alimentación para la energía diaria' },
]

const formOptions = [
  { value: 'frm-001', label: 'Evaluación inicial de bienestar' },
  { value: 'frm-002', label: 'Check-in semanal' },
  { value: 'frm-003', label: 'Encuesta de satisfacción del programa' },
  { value: 'frm-004', label: 'Registro de hábitos diarios' },
  { value: 'frm-005', label: 'Evaluación de progreso mensual' },
]

watch(() => form.action_type, () => {
  form.content_id = ''
  form.form_id = ''
})

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function handleSave() {
  alert('Plan del día guardado (mock)')
}
</script>

<style scoped>
.form-layout__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
}

.section-hint {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
}

</style>
