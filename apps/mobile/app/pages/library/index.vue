<template>
  <div class="screen">
    <div class="screen__content">
      <header class="library__header">
        <h1 class="title title--lg">Biblioteca</h1>
        <NuxtLink to="/library/search" class="library__search-btn" aria-label="Buscar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </NuxtLink>
      </header>

      <!-- Featured / hero (inspired by inspiration-library) -->
      <section class="library__featured">
        <p class="eyebrow">DESTACADO</p>
        <UiCard variant="dark" clickable to="/content/mock-content-001">
          <template #media>
            <div class="library__featured-media">
              <img src="/logo-icon/logo-icon-white.png" alt="" class="library__featured-logo" />
            </div>
          </template>
          <p class="eyebrow eyebrow--sm" style="color: var(--color-sand)">MEDITACIÓN • 10 MIN</p>
          <h2 style="font-family: var(--font-title); font-size: var(--title-sm); color: var(--color-light);">
            Respiración consciente
          </h2>
          <p style="font-size: var(--text-sm); color: var(--color-sand);">
            Reconecta con tu cuerpo y tu calma en 10 minutos.
          </p>
        </UiCard>
      </section>

      <!-- Categories -->
      <section v-for="cat in categories" :key="cat.slug" class="library__section">
        <div class="section__header">
          <p class="eyebrow">{{ cat.title.toUpperCase() }}</p>
          <NuxtLink :to="`/library/c/${cat.slug}`" class="library__see-all">Ver todo</NuxtLink>
        </div>
        <div class="library__scroll">
          <UiCard
            v-for="item in cat.items"
            :key="item.id"
            variant="filled"
            clickable
            :to="`/content/${item.id}`"
            :eyebrow="item.typeLabel"
            :title="item.title"
            :subtitle="item.duration"
            class="library__scroll-card"
          >
            <template #media>
              <div class="library__thumb" :style="{ background: item.color }" />
            </template>
          </UiCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const categories = ref([
  {
    title: 'Meditaciones',
    slug: 'meditaciones',
    items: [
      { id: 'mock-content-001', title: 'Respiración consciente', typeLabel: 'AUDIO • 10 MIN', duration: '10 min', color: 'linear-gradient(135deg, #384637, #28374A)' },
      { id: 'mock-content-002', title: 'Escaneo corporal', typeLabel: 'AUDIO • 15 MIN', duration: '15 min', color: 'linear-gradient(135deg, #28374A, #A7A68E)' },
      { id: 'mock-content-003', title: 'Atención plena', typeLabel: 'VIDEO • 8 MIN', duration: '8 min', color: 'linear-gradient(135deg, #282828, #384637)' },
    ],
  },
  {
    title: 'Rutinas de mañana',
    slug: 'rutinas-manana',
    items: [
      { id: 'mock-content-004', title: 'Despertar con energía', typeLabel: 'VIDEO • 12 MIN', duration: '12 min', color: 'linear-gradient(135deg, #A7A68E, #E8E6E2)' },
      { id: 'mock-content-005', title: 'Diario de gratitud', typeLabel: 'TEXTO • 5 MIN', duration: '5 min', color: 'linear-gradient(135deg, #384637, #A7A68E)' },
    ],
  },
  {
    title: 'Crecimiento personal',
    slug: 'crecimiento-personal',
    items: [
      { id: 'mock-content-006', title: 'Mentalidad de crecimiento', typeLabel: 'VIDEO • 20 MIN', duration: '20 min', color: 'linear-gradient(135deg, #28374A, #282828)' },
      { id: 'mock-content-007', title: 'Hábitos atómicos', typeLabel: 'TEXTO • 8 MIN', duration: '8 min', color: 'linear-gradient(135deg, #282828, #A7A68E)' },
    ],
  },
])
</script>

<style scoped>
.library__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.library__search-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
}
.library__search-btn:hover { background: rgba(255, 255, 255, 0.1); }

.library__featured { margin-bottom: var(--space-6); }
.library__featured > .eyebrow { margin-bottom: var(--space-3); }

.library__featured-media {
  background: linear-gradient(135deg, var(--color-navy), var(--color-green));
  display: flex;
  align-items: center;
  justify-content: center;
}

.library__featured-logo { height: 36px; width: auto; opacity: 0.4; }

.library__section { margin-bottom: var(--space-6); }

.library__see-all {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-primary);
}

.library__scroll {
  display: flex;
  gap: var(--space-3);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: var(--space-2);
}
.library__scroll::-webkit-scrollbar { display: none; }

.library__scroll-card {
  min-width: 180px;
  max-width: 200px;
  flex-shrink: 0;
  scroll-snap-align: start;
}

.library__thumb {
  width: 100%;
  height: 100%;
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .library__scroll {
    flex-wrap: wrap;
    overflow-x: visible;
  }

  .library__scroll-card {
    min-width: 200px;
    max-width: none;
    flex: 1 1 200px;
  }
}
</style>
