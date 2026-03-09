<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Editar programa</h1>
      <div class="page-header__actions">
        <UiButton variant="ghost" size="sm" @click="handleDelete">Eliminar</UiButton>
        <UiButton variant="outline" size="sm" @click="handleDuplicate">Duplicar</UiButton>
        <UiButton variant="soft" size="sm" to="/admin/programs">Cancelar</UiButton>
        <UiButton variant="primary-outline" size="sm" @click="handleSave">Guardar cambios</UiButton>
      </div>
    </div>

    <UiTabs v-model="activeTab" :tabs="tabs" />

    <!-- Info Tab -->
    <div v-if="activeTab === 'info'" class="tab-content">
      <div class="form-layout">
        <div class="form-layout__main">
          <UiCard variant="outlined">
            <div class="form-section">
              <UiInput v-model="form.title" label="Titulo del programa" />
              <UiTextarea v-model="form.description" label="Descripcion" :rows="4" />
              <UiInput v-model="form.cover_url" label="URL de portada" />
              <UiTextarea v-model="form.objectives" label="Objetivos" :rows="4" />
            </div>
          </UiCard>
        </div>
        <div class="form-layout__sidebar">
          <UiCard variant="outlined">
            <div class="form-section">
              <UiSelect v-model="form.program_type" label="Tipo" :options="typeOptions" />
              <UiInput v-model="form.duration_days" label="Duracion (dias)" type="number" />
              <UiSelect v-model="form.difficulty" label="Dificultad" :options="difficultyOptions" />
              <UiSelect v-model="form.segment" label="Segmento" :options="segmentOptions" />
              <UiSelect v-model="form.status" label="Estado" :options="statusOptions" />
            </div>
          </UiCard>
          <UiCard variant="filled">
            <div class="form-section">
              <p class="meta-label">Inscritos: 3,420</p>
              <p class="meta-label">Completados: 1,847</p>
              <p class="meta-label">Tasa de finalizacion: 54%</p>
            </div>
          </UiCard>
        </div>
      </div>
    </div>

    <!-- Days Tab -->
    <div v-if="activeTab === 'days'" class="tab-content">
      <div class="days-header">
        <h2 class="days-header__title">Dias del programa</h2>
        <UiButton size="sm" @click="addDay">+ Agregar dia</UiButton>
      </div>

      <div class="days-list">
        <div v-for="day in programDays" :key="day.day_number" class="day-card">
          <div class="day-card__header">
            <span class="day-card__number eyebrow">Dia {{ day.day_number }}</span>
            <UiButton variant="ghost" size="sm" @click="editDay(day)">Editar</UiButton>
          </div>
          <h3 class="day-card__title">{{ day.title }}</h3>
          <p class="day-card__description">{{ day.description }}</p>
          <div class="day-card__meta">
            <UiTag size="sm" variant="info">{{ day.content_count }} contenidos</UiTag>
            <UiTag size="sm" :variant="day.has_checkin ? 'success' : 'default'">
              {{ day.has_checkin ? 'Con check-in' : 'Sin check-in' }}
            </UiTag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const activeTab = ref('info')

const tabs = [
  { value: 'info', label: 'Informacion' },
  { value: 'days', label: 'Dias del programa' },
]

const form = reactive({
  title: 'Reto 21 dias de meditacion',
  description: 'Un reto disenado para construir el habito de la meditacion. Cada dia incluye una sesion guiada, un ejercicio de reflexion y un check-in de progreso.',
  cover_url: 'https://images.tupotencial.app/programs/meditacion-21.jpg',
  objectives: 'Establecer una practica diaria de meditacion\nReducir niveles de estres y ansiedad\nMejorar la concentracion y claridad mental\nDesarrollar mayor consciencia emocional',
  program_type: 'challenge',
  duration_days: '21',
  difficulty: 'beginner',
  segment: 'premium',
  status: 'active',
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

const programDays = ref([
  { day_number: 1, title: 'Introduccion a la meditacion', description: 'Aprende los fundamentos de la practica meditativa y realiza tu primera sesion guiada de 5 minutos.', content_count: 3, has_checkin: true },
  { day_number: 2, title: 'Respiracion consciente', description: 'Explora tecnicas de respiracion que te ayudaran a centrar tu atencion y calmar la mente.', content_count: 2, has_checkin: true },
  { day_number: 3, title: 'El escaneo corporal', description: 'Practica la tecnica del body scan para conectar con las sensaciones de tu cuerpo.', content_count: 2, has_checkin: true },
  { day_number: 4, title: 'Meditacion caminando', description: 'Descubre como meditar en movimiento con una practica guiada de caminata consciente.', content_count: 3, has_checkin: true },
  { day_number: 5, title: 'Manejo de pensamientos', description: 'Aprende a observar tus pensamientos sin juzgarlos ni engancharte en ellos.', content_count: 2, has_checkin: true },
])

function addDay() {
  const nextDay = programDays.value.length + 1
  programDays.value.push({
    day_number: nextDay,
    title: `Dia ${nextDay} - Nuevo`,
    description: 'Descripcion del dia...',
    content_count: 0,
    has_checkin: false,
  })
}

function editDay(day: any) {
  alert(`Editar dia ${day.day_number}: ${day.title} (mock)`)
}

function handleSave() {
  alert('Programa actualizado (mock)')
}

function handleDuplicate() {
  alert(`Programa duplicado como "Copia de ${form.title}" (mock)`)
  navigateTo('/admin/programs/new')
}

function handleDelete() {
  if (confirm('Seguro que deseas eliminar este programa?')) {
    alert('Programa eliminado (mock)')
    navigateTo('/admin/programs')
  }
}
</script>

<style scoped>
.tab-content {
  margin-top: var(--space-6);
}

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

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.days-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.days-header__title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
}

.days-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.day-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
}

.day-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.day-card__number {
  color: var(--color-primary);
}

.day-card__title {
  font-family: var(--font-body);
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  margin-bottom: var(--space-1);
}

.day-card__description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
}

.day-card__meta {
  display: flex;
  gap: var(--space-2);
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
}
</style>
