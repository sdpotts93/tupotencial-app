<template>
  <UiModal :model-value="modelValue" @update:model-value="v => emit('update:modelValue', v)">
    <div class="ent__body">
      <div class="ent__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>

      <h1 class="ent__sheet-title">Contenido exclusivo</h1>
      <p class="ent__sheet-subtitle">
        <template v-if="isSubscriptionGate">
          Este contenido requiere la suscripción <strong>{{ addon?.title }}</strong> para acceder.
        </template>
        <template v-else-if="addon">
          Este contenido requiere el complemento <strong>{{ addon.title }}</strong> para acceder.
        </template>
        <template v-else>
          Este contenido requiere un complemento para acceder.
        </template>
      </p>

      <div v-if="addon" class="ent__addon-tag">
        <UiTag v-if="isSubscriptionGate" variant="accent" size="sm">Core</UiTag>
        <UiTag v-else variant="default" size="sm">{{ addon.title }}</UiTag>
      </div>

      <UiButton block variant="secondary" @click="goToAddon">
        {{ isSubscriptionGate ? 'Ver suscripción' : 'Ver complemento' }}
      </UiButton>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface AddonInfo {
  id: string
  title: string
  description: string | null
}

const props = defineProps<{
  modelValue: boolean
  addon: AddonInfo | null
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const isSubscriptionGate = computed(() => props.addon?.id === 'core' || props.addon?.id === 'free')

function goToAddon() {
  emit('update:modelValue', false)
  if (props.addon) {
    if (isSubscriptionGate.value) {
      navigateTo('/cuenta/suscripcion')
    } else {
      navigateTo(`/cuenta/complementos/${props.addon.id}`)
    }
  } else {
    navigateTo('/cuenta/complementos')
  }
}
</script>

<style scoped>
.ent__body {
  text-align: center;
}

.ent__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-full);
  margin: var(--space-4) auto var(--space-6);
  color: var(--color-muted);
}

.ent__sheet-title {
  font-family: var(--font-title);
  font-size: var(--title-xl);
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-2);
  font-weight: 100;
}

.ent__sheet-subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-6);
}

.ent__addon-tag {
  margin-bottom: var(--space-6);
}
</style>
