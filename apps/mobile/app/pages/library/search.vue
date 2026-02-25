<template>
  <div class="screen">
    <UiTopNav title="Buscar" show-back />
    <div class="screen__content">
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

      <div v-if="!query" class="search__suggestions">
        <p class="eyebrow">SUGERENCIAS</p>
        <div class="search__tags">
          <UiTag v-for="tag in suggestions" :key="tag" @click="query = tag">{{ tag }}</UiTag>
        </div>
      </div>

      <div v-else class="search__results">
        <p class="eyebrow">RESULTADOS</p>
        <UiList>
          <UiListItem
            v-for="item in filteredResults"
            :key="item.id"
            :label="item.title"
            :description="item.type"
            :to="`/content/${item.id}`"
          />
        </UiList>
        <UiEmptyState v-if="!filteredResults.length" title="Sin resultados" description="Intenta con otros términos de búsqueda." />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const query = ref('')

const suggestions = ['Meditación', 'Gratitud', 'Respiración', 'Hábitos', 'Mindfulness']

const allContent = [
  { id: 'mock-content-001', title: 'Respiración consciente', type: 'Audio • 10 min' },
  { id: 'mock-content-002', title: 'Escaneo corporal', type: 'Audio • 15 min' },
  { id: 'mock-content-003', title: 'Atención plena', type: 'Video • 8 min' },
  { id: 'mock-content-004', title: 'Despertar con energía', type: 'Video • 12 min' },
  { id: 'mock-content-005', title: 'Diario de gratitud', type: 'Texto • 5 min' },
  { id: 'mock-content-006', title: 'Mentalidad de crecimiento', type: 'Video • 20 min' },
  { id: 'mock-content-007', title: 'Hábitos atómicos', type: 'Texto • 8 min' },
]

const filteredResults = computed(() => {
  const q = query.value.toLowerCase()
  return allContent.filter(c => c.title.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
})
</script>

<style scoped>
.search__input { margin-bottom: var(--space-6); }

.search__suggestions > .eyebrow,
.search__results > .eyebrow {
  margin-bottom: var(--space-3);
}

.search__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.search__tags .tag { cursor: pointer; }
</style>
