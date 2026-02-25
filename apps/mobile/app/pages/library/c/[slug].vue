<template>
  <div class="screen">
    <UiTopNav :title="category.title" show-back @back="navigateTo('/library')" />
    <div class="screen__content">
      <p v-if="category.description" class="category__desc">{{ category.description }}</p>

      <div class="category__grid">
        <UiCard
          v-for="item in items"
          :key="item.id"
          variant="default"
          clickable
          :to="`/content/${item.id}`"
          :eyebrow="item.typeLabel"
          :title="item.title"
          :subtitle="item.subtitle"
        >
          <template #media>
            <div class="category__thumb" :style="{ background: item.color }" />
          </template>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const slug = route.params.slug as string

const category = computed(() => ({
  title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  description: 'Explora el contenido de esta categoría y encuentra lo que necesitas hoy.',
}))

const items = ref([
  { id: 'mock-content-001', title: 'Respiración consciente', subtitle: '10 minutos de calma', typeLabel: 'AUDIO', color: 'linear-gradient(135deg, #384637, #28374A)' },
  { id: 'mock-content-002', title: 'Escaneo corporal', subtitle: 'Reconecta con tu cuerpo', typeLabel: 'AUDIO', color: 'linear-gradient(135deg, #28374A, #A7A68E)' },
  { id: 'mock-content-003', title: 'Atención plena', subtitle: 'Practica el presente', typeLabel: 'VIDEO', color: 'linear-gradient(135deg, #282828, #384637)' },
  { id: 'mock-content-004', title: 'Gratitud matutina', subtitle: 'Empieza con intención', typeLabel: 'TEXTO', color: 'linear-gradient(135deg, #A7A68E, #E8E6E2)' },
])
</script>

<style scoped>
.category__desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-bottom: var(--space-6);
  line-height: var(--leading-relaxed);
}

.category__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

@media (min-width: 768px) {
  .category__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.category__thumb {
  width: 100%;
  height: 100%;
}
</style>
