<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Editar plan — {{ plan?.title }}</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput v-model="form.title" label="Nombre del plan" />

            <UiTextarea v-model="form.description" label="Descripción" :rows="3" />

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
          </div>
        </UiCard>

        <!-- Benefits from benefits table -->
        <UiCard variant="outlined">
          <div class="form-section">
            <div class="benefits-header">
              <div>
                <label class="benefits__label">Beneficios del plan</label>
                <p class="benefits__hint">Alianzas y descuentos asociados a este plan. Edítalos en Beneficios.</p>
              </div>
              <UiButton variant="soft" size="sm" to="/admin/beneficios">Ir a Beneficios</UiButton>
            </div>

            <div v-if="planBenefits?.length" class="benefits-list">
              <div v-for="b in planBenefits" :key="b.id" class="benefits-list__item">
                <span class="benefits-list__title">{{ b.title }}</span>
                <UiTag :variant="b.status === 'active' ? 'success' : 'warning'" size="sm">
                  {{ b.status === 'active' ? 'Activo' : 'Inactivo' }}
                </UiTag>
              </div>
            </div>
            <p v-else class="benefits__empty">No hay beneficios asociados a este plan.</p>
          </div>
        </UiCard>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.price"
              label="Precio (MXN)"
              type="number"
              placeholder="399"
              hint="Precio en pesos mexicanos"
            />

            <UiSelect
              v-model="form.interval"
              label="Intervalo"
              :options="intervalOptions"
            />
          </div>
        </UiCard>

        <UiCard variant="filled">
          <div class="form-section">
            <p class="meta-label">ID: {{ route.params.id }}</p>
            <p class="meta-hint">Los planes no se pueden crear ni eliminar.</p>
          </div>
        </UiCard>
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="soft" size="sm" to="/admin/suscripciones">Cancelar</UiButton>
      <UiButton variant="primary-outline" size="sm" :loading="saving" @click="handleSave">Guardar cambios</UiButton>
      <p v-if="formError" class="form-error">{{ formError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const client = useSupabaseClient()
const planId = route.params.id as string
const toast = useToast()

// ── Fetch plan ──
const { data: plan } = await useAsyncData(`sub-plan-${planId}`, async () => {
  const { data } = await client.from('subscription_plans').select('*').eq('id', planId).single()
  return data
})

// ── Fetch benefits for this plan ──
const { data: planBenefits } = await useAsyncData(`sub-plan-benefits-${planId}`, async () => {
  const { data } = await client
    .from('benefits')
    .select('id, title, status')
    .eq('plan', planId)
    .order('position')
  return data ?? []
})

// ── Image upload ──
const fileInput = ref<HTMLInputElement | null>(null)
const coverFile = ref<File | null>(null)
const isDragging = ref(false)
const formError = ref('')
const saving = ref(false)

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
  title: plan.value?.title ?? '',
  description: plan.value?.description ?? '',
  cover_url: plan.value?.cover_url ?? '',
  price: plan.value ? String(plan.value.price / 100) : '0',
  interval: plan.value?.interval ?? 'month',
})

const intervalOptions = [
  { value: 'month', label: 'Mensual' },
  { value: 'year', label: 'Anual' },
]

async function handleSave() {
  formError.value = ''
  saving.value = true
  try {
    const payload = {
      title: form.title,
      description: form.description || null,
      cover_url: form.cover_url || null,
      price: Math.round(Number(form.price) * 100),
      interval: form.interval,
      updated_at: new Date().toISOString(),
    }

    const { error } = await client.from('subscription_plans').update(payload).eq('id', planId)
    if (error) throw error
    toast.show('Plan actualizado', 'success')
    navigateTo('/admin/suscripciones')
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

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.meta-hint {
  font-size: var(--text-xs);
  color: var(--color-muted);
  opacity: 0.7;
}

/* ─── Benefits section ─── */
.benefits-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.benefits__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.benefits__hint {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.benefits-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: rgba(var(--tint-rgb), 0.03);
  border-radius: var(--radius-md);
}

.benefits-list__title {
  font-size: var(--text-sm);
  color: var(--color-text);
}

.benefits__empty {
  font-size: var(--text-sm);
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

.upload__input { display: none; }

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
  .upload__dropzone:hover { border-color: var(--color-muted); }
  .upload__remove:hover { background: rgba(220, 38, 38, 0.06); }
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
