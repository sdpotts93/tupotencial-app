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
              label="Título del formulario"
              required
              :error="errors.title"
            />

            <UiTextarea
              v-model="form.description"
              label="Descripción"
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

              <label class="field-toggle">
                <input v-model="field.required" type="checkbox" class="field-toggle__input" />
                <span class="field-toggle__label">Campo obligatorio</span>
              </label>
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
            <p class="meta-label">Última respuesta: 7 mar 2026</p>
          </div>
        </UiCard> -->
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="danger-ghost" size="sm" :loading="deleting" @click="handleDelete">Eliminar</UiButton>
      <UiButton variant="soft" size="sm" to="/admin/formularios">Cancelar</UiButton>
      <UiButton variant="primary-outline" size="sm" :loading="saving" @click="handleSave">Guardar cambios</UiButton>
      <p v-if="formError" class="form-error">{{ formError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const client = useSupabaseClient()
const id = route.params.id as string
const isNew = id === 'new'
const toast = useToast()
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')
const errors = reactive({ title: '' })

// ── Fetch existing form ──
const { data: formRecord } = await useAsyncData(`form-${id}`, async () => {
  if (isNew) return null
  const { data } = await client.from('forms').select('*').eq('id', id).single()
  return data
})

// Convert DB fields (jsonb array) to local FormField[]
function dbFieldsToLocal(dbFields: unknown): FormField[] {
  if (!Array.isArray(dbFields)) return []
  return dbFields.map((f: any) => ({
    question: f.question ?? '',
    type: ['text', 'textarea', 'select', 'rating'].includes(f.type) ? f.type : 'text',
    optionsText: Array.isArray(f.options) ? f.options.join(', ') : '',
    required: f.required ?? false,
  }))
}

function localFieldsToDb(localFields: FormField[]) {
  return localFields.map(f => ({
    question: f.question,
    type: f.type,
    required: f.required,
    ...(f.type === 'select' && f.optionsText
      ? { options: f.optionsText.split(',').map(o => o.trim()).filter(Boolean) }
      : {}),
  }))
}

// ── Form state ──
const form = reactive({
  title: formRecord.value?.title ?? '',
  description: formRecord.value?.description ?? '',
  status: formRecord.value?.status ?? 'active',
})

// ── Options ──
const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
]

const fieldTypeOptions = [
  { value: 'text', label: 'Pregunta abierta' },
  { value: 'textarea', label: 'Texto largo' },
  { value: 'select', label: 'Selección' },
  { value: 'rating', label: 'Calificación (estrellas)' },
]

// ── Field management ──
interface FormField {
  question: string
  type: 'text' | 'textarea' | 'select' | 'rating'
  optionsText: string
  required: boolean
}

const fields = ref<FormField[]>(
  formRecord.value ? dbFieldsToLocal(formRecord.value.fields) : [],
)

function addField() {
  fields.value.push({
    question: '',
    type: 'text',
    optionsText: '',
    required: false,
  })
}

function removeField(index: number) {
  fields.value.splice(index, 1)
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

    if (isNew) {
      await client.from('forms').insert(payload)
    } else {
      await client.from('forms').update(payload).eq('id', id)
    }
    navigateTo('/admin/formularios')
  } catch {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

const confirm = useConfirm()

async function handleDelete() {
  if (await confirm({ message: '¿Seguro que deseas eliminar este formulario?' })) {
    deleting.value = true
    try {
      await client.from('forms').delete().eq('id', id)
      navigateTo('/admin/formularios')
    } catch {
      toast.show('Error al eliminar', 'error')
    } finally {
      deleting.value = false
    }
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

/* ─── Field toggle ─── */
.field-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.field-toggle__input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-tint);
  cursor: pointer;
}

.field-toggle__label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
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
