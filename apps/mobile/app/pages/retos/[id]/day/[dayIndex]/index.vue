<template>
  <div class="screen">
    <UiTopNav :title="`Día ${dayIndex}`" show-back >
      <template #right>
        <UiTag variant="accent">Día {{ dayIndex }}/{{ totalDays }}</UiTag>
      </template>
    </UiTopNav>
    <div class="screen__content">
      <h1 class="title title--lg">{{ dayTitle }}</h1>
      <p class="day__desc">{{ dayDescription }}</p>

      <!-- Content items for this day -->
      <section class="day__items">
        <p class="eyebrow">CONTENIDO DEL DÍA</p>
        <div class="day__items-list">
          <UiCard
            v-for="item in dayItems"
            :key="item.id"
            variant="filled"
            clickable
            :to="`/content/${item.id}`"
            :eyebrow="item.typeLabel"
            :title="item.title"
            :subtitle="item.duration"
          />
        </div>
      </section>

      <!-- Check-in CTA -->
      <div class="day__checkin">
        <UiButton block variant="secondary" :to="`/retos/${programId}/day/${dayIndex}/checkin`">
          Completar check-in del día
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const programId = route.params.id as string
const dayIndex = route.params.dayIndex as string
const totalDays = 7

const dayTitle = ref('Oportunidades')
const dayDescription = ref('Hoy reflexiona sobre las oportunidades que has tenido en tu vida. Piensa en cómo cada experiencia te ha llevado a donde estás ahora.')

const dayItems = ref([
  { id: 'mock-content-005', title: 'Diario de gratitud', typeLabel: 'TEXTO • 5 MIN', duration: '5 min' },
  { id: 'mock-content-001', title: 'Meditación de gratitud', typeLabel: 'AUDIO • 10 MIN', duration: '10 min' },
])
</script>

<style scoped>
.day__desc {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin: var(--space-3) 0 var(--space-6);
}

.day__items { margin-bottom: var(--space-6); }
.day__items > .eyebrow { margin-bottom: var(--space-3); }

.day__items-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.day__checkin { margin-bottom: var(--space-4); }
</style>
