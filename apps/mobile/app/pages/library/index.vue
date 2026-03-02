<template>
  <div class="screen">
    <div class="screen__content">
      <header class="library__header">
        <h1 class="library__title">Biblioteca</h1>
        <NuxtLink to="/library/search" class="library__search-btn" aria-label="Buscar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </NuxtLink>
      </header>

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
    </div>
  </div>
</template>

<script setup lang="ts">
function contentTypeIcon(typeLabel: string) {
  switch (typeLabel.toLowerCase()) {
    case 'video': return 'lucide:video'
    case 'audio': return 'lucide:headphones'
    case 'texto': return 'lucide:file-text'
    default: return 'lucide:file'
  }
}

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
</script>

<style scoped>
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
  border-radius: var(--radius-md);
  position: absolute;
  right: 0;
}
.library__search-btn:hover { background: rgba(0, 0, 0, 0.06); }

.library__section-title {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--space-3);
}

.library__featured { margin-bottom: var(--space-8); }

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
    width: 36px;
    height: 36px;
    color: var(--color-muted);
  }

  .library__search-btn:hover {
    border-color: var(--color-border);
    color: var(--color-text);
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
}
</style>
