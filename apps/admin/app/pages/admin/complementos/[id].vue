<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Editar add-on</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput v-model="form.title" label="Título del add-on" required :error="errors.title" />

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
                    <img :src="coverPreview" alt="" class="upload__img-preview" />
                    <p class="upload__filename">{{ coverFile.name }}</p>
                    <p class="upload__filesize">{{ formatFileSize(coverFile.size) }}</p>
                    <button class="upload__remove" @click.stop="removeCover">Eliminar</button>
                  </div>
                </template>
                <template v-else>
                  <div class="upload__preview">
                    <img :src="form.cover_url" alt="" class="upload__img-preview" />
                    <p class="upload__filename">{{ form.cover_url }}</p>
                    <button class="upload__remove" @click.stop="removeCover">Eliminar</button>
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
            <UiInput
              v-model="form.price"
              label="Precio (MXN)"
              type="number"
              placeholder="2499"
              hint="Precio en pesos mexicanos"
              required
              :error="errors.price"
            />

            <UiSelect
              v-model="form.plan"
              label="Disponible para"
              :options="planOptions"
            />

            <UiInput
              v-model="form.grants_core_months"
              label="Meses de Core incluidos"
              type="number"
              placeholder="0"
              hint="Dejar vacío si no aplica"
            />

            <UiInput
              v-model="form.stripe_price_id"
              label="Stripe Price ID"
              placeholder="price_..."
              hint="ID del precio en Stripe"
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
            <p class="meta-label">ID: {{ route.params.id }}</p>
            <p class="meta-label">Compras: {{ purchases }}</p>
            <p class="meta-label">Ingresos: ${{ (revenue / 100).toLocaleString('es-MX') }} MXN</p>
          </div>
        </UiCard> -->
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="danger-ghost" size="sm" :loading="deleting" @click="handleDelete">Eliminar</UiButton>
      <UiButton variant="soft" size="sm" to="/admin/complementos">Cancelar</UiButton>
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

// ── Fetch existing addon + purchase stats ──
const { data: addon } = await useAsyncData(`addon-${id}`, async () => {
  if (isNew) return null
  const { data } = await client.from('addons').select('*').eq('id', id).single()
  return data
})

const { data: stats } = await useAsyncData(`addon-stats-${id}`, async () => {
  if (isNew) return { purchases: 0, revenue: 0 }
  const { data } = await client.from('addon_purchases').select('amount').eq('addon_id', id)
  const rows = data ?? []
  return {
    purchases: rows.length,
    revenue: rows.reduce((sum, p) => sum + (p.amount ?? 0), 0),
  }
})

const purchases = computed(() => stats.value?.purchases ?? 0)
const revenue = computed(() => stats.value?.revenue ?? 0)

// ── Image upload ──
const fileInput = ref<HTMLInputElement | null>(null)
const coverFile = ref<File | null>(null)
const coverPreview = ref('')
const isDragging = ref(false)
const toast = useToast()
const formError = ref('')
const saving = ref(false)
const deleting = ref(false)
const errors = reactive({ title: '', price: '' })

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    coverFile.value = target.files[0]
    coverPreview.value = URL.createObjectURL(target.files[0])
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files?.[0]) {
    coverFile.value = e.dataTransfer.files[0]
    coverPreview.value = URL.createObjectURL(e.dataTransfer.files[0])
  }
}

function removeCover() {
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value)
  coverFile.value = null
  coverPreview.value = ''
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
  title: addon.value?.title ?? '',
  description: addon.value?.description ?? '',
  cover_url: addon.value?.cover_url ?? '',
  price: addon.value ? String(addon.value.price / 100) : '',
  plan: addon.value?.plan ?? 'todos',
  grants_core_months: addon.value?.grants_core_months ? String(addon.value.grants_core_months) : '',
  stripe_price_id: addon.value?.stripe_price_id ?? '',
  status: addon.value?.status ?? 'active',
})

const planOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'core', label: 'Core' },
]

const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
]

async function handleSave() {
  formError.value = ''
  errors.title = ''
  errors.price = ''

  let hasError = false
  if (!form.title.trim()) { errors.title = 'El título es obligatorio'; hasError = true }
  if (!form.price || Number(form.price) <= 0) { errors.price = 'El precio es obligatorio'; hasError = true }
  if (hasError) return

  saving.value = true
  try {
    const payload = {
      title: form.title,
      description: form.description || null,
      cover_url: form.cover_url || null,
      price: Math.round(Number(form.price) * 100),
      plan: form.plan,
      grants_core_months: form.grants_core_months ? Number(form.grants_core_months) : null,
      stripe_price_id: form.stripe_price_id || null,
      status: form.status,
    }

    if (isNew) {
      await client.from('addons').insert(payload)
    } else {
      await client.from('addons').update(payload).eq('id', id)
    }
    navigateTo('/admin/complementos')
  } catch {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

const confirm = useConfirm()

async function handleDelete() {
  if (await confirm({ message: '¿Seguro que deseas eliminar este add-on?' })) {
    deleting.value = true
    try {
      await client.from('addons').delete().eq('id', id)
      navigateTo('/admin/complementos')
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
