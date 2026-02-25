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
        <h2 class="title title--md">Destacado</h2>
        <NuxtLink to="/content/mock-content-001" class="library__featured-card">
          <img src="/images/lib-1.jpg" alt="" class="library__featured-img" />
          <div class="library__featured-overlay">
            <span class="library__featured-eyebrow">Meditación • 10 min</span>
            <h3 class="library__featured-name">Respiración consciente</h3>
            <p class="library__featured-desc">Reconecta con tu cuerpo y tu calma en 10 minutos.</p>
          </div>
        </NuxtLink>
      </section>

      <!-- Categories -->
      <section v-for="cat in categories" :key="cat.slug" class="library__section">
        <div class="section__header">
          <h2 class="title title--md">{{ cat.title }}</h2>
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
            <div class="library__scroll-overlay">
              <Icon :name="contentTypeIcon(item.typeLabel)" size="14" class="library__scroll-type-label" />
              <span class="library__scroll-title">{{ item.title }}</span>
              <span v-if="item.duration" class="library__scroll-duration">
                <Icon class="clock-icon" name="lucide:clock" size="12" /> {{ item.duration }}
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
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  position: absolute;
  right: 0;
}
.library__search-btn:hover { background: rgba(255, 255, 255, 0.1); }

.library__featured { margin-bottom: var(--space-8); }
.library__featured > .title { margin-bottom: var(--space-4); }

.library__featured-card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  text-decoration: none;
  color: white;
  background: #000;
}

.library__featured-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: bottom;
}

.library__featured-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-5);
  backdrop-filter: blur(8px);
  background: #282828c7;
}

.library__featured-eyebrow {
  display: block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: white;
  margin-bottom: var(--space-1);
}

.library__featured-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: white;
  margin: 0 0 var(--space-1);
  line-height: var(--leading-snug);
}

.library__featured-desc {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.7);
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
  color: white;
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
  flex: 0 0 85%;
  scroll-snap-align: start;
  text-decoration: none;
  color: white;
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  aspect-ratio: 3 / 2;
}

.library__scroll-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.library__scroll-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-5);
  background: linear-gradient(to top, rgb(0 0 0) 0%, rgb(0 0 0 / 60%) 36%, transparent 100%);
}

.library__scroll-type-label {
  position: absolute;
  bottom: var(--space-5);
  right: var(--space-5);
  padding: var(--space-1);
  border-radius: 4px;
  font-size: 10px;
  font-family: var(--font-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.library__scroll-title {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  font-weight: var(--weight-bold);
  line-height: var(--leading-snug);
  color: white;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: var(--space-1);
}

.library__scroll-duration {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: var(--space-2);
  font-family: var(--font-eyebrow);
}


/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .library__scroll {
    flex-wrap: wrap;
    overflow-x: visible;
    margin: 0;
  }

  .library__scroll::before,
  .library__scroll::after {
    display: none;
  }

  .library__scroll-card {
    min-width: 200px;
    max-width: none;
    flex: 1 1 200px;
  }
}
</style>
