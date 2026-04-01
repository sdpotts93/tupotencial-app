<template>
  <div class="page-fill">
    <div class="page-header">
      <h1 class="page-header__title">Nuevo formulario</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.title"
              label="Título del formulario"
              placeholder="Escribe el título del formulario"
              required
              :error="errors.title"
            />

            <UiTextarea
              v-model="form.description"
              label="Descripción"
              placeholder="Describe el propósito del formulario..."
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
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="soft" size="sm" to="/admin/formularios">Cancelar</UiButton>
      <UiButton variant="primary-outline" size="sm" :loading="saving" @click="handleSave">Guardar</UiButton>
      <p v-if="formError" class="form-error">{{ formError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const toast = useToast()
const saving = ref(false)
const formError = ref('')
const errors = reactive({ title: '' })

// ── Form state ──
const form = reactive({
  title: '',
  description: '',
  status: 'active',
})

// ── Options ──
const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
]

const fieldTypeOptions = [
  { value: 'text', label: 'Pregunta abierta' },
  { value: 'select', label: 'Selección' },
]

// ── Field management ──
interface FormField {
  question: string
  type: 'text' | 'select'
  optionsText: string
}

const fields = ref<FormField[]>([])

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

function localFieldsToDb(localFields: FormField[]) {
  return localFields.map(f => ({
    question: f.question,
    type: f.type,
    ...(f.type === 'select' && f.optionsText
      ? { options: f.optionsText.split(',').map(o => o.trim()).filter(Boolean) }
      : {}),
  }))
}

async function handleSave() {
  formError.value = ''
  errors.title = ''

  if (!form.title.trim()) { errors.title = 'El título es obligatorio'; return }

  saving.value = true
  try {
    const payload = {
      title: form.title,
      description: form.description || null,
      fields: localFieldsToDb(fields.value),
      status: form.status,
    }

    await client.from('forms').insert(payload)
    navigateTo('/admin/formularios')
  } catch {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
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

.form-error {
  width: 100%;
  font-size: var(--text-sm);
  color: var(--color-danger);
  text-align: center;
  order: -1;
}
</style>
