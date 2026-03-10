<template>
  <div class="page-fill">
    <div class="page-header">
      <h1 class="page-header__title">Editar formulario</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.title"
              label="Titulo del formulario"
            />

            <UiTextarea
              v-model="form.description"
              label="Descripcion"
              :rows="3"
            />
          </div>
        </UiCard>

        <!-- Fields -->
        <div class="fields-header">
          <h2 class="fields-header__title">Campos del formulario</h2>
        </div>

        <div v-if="fields.length === 0" class="fields-empty">
          <p>No hay campos configurados. Agrega el primer campo del formulario.</p>
        </div>

        <div class="fields-list">
          <UiCard v-for="(field, index) in fields" :key="index" variant="outlined">
            <div class="form-section">
              <div class="field-card__header">
                <span class="field-card__number eyebrow">Campo {{ index + 1 }}</span>
                <UiButton variant="danger-ghost" size="sm" @click="removeField(index)">Quitar</UiButton>
              </div>

              <UiInput
                v-model="field.question"
                label="Pregunta"
                placeholder="Escribe la pregunta..."
              />

              <UiSelect
                v-model="field.type"
                label="Tipo"
                :options="fieldTypeOptions"
              />

              <UiInput
                v-if="field.type === 'select'"
                v-model="field.optionsText"
                label="Opciones (separadas por coma)"
                placeholder="Ej: Malo, Regular, Bueno, Excelente"
              />
            </div>
          </UiCard>
        </div>

        <UiButton variant="primary-outline" size="sm" @click="addField" style="align-self: flex-start; margin-top: var(--space-3);">+ Agregar campo</UiButton>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiSelect
              v-model="form.status"
              label="Estado"
              :options="statusOptions"
            />
          </div>
        </UiCard>
        <!-- <UiCard variant="filled">
          <div class="form-section">
            <p class="meta-label">Respuestas: 247</p>
            <p class="meta-label">Ultima respuesta: 7 mar 2026</p>
          </div>
        </UiCard> -->
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="danger-ghost" size="sm" @click="handleDelete">Eliminar</UiButton>
      <UiButton variant="soft" size="sm" to="/admin/formularios">Cancelar</UiButton>
      <UiButton variant="primary-outline" size="sm" @click="handleSave">Guardar cambios</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

// ── Form state (pre-filled) ──
const form = reactive({
  title: 'Evaluacion inicial de bienestar',
  description: 'Formulario para evaluar el estado de bienestar del usuario al iniciar un programa. Incluye preguntas sobre habitos, estado emocional y objetivos.',
  status: 'published',
})

// ── Options ──
const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

const fieldTypeOptions = [
  { value: 'text', label: 'Pregunta abierta' },
  { value: 'select', label: 'Seleccion' },
]

// ── Field management ──
interface FormField {
  question: string
  type: 'text' | 'select'
  optionsText: string
}

const fields = ref<FormField[]>([
  {
    question: 'Como describirias tu nivel de energia actualmente?',
    type: 'select',
    optionsText: 'Muy bajo, Bajo, Normal, Alto, Muy alto',
  },
  {
    question: 'Cuantas horas duermes en promedio por noche?',
    type: 'select',
    optionsText: 'Menos de 5, 5-6, 6-7, 7-8, Mas de 8',
  },
  {
    question: 'Cual es tu principal objetivo al iniciar este programa?',
    type: 'text',
    optionsText: '',
  },
  {
    question: 'Con que frecuencia realizas actividad fisica?',
    type: 'select',
    optionsText: 'Nunca, 1-2 veces por semana, 3-4 veces por semana, Diariamente',
  },
  {
    question: 'Hay algo mas que te gustaria compartir con tu coach?',
    type: 'text',
    optionsText: '',
  },
])

function addField() {
  fields.value.push({
    question: '',
    type: 'text',
    optionsText: '',
  })
}

function removeField(index: number) {
  fields.value.splice(index, 1)
}

function handleSave() {
  alert('Formulario actualizado (mock)')
}

function handleDelete() {
  if (confirm('Seguro que deseas eliminar este formulario?')) {
    alert('Formulario eliminado (mock)')
    navigateTo('/admin/formularios')
  }
}
</script>

<style scoped>
.page-fill {
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - var(--topbar-height) - var(--space-6) * 2);
}

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

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

/* ─── Fields ─── */
.fields-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-6);
  margin-bottom: var(--space-4);
}

.fields-header__title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
}

.fields-empty {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--color-muted);
  font-size: var(--text-sm);
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.field-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-card__number {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
}
</style>
