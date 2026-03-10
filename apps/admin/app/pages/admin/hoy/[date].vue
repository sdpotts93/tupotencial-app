<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Plan del dia: {{ formatDate(dateParam) }}</h1>
      <div class="page-header__actions">
        <UiButton variant="soft" size="sm" to="/admin/hoy">Volver</UiButton>
        <UiButton variant="primary-outline" size="sm" @click="handleSave">Guardar</UiButton>
      </div>
    </div>

    <div class="form-layout">
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
            <p class="section-hint">Vincula este dia a un programa y su dia correspondiente. El usuario vera esta accion como su reto principal del dia.</p>
            <UiSelect
              v-model="form.program_id"
              label="Programa"
              :options="programOptions"
              placeholder="Selecciona un programa"
            />
            <UiSelect
              v-if="form.program_id"
              v-model="form.program_day_id"
              label="Dia del programa"
              :options="programDayOptions"
              placeholder="Selecciona el dia"
            />
            <div v-if="form.program_id && form.program_day_id" class="action-preview">
              <Icon name="lucide:check-circle" size="16" />
              <span>{{ selectedProgramLabel }} &mdash; {{ selectedDayLabel }}</span>
            </div>
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

      <div class="form-layout__sidebar">
        <UiCard variant="filled">
          <div class="form-section">
            <p class="meta-label">Fecha</p>
            <p class="meta-value">{{ formatDate(dateParam) }}</p>
            <p class="meta-label" style="margin-top: var(--space-3);">Comunidad</p>
            <p class="meta-value">{{ form.phrase_author === 'gabriel' ? 'Gabriel' : 'Carlotta' }}</p>
          </div>
        </UiCard>
      </div>
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
  program_id: 'prg-001',
  program_day_id: 'pd-001',
  badge_title: 'Dia completado',
  badge_subtitle: 'Sigue asi, vas genial',
})

const authorOptions = [
  { value: 'gabriel', label: 'Gabriel' },
  { value: 'carlotta', label: 'Carlotta' },
]

const programOptions = [
  { value: 'prg-001', label: 'Reto 21 dias de meditacion' },
  { value: 'prg-002', label: 'Programa de nutricion consciente' },
  { value: 'prg-003', label: 'Bootcamp de bienestar integral' },
  { value: 'prg-004', label: 'Reto 7 dias de gratitud' },
]

const programDaysMap: Record<string, { value: string; label: string }[]> = {
  'prg-001': [
    { value: 'pd-001', label: 'Dia 1: Introduccion a la meditacion' },
    { value: 'pd-002', label: 'Dia 2: Respiracion consciente' },
    { value: 'pd-003', label: 'Dia 3: El escaneo corporal' },
    { value: 'pd-004', label: 'Dia 4: Meditacion caminando' },
    { value: 'pd-005', label: 'Dia 5: Manejo de pensamientos' },
  ],
  'prg-002': [
    { value: 'pd-010', label: 'Dia 1: Fundamentos de nutricion' },
    { value: 'pd-011', label: 'Dia 2: Planificacion de comidas' },
    { value: 'pd-012', label: 'Dia 3: Hidratacion consciente' },
  ],
  'prg-003': [
    { value: 'pd-020', label: 'Dia 1: Evaluacion integral' },
    { value: 'pd-021', label: 'Dia 2: Plan de accion' },
  ],
  'prg-004': [
    { value: 'pd-030', label: 'Dia 1: Gratitud matutina' },
    { value: 'pd-031', label: 'Dia 2: Carta de agradecimiento' },
    { value: 'pd-032', label: 'Dia 3: Meditacion de gratitud' },
  ],
}

const programDayOptions = computed(() => {
  return programDaysMap[form.program_id] ?? []
})

watch(() => form.program_id, () => {
  form.program_day_id = ''
})

const selectedProgramLabel = computed(() => {
  return programOptions.find(p => p.value === form.program_id)?.label ?? ''
})

const selectedDayLabel = computed(() => {
  return programDayOptions.value.find(d => d.value === form.program_day_id)?.label ?? ''
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
.form-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-6);
  align-items: start;
}

.form-layout__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-layout__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: sticky;
  top: 0;
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

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-value {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  margin-top: var(--space-1);
}

.action-preview {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: rgba(40, 55, 74, 0.04);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-success);
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
}
</style>
