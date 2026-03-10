<template>
  <div class="page-fill">
    <div class="page-header">
      <h1 class="page-header__title">Nueva publicacion</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiTextarea
              v-model="form.body"
              label="Contenido de la publicacion"
              placeholder="Escribe tu publicacion aqui..."
              :rows="6"
            />

            <!-- Media upload -->
            <div class="upload">
              <label class="upload__label">Imagen o video (opcional)</label>
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
                  accept="image/*,video/*"
                  class="upload__input"
                  @change="handleFileChange"
                />
                <template v-if="!uploadedFile">
                  <div class="upload__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p class="upload__text">Arrastra tu archivo aqui o <span class="upload__link">selecciona</span></p>
                  <p class="upload__hint">JPG, PNG, WebP, MP4, MOV — max 50 MB</p>
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
              v-model="form.author"
              label="Autor"
              :options="authorOptions"
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
            <div class="author-preview">
              <img :src="authorAvatar" :alt="form.author" class="author-preview__avatar" />
              <p class="meta-info">Se publicara como <strong>{{ form.author }}</strong></p>
            </div>
          </div>
        </UiCard>
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="soft" size="sm" to="/admin/comunidad">Cancelar</UiButton>
      <UiButton variant="primary-outline" size="sm" @click="handleSave">Publicar</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const form = reactive({
  body: '',
  author: 'Gabriel',
  status: 'published',
})

const authorOptions = [
  { value: 'Gabriel', label: 'Gabriel' },
  { value: 'Carlotta', label: 'Carlotta' },
]

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicar ahora' },
]

const authorAvatar = computed(() =>
  form.author === 'Carlotta' ? '/images/carlotta.png' : '/images/gabriel.png',
)

// ── Media upload ──
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFile = ref<File | null>(null)
const isDragging = ref(false)

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
  alert('Publicacion creada (mock)')
  navigateTo('/admin/comunidad')
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
  flex: 1;
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

.meta-info {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.author-preview {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.author-preview__avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
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
  .form-layout { grid-template-columns: 1fr; }
}
</style>
