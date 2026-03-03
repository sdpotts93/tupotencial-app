<template>
  <div class="screen">
    <div class="screen__content">
      <header class="library__header">
        <h1 class="library__title">Biblioteca</h1>
        <button v-if="!searching" class="library__search-btn" aria-label="Buscar" @click="openSearch">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span class="library__search-btn-label">Buscar</span>
        </button>
        <button v-else class="library__search-btn" aria-label="Cerrar búsqueda" @click="closeSearch">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <span class="library__search-btn-label">Cerrar</span>
        </button>
      </header>

      <!-- Inline search -->
      <div v-if="searching" class="library__search">
        <UiInput
          ref="searchInputRef"
          v-model="query"
          placeholder="Buscar contenido..."
          type="search"
          class="library__search-input"
        >
          <template #prefix>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </template>
        </UiInput>

        <div v-if="query" class="library__search-results">
          <p v-if="filteredResults.length" class="eyebrow library__search-results-label">RESULTADOS</p>

          <div class="library__search-list">
            <NuxtLink
              v-for="item in filteredResults"
              :key="item.id"
              :to="`/content/${item.id}`"
              class="library__search-item"
            >
              <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="library__search-item-thumb" />
              <div class="library__search-item-body">
                <h3 class="library__search-item-name">{{ item.title }}</h3>
                <p class="library__search-item-meta">{{ item.meta }}</p>
                <span class="library__search-item-category">{{ item.category }}</span>
              </div>
            </NuxtLink>
          </div>

          <UiEmptyState v-if="!filteredResults.length" title="Sin resultados" description="Intenta con otros términos de búsqueda." />
        </div>
      </div>

      <!-- Library content (hidden while searching) -->
      <template v-else>
        <!-- Tabs -->
        <UiTabs v-model="activeTab" :tabs="tabs" />

        <!-- ═══════════ TAB: Categorías ═══════════ -->
        <template v-if="activeTab === 'categorias'">
          <!-- Featured / hero -->
          <section class="library__featured">
            <h2 class="library__section-title">Destacado</h2>
            <NuxtLink to="/content/mock-content-001" class="library__featured-card">
              <img src="/images/lib-1.jpg" alt="" class="library__featured-img" />
              <div class="library__featured-info">
                <span class="library__featured-eyebrow">Meditación • 10 min</span>
                <h3 class="library__featured-name">Respiración consciente</h3>
                <p class="library__featured-desc">Reconecta con tu cuerpo y tu calma en 10 minutos.</p>
              </div>
            </NuxtLink>
          </section>

          <!-- Categories -->
          <section v-for="cat in categories" :key="cat.slug" class="library__section">
            <div class="section__header">
              <h2 class="library__section-title">{{ cat.title }}</h2>
              <NuxtLink :to="`/library/c/${cat.slug}`" class="library__see-all">Ver todo</NuxtLink>
            </div>
            <div class="library__scroll">
              <NuxtLink
                v-for="item in cat.items"
                :key="item.id"
                :to="`/content/${item.id}`"
                class="library__scroll-card"
              >
                <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="library__scroll-img" />
                <div class="library__scroll-info">
                  <span class="library__scroll-title">{{ item.title }}</span>
                  <span v-if="item.duration" class="library__scroll-duration">
                    <Icon class="clock-icon" name="lucide:clock" size="12" /> {{ item.duration }}
                  </span>
                </div>
              </NuxtLink>
            </div>
          </section>

          <!-- Eventos Grabados -->
          <section class="library__section">
            <div class="section__header">
              <h2 class="library__section-title">Eventos Grabados</h2>
              <NuxtLink to="/events" class="library__see-all">Ver todo</NuxtLink>
            </div>
            <div class="library__scroll">
              <NuxtLink
                v-for="ev in recordedEvents"
                :key="ev.id"
                :to="`/events/${ev.id}`"
                class="library__scroll-card"
              >
                <img :src="ev.img" :alt="ev.title" loading="lazy" class="library__scroll-img" />
                <div class="library__scroll-info">
                  <span class="library__scroll-title">{{ ev.title }}</span>
                  <span class="library__scroll-duration">
                    <Icon class="clock-icon" name="lucide:clock" size="12" /> {{ ev.dateLabel }}
                  </span>
                </div>
              </NuxtLink>
            </div>
          </section>
        </template>

        <!-- ═══════════ TAB: Programas ═══════════ -->
        <template v-if="activeTab === 'programas'">
          <p class="library__tab-intro">Contenido incluido en cada programa, reto o bootcamp.</p>

          <section v-for="prog in programsWithContent" :key="prog.id" class="library__section">
            <div class="section__header">
              <div class="library__prog-header">
                <h2 class="library__section-title library__section-title--prog">{{ prog.title }}</h2>
                <div class="library__prog-tags">
                  <span class="library__prog-badge">{{ prog.typeLabel }}</span>
                  <span :class="['library__prog-status', prog.enrolled ? 'library__prog-status--inscrito' : (prog.free ? 'library__prog-status--gratis' : 'library__prog-status--core')]">
                    {{ prog.enrolled ? 'Inscrito' : (prog.free ? 'Gratis' : 'Core') }}
                  </span>
                </div>
              </div>
              <NuxtLink :to="`/retos/${prog.id}`" class="library__see-all">Ver programa</NuxtLink>
            </div>
            <div class="library__scroll">
              <NuxtLink
                v-for="item in prog.items"
                :key="item.id"
                :to="`/content/${item.id}`"
                class="library__scroll-card"
              >
                <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="library__scroll-img" />
                <div class="library__scroll-info">
                  <span class="library__scroll-title">{{ item.title }}</span>
                  <span v-if="item.duration" class="library__scroll-duration">
                    <Icon class="clock-icon" name="lucide:clock" size="12" /> {{ item.duration }}
                  </span>
                </div>
              </NuxtLink>
            </div>
          </section>
        </template>

        <!-- ═══════════ TAB: Objetivos ═══════════ -->
        <template v-if="activeTab === 'objetivos'">
          <p class="library__tab-intro">Encuentra contenido según lo que quieres trabajar.</p>

          <div class="library__objectives-grid">
            <NuxtLink
              v-for="obj in objectives"
              :key="obj.slug"
              :to="`/library/o/${obj.slug}`"
              class="library__objective-card"
            >
              <div class="library__objective-icon-wrap">
                <Icon :name="obj.icon" size="22" class="library__objective-icon" />
              </div>
              <div class="library__objective-body">
                <h3 class="library__objective-name">{{ obj.title }}</h3>
                <p class="library__objective-desc">{{ obj.description }}</p>
              </div>
              <span class="library__objective-count">{{ obj.count }} {{ obj.count === 1 ? 'contenido' : 'contenidos' }}</span>
            </NuxtLink>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const searching = ref(false)
const query = ref('')
const searchInputRef = ref()
const route = useRoute()
const router = useRouter()
const activeTab = ref((route.query.tab as string) || 'categorias')

watch(activeTab, (tab) => {
  router.replace({ query: tab === 'categorias' ? {} : { tab } })
})

const tabs = [
  { value: 'categorias', label: 'Categorías' },
  { value: 'programas', label: 'Programas' },
  { value: 'objetivos', label: 'Objetivos' },
]

function openSearch() {
  searching.value = true
  nextTick(() => {
    searchInputRef.value?.$el?.querySelector('input')?.focus()
  })
}

function closeSearch() {
  searching.value = false
  query.value = ''
}

// ─── Search data ───
const allContent = [
  { id: 'mock-content-001', title: 'Respiración consciente', meta: '10 min • Audio', category: 'Meditación', thumbnail: '/images/lib-1.jpg' },
  { id: 'mock-content-002', title: 'Escaneo corporal', meta: '15 min • Audio', category: 'Meditación', thumbnail: '/images/lib-2.jpg' },
  { id: 'mock-content-003', title: 'Atención plena', meta: '8 min • Video', category: 'Mindfulness', thumbnail: '/images/lib-3.jpg' },
  { id: 'mock-content-004', title: 'Despertar con energía', meta: '12 min • Video', category: 'Rutinas De Mañana', thumbnail: '/images/lib-5.jpg' },
  { id: 'mock-content-005', title: 'Diario de gratitud', meta: '5 min • Texto', category: 'Rutinas De Mañana', thumbnail: '/images/lib-6.jpg' },
  { id: 'mock-content-006', title: 'Mentalidad de crecimiento', meta: '20 min • Video', category: 'Crecimiento Personal', thumbnail: '/images/lib-7.jpg' },
  { id: 'mock-content-007', title: 'Hábitos atómicos', meta: '8 min • Texto', category: 'Crecimiento Personal', thumbnail: '/images/lib-2.jpg' },
]

const filteredResults = computed(() => {
  const q = query.value.toLowerCase()
  return allContent.filter(c =>
    c.title.toLowerCase().includes(q)
    || c.meta.toLowerCase().includes(q)
    || c.category.toLowerCase().includes(q),
  )
})

// ─── Tab: Categorías ───
const recordedEvents = ref([
  { id: 'mock-event-003', title: 'Live: Respiración y estrés', dateLabel: '15 Feb 2026', img: '/images/lib-2.jpg' },
  { id: 'mock-event-004', title: 'Taller: Diario de gratitud', dateLabel: '8 Feb 2026', img: '/images/lib-6.jpg' },
  { id: 'mock-event-005', title: 'Q&A: Hábitos de alto rendimiento', dateLabel: '1 Feb 2026', img: '/images/lib-8.jpg' },
])

const categories = ref([
  {
    title: 'Meditaciones',
    slug: 'meditaciones',
    items: [
      { id: 'mock-content-001', title: 'Respiración consciente', typeLabel: 'Audio', duration: '10 min', thumbnail: '/images/lib-1.jpg' },
      { id: 'mock-content-002', title: 'Escaneo corporal', typeLabel: 'Audio', duration: '15 min', thumbnail: '/images/lib-2.jpg' },
      { id: 'mock-content-003', title: 'Atención plena', typeLabel: 'Video', duration: '8 min', thumbnail: '/images/lib-3.jpg' },
    ],
  },
  {
    title: 'Rutinas de mañana',
    slug: 'rutinas-manana',
    items: [
      { id: 'mock-content-004', title: 'Despertar con energía', typeLabel: 'Video', duration: '12 min', thumbnail: '/images/lib-5.jpg' },
      { id: 'mock-content-005', title: 'Diario de gratitud', typeLabel: 'Texto', duration: '5 min', thumbnail: '/images/lib-6.jpg' },
    ],
  },
  {
    title: 'Crecimiento personal',
    slug: 'crecimiento-personal',
    items: [
      { id: 'mock-content-006', title: 'Mentalidad de crecimiento', typeLabel: 'Video', duration: '20 min', thumbnail: '/images/lib-7.jpg' },
      { id: 'mock-content-007', title: 'Hábitos atómicos', typeLabel: 'Texto', duration: '8 min', thumbnail: '/images/lib-2.jpg' },
    ],
  },
])

// ─── Tab: Programas ───
// Mock: content grouped by program (simulates program → days → day_items → content join)
const programsWithContent = ref([
  {
    id: 'mock-uuid-prog-001',
    type: 'reto',
    typeLabel: 'RETO',
    title: 'Reto 7 días de gratitud',
    enrolled: true,
    free: true,
    items: [
      { id: 'mock-content-001', title: 'Meditación matutina: Gratitud y presencia', duration: '10 min', thumbnail: '/images/lib-1.jpg' },
      { id: 'mock-content-006', title: 'Las 5 preguntas que transforman tu mañana', duration: '5 min lectura', thumbnail: '/images/lib-6.jpg' },
      { id: 'mock-content-004', title: 'Meditación nocturna: Soltar el día', duration: '15 min', thumbnail: '/images/lib-3.jpg' },
    ],
  },
  {
    id: 'mock-uuid-prog-002',
    type: 'program',
    typeLabel: 'PROGRAMA',
    title: 'Despertar consciente',
    enrolled: true,
    free: false,
    items: [
      { id: 'mock-content-002', title: 'Rutina energizante de 5 minutos', duration: '5 min', thumbnail: '/images/lib-5.jpg' },
      { id: 'mock-content-001', title: 'Meditación matutina: Gratitud y presencia', duration: '10 min', thumbnail: '/images/lib-1.jpg' },
      { id: 'mock-content-006', title: 'Las 5 preguntas que transforman tu mañana', duration: '5 min lectura', thumbnail: '/images/lib-6.jpg' },
    ],
  },
  {
    id: 'mock-uuid-prog-003',
    type: 'bootcamp',
    typeLabel: 'BOOTCAMP',
    title: 'Liderazgo interior',
    enrolled: false,
    free: false,
    items: [
      { id: 'mock-content-005', title: 'Visualización guiada: Tu mejor versión', duration: '15 min', thumbnail: '/images/lib-7.jpg' },
      { id: 'mock-content-006', title: 'Las 5 preguntas que transforman tu mañana', duration: '5 min lectura', thumbnail: '/images/lib-6.jpg' },
    ],
  },
])

// ─── Tab: Objetivos ───
const objectives = ref([
  {
    slug: 'reducir-estres',
    title: 'Reducir estrés',
    description: 'Técnicas para calmar la mente y soltar la tensión acumulada.',
    icon: 'lucide:wind',
    count: 6,
  },
  {
    slug: 'rutina-matutina',
    title: 'Rutina matutina',
    description: 'Empieza cada día con intención, energía y claridad.',
    icon: 'lucide:sunrise',
    count: 4,
  },
  {
    slug: 'crecimiento-personal',
    title: 'Crecimiento personal',
    description: 'Herramientas para tu desarrollo integral como ser humano.',
    icon: 'lucide:sprout',
    count: 5,
  },
  {
    slug: 'inteligencia-emocional',
    title: 'Inteligencia emocional',
    description: 'Reconoce, entiende y gestiona tus emociones.',
    icon: 'lucide:heart',
    count: 3,
  },
  {
    slug: 'mindfulness',
    title: 'Mindfulness',
    description: 'Prácticas de atención plena para vivir el presente.',
    icon: 'lucide:brain',
    count: 4,
  },
  {
    slug: 'habitos-positivos',
    title: 'Hábitos positivos',
    description: 'Construye rutinas que transformen tu vida paso a paso.',
    icon: 'lucide:repeat',
    count: 3,
  },
])
</script>

<style scoped>
/* ─── Header ─── */
.library__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
  position: relative;
}

.library__title {
  font-family: var(--font-eyebrow);
  font-size: 14px;
  text-transform: uppercase;
}

.library__search-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  position: absolute;
  right: 0;
  -webkit-tap-highlight-color: transparent;
}
.library__search-btn-label { display: none; }
.library__search-btn:hover { background: rgba(var(--tint-rgb), 0.06); }

/* ─── Inline search ─── */
.library__search-input { margin-bottom: var(--space-6); }

.library__search-input :deep(.input-field__input) {
  color: var(--color-text);
}

.library__search-results-label { margin-bottom: var(--space-4); }

.library__search-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.library__search-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  text-decoration: none;
  color: var(--color-text);
}

.library__search-item-thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  object-fit: cover;
  flex-shrink: 0;
}

.library__search-item-body {
  flex: 1;
  min-width: 0;
}

.library__search-item-name {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  margin-bottom: 2px;
}

.library__search-item-meta {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: 4px;
}

.library__search-item-category {
  display: inline-block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  color: var(--color-sand);
}

/* ─── Tab intro text ─── */
.library__tab-intro {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin: var(--space-5) 0 var(--space-2);
}

/* ─── Section titles ─── */
.library__section-title {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--space-3);
}

.library__section-title--prog {
  margin-bottom: 0;
}

/* ─── Featured ─── */
.library__featured { margin-bottom: var(--space-8); margin-top: var(--space-5); }

.library__featured-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: var(--radius-2xl);
  text-decoration: none;
  color: var(--color-text);
}

.library__featured-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-2xl);
}

.library__featured-info {
  padding: var(--space-4) var(--space-1) 0;
}

.library__featured-eyebrow {
  display: block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--space-1);
}

.library__featured-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  margin: 0 0 var(--space-1);
  line-height: var(--leading-snug);
}

.library__featured-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

/* ─── Sections ─── */
.library__section { margin-bottom: var(--space-8); }

.section__header {
  align-items: baseline;
  margin-bottom: var(--space-4);
}

.library__see-all {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  text-decoration: none;
}

/* ─── Horizontal scroll ─── */
.library__scroll {
  display: flex;
  gap: var(--space-3);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline-start: var(--space-5);
  -webkit-overflow-scrolling: touch;
  margin: 0 calc(-1 * var(--space-5));
  scrollbar-width: none;
}

.library__scroll::before,
.library__scroll::after {
  content: '';
  flex: 0 0 var(--space-5);
}

.library__scroll::-webkit-scrollbar { display: none; }

.library__scroll-card {
  flex: 0 0 60%;
  scroll-snap-align: start;
  text-decoration: none;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.library__scroll-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-xl);
}

.library__scroll-info {
  padding: var(--space-3) var(--space-1) 0;
}

.library__scroll-title {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.library__scroll-duration {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--color-muted);
  margin-top: var(--space-1);
  font-family: var(--font-eyebrow);
  text-transform: uppercase;
}

/* ─── Programs tab: header + badge ─── */
.library__prog-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.library__prog-tags {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.library__prog-badge {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  white-space: nowrap;
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
}

.library__prog-status {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.library__prog-status--core {
  background: var(--color-gold-bg);
  color: var(--color-gold);
}

.library__prog-status--gratis {
  background: var(--color-silver-bg);
  color: var(--color-silver);
}

.library__prog-status--inscrito {
  background: var(--color-complete-bg);
  color: var(--color-complete);
}

/* ─── Objectives tab: grid ─── */
.library__objectives-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.library__objective-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  background: var(--color-surface-alt);
  text-decoration: none;
  color: var(--color-text);
  transition: background var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}

.library__objective-card:hover {
  background: var(--color-surface);
}

.library__objective-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: rgba(var(--tint-rgb), 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-3);
  color: var(--color-text-secondary);
}

.library__objective-body {
  flex: 1;
  min-width: 0;
}

.library__objective-name {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  margin-bottom: var(--space-1);
}

.library__objective-desc {
  font-size: var(--text-xs);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.library__objective-count {
  display: block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-medium);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-sand);
  margin-top: var(--space-3);
}


/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .library__header {
    justify-content: flex-start;
    gap: var(--space-4);
  }

  .library__title {
    font-size: var(--text-lg);
    display: none; /* title shown in top bar */
  }

  .library__search-btn {
    position: static;
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-md);
    width: auto;
    height: 36px;
    padding: 0 var(--space-3);
    gap: var(--space-2);
    color: var(--color-muted);
  }

  .library__search-btn:hover {
    border-color: var(--color-border);
    color: var(--color-text);
  }

  .library__search-btn-label {
    display: inline;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }

  .library__featured-card {
    flex-direction: row;
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .library__featured-img {
    width: 520px;
    aspect-ratio: 4 / 3;
    border-radius: var(--radius-lg);
    margin: var(--space-4);
    flex-shrink: 0;
  }

  .library__featured-info {
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0 auto;
  }

  .library__scroll {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-4);
    overflow-x: visible;
    margin: 0;
  }

  .library__scroll::before,
  .library__scroll::after {
    display: none;
  }

  .library__scroll-card {
    flex: none;
    min-width: 0;
  }

  .library__scroll-img {
    border-radius: var(--radius-lg);
  }

  .library__search-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .library__search-item {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-4);
    transition: border-color var(--transition-fast);
  }

  .library__search-item:hover {
    border-color: var(--color-border);
  }

  /* Objectives: 3 columns on desktop */
  .library__objectives-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }

  .library__objective-card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    transition: border-color var(--transition-fast), background var(--transition-fast);
  }

  .library__objective-card:hover {
    border-color: var(--color-border);
    background: var(--color-desktop-card);
  }
}
</style>
