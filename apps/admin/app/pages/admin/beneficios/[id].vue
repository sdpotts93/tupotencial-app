<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Editar beneficio</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput v-model="form.title" label="Título del beneficio" />
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

            <UiInput v-model="form.url" label="URL" />

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
      <UiButton variant="danger-ghost" size="sm" @click="handleDelete">Eliminar</UiButton>
      <UiButton variant="soft" size="sm" to="/admin/beneficios">Cancelar</UiButton>
      <UiButton variant="primary-outline" size="sm" @click="handleSave">Guardar cambios</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

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
  form.cover_url = ''
  if (fileInput.value) fileInput.value.value = ''
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Form state ──
const form = reactive({
  title: '20% en suplementos',
  description: 'Obtén un 20% de descuento en toda la línea de suplementos NutriVida. Incluye vitaminas, minerales, proteínas y más. Válido en compras en línea y tiendas físicas.',
  cover_url: 'https://images.tupotencial.app/benefits/nutrivida.jpg',
  url: 'https://nutrivida.com/tupotencial',
  utm_template: '?utm_source=tupotencial&utm_medium=benefit&utm_campaign=nutrivida',
  code: 'TUPOTENCIAL20',
  plan: 'core',
  status: 'active',
})

const planOptions = [
  { value: 'free', label: 'Gratuito' },
  { value: 'core', label: 'Core' },
]

const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
]

function handleSave() {
  alert('Beneficio actualizado (mock)')
}

function handleDelete() {
  if (confirm('¿Seguro que deseas eliminar este beneficio?')) {
    alert('Beneficio eliminado (mock)')
    navigateTo('/admin/beneficios')
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
</style>
