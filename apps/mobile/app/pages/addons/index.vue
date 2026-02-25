<template>
  <div class="screen">
    <UiTopNav title="Add-ons / VIP" show-back />
    <div class="screen__content">
      <p class="addons__intro">Lleva tu experiencia al siguiente nivel con contenido y experiencias exclusivas.</p>

      <div class="addons__list">
        <UiCard
          v-for="addon in addons"
          :key="addon.id"
          variant="elevated"
          clickable
          :to="`/addons/${addon.id}`"
        >
          <template #media>
            <div class="addons__media" :style="{ background: addon.bg }">
              <span class="addons__badge">{{ addon.priceLabel }}</span>
            </div>
          </template>
          <p class="eyebrow eyebrow--sm">{{ addon.typeLabel }}</p>
          <h3 style="font-weight: var(--weight-semibold); font-size: var(--text-md); margin: var(--space-1) 0;">{{ addon.title }}</h3>
          <p style="font-size: var(--text-sm); color: var(--color-muted);">{{ addon.description }}</p>
          <template #footer>
            <UiTag v-if="addon.owned" variant="success" size="sm">Desbloqueado</UiTag>
          </template>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const addons = ref([
  {
    id: 'mock-addon-001', title: 'Mentoría 1:1 con Gabriel', typeLabel: 'EXPERIENCIA',
    description: '4 sesiones de coaching personalizado de 45 minutos.',
    priceLabel: '$2,499 MXN', bg: 'linear-gradient(135deg, #28374A, #282828)', owned: false,
  },
  {
    id: 'mock-addon-002', title: 'Módulo VIP: Liderazgo avanzado', typeLabel: 'CONTENIDO PREMIUM',
    description: '12 lecciones exclusivas + material descargable.',
    priceLabel: '$799 MXN', bg: 'linear-gradient(135deg, #384637, #A7A68E)', owned: true,
  },
  {
    id: 'mock-addon-003', title: 'Retiro presencial — Marzo 2026', typeLabel: 'EXPERIENCIA',
    description: 'Fin de semana de inmersión en Valle de Bravo.',
    priceLabel: '$8,999 MXN', bg: 'linear-gradient(135deg, #A7A68E, #28374A)', owned: false,
  },
])
</script>

<style scoped>
.addons__intro {
  font-size: var(--text-sm); color: var(--color-muted);
  margin-bottom: var(--space-6); line-height: var(--leading-relaxed);
}

.addons__list { display: flex; flex-direction: column; gap: var(--space-4); }

.addons__media {
  width: 100%; height: 100%; display: flex; align-items: flex-end;
  justify-content: flex-end; padding: var(--space-3);
}

.addons__badge {
  font-family: var(--font-eyebrow); font-size: var(--eyebrow-md); font-weight: var(--weight-bold);
  background: rgba(0,0,0,0.5); color: #fff; padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md); backdrop-filter: blur(4px);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .addons__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
