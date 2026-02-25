<template>
  <div class="screen">
    <div class="screen__content">
      <h1 class="title title--lg">Retos y Programas</h1>
      <p class="retos__subtitle">Programas guiados de 7, 15 y 30 días para construir hábitos con estructura y constancia.</p>

      <!-- Tabs (inspired by inspiration-retos) -->
      <UiTabs v-model="activeTab" :tabs="tabs" />

      <!-- Programs list -->
      <div class="retos__list">
        <UiCard
          v-for="item in filteredPrograms"
          :key="item.id"
          variant="default"
          clickable
          :to="`/retos/${item.id}`"
          class="retos__card"
        >
          <template #media>
            <div class="retos__media" :style="{ background: item.bg }">
              <span class="retos__media-type">{{ item.typeLabel }}</span>
            </div>
          </template>
          <p class="eyebrow eyebrow--sm">{{ item.typeLabel }} • {{ item.duration }}</p>
          <h3 class="retos__card-title">{{ item.title }}</h3>
          <p class="retos__card-desc">{{ item.description }}</p>
          <template #footer>
            <div class="retos__card-footer">
              <UiTag v-if="item.enrolled" variant="success">Inscrito</UiTag>
              <UiTag v-else variant="accent">{{ item.free ? 'Gratis' : 'Core' }}</UiTag>
              <span v-if="item.progress" class="retos__progress-text">{{ item.progress }}</span>
            </div>
          </template>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const activeTab = ref('all')

const tabs = [
  { value: 'all', label: 'Todos' },
  { value: 'program', label: 'Programas' },
  { value: 'reto', label: 'Retos' },
  { value: 'bootcamp', label: 'Bootcamps' },
]

const programs = ref([
  {
    id: 'mock-prog-001', type: 'reto', typeLabel: 'RETO', title: 'Reto 7 días de gratitud',
    description: 'Transforma tu perspectiva con un ejercicio diario de agradecimiento.',
    duration: '7 días', bg: 'linear-gradient(135deg, #384637, #A7A68E)', enrolled: true, free: true, progress: 'Día 5/7',
  },
  {
    id: 'mock-prog-002', type: 'program', typeLabel: 'PROGRAMA', title: 'Despertar consciente',
    description: 'Un programa de 30 días para desarrollar una rutina matutina transformadora.',
    duration: '30 días', bg: 'linear-gradient(135deg, #28374A, #384637)', enrolled: true, free: false, progress: 'Día 12/30',
  },
  {
    id: 'mock-prog-003', type: 'reto', typeLabel: 'RETO', title: 'Reto 15 días sin quejas',
    description: 'Desarrolla consciencia sobre tu lenguaje interno y externo.',
    duration: '15 días', bg: 'linear-gradient(135deg, #282828, #28374A)', enrolled: false, free: true, progress: null,
  },
  {
    id: 'mock-prog-004', type: 'bootcamp', typeLabel: 'BOOTCAMP', title: 'Liderazgo interior',
    description: 'Intensivo de 5 días para descubrir tu estilo de liderazgo.',
    duration: '5 días', bg: 'linear-gradient(135deg, #A7A68E, #282828)', enrolled: false, free: false, progress: null,
  },
  {
    id: 'mock-prog-005', type: 'program', typeLabel: 'PROGRAMA', title: 'Equilibrio emocional',
    description: 'Aprende técnicas para manejar tus emociones día a día.',
    duration: '30 días', bg: 'linear-gradient(135deg, #384637, #28374A)', enrolled: false, free: false, progress: null,
  },
])

const filteredPrograms = computed(() => {
  if (activeTab.value === 'all') return programs.value
  return programs.value.filter(p => p.type === activeTab.value)
})
</script>

<style scoped>
.retos__subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-2) 0 var(--space-5);
}

.retos__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-5);
}

.retos__media {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  padding: var(--space-3);
}

.retos__media-type {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.06em;
}

.retos__card-title {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  margin: var(--space-1) 0;
}

.retos__card-desc {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.6);
  line-height: var(--leading-normal);
}

.retos__card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.retos__progress-text {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: rgba(255, 255, 255, 0.6);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .retos__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
