<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Plan del dia: {{ formatDate(dateParam) }}</h1>
    </div>

    <div class="form-layout__main">

      <!-- 1. Frase del dia -->
      <UiCard variant="outlined">
        <div class="form-section">
          <h3 class="section-title">Frase del dia</h3>
          <UiTextarea
            v-model="form.phrase_text"
            label="Frase"
            placeholder="Escribe la frase motivacional del dia..."
            :rows="3"
          />
          <UiSelect
            v-model="form.phrase_author"
            label="Quien dice la frase"
            :options="authorOptions"
          />
        </div>
      </UiCard>

      <!-- 2. Accion del dia -->
      <UiCard variant="outlined">
        <div class="form-section">
          <h3 class="section-title">Accion del dia</h3>
          <p class="section-hint">El usuario vera esta accion como su reto principal del dia. Selecciona el tipo y configura los detalles.</p>
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
          <p class="section-hint">El badge aparece despues de que el usuario completa la accion del dia.</p>
          <UiInput
            v-model="form.badge_title"
            label="Titulo del badge"
            placeholder="Ej: Dia completado"
          />
          <UiInput
            v-model="form.badge_subtitle"
            label="Subtitulo del badge"
            placeholder="Ej: Sigue asi, vas genial"
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
  phrase_text: 'Cada dia es una nueva oportunidad para cuidar de ti.',
  phrase_author: 'gabriel' as 'gabriel' | 'carlotta',
  action_type: 'talk_to_ai' as string,
  content_id: '',
  form_id: '',
  badge_title: 'Dia completado',
  badge_subtitle: 'Sigue asi, vas genial',
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
  { value: 'cnt-002', label: 'Meditacion guiada para la manana' },
  { value: 'cnt-003', label: 'Nutricion consciente: guia basica' },
  { value: 'cnt-004', label: 'Rutina de yoga para principiantes' },
  { value: 'cnt-005', label: 'Higiene del sueno: consejos practicos' },
  { value: 'cnt-006', label: 'Como manejar el estres laboral' },
  { value: 'cnt-007', label: 'Ejercicios de respiracion 4-7-8' },
  { value: 'cnt-008', label: 'Alimentacion para la energia diaria' },
]

const formOptions = [
  { value: 'frm-001', label: 'Evaluacion inicial de bienestar' },
  { value: 'frm-002', label: 'Check-in semanal' },
  { value: 'frm-003', label: 'Encuesta de satisfaccion del programa' },
  { value: 'frm-004', label: 'Registro de habitos diarios' },
  { value: 'frm-005', label: 'Evaluacion de progreso mensual' },
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
  alert('Plan del dia guardado (mock)')
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
  padding: var(--space-5);
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
