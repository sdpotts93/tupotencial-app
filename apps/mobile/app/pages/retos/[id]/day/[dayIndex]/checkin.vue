<template>
  <div class="screen">
    <UiTopNav :title="`Check-in — Día ${dayIndex}`" show-back @back="navigateTo(`/retos/${programId}/day/${dayIndex}`)" />
    <div class="screen__content">
      <h1 class="title title--lg">Check-in del día</h1>
      <p class="pcheckin__desc">Comparte tu reflexión de hoy sobre este tema.</p>

      <UiTextarea
        v-model="reflection"
        label="Tu reflexión"
        placeholder="Escribe aquí lo que agradeces hoy..."
        :rows="5"
      />

      <UiButton block :loading="loading" class="pcheckin__submit" @click="handleSubmit">
        Enviar check-in
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const programId = route.params.id as string
const dayIndex = route.params.dayIndex as string

const reflection = ref('')
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  loading.value = false
  navigateTo(`/retos/${programId}/day/${dayIndex}`)
}
</script>

<style scoped>
.pcheckin__desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-2) 0 var(--space-6);
}

.pcheckin__submit { margin-top: var(--space-5); }
</style>
