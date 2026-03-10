<template>
  <div class="page-fill">
    <div class="page-header">
      <h1 class="page-header__title">Editar programa</h1>
    </div>

    <UiTabs v-model="activeTab" :tabs="tabs" />

    <!-- Tab 1: Informacion -->
    <div v-if="activeTab === 'info'" class="tab-content">
      <div class="form-layout">
        <div class="form-layout__main">
          <UiCard variant="outlined">
            <div class="form-section">
              <UiInput
                v-model="form.title"
                label="Titulo del programa"
              />

              <UiTextarea
                v-model="form.description"
                label="Descripcion"
                :rows="4"
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
                  <template v-if="!uploadedFile && !form.existing_media">
                    <div class="upload__icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <p class="upload__text">Arrastra tu imagen aqui o <span class="upload__link">selecciona</span></p>
                    <p class="upload__hint">JPG, PNG, WebP — max 10 MB</p>
                  </template>
                  <template v-else-if="uploadedFile">
                    <div class="upload__preview">
                      <p class="upload__filename">{{ uploadedFile.name }}</p>
                      <p class="upload__filesize">{{ formatFileSize(uploadedFile.size) }}</p>
                      <button class="upload__remove" @click.stop="removeFile">Eliminar</button>
                    </div>
                  </template>
                  <template v-else>
                    <div class="upload__preview">
                      <p class="upload__filename">{{ form.existing_media }}</p>
                      <p class="upload__filesize">Archivo existente</p>
                      <button class="upload__remove" @click.stop="removeExistingMedia">Eliminar</button>
                    </div>
                  </template>
                </div>
              </div>

              <UiSelect
                v-model="form.program_type"
                label="Tipo de programa"
                :options="typeOptions"
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
                v-model="form.status"
                label="Estado"
                :options="statusOptions"
              />
            </div>
          </UiCard>
          <UiCard variant="filled">
            <div class="form-section">
              <p class="meta-label">Inscritos: 3,420</p>
              <p class="meta-label">Completados: 1,847</p>
              <p class="meta-label">Tasa de finalizacion: 54%</p>
            </div>
          </UiCard>
        </div>
      </div>
    </div>

    <!-- Tab 2: Dias del programa -->
    <div v-if="activeTab === 'days'" class="tab-content">
      <div class="days-header">
        <h2 class="days-header__title">Dias del programa</h2>
      </div>

      <div v-if="programDays.length === 0" class="days-empty">
        <p>No hay dias configurados. Agrega el primer dia del programa.</p>
      </div>

      <div class="days-list">
        <UiCard v-for="(day, dayIndex) in programDays" :key="dayIndex" variant="outlined">
          <div class="form-section">
            <div class="day-card__header">
              <span class="day-card__number eyebrow">Dia {{ dayIndex + 1 }}</span>
              <UiButton variant="danger-ghost" size="sm" @click="removeDay(dayIndex)">Quitar</UiButton>
            </div>

            <div class="day-card__fields">
              <UiInput v-model="day.title" label="Titulo del dia" placeholder="Ej: Introduccion a la meditacion" />
              <UiTextarea v-model="day.description" label="Descripcion" placeholder="Describe las actividades del dia..." :rows="2" />
            </div>

            <!-- Activities -->
            <div class="activities">
              <h4 class="activities__title eyebrow">Actividades</h4>

              <div v-for="(activity, actIndex) in day.activities" :key="actIndex" class="activity-item">
                <div class="activity-item__header">
                  <span class="activity-item__label">Actividad {{ actIndex + 1 }}</span>
                  <UiButton variant="danger-ghost" size="sm" @click="removeActivity(dayIndex, actIndex)">Quitar actividad</UiButton>
                </div>
                <div class="activity-item__fields">
                  <UiSelect
                    v-model="activity.type"
                    label="Tipo"
                    :options="activityTypeOptions"
                  />
                  <UiSelect
                    v-if="activity.type === 'contenido'"
                    v-model="activity.content_id"
                    label="Contenido"
                    :options="contentOptions"
                    placeholder="Selecciona contenido"
                  />
                  <UiSelect
                    v-if="activity.type === 'formulario'"
                    v-model="activity.form_id"
                    label="Formulario"
                    :options="[]"
                    placeholder="Proximamente..."
                    disabled
                  />
                </div>
              </div>

              <UiButton variant="outline" size="sm" @click="addActivity(dayIndex)">+ Agregar actividad</UiButton>
            </div>
          </div>
        </UiCard>
      </div>

      <UiButton variant="primary-outline" size="sm" @click="addDay" style="align-self: flex-start; margin-top: var(--space-3);">+ Agregar dia</UiButton>
    </div>

    <div class="page-actions">
      <UiButton variant="danger-ghost" size="sm" @click="handleDelete">Eliminar</UiButton>
      <UiButton variant="soft" size="sm" to="/admin/programas">Cancelar</UiButton>
      <UiButton v-if="activeTab === 'info'" variant="soft" size="sm" @click="activeTab = 'days'">Siguiente</UiButton>
      <UiButton v-if="activeTab === 'days'" variant="soft" size="sm" @click="activeTab = 'info'">Atras</UiButton>
      <UiButton variant="primary-outline" size="sm" @click="handleSave">Guardar cambios</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const activeTab = ref('info')

const tabs = [
  { value: 'info', label: '1. Informacion' },
  { value: 'days', label: '2. Dias del programa' },
]

// ── Image upload ──
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)
const isDragging = ref(false)

// ── Form state (pre-filled) ──
const form = reactive({
  title: 'Reto 21 dias de meditacion',
  description: 'Un reto disenado para construir el habito de la meditacion. Cada dia incluye una sesion guiada, un ejercicio de reflexion y un check-in de progreso.',
  program_type: 'reto',
  plan: 'core',
  status: 'published',
  existing_media: 'meditacion-21-portada.jpg',
})

// ── Options ──
const typeOptions = [
  { value: 'program', label: 'Programa' },
  { value: 'reto', label: 'Reto' },
  { value: 'bootcamp', label: 'Bootcamp' },
]

const planOptions = [
  { value: 'free', label: 'Gratuito' },
  { value: 'core', label: 'Core' },
]

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

const activityTypeOptions = [
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

// ── Day + Activity management ──
interface Activity {
  type: string
  content_id: string
  form_id: string
}

interface ProgramDay {
  title: string
  description: string
  activities: Activity[]
}

const programDays = ref<ProgramDay[]>([
  {
    title: 'Introduccion a la meditacion',
    description: 'Aprende los fundamentos de la practica meditativa y realiza tu primera sesion guiada de 5 minutos.',
    activities: [
      { type: 'contenido', content_id: 'cnt-001', form_id: '' },
      { type: 'contenido', content_id: 'cnt-002', form_id: '' },
      { type: 'talk_to_ai', content_id: '', form_id: '' },
    ],
  },
  {
    title: 'Respiracion consciente',
    description: 'Explora tecnicas de respiracion que te ayudaran a centrar tu atencion y calmar la mente.',
    activities: [
      { type: 'contenido', content_id: 'cnt-007', form_id: '' },
      { type: 'talk_to_ai', content_id: '', form_id: '' },
    ],
  },
  {
    title: 'El escaneo corporal',
    description: 'Practica la tecnica del body scan para conectar con las sensaciones de tu cuerpo.',
    activities: [
      { type: 'contenido', content_id: 'cnt-004', form_id: '' },
      { type: 'talk_to_ai', content_id: '', form_id: '' },
    ],
  },
  {
    title: 'Meditacion caminando',
    description: 'Descubre como meditar en movimiento con una practica guiada de caminata consciente.',
    activities: [
      { type: 'contenido', content_id: 'cnt-003', form_id: '' },
      { type: 'contenido', content_id: 'cnt-006', form_id: '' },
      { type: 'talk_to_ai', content_id: '', form_id: '' },
    ],
  },
  {
    title: 'Manejo de pensamientos',
    description: 'Aprende a observar tus pensamientos sin juzgarlos ni engancharte en ellos.',
    activities: [
      { type: 'contenido', content_id: 'cnt-005', form_id: '' },
      { type: 'talk_to_ai', content_id: '', form_id: '' },
    ],
  },
])

function addDay() {
  programDays.value.push({
    title: '',
    description: '',
    activities: [],
  })
}

function removeDay(index: number) {
  programDays.value.splice(index, 1)
}

function addActivity(dayIndex: number) {
  programDays.value[dayIndex].activities.push({
    type: 'contenido',
    content_id: '',
    form_id: '',
  })
}

function removeActivity(dayIndex: number, actIndex: number) {
  programDays.value[dayIndex].activities.splice(actIndex, 1)
}

// ── Upload functions ──
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    uploadedFile.value = target.files[0]
    form.existing_media = ''
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files?.[0]) {
    uploadedFile.value = e.dataTransfer.files[0]
    form.existing_media = ''
  }
}

function removeFile() {
  uploadedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function removeExistingMedia() {
  form.existing_media = ''
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function handleSave() {
  alert('Programa actualizado (mock)')
}

function handleDelete() {
  if (confirm('Seguro que deseas eliminar este programa?')) {
    alert('Programa eliminado (mock)')
    navigateTo('/admin/programas')
  }
}
</script>

<style scoped>
.page-fill {
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - var(--topbar-height) - var(--space-6) * 2);
}

.tab-content {
  margin-top: var(--space-6);
  flex: 1;
}

.form-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-6);
  align-items: start;
}

.form-layout__main,
.form-layout__sidebar {
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

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
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

/* ─── Days ─── */
.days-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.days-header__title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
}

.days-empty {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--color-muted);
  font-size: var(--text-sm);
}

.days-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.day-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.day-card__number {
  color: var(--color-primary);
}

.day-card__fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

/* ─── Activities ─── */
.activities {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
  margin-top: var(--space-3);
}

.activities__title {
  margin-bottom: var(--space-3);
}

.activity-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6) var(--space-6);
  margin-bottom: var(--space-4);
  background: rgba(var(--tint-rgb), 0.05);
}

.activity-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.activity-item__label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-muted);
}

.activity-item__fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.activity-item__info {
  font-size: var(--text-sm);
  color: var(--color-muted);
  font-style: italic;
  padding: var(--space-2) 0;
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
}
</style>
