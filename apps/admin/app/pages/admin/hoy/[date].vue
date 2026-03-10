<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Plan del dia: {{ formatDate(dateParam) }}</h1>
      <div class="page-header__actions">
        <UiButton variant="soft" size="sm" to="/admin/hoy">Volver</UiButton>
        <UiButton variant="primary-outline" size="sm" @click="handleSave">Guardar</UiButton>
      </div>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.theme"
              label="Tema del dia"
              placeholder="Tema que guia el contenido del dia"
            />

            <UiTextarea
              v-model="form.motivational_quote"
              label="Frase motivacional"
              placeholder="Una frase inspiradora para iniciar el dia..."
              :rows="2"
            />

            <UiTextarea
              v-model="form.badge_share_text"
              label="Texto para badge compartible"
              placeholder="Texto que aparecera en la imagen compartible cuando el usuario completa la accion del dia..."
              :rows="2"
              hint="Si se deja vacio, se usara un texto predeterminado."
            />
          </div>
        </UiCard>

        <h2 class="section-title">Elementos del dia</h2>

        <div v-for="(item, index) in dayItems" :key="index" class="day-item">
          <div class="day-item__header">
            <span class="eyebrow">Elemento {{ index + 1 }}</span>
            <UiButton variant="ghost" size="sm" @click="removeItem(index)">Quitar</UiButton>
          </div>
          <div class="day-item__fields">
            <UiSelect
              v-model="item.type"
              label="Tipo"
              :options="itemTypeOptions"
            />
            <UiInput
              v-model="item.title"
              label="Titulo"
              placeholder="Titulo del elemento"
            />
            <UiInput
              v-model="item.content_id"
              label="ID de contenido (referencia)"
              placeholder="cnt-001"
              hint="ID del contenido vinculado"
            />
            <UiInput
              v-model="item.sort_order"
              label="Orden"
              type="number"
              placeholder="1"
            />
          </div>
        </div>

        <UiButton variant="outline" size="sm" @click="addItem">+ Agregar elemento</UiButton>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiSelect
              v-model="form.status"
              label="Estado"
              :options="statusOptions"
            />

            <UiInput
              v-model="form.publish_time"
              label="Hora de publicacion"
              type="time"
              hint="Hora a la que se mostrara el plan"
            />
          </div>
        </UiCard>

        <UiCard variant="filled">
          <div class="form-section">
            <p class="meta-label">Fecha: {{ dateParam }}</p>
            <p class="meta-label">Elementos: {{ dayItems.length }}</p>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const dateParam = computed(() => route.params.date as string)

const form = reactive({
  theme: 'Bienestar emocional',
  motivational_quote: 'Cada dia es una nueva oportunidad para cuidar de ti.',
  badge_share_text: '',
  status: 'published',
  publish_time: '06:00',
})

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'scheduled', label: 'Programado' },
  { value: 'published', label: 'Publicado' },
]

const itemTypeOptions = [
  { value: 'article', label: 'Articulo' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'checkin', label: 'Check-in' },
  { value: 'challenge', label: 'Mini reto' },
  { value: 'tip', label: 'Tip del dia' },
]

const dayItems = ref([
  { type: 'tip', title: 'Tip: 3 respiraciones profundas al despertar', content_id: '', sort_order: '1' },
  { type: 'article', title: '5 pasos para el bienestar emocional', content_id: 'cnt-001', sort_order: '2' },
  { type: 'audio', title: 'Meditacion guiada para la manana', content_id: 'cnt-002', sort_order: '3' },
  { type: 'checkin', title: 'Como te sientes hoy?', content_id: '', sort_order: '4' },
])

function addItem() {
  dayItems.value.push({
    type: 'article',
    title: '',
    content_id: '',
    sort_order: String(dayItems.value.length + 1),
  })
}

function removeItem(index: number) {
  dayItems.value.splice(index, 1)
}

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function handleSave() {
  alert('Plan del dia guardado (mock)')
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
  padding: var(--space-5);
}

.section-title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  margin-top: var(--space-2);
}

.day-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
}

.day-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.day-item__fields {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-3);
}

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
  .day-item__fields { grid-template-columns: 1fr; }
}
</style>
