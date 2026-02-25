<template>
  <div class="screen">
    <UiTopNav title="Beneficio" show-back />
    <div class="screen__content">
      <div class="benefit-detail__icon"><Icon name="lucide:mountain" size="48" /></div>
      <h1 class="title title--lg">{{ benefit.title }}</h1>
      <p class="benefit-detail__desc">{{ benefit.description }}</p>

      <div v-if="benefit.code" class="benefit-detail__code">
        <p class="eyebrow eyebrow--sm">TU CÓDIGO</p>
        <p class="benefit-detail__code-value">{{ benefit.code }}</p>
      </div>

      <UiButton block @click="handleOpen">Abrir enlace</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const benefit = ref({
  title: 'Descuento en retiros',
  description: 'Obtén un 15% de descuento en todos los retiros presenciales de Tu Potencial. Este beneficio es exclusivo para miembros activos con suscripción Core.',
  code: 'TPRETIRO15',
  url: 'https://example.com/retiros',
})

function handleOpen() {
  // Log click + open URL
  window.open(benefit.value.url, '_blank')
}
</script>

<style scoped>
.benefit-detail__icon { font-size: 3rem; margin-bottom: var(--space-4); }

.benefit-detail__desc {
  font-size: var(--text-base); color: var(--color-text-secondary);
  line-height: var(--leading-relaxed); margin: var(--space-3) 0 var(--space-6);
}

.benefit-detail__code {
  background: var(--color-surface-alt); border-radius: var(--radius-lg);
  padding: var(--space-4); margin-bottom: var(--space-6); text-align: center;
}

.benefit-detail__code-value {
  font-family: var(--font-eyebrow); font-size: var(--title-md);
  font-weight: var(--weight-bold); color: var(--color-primary);
  letter-spacing: 0.1em; margin-top: var(--space-2);
}
</style>
