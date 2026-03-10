<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Editar evento</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput v-model="form.title" label="Titulo del evento" />
            <UiTextarea v-model="form.description" label="Descripcion" :rows="5" />
            <UiInput v-model="form.cover_url" label="URL de portada" />
            <UiInput v-model="form.location" label="Ubicacion / URL de sesion" />

            <div class="form-row">
              <UiInput v-model="form.starts_at" label="Inicio" type="datetime-local" />
              <UiInput v-model="form.ends_at" label="Fin" type="datetime-local" />
            </div>

            <UiInput v-model="form.host_name" label="Anfitrion" />
            <UiInput v-model="form.max_capacity" label="Capacidad maxima" type="number" />

            <UiInput
              v-model="form.vimeo_url"
              label="URL de Vimeo (grabacion)"
              placeholder="https://vimeo.com/..."
              hint="URL del video en Vimeo para la grabacion del evento"
            />
          </div>
        </UiCard>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiSelect v-model="form.event_type" label="Tipo" :options="typeOptions" />
            <UiSelect v-model="form.modality" label="Modalidad" :options="modalityOptions" />
            <UiSelect v-model="form.segment" label="Segmento de comunidad" :options="segmentOptions" />

            <UiSelect v-model="form.requires_subscription" label="Requiere suscripcion" :options="gatingOptions" />

            <UiSelect v-model="form.status" label="Estado" :options="statusOptions" />
          </div>
        </UiCard>

        <UiCard variant="filled">
          <div class="form-section">
            <p class="meta-label">ID: {{ route.params.id }}</p>
            <p class="meta-label">Registrados: 234</p>
            <p class="meta-label">Asistentes: 198</p>
            <p class="meta-label">Tasa de asistencia: 84.6%</p>
          </div>
        </UiCard>
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="danger-ghost" size="sm" @click="handleDelete">Eliminar</UiButton>
      <UiButton variant="soft" size="sm" to="/admin/eventos">Cancelar</UiButton>
      <UiButton variant="primary-outline" size="sm" @click="handleSave">Guardar cambios</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

const form = reactive({
  title: 'Taller de mindfulness para principiantes',
  description: 'Un taller practico de 90 minutos donde aprenderas las bases de la meditacion mindfulness. Incluye ejercicios guiados, tecnicas de respiracion y herramientas para incorporar la practica en tu vida diaria.',
  cover_url: 'https://images.tupotencial.app/events/mindfulness-taller.jpg',
  location: 'https://zoom.us/j/1234567890',
  starts_at: '2026-03-05T18:00',
  ends_at: '2026-03-05T19:30',
  host_name: 'Dra. Elena Rojas',
  max_capacity: '500',
  vimeo_url: '',
  event_type: 'workshop',
  modality: 'online',
  segment: 'conjunta',
  requires_subscription: 'no',
  status: 'published',
})

const typeOptions = [
  { value: 'workshop', label: 'Taller' },
  { value: 'class', label: 'Clase' },
  { value: 'conference', label: 'Conferencia' },
  { value: 'retreat', label: 'Retiro' },
]

const modalityOptions = [
  { value: 'online', label: 'En linea' },
  { value: 'presential', label: 'Presencial' },
  { value: 'hybrid', label: 'Hibrido' },
]

const segmentOptions = [
  { value: 'conjunta', label: 'Todos (Conjunta)' },
  { value: 'gabriel', label: 'Gabriel' },
  { value: 'carlotta', label: 'Carlotta' },
]

const gatingOptions = [
  { value: 'no', label: 'No (acceso libre)' },
  { value: 'yes', label: 'Si (solo suscriptores)' },
]

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'cancelled', label: 'Cancelado' },
]

function handleSave() {
  alert('Evento actualizado (mock)')
}

function handleDelete() {
  if (confirm('Seguro que deseas eliminar este evento?')) {
    alert('Evento eliminado (mock)')
    navigateTo('/admin/eventos')
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
