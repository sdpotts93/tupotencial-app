<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Imágenes</h1>
    </div>

    <!-- Loading -->
    <template v-if="status === 'pending'">
      <div class="img-grid">
        <div v-for="i in 2" :key="i" class="img-card">
          <UiSkeleton variant="rect" width="100%" height="160px" radius="var(--radius-md)" />
          <UiSkeleton variant="text" width="60%" height="14px" style="margin-top: var(--space-3);" />
        </div>
      </div>
    </template>

    <!-- Error -->
    <template v-else-if="status === 'error'">
      <UiErrorState title="No pudimos cargar la configuración" @retry="refresh()" />
    </template>

    <template v-else>
      <!-- Avatares section -->
      <div class="img-section">
        <h2 class="img-section__title">Avatares de personajes</h2>
        <p class="img-section__desc">Estos avatares se usan en comunidad, hoy, onboarding e IA.</p>

        <div class="img-grid">
          <!-- Carlotta -->
          <div class="img-card">
            <div class="img-card__header">
              <span class="img-card__name">Carlotta</span>
            </div>
            <div
              class="img-card__dropzone"
              :class="{ 'img-card__dropzone--active': isDraggingCarlotta }"
              @dragover.prevent="isDraggingCarlotta = true"
              @dragleave="isDraggingCarlotta = false"
              @drop.prevent="handleDrop('carlotta', $event)"
              @click="triggerInput('carlotta')"
            >
              <input
                ref="carlottaInput"
                type="file"
                accept="image/*"
                class="img-card__input"
                @change="handleFileChange('carlotta', $event)"
              />
              <template v-if="carlottaPreview || (!carlottaCleared && avatars.carlotta_avatar_url)">
                <img
                  :src="carlottaPreview || avatars.carlotta_avatar_url"
                  alt="Carlotta"
                  class="img-card__preview"
                />
                <button class="img-card__remove" @click.stop="clearCarlotta">Eliminar</button>
              </template>
              <div v-else class="img-card__placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <p class="img-card__hint">Arrastra o selecciona</p>
              </div>
            </div>
          </div>

          <!-- Gabriel -->
          <div class="img-card">
            <div class="img-card__header">
              <span class="img-card__name">Gabriel</span>
            </div>
            <div
              class="img-card__dropzone"
              :class="{ 'img-card__dropzone--active': isDraggingGabriel }"
              @dragover.prevent="isDraggingGabriel = true"
              @dragleave="isDraggingGabriel = false"
              @drop.prevent="handleDrop('gabriel', $event)"
              @click="triggerInput('gabriel')"
            >
              <input
                ref="gabrielInput"
                type="file"
                accept="image/*"
                class="img-card__input"
                @change="handleFileChange('gabriel', $event)"
              />
              <template v-if="gabrielPreview || (!gabrielCleared && avatars.gabriel_avatar_url)">
                <img
                  :src="gabrielPreview || avatars.gabriel_avatar_url"
                  alt="Gabriel"
                  class="img-card__preview"
                />
                <button class="img-card__remove" @click.stop="clearGabriel">Eliminar</button>
              </template>
              <div v-else class="img-card__placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <p class="img-card__hint">Arrastra o selecciona</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="page-actions">
        <UiButton variant="primary-outline" size="sm" :loading="saving" @click="handleSave">Guardar cambios</UiButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const toast = useToast()
const saving = ref(false)

const isDraggingCarlotta = ref(false)
const isDraggingGabriel = ref(false)

const carlottaInput = ref<HTMLInputElement | null>(null)
const gabrielInput = ref<HTMLInputElement | null>(null)

const carlottaFile = ref<File | null>(null)
const gabrielFile = ref<File | null>(null)

const carlottaPreview = ref('')
const gabrielPreview = ref('')

interface CharacterAvatars {
  carlotta_avatar_url: string
  gabriel_avatar_url: string
}

const { data: avatarsData, refresh, status } = useAsyncData('admin-character-avatars', async () => {
  const { data } = await client
    .from('app_settings')
    .select('value')
    .eq('key', 'character_avatars')
    .single()
  const val = data?.value as unknown as CharacterAvatars | undefined
  return {
    carlotta_avatar_url: val?.carlotta_avatar_url ?? '',
    gabriel_avatar_url: val?.gabriel_avatar_url ?? '',
  }
}, { lazy: true, default: () => ({ carlotta_avatar_url: '', gabriel_avatar_url: '' }) })

const avatars = computed(() => avatarsData.value)

function triggerInput(character: 'carlotta' | 'gabriel') {
  if (character === 'carlotta') carlottaInput.value?.click()
  else gabrielInput.value?.click()
}

function handleFileChange(character: 'carlotta' | 'gabriel', event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  setFile(character, file)
}

function handleDrop(character: 'carlotta' | 'gabriel', event: DragEvent) {
  isDraggingCarlotta.value = false
  isDraggingGabriel.value = false
  const file = event.dataTransfer?.files[0]
  if (!file || !file.type.startsWith('image/')) return
  setFile(character, file)
}

function setFile(character: 'carlotta' | 'gabriel', file: File) {
  const preview = URL.createObjectURL(file)
  if (character === 'carlotta') {
    carlottaFile.value = file
    carlottaPreview.value = preview
  } else {
    gabrielFile.value = file
    gabrielPreview.value = preview
  }
}

const carlottaCleared = ref(false)
const gabrielCleared = ref(false)

function clearCarlotta() {
  carlottaFile.value = null
  carlottaPreview.value = ''
  carlottaCleared.value = true
  if (carlottaInput.value) carlottaInput.value.value = ''
}

function clearGabriel() {
  gabrielFile.value = null
  gabrielPreview.value = ''
  gabrielCleared.value = true
  if (gabrielInput.value) gabrielInput.value.value = ''
}

async function uploadAvatar(file: File, character: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${character}/avatar-${Date.now()}.${ext}`
  const { error } = await client.storage.from('character-avatars').upload(path, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = client.storage.from('character-avatars').getPublicUrl(path)
  return urlData.publicUrl
}

async function handleSave() {
  saving.value = true
  try {
    let carlottaUrl = avatars.value.carlotta_avatar_url
    let gabrielUrl = avatars.value.gabriel_avatar_url

    if (carlottaFile.value) {
      carlottaUrl = await uploadAvatar(carlottaFile.value, 'carlotta')
    } else if (carlottaCleared.value) {
      carlottaUrl = ''
    }

    if (gabrielFile.value) {
      gabrielUrl = await uploadAvatar(gabrielFile.value, 'gabriel')
    } else if (gabrielCleared.value) {
      gabrielUrl = ''
    }

    const hasChanges = carlottaFile.value || gabrielFile.value || carlottaCleared.value || gabrielCleared.value
    if (hasChanges) {
      const { error } = await client
        .from('app_settings')
        .upsert({ key: 'character_avatars', value: { carlotta_avatar_url: carlottaUrl, gabriel_avatar_url: gabrielUrl } as any })

      if (error) throw error

      carlottaFile.value = null
      gabrielFile.value = null
      carlottaPreview.value = ''
      gabrielPreview.value = ''
      carlottaCleared.value = false
      gabrielCleared.value = false
      await refresh()
    }

    toast.show('Imágenes guardadas', 'success')
  } catch {
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.img-section {
  margin-bottom: var(--space-6);
}

.img-section__title {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.img-section__desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-bottom: var(--space-5);
}

.img-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  max-width: 640px;
}

.img-card {
  background: var(--color-desktop-card, var(--color-white));
  border: 1px solid var(--color-desktop-border, var(--color-border-light));
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.img-card__header {
  margin-bottom: var(--space-3);
}

.img-card__name {
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  color: var(--color-text);
}

.img-card__dropzone {
  position: relative;
  border: 2px dashed var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: 180px;
  height: calc(100% - var(--space-8));
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.img-card__dropzone--active {
  border-color: var(--color-primary);
  background: rgba(var(--tint-rgb), 0.04);
}

@media (hover: hover) {
  .img-card__dropzone:hover {
    border-color: var(--color-text-secondary);
  }
}

.img-card__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
}

.img-card__preview {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.img-card__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-muted);
}

.img-card__hint {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.img-card__file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.img-card__remove {
  background: none;
  border: none;
  color: var(--color-danger);
  font-size: var(--text-xs);
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
}


@media (max-width: 640px) {
  .img-grid {
    grid-template-columns: 1fr;
  }
}
</style>
