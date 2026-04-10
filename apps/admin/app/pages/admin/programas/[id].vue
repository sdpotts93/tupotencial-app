<template>
  <div class="page-fill">
    <div class="page-header">
      <h1 class="page-header__title">Editar programa</h1>
    </div>

    <!-- Skeleton -->
    <template v-if="!isNew && dataStatus === 'pending'">
      <UiSkeleton variant="rect" width="240px" height="36px" radius="var(--radius-lg)" style="margin-bottom: var(--space-6);" />
      <div class="form-layout">
        <div class="form-layout__main">
          <UiCard variant="outlined">
            <div class="form-section">
              <UiSkeleton variant="text" width="120px" height="12px" style="margin-bottom: var(--space-1);" />
              <UiSkeleton variant="rect" width="100%" height="40px" radius="var(--radius-lg)" />
              <UiSkeleton variant="text" width="70px" height="12px" style="margin-top: var(--space-4); margin-bottom: var(--space-1);" />
              <UiSkeleton variant="rect" width="100%" height="100px" radius="var(--radius-lg)" />
              <UiSkeleton variant="text" width="100px" height="12px" style="margin-top: var(--space-4); margin-bottom: var(--space-1);" />
              <UiSkeleton variant="rect" width="100%" height="120px" radius="var(--radius-lg)" />
            </div>
          </UiCard>
        </div>
        <div class="form-layout__sidebar">
          <UiCard variant="outlined">
            <div class="form-section">
              <UiSkeleton variant="text" width="30px" height="12px" style="margin-bottom: var(--space-1);" />
              <UiSkeleton variant="rect" width="100%" height="40px" radius="var(--radius-lg)" />
              <UiSkeleton variant="text" width="100px" height="12px" style="margin-top: var(--space-4); margin-bottom: var(--space-1);" />
              <UiSkeleton variant="rect" width="100%" height="40px" radius="var(--radius-lg)" />
              <UiSkeleton variant="text" width="40px" height="12px" style="margin-top: var(--space-4); margin-bottom: var(--space-1);" />
              <UiSkeleton variant="rect" width="100%" height="40px" radius="var(--radius-lg)" />
            </div>
          </UiCard>
        </div>
      </div>
    </template>

    <template v-else>
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
                  required
                  :error="errors.title"
                />

                <UiTextarea
                  v-model="form.description"
                  label="Descripción"
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
                      <p class="upload__text">Arrastra tu imagen aquí o <span class="upload__link">selecciona</span></p>
                      <p class="upload__hint">JPG, PNG, WebP — max 10 MB</p>
                    </template>
                    <template v-else-if="uploadedFile">
                      <div class="upload__preview">
                        <img :src="coverPreview" alt="" class="upload__img-preview" />
                        <p class="upload__filename">{{ uploadedFile.name }}</p>
                        <p class="upload__filesize">{{ formatFileSize(uploadedFile.size) }}</p>
                        <button class="upload__remove" @click.stop="removeFile">Eliminar</button>
                      </div>
                    </template>
                    <template v-else>
                      <div class="upload__preview">
                        <img :src="form.existing_media" alt="" class="upload__img-preview" />
                        <p class="upload__filename">{{ form.existing_media }}</p>
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
            <!-- <UiCard variant="filled">
              <div class="form-section">
                <p class="meta-label">Inscritos: 3,420</p>
                <p class="meta-label">Completados: 1,847</p>
                <p class="meta-label">Tasa de finalización: 54%</p>
              </div>
            </UiCard> -->
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
        <UiButton variant="danger-ghost" size="sm" :loading="deleting" @click="handleDelete">Eliminar</UiButton>
        <UiButton variant="soft" size="sm" to="/admin/programas">Cancelar</UiButton>
        <UiButton v-if="activeTab === 'info'" variant="soft" size="sm" @click="activeTab = 'days'">Siguiente</UiButton>
        <UiButton v-if="activeTab === 'days'" variant="soft" size="sm" @click="activeTab = 'info'">Atrás</UiButton>
        <UiButton variant="primary-outline" size="sm" :loading="saving" @click="handleSave">Guardar cambios</UiButton>
        <p v-if="formError" class="form-error">{{ formError }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const client = useSupabaseClient()
const toast = useToast()
const id = route.params.id as string
const isNew = id === 'new'
const activeTab = ref('info')
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')
const errors = reactive({ title: '' })

const tabs = [
  { value: 'info', label: '1. Información' },
  { value: 'days', label: '2. Días del programa' },
]

// ── Image upload ──
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)
const coverPreview = ref('')
const isDragging = ref(false)

// ── Fetch existing program ──
const { data: program, status: dataStatus } = useAsyncData(`program-${id}`, async () => {
  if (isNew) return null
  const { data } = await client.from('programs').select('*').eq('id', id).single()
  return data
}, { lazy: true })

// ── Fetch program days with items ──
const { data: dbDays } = useAsyncData(`program-days-${id}`, async () => {
  if (isNew) return []
  const { data } = await client
    .from('program_days')
    .select('id, day_index, title, description, program_day_items ( id, type, content_item_id, form_id, position )')
    .eq('program_id', id)
    .order('day_index')
  return data ?? []
}, { lazy: true })

// ── Fetch content items and forms for dropdowns ──
const { data: contentItemsList } = useAsyncData('program-content-items', async () => {
  const { data } = await client.from('content_items').select('id, title, entitlement_key').eq('status', 'published').order('title')
  return data ?? []
}, { lazy: true })

const { data: formsList } = useAsyncData('program-forms', async () => {
  const { data } = await client.from('forms').select('id, title').eq('status', 'active').order('title')
  return data ?? []
}, { lazy: true })

const { entitlementOptions, entitlementLabels } = useAdminEntitlements()

// ── Map DB item type to UI type ──
const dbTypeToUi: Record<string, string> = { content: 'contenido', form: 'formulario', ai_prompt: 'talk_to_ai' }
const uiTypeToDb: Record<string, string> = { contenido: 'content', formulario: 'form', talk_to_ai: 'ai_prompt' }

// ── Form state ──
const form = reactive({
  title: '',
  description: '',
  program_type: 'program',
  plan: 'free',
  entitlement_key: '',
  status: 'draft',
  existing_media: '',
})

watch(program, (val) => {
  if (val) {
    form.title = val.title ?? ''
    form.description = val.description ?? ''
    form.program_type = val.type ?? 'program'
    form.plan = val.plan ?? 'free'
    form.entitlement_key = val.entitlement_key ?? ''
    form.status = val.status ?? 'draft'
    form.existing_media = val.cover_url ?? ''
  }
}, { immediate: true })

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

function contentConflictLabel(contentId: string): string | null {
  if (form.entitlement_key) return null
  const key = contentEntitlementMap.value[contentId]
  if (!key) return null
  return entitlementLabels.value[key] ?? key
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

// Convert DB days to local structure
function buildLocalDays(): ProgramDay[] {
  return (dbDays.value ?? []).map((day: any) => {
    const items = Array.isArray(day.program_day_items)
      ? [...day.program_day_items].sort((a: any, b: any) => a.position - b.position)
      : []
    return {
      title: day.title ?? '',
      description: day.description ?? '',
      activities: items.map((item: any) => ({
        type: dbTypeToUi[item.type] ?? item.type,
        content_id: item.content_item_id ?? '',
        form_id: item.form_id ?? '',
      })),
    }
  })
}

const programDays = ref<ProgramDay[]>([])

watch(dbDays, () => {
  if (!isNew && dbDays.value?.length) {
    programDays.value = buildLocalDays()
  }
}, { immediate: true })

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

function setCoverFile(file: File) {
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value)
  uploadedFile.value = file
  coverPreview.value = URL.createObjectURL(file)
  form.existing_media = ''
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) setCoverFile(target.files[0])
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files?.[0]) setCoverFile(e.dataTransfer.files[0])
}

function removeFile() {
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value)
  uploadedFile.value = null
  coverPreview.value = ''
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

async function uploadCover(file: File, programId: string): Promise<string> {
  const path = `${programId}/${Date.now()}-${file.name}`
  const { error } = await client.storage.from('content-covers').upload(path, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = client.storage.from('content-covers').getPublicUrl(path)
  return urlData.publicUrl
}

async function handleSave() {
  formError.value = ''
  errors.title = ''

  if (!form.title.trim()) { errors.title = 'El título es obligatorio'; return }

  if (!form.entitlement_key) {
    const hasConflict = programDays.value.some(day =>
      day.activities.some(a => a.type === 'contenido' && contentEntitlementMap.value[a.content_id]),
    )
    if (hasConflict) {
      formError.value = 'No se puede guardar: hay contenido que requiere un complemento pero el programa no tiene restricción.'
      toast.show('No se puede guardar: contenido requiere complemento', 'error')
      return
    }
  }

  formError.value = ''
  saving.value = true
  try {
    const targetId = isNew ? crypto.randomUUID() : id
    let coverUrl = form.existing_media || null
    if (uploadedFile.value) {
      coverUrl = await uploadCover(uploadedFile.value, targetId)
    }

    const programPayload = {
      title: form.title,
      description: form.description || null,
      type: form.program_type,
      plan: form.plan,
      entitlement_key: form.entitlement_key || null,
      status: form.status,
      cover_url: coverUrl,
    }

    let programId = id

    if (isNew) {
      const { data: inserted } = await client.from('programs').insert({ ...programPayload, id: targetId }).select('id').single()
      if (!inserted) return
      programId = inserted.id
    } else {
      await client.from('programs').update(programPayload).eq('id', id)
      // Delete existing days and items to replace them
      const existingDayIds = (dbDays.value ?? []).map((d: any) => d.id)
      if (existingDayIds.length) {
        await client.from('program_day_items').delete().in('program_day_id', existingDayIds)
        await client.from('program_days').delete().eq('program_id', id)
      }
    }

    // Insert days + items
    for (let i = 0; i < programDays.value.length; i++) {
      const day = programDays.value[i]!
      const { data: insertedDay } = await client
        .from('program_days')
        .insert({
          program_id: programId,
          day_index: i + 1,
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
  } catch {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

const confirm = useConfirm()

async function handleDelete() {
  if (await confirm({ message: '¿Seguro que deseas eliminar este programa?' })) {
    deleting.value = true
    try {
      const existingDayIds = (dbDays.value ?? []).map((d: any) => d.id)
      if (existingDayIds.length) {
        await client.from('program_day_items').delete().in('program_day_id', existingDayIds)
        await client.from('program_days').delete().eq('program_id', id)
      }
      await client.from('programs').delete().eq('id', id)
      navigateTo('/admin/programas')
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

.upload__img-preview {
  max-width: 100%;
  max-height: 160px;
  border-radius: var(--radius-md);
  object-fit: cover;
  margin-bottom: var(--space-2);
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

.form-error {
  width: 100%;
  font-size: var(--text-sm);
  color: var(--color-danger);
  text-align: center;
  order: -1;
}
</style>
