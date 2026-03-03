<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Nuevo evento</h1>
      <div class="page-header__actions">
        <UiButton variant="outline" size="sm" to="/admin/events">Cancelar</UiButton>
        <UiButton size="sm" @click="handleSave">Guardar</UiButton>
      </div>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.title"
              label="Titulo del evento"
              placeholder="Nombre del evento"
            />

            <UiTextarea
              v-model="form.description"
              label="Descripcion"
              placeholder="Describe el evento..."
              :rows="5"
            />

            <UiInput
              v-model="form.cover_url"
              label="URL de portada"
              placeholder="https://ejemplo.com/portada.jpg"
            />

            <UiInput
              v-model="form.location"
              label="Ubicacion / URL de sesion"
              placeholder="Zoom link o direccion fisica"
            />

            <div class="form-row">
              <UiInput
                v-model="form.starts_at"
                label="Fecha y hora de inicio"
                type="datetime-local"
              />
              <UiInput
                v-model="form.ends_at"
                label="Fecha y hora de fin"
                type="datetime-local"
              />
            </div>

            <UiInput
              v-model="form.host_name"
              label="Nombre del anfitrion"
              placeholder="Nombre del facilitador o ponente"
            />

            <UiInput
              v-model="form.max_capacity"
              label="Capacidad maxima"
              type="number"
              placeholder="100"
              hint="Dejar vacio para sin limite"
            />

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
            <UiSelect
              v-model="form.event_type"
              label="Tipo de evento"
              :options="typeOptions"
            />

            <UiSelect
              v-model="form.modality"
              label="Modalidad"
              :options="modalityOptions"
            />

            <UiSelect
              v-model="form.segment"
              label="Segmento de comunidad"
              :options="segmentOptions"
            />

            <UiSelect
              v-model="form.requires_subscription"
              label="Requiere suscripcion"
              :options="gatingOptions"
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
  location: '',
  starts_at: '',
  ends_at: '',
  host_name: '',
  max_capacity: '',
  vimeo_url: '',
  event_type: 'workshop',
  modality: 'online',
  segment: 'conjunta',
  requires_subscription: 'no',
  status: 'draft',
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
]

function handleSave() {
  alert('Evento creado (mock)')
  navigateTo('/admin/events')
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

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
