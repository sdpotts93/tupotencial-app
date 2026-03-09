<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Nueva publicacion oficial</h1>
      <div class="page-header__actions">
        <UiButton variant="soft" size="sm" to="/admin/community">Cancelar</UiButton>
        <UiButton variant="primary-outline" size="sm" @click="handleSave">Publicar</UiButton>
      </div>
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

            <UiInput
              v-model="form.media_url"
              label="URL de imagen (opcional)"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
        </UiCard>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiSelect
              v-model="form.post_type"
              label="Tipo de publicacion"
              :options="typeOptions"
            />

            <UiSelect
              v-model="form.segment"
              label="Segmento de comunidad"
              :options="segmentOptions"
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
            <p class="meta-info">Se publicara como <strong>Tu Potencial</strong> (cuenta oficial)</p>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const form = reactive({
  body: '',
  media_url: '',
  post_type: 'announcement',
  segment: 'conjunta',
  status: 'published',
})

const typeOptions = [
  { value: 'announcement', label: 'Anuncio' },
  { value: 'motivation', label: 'Motivacion' },
  { value: 'tip', label: 'Tip' },
  { value: 'poll', label: 'Encuesta' },
]

const segmentOptions = [
  { value: 'conjunta', label: 'Todos (Conjunta)' },
  { value: 'gabriel', label: 'Gabriel' },
  { value: 'carlotta', label: 'Carlotta' },
]

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicar ahora' },
]

function handleSave() {
  alert('Publicacion creada (mock)')
  navigateTo('/admin/community')
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

.meta-info {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
}
</style>
