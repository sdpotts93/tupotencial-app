<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Editar contenido</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.title"
              label="Título"
              placeholder="Escribe el título del contenido"
              required
              :error="errors.title"
            />

            <UiTextarea
              v-model="form.introduction"
              label="Introducción"
              placeholder="Escribe una breve introducción..."
              :rows="3"
              :required="false"
              :error="errors.introduction"
            />

            <UiEditor
              v-if="form.content_type === 'article'"
              v-model="form.body"
              label="Contenido del artículo"
              placeholder="Escribe el contenido del artículo aquí..."
              required
              :error="errors.body"
            />
            <UiTextarea
              v-else
              v-model="form.body"
              label="Texto"
              placeholder="Escribe el contenido aquí..."
              :rows="10"
              required
              :error="errors.body"
            />

            <!-- Vimeo URL for video content -->
            <UiInput
              v-if="form.content_type === 'video'"
              v-model="form.vimeo_url"
              label="URL de Vimeo"
              placeholder="https://vimeo.com/123456789"
              hint="Sube el video a Vimeo y pega la URL aquí"
              required
              :error="errors.vimeo_url"
            />

            <!-- File upload for audio -->
            <div v-else-if="form.content_type === 'audio'" class="upload">
              <label class="upload__label">{{ uploadLabel }}<span class="upload__required">*</span></label>
              <p v-if="errors.audio_file" class="upload__error">{{ errors.audio_file }}</p>
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
                <template v-if="!uploadedFile && !form.existing_media">
                  <div class="upload__icon">
                    <svg v-if="form.content_type === 'audio'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                    </svg>
                    <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p class="upload__text">Arrastra tu archivo aquí o <span class="upload__link">selecciona</span></p>
                  <p class="upload__hint">{{ acceptHint }}</p>
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
          </div>
        </UiCard>

        <!-- Cover image upload -->
        <UiCard variant="outlined">
          <div class="form-section">
            <div class="upload">
              <label class="upload__label">Imagen de portada</label>
              <div
                class="upload__dropzone"
                :class="{ 'upload__dropzone--active': isCoverDragging }"
                @dragover.prevent="isCoverDragging = true"
                @dragleave="isCoverDragging = false"
                @drop.prevent="handleCoverDrop"
                @click="triggerCoverInput"
              >
                <input
                  ref="coverInput"
                  type="file"
                  accept="image/*"
                  class="upload__input"
                  @change="handleCoverChange"
                />
                <template v-if="!coverFile && !form.thumbnail_url">
                  <div class="upload__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p class="upload__text">Arrastra tu imagen aquí o <span class="upload__link">selecciona</span></p>
                  <p class="upload__hint">JPG, PNG, WebP — max 10 MB</p>
                </template>
                <template v-else-if="coverFile">
                  <div class="upload__preview">
                    <img :src="coverPreview" alt="" class="upload__img-preview" />
                    <p class="upload__filename">{{ coverFile.name }}</p>
                    <p class="upload__filesize">{{ formatFileSize(coverFile.size) }}</p>
                    <button class="upload__remove" @click.stop="removeCover">Eliminar</button>
                  </div>
                </template>
                <template v-else>
                  <div class="upload__preview">
                    <img :src="form.thumbnail_url" alt="" class="upload__img-preview" />
                    <p class="upload__filename">{{ form.thumbnail_url }}</p>
                    <button class="upload__remove" @click.stop="form.thumbnail_url = ''">Eliminar</button>
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

            <div class="multi-select">
              <label class="multi-select__label">Categorías</label>
              <div ref="catContainerRef" class="multi-select__wrapper">
                <button type="button" class="multi-select__trigger" :class="{ 'multi-select__trigger--open': catDropdownOpen }" @click="catDropdownOpen = !catDropdownOpen">
                  <span :class="['multi-select__value', { 'multi-select__value--placeholder': !form.category_ids.length }]">
                    {{ form.category_ids.length ? `${form.category_ids.length} seleccionada${form.category_ids.length > 1 ? 's' : ''}` : 'Selecciona categorías' }}
                  </span>
                  <svg class="multi-select__chevron" :class="{ 'multi-select__chevron--open': catDropdownOpen }" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <div v-if="catDropdownOpen" class="multi-select__dropdown">
                  <label v-for="opt in categoryOptions" :key="opt.value" class="multi-select__option">
                    <input type="checkbox" :value="opt.value" v-model="form.category_ids" class="multi-select__checkbox" />
                    <span>{{ opt.label }}</span>
                  </label>
                </div>
              </div>
              <div v-if="form.category_ids.length" class="multi-select__pills">
                <span v-for="cid in form.category_ids" :key="cid" class="multi-select__pill">
                  {{ categoryOptions.find(o => o.value === cid)?.label }}
                  <button type="button" class="multi-select__pill-remove" @click="form.category_ids = form.category_ids.filter(id => id !== cid)">&times;</button>
                </span>
              </div>
            </div>

            <div class="multi-select">
              <label class="multi-select__label">Objetivos</label>
              <div ref="objContainerRef" class="multi-select__wrapper">
                <button type="button" class="multi-select__trigger" :class="{ 'multi-select__trigger--open': objDropdownOpen }" @click="objDropdownOpen = !objDropdownOpen">
                  <span :class="['multi-select__value', { 'multi-select__value--placeholder': !form.objective_ids.length }]">
                    {{ form.objective_ids.length ? `${form.objective_ids.length} seleccionado${form.objective_ids.length > 1 ? 's' : ''}` : 'Selecciona objetivos' }}
                  </span>
                  <svg class="multi-select__chevron" :class="{ 'multi-select__chevron--open': objDropdownOpen }" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <div v-if="objDropdownOpen" class="multi-select__dropdown">
                  <label v-for="opt in objectiveOptions" :key="opt.value" class="multi-select__option">
                    <input type="checkbox" :value="opt.value" v-model="form.objective_ids" class="multi-select__checkbox" />
                    <span>{{ opt.label }}</span>
                  </label>
                </div>
              </div>
              <div v-if="form.objective_ids.length" class="multi-select__pills">
                <span v-for="oid in form.objective_ids" :key="oid" class="multi-select__pill">
                  {{ objectiveOptions.find(o => o.value === oid)?.label }}
                  <button type="button" class="multi-select__pill-remove" @click="form.objective_ids = form.objective_ids.filter(id => id !== oid)">&times;</button>
                </span>
              </div>
            </div>

            <UiInput
              v-model="form.duration"
              label="Duración (segundos)"
              placeholder="Ej: 480"
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
              placeholder="Sin restricción"
            />

            <UiSelect
              v-model="form.status"
              label="Estado"
              :options="statusOptions"
              placeholder="Selecciona el estado"
            />

            <UiDatePicker
              v-if="form.status === 'scheduled'"
              v-model="form.scheduled_at"
              label="Fecha de publicación programada"
              :enable-time="true"
              placeholder="Selecciona fecha y hora"
              required
              :error="errors.scheduled_at"
            />

            <UiDatePicker
              v-model="form.unpublished_at"
              label="Despublicar automáticamente (opcional)"
              :enable-time="true"
              placeholder="Selecciona fecha y hora"
              hint="Fecha en que el contenido se archivará automáticamente"
            />
          </div>
        </UiCard>
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="danger-ghost" size="sm" :loading="deleting" @click="handleDelete">Eliminar</UiButton>
      <UiButton variant="soft" size="sm" to="/admin/contenido">Cancelar</UiButton>
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

const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)
const isDragging = ref(false)
const coverInput = ref<HTMLInputElement | null>(null)
const coverFile = ref<File | null>(null)
const coverPreview = ref('')
const isCoverDragging = ref(false)
const saving = ref(false)
const deleting = ref(false)
const catDropdownOpen = ref(false)
const catContainerRef = ref<HTMLElement>()
const objDropdownOpen = ref(false)
const objContainerRef = ref<HTMLElement>()
const formError = ref('')
const errors = reactive({ title: '', introduction: '', body: '', vimeo_url: '', audio_file: '', scheduled_at: '' })

// ── Fetch existing content item + junction category ──
const { data: contentItem } = await useAsyncData(`content-${id}`, async () => {
  if (isNew) return null
  const { data } = await client.from('content_items').select('*').eq('id', id).single()
  return data
})

const { data: itemCategories } = await useAsyncData(`content-categories-${id}`, async () => {
  if (isNew) return []
  const { data } = await client.from('content_item_categories').select('category_id').eq('content_item_id', id)
  return (data ?? []).map(d => d.category_id)
})

const { data: itemObjectives } = await useAsyncData(`content-objectives-${id}`, async () => {
  if (isNew) return []
  const { data } = await client.from('content_item_objectives').select('objective_id').eq('content_item_id', id)
  return (data ?? []).map(d => d.objective_id)
})

// ── Fetch categories & objectives for dropdowns ──
const { data: categories } = await useAsyncData('content-categories', async () => {
  const { data } = await client.from('content_categories').select('id, title').order('sort_order')
  return data ?? []
})

const { data: objectives } = await useAsyncData('content-objectives', async () => {
  const { data } = await client.from('content_objectives').select('id, title').order('position')
  return data ?? []
})

const form = reactive({
  title: contentItem.value?.title ?? '',
  introduction: contentItem.value?.subtitle ?? '',
  body: contentItem.value?.type === 'article'
    ? (contentItem.value?.body ?? '')
    : (contentItem.value?.description ?? ''),
  content_type: contentItem.value?.type ?? 'video',
  category_ids: itemCategories.value ?? [] as string[],
  objective_ids: itemObjectives.value ?? [] as string[],
  duration: contentItem.value?.duration_seconds ? `${contentItem.value.duration_seconds}` : '',
  segment: contentItem.value?.plan ?? 'free',
  entitlement_key: contentItem.value?.entitlement_key ?? '',
  status: contentItem.value?.status ?? 'draft',
  scheduled_at: contentItem.value?.available_from ? new Date(contentItem.value.available_from) : null as Date | null,
  unpublished_at: contentItem.value?.available_to ? new Date(contentItem.value.available_to) : null as Date | null,
  vimeo_url: contentItem.value?.vimeo_id ?? '',
  existing_media: contentItem.value?.type !== 'video' ? (contentItem.value?.media_url ?? '') : '',
  thumbnail_url: contentItem.value?.thumbnail_url ?? '',
})

const typeOptions = [
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'article', label: 'Artículo' },
]

const segmentOptions = [
  { value: 'free', label: 'Gratuito' },
  { value: 'core', label: 'Core' },
]

// Close dropdowns on click outside
if (import.meta.client) {
  document.addEventListener('mousedown', (e: MouseEvent) => {
    if (catDropdownOpen.value && catContainerRef.value && !catContainerRef.value.contains(e.target as Node)) {
      catDropdownOpen.value = false
    }
    if (objDropdownOpen.value && objContainerRef.value && !objContainerRef.value.contains(e.target as Node)) {
      objDropdownOpen.value = false
    }
  })
}

const entitlementOptions = [
  { value: '', label: 'Sin restricción (abierto)' },
  { value: 'vip', label: 'VIP' },
  { value: 'mentoria_grupal', label: 'Mentoría grupal' },
  { value: 'bootcamp_liderazgo', label: 'Bootcamp: Liderazgo' },
  { value: 'coaching_1on1', label: 'Coaching 1:1' },
  { value: 'retiro_marzo_2026', label: 'Retiro marzo 2026' },
]

const categoryOptions = computed(() =>
  (categories.value ?? []).map(c => ({ value: c.id, label: c.title })),
)

const objectiveOptions = computed(() =>
  (objectives.value ?? []).map(o => ({ value: o.id, label: o.title })),
)

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'scheduled', label: 'Programado' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

const uploadLabel = computed(() => {
  const labels: Record<string, string> = {
    audio: 'Subir audio',
    article: 'Imagen del artículo',
  }
  return labels[form.content_type] || 'Subir archivo'
})

const acceptType = computed(() => {
  const types: Record<string, string> = {
    audio: '.mp3',
    article: 'image/*',
  }
  return types[form.content_type] || '*/*'
})

const acceptHint = computed(() => {
  const hints: Record<string, string> = {
    audio: 'MP3 — max 50 MB',
    article: 'JPG, PNG, WebP — max 10 MB',
  }
  return hints[form.content_type] || ''
})

// Reset file / vimeo URL when content type changes
watch(() => form.content_type, () => {
  uploadedFile.value = null
  form.existing_media = ''
  form.vimeo_url = ''
  if (fileInput.value) fileInput.value.value = ''
})

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

function extractVimeoId(input: string): string | null {
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) return trimmed
  const match = trimmed.match(/vimeo\.com\/(?:video\/|manage\/videos\/|event\/)?(\d+)/)
  return match?.[1] ?? null
}

function removeExistingMedia() {
  form.existing_media = ''
}

// ── Cover image upload ──
function triggerCoverInput() {
  coverInput.value?.click()
}

function setCoverFile(file: File) {
  coverFile.value = file
  coverPreview.value = URL.createObjectURL(file)
  form.thumbnail_url = ''
}

function handleCoverChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) setCoverFile(target.files[0])
}

function handleCoverDrop(e: DragEvent) {
  isCoverDragging.value = false
  if (e.dataTransfer?.files?.[0]) setCoverFile(e.dataTransfer.files[0])
}

function removeCover() {
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value)
  coverFile.value = null
  coverPreview.value = ''
  if (coverInput.value) coverInput.value.value = ''
}

async function uploadCover(file: File, contentId: string): Promise<string> {
  const path = `${contentId}/${Date.now()}-${file.name}`
  const { error } = await client.storage.from('content-covers').upload(path, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = client.storage.from('content-covers').getPublicUrl(path)
  return urlData.publicUrl
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function parseDuration(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const match = trimmed.match(/^(\d+)\s*(.*)?$/)
  if (!match) return null
  const num = parseInt(match[1], 10)
  const unit = (match[2] || '').trim().toLowerCase()
  if (['m', 'min', 'mins', 'minuto', 'minutos'].includes(unit)) return num * 60
  // default to seconds for: s, seg, segundo, segundos, or no unit
  return num
}

async function uploadFile(file: File, contentId: string): Promise<string> {
  const path = `${contentId}/${Date.now()}-${file.name}`
  const { error } = await client.storage.from('content-media').upload(path, file, { upsert: true })
  if (error) throw error
  return path
}

async function handleSave() {
  saving.value = true
  formError.value = ''
  errors.title = ''
  errors.introduction = ''
  errors.body = ''
  errors.vimeo_url = ''
  errors.audio_file = ''
  errors.scheduled_at = ''

  let hasError = false
  if (!form.title.trim()) { errors.title = 'El título es obligatorio'; hasError = true }
  if (form.content_type === 'article' && !form.body.trim()) { errors.body = 'El contenido del artículo es obligatorio'; hasError = true }
  if (form.content_type !== 'article' && !form.body.trim()) { errors.body = 'El texto es obligatorio'; hasError = true }
  if (form.content_type === 'video' && !extractVimeoId(form.vimeo_url)) { errors.vimeo_url = 'La URL de Vimeo es obligatoria'; hasError = true }
  if (form.content_type === 'audio' && !uploadedFile.value && !form.existing_media) { errors.audio_file = 'El archivo de audio es obligatorio'; hasError = true }
  if (form.status === 'scheduled' && !form.scheduled_at) { errors.scheduled_at = 'La fecha programada es obligatoria'; hasError = true }
  if (hasError) { saving.value = false; return }

  try {
    // Upload files if selected
    let mediaUrl = form.existing_media || null
    const targetId = isNew ? crypto.randomUUID() : id
    if (uploadedFile.value) {
      mediaUrl = await uploadFile(uploadedFile.value, targetId)
    }
    let thumbnailUrl = form.thumbnail_url || null
    if (coverFile.value) {
      thumbnailUrl = await uploadCover(coverFile.value, targetId)
    }

    const payload = {
      title: form.title,
      subtitle: form.introduction || null,
      description: form.content_type !== 'article' ? (form.body || null) : null,
      body: form.content_type === 'article' ? (form.body || null) : null,
      type: form.content_type,
      vimeo_id: form.content_type === 'video' ? extractVimeoId(form.vimeo_url) : null,
      media_url: form.content_type === 'audio' ? mediaUrl : null,
      plan: form.segment,
      status: form.status,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
      entitlement_key: form.entitlement_key || null,
      objective_id: form.objective_ids.length ? form.objective_ids[0] : null,
      available_from: form.scheduled_at ? form.scheduled_at.toISOString() : null,
      available_to: form.unpublished_at ? form.unpublished_at.toISOString() : null,
      duration_seconds: parseDuration(form.duration),
      thumbnail_url: thumbnailUrl,
    }

    if (isNew) {
      const { data: inserted } = await client.from('content_items').insert({ ...payload, type: form.content_type }).select('id').single()
      if (inserted) {
        if (form.category_ids.length) {
          await client.from('content_item_categories').insert(
            form.category_ids.map(cid => ({ content_item_id: inserted.id, category_id: cid })),
          )
        }
        if (form.objective_ids.length) {
          await client.from('content_item_objectives').insert(
            form.objective_ids.map(oid => ({ content_item_id: inserted.id, objective_id: oid })),
          )
        }
      }
    } else {
      await client.from('content_items').update(payload).eq('id', id)
      // Update junction categories
      await client.from('content_item_categories').delete().eq('content_item_id', id)
      if (form.category_ids.length) {
        await client.from('content_item_categories').insert(
          form.category_ids.map(cid => ({ content_item_id: id, category_id: cid })),
        )
      }
      // Update junction objectives
      await client.from('content_item_objectives').delete().eq('content_item_id', id)
      if (form.objective_ids.length) {
        await client.from('content_item_objectives').insert(
          form.objective_ids.map(oid => ({ content_item_id: id, objective_id: oid })),
        )
      }
    }
    navigateTo('/admin/contenido')
  } catch {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

function handleDuplicate() {
  navigateTo('/admin/contenido/new')
}

const confirm = useConfirm()

async function handleDelete() {
  if (await confirm({ message: '¿Seguro que deseas eliminar este contenido?' })) {
    deleting.value = true
    try {
      await client.from('content_item_categories').delete().eq('content_item_id', id)
      await client.from('content_item_objectives').delete().eq('content_item_id', id)
      await client.from('content_items').delete().eq('id', id)
      navigateTo('/admin/contenido')
    } catch {
      toast.show('Error al eliminar', 'error')
    } finally {
      deleting.value = false
    }
  }
}
</script>

<style scoped>
/* ── Multi-select categories ── */
.multi-select { display: flex; flex-direction: column; gap: var(--space-1); }
.multi-select__label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text); }
.multi-select__wrapper { position: relative; }
.multi-select__trigger {
  appearance: none; display: flex; align-items: center; justify-content: space-between;
  width: 100%; background: var(--color-input-bg); border: 1.5px solid transparent;
  box-shadow: 0px 0px 2px var(--color-input-shadow); border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4); font-family: var(--font-body); font-size: var(--text-md);
  color: var(--color-text); cursor: pointer; text-align: left;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.multi-select__trigger:focus,
.multi-select__trigger--open { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-input-focus-ring); outline: none; }
.multi-select__value { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.multi-select__value--placeholder { color: var(--color-placeholder); }
.multi-select__chevron { flex-shrink: 0; color: var(--color-muted); transition: transform var(--transition-fast); }
.multi-select__chevron--open { transform: rotate(180deg); }
.multi-select__dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 100;
  background: var(--color-input-bg); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  max-height: 256px; overflow-y: auto; padding: var(--space-1) 0;
}
.multi-select__option {
  display: flex; align-items: center; gap: var(--space-2);
  padding: 10px var(--space-3); cursor: pointer; font-size: var(--text-md);
  transition: background var(--transition-fast);
}
.multi-select__option:hover { background: #f3f4f6; }
.multi-select__checkbox { accent-color: var(--color-primary); }
.multi-select__pills { display: flex; flex-wrap: wrap; gap: var(--space-1); margin-top: var(--space-1); }
.multi-select__pill {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--color-primary-light, #e0e7ff); color: var(--color-primary);
  font-size: var(--text-xs); font-weight: var(--weight-medium);
  padding: 2px 8px; border-radius: var(--radius-full);
}
.multi-select__pill-remove {
  background: none; border: none; color: inherit; cursor: pointer;
  font-size: 14px; line-height: 1; padding: 0; opacity: 0.7;
}
.multi-select__pill-remove:hover { opacity: 1; }

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

.upload__required {
  color: var(--color-danger);
  margin-left: 2px;
}

.upload__error {
  font-size: var(--text-xs);
  color: var(--color-danger);
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

@media (hover: hover) {
  .upload__dropzone:hover {
    border-color: var(--color-muted);
  }
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
  .upload__remove:hover {
    background: rgba(220, 38, 38, 0.06);
  }
}

@media (max-width: 768px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
}

.form-error {
  width: 100%;
  font-size: var(--text-sm);
  color: var(--color-danger);
  text-align: center;
  order: -1;
}
</style>
