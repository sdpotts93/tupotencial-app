<template>
  <div class="screen">
    <div class="screen__content">
      <header class="search__header">
        <NuxtLink to="/library" class="search__back" aria-label="Volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </NuxtLink>
        <h1 class="search__title">Buscar</h1>
      </header>

      <UiInput
        v-model="query"
        placeholder="Buscar contenido..."
        type="search"
        class="search__input"
      >
        <template #prefix>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </template>
      </UiInput>

      <div v-if="query" class="search__results">
        <p v-if="filteredResults.length" class="eyebrow search__results-label">RESULTADOS</p>

        <div class="search__list">
          <NuxtLink
            v-for="item in filteredResults"
            :key="item.id"
            :to="`/content/${item.id}`"
            class="search__item"
          >
            <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="search__item-thumb" />
            <div class="search__item-body">
              <h3 class="search__item-name">{{ item.title }}</h3>
              <p class="search__item-meta">{{ item.meta }}</p>
              <span class="search__item-category">{{ item.category }}</span>
            </div>
          </NuxtLink>
        </div>

        <UiEmptyState v-if="!filteredResults.length" title="Sin resultados" description="Intenta con otros términos de búsqueda." />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const query = ref('')

const allContent = [
  { id: 'mock-content-001', title: 'Respiración consciente', meta: '10 min • Audio', category: 'Meditación', thumbnail: '/images/lib-1.jpg' },
  { id: 'mock-content-002', title: 'Escaneo corporal', meta: '15 min • Audio', category: 'Meditación', thumbnail: '/images/lib-2.jpg' },
  { id: 'mock-content-003', title: 'Atención plena', meta: '8 min • Video', category: 'Mindfulness', thumbnail: '/images/lib-3.jpg' },
  { id: 'mock-content-004', title: 'Despertar con energía', meta: '12 min • Video', category: 'Rutinas De Mañana', thumbnail: '/images/lib-4.jpg' },
  { id: 'mock-content-005', title: 'Diario de gratitud', meta: '5 min • Texto', category: 'Rutinas De Mañana', thumbnail: '/images/lib-5.jpg' },
  { id: 'mock-content-006', title: 'Mentalidad de crecimiento', meta: '20 min • Video', category: 'Crecimiento Personal', thumbnail: '/images/lib-6.jpg' },
  { id: 'mock-content-007', title: 'Hábitos atómicos', meta: '8 min • Texto', category: 'Crecimiento Personal', thumbnail: '/images/lib-7.jpg' },
]

const filteredResults = computed(() => {
  const q = query.value.toLowerCase()
  return allContent.filter(c =>
    c.title.toLowerCase().includes(q)
    || c.meta.toLowerCase().includes(q)
    || c.category.toLowerCase().includes(q),
  )
})
</script>

<style scoped>
/* ─── Header (matches /library) ─── */
.search__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
  position: relative;
}

.search__title {
  font-family: var(--font-eyebrow);
  font-size: 14px;
  text-transform: uppercase;
}

.search__back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  position: absolute;
  left: 0;
}
.search__back:hover { background: rgba(0, 0, 0, 0.06); }

/* ─── Input (matches profile-setup) ─── */
.search__input { margin-bottom: var(--space-6); }

.search__input :deep(.input-field__wrapper) {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-bottom: 1.5px solid #a7a68e36;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search__input :deep(.input-field__input) {
  color: var(--color-text);
}

.search__input :deep(.input-field__label) {
  color: var(--color-text);
}

/* ─── Results ─── */
.search__results-label { margin-bottom: var(--space-4); }

.search__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.search__item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  text-decoration: none;
  color: var(--color-text);
}
.search__item:hover { text-decoration: none; }

.search__item-thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  object-fit: cover;
  flex-shrink: 0;
}

.search__item-body {
  flex: 1;
  min-width: 0;
}

.search__item-name {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  margin-bottom: 2px;
}

.search__item-meta {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: 4px;
}

.search__item-category {
  display: inline-block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  color: var(--color-sand);
}
</style>
