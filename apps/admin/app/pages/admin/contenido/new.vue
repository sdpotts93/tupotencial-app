<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Crear contenido</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.title"
              label="Titulo"
              placeholder="Escribe el titulo del contenido"
            />

            <UiTextarea
              v-model="form.introduction"
              label="Introduccion"
              placeholder="Escribe una breve introduccion..."
              :rows="3"
            />

            <UiEditor
              v-if="form.content_type === 'article'"
              v-model="form.body"
              label="Contenido del articulo"
              placeholder="Escribe el contenido del articulo aqui..."
            />
            <UiTextarea
              v-else
              v-model="form.body"
              label="Texto"
              placeholder="Escribe el contenido aqui..."
              :rows="10"
            />

            <!-- File upload -->
            <div class="upload">
              <label class="upload__label">{{ uploadLabel }}</label>
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
                  :accept="acceptType"
                  class="upload__input"
                  @change="handleFileChange"
                />
                <template v-if="!uploadedFile">
                  <div class="upload__icon">
                    <svg v-if="form.content_type === 'video'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                    <svg v-else-if="form.content_type === 'audio'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                    </svg>
                    <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p class="upload__text">Arrastra tu archivo aqui o <span class="upload__link">selecciona</span></p>
                  <p class="upload__hint">{{ acceptHint }}</p>
                </template>
                <template v-else>
                  <div class="upload__preview">
                    <p class="upload__filename">{{ uploadedFile.name }}</p>
                    <p class="upload__filesize">{{ formatFileSize(uploadedFile.size) }}</p>
                    <button class="upload__remove" @click.stop="removeFile">Eliminar</button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </UiCard>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiSelect
              v-model="form.content_type"
              label="Tipo de contenido"
              :options="typeOptions"
              placeholder="Selecciona el tipo"
            />

            <UiSelect
              v-model="form.category_id"
              label="Categoria"
              :options="categoryOptions"
              placeholder="Selecciona la categoria"
            />

            <UiSelect
              v-model="form.objective_id"
              label="Objetivo"
              :options="objectiveOptions"
              placeholder="Selecciona el objetivo"
            />

            <UiInput
              v-model="form.duration"
              label="Duracion"
              placeholder="Ej: 10 min"
            />

            <UiSelect
              v-model="form.segment"
              label="Plan"
              :options="segmentOptions"
              placeholder="Selecciona el plan"
            />

            <UiSelect
              v-model="form.entitlement_key"
              label="Complemento requerido"
              :options="entitlementOptions"
              placeholder="Sin restriccion"
            />

            <UiSelect
              v-model="form.status"
              label="Estado"
              :options="statusOptions"
              placeholder="Selecciona el estado"
            />

            <UiInput
              v-if="form.status === 'scheduled'"
              v-model="form.scheduled_at"
              label="Fecha de publicacion programada"
              type="datetime-local"
            />

            <UiInput
              v-model="form.unpublished_at"
              label="Despublicar automaticamente (opcional)"
              type="datetime-local"
              hint="Fecha en que el contenido se archivara automaticamente"
            />
          </div>
        </UiCard>
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="soft" size="sm" to="/admin/contenido">Cancelar</UiButton>
      <UiButton variant="primary-outline" size="sm" @click="handleSave">Guardar</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)
const isDragging = ref(false)

const form = reactive({
  title: '',
  introduction: '',
  body: '',
  content_type: 'video',
  category_id: '',
  objective_id: '',
  duration: '',
  segment: 'free',
  entitlement_key: '',
  status: 'draft',
  scheduled_at: '',
  unpublished_at: '',
})

const typeOptions = [
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'article', label: 'Articulo' },
]

const segmentOptions = [
  { value: 'free', label: 'Gratuito' },
  { value: 'core', label: 'Core' },
]

const entitlementOptions = [
  { value: '', label: 'Sin restriccion (abierto)' },
  { value: 'vip', label: 'VIP' },
  { value: 'mentoria_grupal', label: 'Mentoria grupal' },
  { value: 'bootcamp_liderazgo', label: 'Bootcamp: Liderazgo' },
  { value: 'coaching_1on1', label: 'Coaching 1:1' },
  { value: 'retiro_marzo_2026', label: 'Retiro marzo 2026' },
]

const categoryOptions = [
  { value: 'cat-001', label: 'Mindfulness' },
  { value: 'cat-002', label: 'Nutricion' },
  { value: 'cat-003', label: 'Ejercicio' },
  { value: 'cat-004', label: 'Sueno' },
  { value: 'cat-005', label: 'Productividad' },
  { value: 'cat-006', label: 'Relaciones' },
  { value: 'cat-007', label: 'Finanzas personales' },
]

const objectiveOptions = [
  { value: 'obj-001', label: 'Reducir estres' },
  { value: 'obj-002', label: 'Rutina matutina' },
  { value: 'obj-003', label: 'Crecimiento personal' },
  { value: 'obj-004', label: 'Inteligencia emocional' },
  { value: 'obj-005', label: 'Mindfulness' },
  { value: 'obj-006', label: 'Habitos positivos' },
]

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'scheduled', label: 'Programado' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

const uploadLabel = computed(() => {
  const labels: Record<string, string> = {
    video: 'Subir video',
    audio: 'Subir audio',
    article: 'Imagen del articulo',
  }
  return labels[form.content_type] || 'Subir archivo'
})

const acceptType = computed(() => {
  const types: Record<string, string> = {
    video: 'video/*',
    audio: 'audio/*',
    article: 'image/*',
  }
  return types[form.content_type] || '*/*'
})

const acceptHint = computed(() => {
  const hints: Record<string, string> = {
    video: 'MP4, MOV, WebM — max 500 MB',
    audio: 'MP3, WAV, M4A — max 100 MB',
    article: 'JPG, PNG, WebP — max 10 MB',
  }
  return hints[form.content_type] || ''
})

// Reset file when content type changes
watch(() => form.content_type, () => {
  uploadedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
})

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    uploadedFile.value = target.files[0]
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files?.[0]) {
    uploadedFile.value = e.dataTransfer.files[0]
  }
}

function removeFile() {
  uploadedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function handleSave() {
  alert('Contenido guardado (mock). Redirigiendo a la lista...')
  navigateTo('/admin/contenido')
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

.upload__dropzone:hover {
  border-color: var(--color-muted);
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

.upload__remove:hover {
  background: rgba(220, 38, 38, 0.06);
}

@media (max-width: 768px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
}
</style>
