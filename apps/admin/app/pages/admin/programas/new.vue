<template>
  <div class="page-fill">
    <div class="page-header">
      <h1 class="page-header__title">Nuevo programa</h1>
    </div>

    <UiTabs v-model="activeTab" :tabs="tabs" />

    <!-- Tab 1: Información -->
    <div v-if="activeTab === 'info'" class="tab-content">
      <div class="form-layout">
        <div class="form-layout__main">
          <UiCard variant="outlined">
            <div class="form-section">
              <UiInput
                v-model="form.title"
                label="Título del programa"
                placeholder="Escribe el título del programa"
              />

              <UiTextarea
                v-model="form.description"
                label="Descripción"
                placeholder="Describe el programa..."
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
                  <template v-if="!uploadedFile">
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
                      <p class="upload__filename">{{ uploadedFile.name }}</p>
                      <p class="upload__filesize">{{ formatFileSize(uploadedFile.size) }}</p>
                      <button class="upload__remove" @click.stop="removeFile">Eliminar</button>
                    </div>
                  </template>
                </div>
              </div>

              <UiSelect
                v-model="form.program_type"
                label="Tipo de programa"
                :options="typeOptions"
                placeholder="Selecciona el tipo"
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
                placeholder="Selecciona el plan"
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
        </div>
      </div>

    </div>

    <!-- Tab 2: Días del programa -->
    <div v-if="activeTab === 'days'" class="tab-content">
      <div class="days-header">
        <h2 class="days-header__title">Días del programa</h2>
      </div>

      <div v-if="programDays.length === 0" class="days-empty">
        <p>No hay días configurados. Agrega el primer día del programa.</p>
      </div>

      <div class="days-list">
        <UiCard v-for="(day, dayIndex) in programDays" :key="dayIndex" variant="outlined">
          <div class="form-section">
            <div class="day-card__header">
              <span class="day-card__number eyebrow">Día {{ dayIndex + 1 }}</span>
              <UiButton variant="danger-ghost" size="sm" @click="removeDay(dayIndex)">Quitar</UiButton>
            </div>

            <div class="day-card__fields">
              <UiInput v-model="day.title" label="Título del día" placeholder="Ej: Introducción a la meditación" />
              <UiTextarea v-model="day.description" label="Descripción" placeholder="Describe las actividades del día..." :rows="2" />
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
                  <p v-if="activity.type === 'contenido' && contentConflictLabel(activity.content_id)" class="activity-item__warning">
                    Este contenido requiere el complemento "{{ contentConflictLabel(activity.content_id) }}" pero el programa no tiene restricción.
                  </p>
                  <UiSelect
                    v-if="activity.type === 'formulario'"
                    v-model="activity.form_id"
                    label="Formulario"
                    :options="formOptions"
                    placeholder="Selecciona formulario"
                  />
                </div>
              </div>

              <UiButton variant="outline" size="sm" @click="addActivity(dayIndex)">+ Agregar actividad</UiButton>
            </div>
          </div>
        </UiCard>
      </div>

      <UiButton variant="primary-outline" size="sm" @click="addDay" style="align-self: flex-start; margin-top: var(--space-3);">+ Agregar día</UiButton>
    </div>

    <div class="page-actions">
      <UiButton variant="soft" size="sm" to="/admin/programas">Cancelar</UiButton>
      <UiButton v-if="activeTab === 'days'" variant="soft" size="sm" @click="activeTab = 'info'">Atrás</UiButton>
      <UiButton v-if="activeTab === 'info'" variant="primary-outline" size="sm" @click="activeTab = 'days'">Siguiente</UiButton>
      <UiButton v-if="activeTab === 'days'" variant="primary-outline" size="sm" @click="handleSave">Guardar</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()

const activeTab = ref('info')

const tabs = [
  { value: 'info', label: '1. Información' },
  { value: 'days', label: '2. Días del programa' },
]

// ── Image upload ──
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)
const isDragging = ref(false)

// ── Fetch content items and forms for dropdowns ──
const { data: contentItemsList } = await useAsyncData('program-content-items', async () => {
  const { data } = await client.from('content_items').select('id, title, entitlement_key').order('title')
  return data ?? []
})

const { data: formsList } = await useAsyncData('program-forms', async () => {
  const { data } = await client.from('forms').select('id, title').order('title')
  return data ?? []
})

// ── Map UI type to DB type ──
const uiTypeToDb: Record<string, string> = { contenido: 'content', formulario: 'form', talk_to_ai: 'ai_prompt' }

// ── Form state ──
const form = reactive({
  title: '',
  description: '',
  program_type: 'program',
  plan: 'free',
  entitlement_key: '',
  status: 'draft',
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
  { value: 'archived', label: 'Archivado' },
]

const activityTypeOptions = [
  { value: 'talk_to_ai', label: 'Habla con tu Coach IA' },
  { value: 'contenido', label: 'Contenido' },
  { value: 'formulario', label: 'Formulario' },
]

const formOptions = computed(() =>
  (formsList.value ?? []).map(f => ({ value: f.id, label: f.title })),
)

const contentOptions = computed(() =>
  (contentItemsList.value ?? []).map(c => ({ value: c.id, label: c.title })),
)

// Content entitlement map built from real data
const contentEntitlementMap = computed(() => {
  const map: Record<string, string> = {}
  for (const c of contentItemsList.value ?? []) {
    if (c.entitlement_key) map[c.id] = c.entitlement_key
  }
  return map
})

const entitlementLabels: Record<string, string> = {
  vip: 'VIP',
  mentoria_grupal: 'Mentoría grupal',
  bootcamp_liderazgo: 'Bootcamp: Liderazgo',
  coaching_1on1: 'Coaching 1:1',
  retiro_marzo_2026: 'Retiro marzo 2026',
}

function contentConflictLabel(contentId: string): string | null {
  if (form.entitlement_key) return null
  const key = contentEntitlementMap.value[contentId]
  if (!key) return null
  return entitlementLabels[key] ?? key
}

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

const programDays = ref<ProgramDay[]>([])

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
  programDays.value[dayIndex]?.activities.push({
    type: 'contenido',
    content_id: '',
    form_id: '',
  })
}

function removeActivity(dayIndex: number, actIndex: number) {
  programDays.value[dayIndex]?.activities.splice(actIndex, 1)
}

// ── Upload functions ──
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

async function handleSave() {
  if (!form.entitlement_key) {
    const hasConflict = programDays.value.some(day =>
      day.activities.some(a => a.type === 'contenido' && contentEntitlementMap.value[a.content_id]),
    )
    if (hasConflict) {
      alert('No se puede guardar: hay contenido que requiere un complemento pero el programa no tiene restricción. Asigna un complemento al programa o cambia el contenido.')
      return
    }
  }

  const programPayload = {
    title: form.title,
    description: form.description || null,
    type: form.program_type,
    plan: form.plan,
    entitlement_key: form.entitlement_key || null,
    status: form.status,
  }

  const { data: inserted } = await client.from('programs').insert(programPayload).select('id').single()
  if (!inserted) return

  // Insert days + items
  for (let i = 0; i < programDays.value.length; i++) {
    const day = programDays.value[i]!
    const { data: insertedDay } = await client
      .from('program_days')
      .insert({
        program_id: inserted.id,
        day_index: i,
        title: day.title || null,
        description: day.description || null,
      })
      .select('id')
      .single()

    if (insertedDay && day.activities.length) {
      const items = day.activities.map((a, pos) => ({
        program_day_id: insertedDay.id,
        type: uiTypeToDb[a.type] ?? a.type,
        content_item_id: a.type === 'contenido' && a.content_id ? a.content_id : null,
        form_id: a.type === 'formulario' && a.form_id ? a.form_id : null,
        position: pos,
      }))
      await client.from('program_day_items').insert(items)
    }
  }

  navigateTo('/admin/programas')
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

.activity-item__warning {
  font-size: var(--text-xs);
  color: var(--color-danger, #dc2626);
  margin-top: var(--space-2);
  line-height: var(--leading-normal);
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
}
</style>
