<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Nuevo evento</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.title"
              label="Título del evento"
              placeholder="Nombre del evento"
              required
              :error="errors.title"
            />

            <UiTextarea
              v-model="form.description"
              label="Descripción"
              placeholder="Describe el evento..."
              :rows="5"
              required
              :error="errors.description"
            />

            <!-- Image upload -->
            <div class="upload">
              <label class="upload__label">Imagen de portada</label>
              <div
                class="upload__dropzone"
                :class="{ 'upload__dropzone--active': isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop.prevent="handleDrop"
                @click="triggerFileInput"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="upload__input"
                  @change="handleFileChange"
                />
                <template v-if="!coverFile">
                  <div class="upload__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p class="upload__text">Arrastra tu imagen aquí o <span class="upload__link">selecciona</span></p>
                  <p class="upload__hint">JPG, PNG, WebP — max 10 MB</p>
                </template>
                <template v-else>
                  <div class="upload__preview">
                    <p class="upload__filename">{{ coverFile.name }}</p>
                    <p class="upload__filesize">{{ formatFileSize(coverFile.size) }}</p>
                    <button class="upload__remove" @click.stop="removeCover">Eliminar</button>
                  </div>
                </template>
              </div>
            </div>

            <div class="form-row">
              <UiDatePicker
                v-model="form.starts_at"
                label="Fecha y hora"
                :enable-time="true"
                placeholder="Selecciona fecha y hora"
                required
                :error="errors.starts_at"
              />
              <UiSelect
                v-model="form.duration"
                label="Duración"
                :options="durationOptions"
                placeholder="Selecciona duración"
                required
                :error="errors.duration"
              />
            </div>

            <div class="form-divider" />

            <p class="eyebrow">Vimeo</p>

            <UiInput
              v-model="form.vimeo_live_event_id"
              label="Vimeo Live Event ID"
              placeholder="1234567"
              hint="ID del evento en vivo. Ir a Vimeo > Crear > Evento en vivo. Copiar ID de la URL (ej: vimeo.com/event/1234567). Requiere Vimeo Premium."
            />
          </div>
        </UiCard>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiSelect
              v-model="form.plan"
              label="Plan"
              :options="planOptions"
            />

            <UiSelect
              v-model="form.entitlement_key"
              label="Complemento requerido"
              :options="entitlementOptions"
              placeholder="Sin restricción"
            />

            <UiSelect
              v-model="form.status"
              label="Estado"
              :options="statusOptions"
            />
          </div>
        </UiCard>

        <UiCard variant="filled">
          <div class="form-section">
            <p class="eyebrow">Configuración de Vimeo</p>
            <p class="meta-text">
              Para eventos en vivo necesitas <strong>Vimeo Premium</strong>. Crea un evento en vivo en Vimeo con privacidad "No listado" — la app controla el acceso mediante complementos.
            </p>
            <p v-if="form.vimeo_live_event_id" class="meta-text">
              URL de embed en vivo:<br>
              <code class="embed-url">https://vimeo.com/event/{{ form.vimeo_live_event_id }}/embed</code>
            </p>
          </div>
        </UiCard>
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="soft" size="sm" to="/admin/eventos">Cancelar</UiButton>
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
const errors = reactive({ title: '', description: '', starts_at: '', duration: '' })

// ── Image upload ──
const fileInput = ref<HTMLInputElement | null>(null)
const coverFile = ref<File | null>(null)
const isDragging = ref(false)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) coverFile.value = target.files[0]
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files?.[0]) coverFile.value = e.dataTransfer.files[0]
}

function removeCover() {
  coverFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Form state ──
const form = reactive({
  title: '',
  description: '',
  starts_at: null as Date | null,
  duration: '',
  vimeo_live_event_id: '',
  plan: 'free',
  entitlement_key: '',
  status: 'draft',
})

const durationOptions = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hora' },
  { value: '75', label: '1 hora 15 min' },
  { value: '90', label: '1 hora 30 min' },
  { value: '105', label: '1 hora 45 min' },
  { value: '120', label: '2 horas' },
  { value: '135', label: '2 horas 15 min' },
  { value: '150', label: '2 horas 30 min' },
  { value: '165', label: '2 horas 45 min' },
  { value: '180', label: '3 horas' },
]

const planOptions = [
  { value: 'free', label: 'Gratuito' },
  { value: 'core', label: 'Core' },
]

const entitlementOptions = [
  { value: '', label: 'Sin restricción (abierto)' },
  { value: 'vip', label: 'VIP' },
  { value: 'mentoria_grupal', label: 'Mentoría grupal' },
  { value: 'bootcamp_liderazgo', label: 'Bootcamp: Liderazgo' },
  { value: 'coaching_1on1', label: 'Coaching 1:1' },
  { value: 'retiro_marzo_2026', label: 'Retiro marzo 2026' },
]

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
]

async function handleSave() {
  formError.value = ''
  errors.title = ''
  errors.description = ''
  errors.starts_at = ''
  errors.duration = ''

  let hasError = false
  if (!form.title.trim()) { errors.title = 'El título es obligatorio'; hasError = true }
  if (!form.description.trim()) { errors.description = 'La descripción es obligatoria'; hasError = true }
  if (!form.starts_at) { errors.starts_at = 'La fecha y hora es obligatoria'; hasError = true }
  if (!form.duration) { errors.duration = 'La duración es obligatoria'; hasError = true }
  if (hasError) return

  saving.value = true
  try {
    const startAt = form.starts_at!.toISOString()

    await client.from('events').insert({
      title: form.title,
      description: form.description,
      start_at: startAt,
      duration: form.duration || null,
      vimeo_live_event_id: form.vimeo_live_event_id || null,
      plan: form.plan,
      entitlement_key: form.entitlement_key || null,
      status: form.status,
    })
    navigateTo('/admin/eventos')
  } catch {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
  }
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
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-divider {
  border-top: 1px solid var(--color-border-light);
  margin: var(--space-2) 0;
}

.eyebrow {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-md);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.meta-text {
  font-size: var(--text-xs);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
}

.embed-url {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  background: rgba(var(--tint-rgb), 0.04);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  word-break: break-all;
}

/* ─── Upload ─── */
.upload__label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.upload__dropzone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-4);
  text-align: center;
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.upload__dropzone--active {
  border-color: var(--color-tint);
  background: rgba(var(--tint-rgb), 0.04);
}

.upload__input {
  display: none;
}

.upload__icon {
  color: var(--color-muted);
  margin-bottom: var(--space-3);
}

.upload__text {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-bottom: var(--space-1);
}

.upload__link {
  color: var(--color-tint);
  font-weight: var(--weight-medium);
}

.upload__hint {
  font-size: var(--text-xs);
  color: var(--color-muted);
  opacity: 0.7;
}

.upload__preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.upload__filename {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  word-break: break-all;
}

.upload__filesize {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.upload__remove {
  font-size: var(--text-xs);
  color: var(--color-danger, #dc2626);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  margin-top: var(--space-1);
  border-radius: var(--radius-sm);
}

@media (hover: hover) {
  .upload__dropzone:hover {
    border-color: var(--color-muted);
  }

  .upload__remove:hover {
    background: rgba(220, 38, 38, 0.06);
  }
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}

.form-error {
  width: 100%;
  font-size: var(--text-sm);
  color: var(--color-danger);
  text-align: center;
  order: -1;
}
</style>
