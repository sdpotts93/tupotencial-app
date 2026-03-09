<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Editar publicacion</h1>
      <div class="page-header__actions">
        <UiButton variant="ghost" size="sm" @click="handleDelete">Eliminar</UiButton>
        <UiButton variant="soft" size="sm" to="/admin/community">Volver</UiButton>
        <UiButton variant="primary-outline" size="sm" @click="handleSave">Guardar</UiButton>
      </div>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiTextarea
              v-model="form.body"
              label="Contenido de la publicacion"
              :rows="6"
            />

            <UiInput
              v-model="form.media_url"
              label="URL de imagen"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
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
              v-model="form.status"
              label="Estado"
              :options="statusOptions"
            />

            <UiSelect
              v-model="form.segment"
              label="Segmento de comunidad"
              :options="segmentOptions"
            />
          </div>
        </UiCard>

        <UiCard variant="filled">
          <div class="form-section">
            <p class="meta-label">Autor: {{ form.author_name }}</p>
            <p class="meta-label">Likes: {{ form.likes_count }}</p>
            <p class="meta-label">Comentarios: {{ comments.length }}</p>
            <p class="meta-label">Reportes: {{ form.reports_count }}</p>
            <p class="meta-label">Creado: {{ formatDate(form.created_at) }}</p>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

const form = reactive({
  body: 'Feliz lunes! Recuerda que cada semana es una oportunidad nueva para cultivar habitos saludables. Que van a hacer hoy para cuidarse?',
  media_url: '',
  status: 'published',
  segment: 'conjunta',
  author_name: 'Tu Potencial',
  is_official: true,
  likes_count: 245,
  reports_count: 0,
  created_at: '2026-02-24T08:00:00',
})

const statusOptions = [
  { value: 'published', label: 'Publicado' },
  { value: 'hidden', label: 'Oculto' },
  { value: 'draft', label: 'Borrador' },
]

const segmentOptions = [
  { value: 'conjunta', label: 'Todos (Conjunta)' },
  { value: 'gabriel', label: 'Gabriel' },
  { value: 'carlotta', label: 'Carlotta' },
]

const comments = ref([
  { id: 'cmt-001', author_name: 'Laura Mendez', body: 'Justo lo que necesitaba leer hoy. Gracias!', created_at: '2026-02-24T08:15:00', is_hidden: false },
  { id: 'cmt-002', author_name: 'Pedro Sanchez', body: 'Voy a empezar con 10 minutos de meditacion. Alguien se une?', created_at: '2026-02-24T08:30:00', is_hidden: false },
  { id: 'cmt-003', author_name: 'Sofia Torres', body: 'Me encanta esta comunidad! Cada dia me motivan mas.', created_at: '2026-02-24T09:00:00', is_hidden: false },
])

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function hideComment(comment: any) {
  comment.is_hidden = !comment.is_hidden
  alert(`Comentario ${comment.is_hidden ? 'ocultado' : 'restaurado'} (mock)`)
}

function handleSave() {
  alert('Publicacion actualizada (mock)')
}

function handleDelete() {
  if (confirm('Seguro que deseas eliminar esta publicacion?')) {
    alert('Publicacion eliminada (mock)')
    navigateTo('/admin/community')
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

.form-layout__main,
.form-layout__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
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

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.comment-item {
  background: var(--color-surface);
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
</style>
