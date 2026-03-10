<template>
  <div class="screen">
    <div class="screen__content">
      <header class="obj__header">
        <NuxtLink to="/cuenta/biblioteca" class="obj__back" aria-label="Volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </NuxtLink>
        <h1 class="obj__title">{{ objective.title }}</h1>
      </header>

      <p v-if="objective.description" class="obj__description">{{ objective.description }}</p>

      <div class="obj__list">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          :to="`/cuenta/contenido/${item.id}`"
          class="obj__item"
        >
          <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="obj__item-thumb" />
          <div class="obj__item-body">
            <h3 class="obj__item-name">{{ item.title }}</h3>
            <p class="obj__item-meta">{{ item.meta }}</p>
            <span class="obj__item-tag">{{ objective.title }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

// Mock objectives lookup (matches library/index.vue objectives)
const objectivesMap: Record<string, { title: string; description: string }> = {
  'reducir-estres': {
    title: 'Reducir estrés',
    description: 'Técnicas para calmar la mente y soltar la tensión acumulada.',
  },
  'rutina-matutina': {
    title: 'Rutina matutina',
    description: 'Empieza cada día con intención, energía y claridad.',
  },
  'crecimiento-personal': {
    title: 'Crecimiento personal',
    description: 'Herramientas para tu desarrollo integral como ser humano.',
  },
  'inteligencia-emocional': {
    title: 'Inteligencia emocional',
    description: 'Reconoce, entiende y gestiona tus emociones.',
  },
  'mindfulness': {
    title: 'Mindfulness',
    description: 'Prácticas de atención plena para vivir el presente.',
  },
  'habitos-positivos': {
    title: 'Hábitos positivos',
    description: 'Construye rutinas que transformen tu vida paso a paso.',
  },
}

const objective = computed(() => {
  if (objectivesMap[slug]) return objectivesMap[slug]
  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: '',
  }
})

interface ContentItem { id: string; title: string; meta: string; thumbnail: string }

// Mock content per objective (simulates content_item_objectives join)
const contentByObjective: Record<string, ContentItem[]> = {
  'reducir-estres': [
    { id: 'mock-content-001', title: 'Respiración consciente', meta: '10 min • Audio', thumbnail: '/images/lib-1.jpg' },
    { id: 'mock-content-002', title: 'Escaneo corporal', meta: '15 min • Audio', thumbnail: '/images/lib-2.jpg' },
    { id: 'mock-content-003', title: 'Respiración 4-7-8 para calmar la ansiedad', meta: '8 min • Video', thumbnail: '/images/lib-3.jpg' },
    { id: 'mock-content-004', title: 'Meditación nocturna: Soltar el día', meta: '15 min • Audio', thumbnail: '/images/lib-5.jpg' },
    { id: 'mock-content-005', title: 'Body scan: Reconecta con tu cuerpo', meta: '20 min • Audio', thumbnail: '/images/lib-6.jpg' },
    { id: 'mock-content-006', title: 'Guía rápida: Cómo crear un espacio sagrado en casa', meta: '5 min • Texto', thumbnail: '/images/lib-7.jpg' },
  ],
  'rutina-matutina': [
    { id: 'mock-content-004', title: 'Despertar con energía', meta: '12 min • Video', thumbnail: '/images/lib-5.jpg' },
    { id: 'mock-content-005', title: 'Las 5 preguntas que transforman tu mañana', meta: '5 min • Texto', thumbnail: '/images/lib-6.jpg' },
    { id: 'mock-content-001', title: 'Meditación matutina: Gratitud y presencia', meta: '10 min • Video', thumbnail: '/images/lib-1.jpg' },
    { id: 'mock-content-002', title: 'Rutina energizante de 5 minutos', meta: '5 min • Video', thumbnail: '/images/lib-2.jpg' },
  ],
  'crecimiento-personal': [
    { id: 'mock-content-006', title: 'Mentalidad de crecimiento', meta: '20 min • Video', thumbnail: '/images/lib-7.jpg' },
    { id: 'mock-content-007', title: 'Hábitos atómicos', meta: '8 min • Texto', thumbnail: '/images/lib-2.jpg' },
    { id: 'mock-content-005', title: 'Visualización guiada: Tu mejor versión', meta: '15 min • Audio', thumbnail: '/images/lib-3.jpg' },
    { id: 'mock-content-008', title: 'Las 5 preguntas que transforman tu mañana', meta: '5 min • Texto', thumbnail: '/images/lib-6.jpg' },
    { id: 'mock-content-009', title: 'Artículo: La ciencia detrás de los hábitos', meta: 'Lectura externa', thumbnail: '/images/lib-8.jpg' },
  ],
  'inteligencia-emocional': [
    { id: 'mock-content-006', title: 'Mentalidad de crecimiento', meta: '20 min • Video', thumbnail: '/images/lib-7.jpg' },
    { id: 'mock-content-001', title: 'Respiración consciente', meta: '10 min • Audio', thumbnail: '/images/lib-1.jpg' },
    { id: 'mock-content-005', title: 'Visualización guiada: Tu mejor versión', meta: '15 min • Audio', thumbnail: '/images/lib-3.jpg' },
  ],
  'mindfulness': [
    { id: 'mock-content-001', title: 'Respiración consciente', meta: '10 min • Audio', thumbnail: '/images/lib-1.jpg' },
    { id: 'mock-content-003', title: 'Atención plena', meta: '8 min • Video', thumbnail: '/images/lib-3.jpg' },
    { id: 'mock-content-005', title: 'Body scan: Reconecta con tu cuerpo', meta: '20 min • Audio', thumbnail: '/images/lib-6.jpg' },
    { id: 'mock-content-002', title: 'Escaneo corporal', meta: '15 min • Audio', thumbnail: '/images/lib-2.jpg' },
  ],
  'habitos-positivos': [
    { id: 'mock-content-007', title: 'Hábitos atómicos', meta: '8 min • Texto', thumbnail: '/images/lib-2.jpg' },
    { id: 'mock-content-009', title: 'Artículo: La ciencia detrás de los hábitos', meta: 'Lectura externa', thumbnail: '/images/lib-8.jpg' },
    { id: 'mock-content-004', title: 'Despertar con energía', meta: '12 min • Video', thumbnail: '/images/lib-5.jpg' },
  ],
}

const items = ref(contentByObjective[slug] ?? [
  { id: 'mock-content-001', title: 'Respiración consciente', meta: '10 min • Audio', thumbnail: '/images/lib-1.jpg' },
  { id: 'mock-content-003', title: 'Atención plena', meta: '8 min • Video', thumbnail: '/images/lib-3.jpg' },
])
</script>

<style scoped>
/* ─── Header ─── */
.obj__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
  position: relative;
}

.obj__title {
  font-family: var(--font-eyebrow);
  font-size: 14px;
  text-transform: uppercase;
}

.obj__back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dark-lighter);
  border-radius: var(--radius-md);
  position: absolute;
  left: 0;
}
.obj__back:hover { background: rgba(var(--tint-rgb), 0.06); }

/* ─── Description ─── */
.obj__description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-6);
}

/* ─── Item list ─── */
.obj__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.obj__item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  text-decoration: none;
  color: var(--color-text);
}
.obj__item:hover { text-decoration: none; }

.obj__item-thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  object-fit: cover;
  flex-shrink: 0;
}

.obj__item-body {
  flex: 1;
  min-width: 0;
}

.obj__item-name {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  margin-bottom: 2px;
}

.obj__item-meta {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: 4px;
}

.obj__item-tag {
  display: inline-block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  color: var(--color-sand);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .obj__header {
    justify-content: flex-start;
  }

  .obj__title {
    display: none;
  }

  .obj__back {
    display: none;
  }

  .obj__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .obj__item {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-4);
    transition: border-color var(--transition-fast);
  }

  .obj__item:hover {
    border-color: var(--color-border);
  }
}
</style>
