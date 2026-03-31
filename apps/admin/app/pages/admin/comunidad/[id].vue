<template>
  <div class="page-fill">
    <div class="page-header">
      <h1 class="page-header__title">Editar publicación</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.title"
              label="Título (opcional)"
              placeholder="Ej: Reflexión del día"
            />

            <UiTextarea
              v-model="form.body"
              label="Contenido de la publicación"
              :rows="6"
            />

            <!-- Media upload -->
            <div class="upload">
              <label class="upload__label">Imagen o video</label>
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
                <template v-if="!uploadedFile && !form.media_url">
                  <div class="upload__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p class="upload__text">Arrastra tu archivo aquí o <span class="upload__link">selecciona</span></p>
                  <p class="upload__hint">JPG, PNG, WebP, MP4, MOV — max 50 MB</p>
                </template>
                <template v-else>
                  <div class="upload__preview">
                    <p class="upload__filename">{{ uploadedFile?.name ?? form.media_url }}</p>
                    <p v-if="uploadedFile" class="upload__filesize">{{ formatFileSize(uploadedFile.size) }}</p>
                    <button class="upload__remove" @click.stop="removeFile">Eliminar</button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </UiCard>

        <!-- Comments section -->
        <h2 class="section-title">Comentarios ({{ comments.length }})</h2>
        <div class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-item__header">
              <span class="comment-item__author">{{ comment.author_name }}</span>
              <span class="comment-item__date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <p class="comment-item__body">{{ comment.body }}</p>
            <div class="comment-item__actions">
              <UiButton variant="ghost" size="sm" @click="hideComment(comment)">
                {{ comment.is_hidden ? 'Mostrar' : 'Ocultar' }}
              </UiButton>
            </div>
          </div>
        </div>
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

        <!-- <UiCard variant="filled">
          <div class="form-section">
            <div class="author-preview">
              <img :src="authorAvatar" :alt="form.author" class="author-preview__avatar" />
              <span class="author-preview__name">{{ form.author }}</span>
            </div>
            <p class="meta-label">Likes: {{ form.likes_count }}</p>
            <p class="meta-label">Comentarios: {{ comments.length }}</p>
            <p class="meta-label">Creado: {{ formatDate(form.created_at) }}</p>
          </div>
        </UiCard> -->
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="danger-ghost" size="sm" :loading="deleting" @click="handleDelete">Eliminar</UiButton>
      <UiButton variant="soft" size="sm" to="/admin/comunidad">Volver</UiButton>
      <UiButton variant="primary-outline" size="sm" :loading="saving" @click="handleSave">{{ form.status === 'draft' ? 'Guardar' : 'Publicar' }}</UiButton>
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
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')

// ── Fetch existing post ──
const { data: post } = await useAsyncData(`post-${id}`, async () => {
  if (isNew) return null
  const { data } = await client.from('posts').select('*').eq('id', id).single()
  return data
})

// ── Fetch comments with author profile ──
const { data: rawComments } = await useAsyncData(`post-comments-${id}`, async () => {
  if (isNew) return []
  const { data } = await client
    .from('post_comments')
    .select('id, body, status, created_at, user_id, profiles:user_id ( display_name )')
    .eq('post_id', id)
    .order('created_at')
  return (data ?? []).map((c: any) => ({
    id: c.id,
    author_name: c.profiles?.display_name ?? 'Usuario',
    body: c.body,
    created_at: c.created_at,
    is_hidden: c.status === 'hidden',
  }))
})

const form = reactive({
  title: post.value?.title ?? '',
  body: post.value?.body ?? '',
  media_url: post.value?.media_url ?? '',
  status: post.value?.status ?? 'draft',
  author: post.value?.community_segment === 'carlotta' ? 'Carlotta' : 'Gabriel',
  likes_count: 0,
  created_at: post.value?.created_at ?? '',
})

// Fetch likes count
const { data: likesData } = await useAsyncData(`post-likes-${id}`, async () => {
  if (isNew) return 0
  const { count } = await client.from('post_reactions').select('*', { count: 'exact', head: true }).eq('post_id', id)
  return count ?? 0
})
form.likes_count = likesData.value ?? 0

const authorOptions = [
  { value: 'Gabriel', label: 'Gabriel' },
  { value: 'Carlotta', label: 'Carlotta' },
]

const statusOptions = [
  { value: 'published', label: 'Publicado' },
  { value: 'hidden', label: 'Oculto' },
  { value: 'draft', label: 'Borrador' },
]

const authorAvatar = computed(() =>
  form.author === 'Carlotta' ? '/images/carlotta.png' : '/images/gabriel.png',
)

const comments = ref(rawComments.value ?? [])

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
    form.media_url = ''
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files?.[0]) {
    uploadedFile.value = e.dataTransfer.files[0]
    form.media_url = ''
  }
}

function removeFile() {
  uploadedFile.value = null
  form.media_url = ''
  if (fileInput.value) fileInput.value.value = ''
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

async function hideComment(comment: any) {
  const newStatus = comment.is_hidden ? 'published' : 'hidden'
  await client.from('post_comments').update({ status: newStatus }).eq('id', comment.id)
  comment.is_hidden = !comment.is_hidden
}

async function handleSave() {
  formError.value = ''
  saving.value = true
  try {
    const communitySegment = form.author === 'Carlotta' ? 'carlotta' : 'gabriel'
    const payload = {
      title: form.title || null,
      body: form.body,
      media_url: form.media_url || null,
      status: form.status,
      community_segment: communitySegment,
      is_official: true,
    }

    if (isNew) {
      await client.from('posts').insert(payload)
    } else {
      await client.from('posts').update(payload).eq('id', id)
    }
    navigateTo('/admin/comunidad')
  } catch {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

const confirm = useConfirm()

async function handleDelete() {
  if (await confirm({ message: '¿Seguro que deseas eliminar esta publicación?' })) {
    deleting.value = true
    try {
      await client.from('posts').delete().eq('id', id)
      navigateTo('/admin/comunidad')
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
}

.section-title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  margin-top: var(--space-2);
}

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.author-preview {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.author-preview__avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.author-preview__name {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
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

/* ─── Comments ─── */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.comment-item {
  background: var(--color-white);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.comment-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.comment-item__author {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}

.comment-item__date {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.comment-item__body {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.comment-item__actions {
  display: flex;
  justify-content: flex-end;
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
