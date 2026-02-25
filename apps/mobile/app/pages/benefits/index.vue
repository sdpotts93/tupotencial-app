<template>
  <div class="screen">
    <UiTopNav title="Beneficios" show-back @back="navigateTo('/more')" />
    <div class="screen__content">
      <p class="benefits__intro">Disfruta descuentos y ofertas exclusivas para miembros de Tu Potencial.</p>

      <div class="benefits__list">
        <UiCard
          v-for="benefit in benefits"
          :key="benefit.id"
          variant="default"
          clickable
          :to="`/benefits/${benefit.id}`"
        >
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <span class="benefits__emoji">{{ benefit.emoji }}</span>
            <div>
              <h3 style="font-weight: var(--weight-semibold); font-size: var(--text-md);">{{ benefit.title }}</h3>
              <p style="font-size: var(--text-sm); color: var(--color-muted); margin-top: 2px;">{{ benefit.description }}</p>
            </div>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const benefits = ref([
  { id: 'mock-ben-001', title: 'Descuento en retiros', description: '15% de descuento en retiros presenciales', emoji: '🏔️' },
  { id: 'mock-ben-002', title: 'Acceso a comunidad VIP', description: 'Grupo exclusivo de WhatsApp con mentores', emoji: '💬' },
  { id: 'mock-ben-003', title: 'Sesión 1:1 gratuita', description: 'Una sesión de coaching al mes sin costo', emoji: '🎯' },
  { id: 'mock-ben-004', title: 'Descuento en libros', description: '20% en la tienda de libros recomendados', emoji: '📚' },
])
</script>

<style scoped>
.benefits__intro {
  font-size: var(--text-sm); color: var(--color-muted);
  margin-bottom: var(--space-6); line-height: var(--leading-relaxed);
}

.benefits__list { display: flex; flex-direction: column; gap: var(--space-3); }

.benefits__emoji { font-size: 2rem; flex-shrink: 0; }

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .benefits__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
