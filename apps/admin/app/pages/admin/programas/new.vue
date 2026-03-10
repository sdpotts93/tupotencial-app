<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Nuevo programa</h1>
      <div class="page-header__actions">
        <UiButton variant="soft" size="sm" to="/admin/programas">Cancelar</UiButton>
        <UiButton variant="primary-outline" size="sm" @click="handleSave">Guardar</UiButton>
      </div>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.title"
              label="Titulo del programa"
              placeholder="Escribe el titulo del programa"
            />

            <UiTextarea
              v-model="form.description"
              label="Descripcion"
              placeholder="Describe el programa..."
              :rows="4"
            />

            <UiInput
              v-model="form.cover_url"
              label="URL de portada"
              placeholder="https://ejemplo.com/portada.jpg"
            />

            <UiTextarea
              v-model="form.objectives"
              label="Objetivos del programa"
              placeholder="Lista los objetivos del programa, uno por linea"
              :rows="4"
            />
          </div>
        </UiCard>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiSelect
              v-model="form.program_type"
              label="Tipo de programa"
              :options="typeOptions"
              placeholder="Selecciona el tipo"
            />

            <UiInput
              v-model="form.duration_days"
              label="Duracion (dias)"
              type="number"
              placeholder="21"
            />

            <UiSelect
              v-model="form.difficulty"
              label="Dificultad"
              :options="difficultyOptions"
              placeholder="Selecciona la dificultad"
            />

            <UiSelect
              v-model="form.segment"
              label="Segmento"
              :options="segmentOptions"
              placeholder="Selecciona el segmento"
            />

            <UiSelect
              v-model="form.status"
              label="Estado"
              :options="statusOptions"
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
  description: '',
  cover_url: '',
  objectives: '',
  program_type: 'challenge',
  duration_days: '',
  difficulty: 'beginner',
  segment: 'all',
  status: 'draft',
})

const typeOptions = [
  { value: 'challenge', label: 'Reto' },
  { value: 'course', label: 'Curso' },
  { value: 'path', label: 'Ruta' },
  { value: 'workshop', label: 'Taller' },
]

const difficultyOptions = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
]

const segmentOptions = [
  { value: 'all', label: 'General' },
  { value: 'free', label: 'Gratuito' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Empresarial' },
]

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'archived', label: 'Archivado' },
]

function handleSave() {
  alert('Programa creado (mock). Redirigiendo...')
  navigateTo('/admin/programas')
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
  .form-layout { grid-template-columns: 1fr; }
}
</style>
