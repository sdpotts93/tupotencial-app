<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Editar beneficio</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput v-model="form.title" label="Título del beneficio" required :error="errors.title" />
            <UiTextarea v-model="form.description" label="Descripción" :rows="4" />

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
                <template v-if="!coverFile && !form.cover_url">
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
                    <p class="upload__filename">{{ coverFile.name }}</p>
                    <p class="upload__filesize">{{ formatFileSize(coverFile.size) }}</p>
                    <button class="upload__remove" @click.stop="removeCover">Eliminar</button>
                  </div>
                </template>
                <template v-else>
                  <div class="upload__preview">
                    <p class="upload__filename">Imagen actual</p>
                    <p class="upload__filesize">{{ form.cover_url }}</p>
                    <button class="upload__remove" @click.stop="removeCover">Eliminar</button>
                  </div>
                </template>
              </div>
            </div>

            <UiInput v-model="form.url" label="URL" required :error="errors.url" />

            <UiInput
              v-model="form.utm_template"
              label="Plantilla UTM"
              placeholder="?utm_source=tupotencial&utm_medium=benefit&utm_campaign=..."
              hint="Parámetros UTM que se agregan a la URL"
            />

            <UiInput v-model="form.code" label="Código promocional" />
          </div>
        </UiCard>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiSelect v-model="form.plan" label="Plan" :options="planOptions" />
            <UiSelect v-model="form.status" label="Estado" :options="statusOptions" />
          </div>
        </UiCard>
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="danger-ghost" size="sm" :loading="deleting" @click="handleDelete">Eliminar</UiButton>
      <UiButton variant="soft" size="sm" to="/admin/beneficios">Cancelar</UiButton>
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

// ── Image upload ──
const fileInput = ref<HTMLInputElement | null>(null)
const coverFile = ref<File | null>(null)
const isDragging = ref(false)
const toast = useToast()
const formError = ref('')
const saving = ref(false)
const deleting = ref(false)
const errors = reactive({ title: '', url: '' })

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
  form.cover_url = ''
  if (fileInput.value) fileInput.value.value = ''
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Fetch existing benefit ──
const { data: benefit } = await useAsyncData(`benefit-${id}`, async () => {
  if (isNew) return null
  const { data } = await client.from('benefits').select('*').eq('id', id).single()
  return data
})

// ── Form state ──
const form = reactive({
  title: benefit.value?.title ?? '',
  description: benefit.value?.description ?? '',
  cover_url: benefit.value?.cover_url ?? '',
  url: benefit.value?.url ?? '',
  utm_template: benefit.value?.utm_template ?? '',
  code: benefit.value?.code ?? '',
  plan: benefit.value?.plan ?? 'free',
  status: benefit.value?.status ?? 'active',
})

const planOptions = [
  { value: 'free', label: 'Gratuito' },
  { value: 'core', label: 'Core' },
]

const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
]

async function handleSave() {
  formError.value = ''
  errors.title = ''
  errors.url = ''

  let hasError = false
  if (!form.title.trim()) { errors.title = 'El título es obligatorio'; hasError = true }
  if (!form.url.trim()) { errors.url = 'La URL es obligatoria'; hasError = true }
  if (hasError) return

  saving.value = true
  try {
    const payload = {
      title: form.title,
      description: form.description || null,
      cover_url: form.cover_url || null,
      url: form.url,
      utm_template: form.utm_template || null,
      code: form.code || null,
      plan: form.plan,
      status: form.status,
    }

    if (isNew) {
      await client.from('benefits').insert(payload)
    } else {
      await client.from('benefits').update(payload).eq('id', id)
    }
    navigateTo('/admin/beneficios')
  } catch {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

const confirm = useConfirm()

async function handleDelete() {
  if (await confirm({ message: '¿Seguro que deseas eliminar este beneficio?' })) {
    deleting.value = true
    try {
      await client.from('benefits').delete().eq('id', id)
      navigateTo('/admin/beneficios')
    } catch {
      toast.show('Error al eliminar', 'error')
    } finally {
      deleting.value = false
    }
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
