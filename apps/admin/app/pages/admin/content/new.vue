<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Crear contenido</h1>
      <div class="page-header__actions">
        <UiButton variant="outline" size="sm" to="/admin/content">Cancelar</UiButton>
        <UiButton size="sm" @click="handleSave">Guardar</UiButton>
      </div>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.title"
              label="Titulo"
              placeholder="Escribe el titulo del contenido"
            />

            <UiTextarea
              v-model="form.body"
              label="Cuerpo del contenido"
              placeholder="Escribe el contenido aqui..."
              :rows="10"
            />

            <UiInput
              v-model="form.media_url"
              label="URL del media"
              placeholder="https://ejemplo.com/imagen.jpg"
              hint="URL de imagen, video o audio segun el tipo de contenido"
            />
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

            <UiSelect
              v-model="form.segment"
              label="Segmento"
              :options="segmentOptions"
              placeholder="Selecciona el segmento"
            />

            <UiSelect
              v-model="form.category_id"
              label="Categoria"
              :options="categoryOptions"
              placeholder="Selecciona la categoria"
            />

            <UiSelect
              v-model="form.status"
              label="Estado"
              :options="statusOptions"
              placeholder="Selecciona el estado"
            />
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const form = reactive({
  title: '',
  body: '',
  media_url: '',
  content_type: 'article',
  segment: 'all',
  category_id: '',
  status: 'draft',
})

const typeOptions = [
  { value: 'article', label: 'Articulo' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'infographic', label: 'Infografia' },
]

const segmentOptions = [
  { value: 'all', label: 'General' },
  { value: 'free', label: 'Gratuito' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Empresarial' },
]

const categoryOptions = [
  { value: 'cat-001', label: 'Mindfulness' },
  { value: 'cat-002', label: 'Nutricion' },
  { value: 'cat-003', label: 'Ejercicio' },
  { value: 'cat-004', label: 'Sueno' },
  { value: 'cat-005', label: 'Productividad' },
  { value: 'cat-006', label: 'Relaciones' },
]

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

function handleSave() {
  alert('Contenido guardado (mock). Redirigiendo a la lista...')
  navigateTo('/admin/content')
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

@media (max-width: 768px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
}
</style>
