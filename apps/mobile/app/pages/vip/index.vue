<template>
  <div class="screen">
    <UiTopNav title="Contenido VIP" show-back />
    <div class="screen__content">
      <UiEmptyState
        title="Contenido VIP"
        description="Accede a contenido exclusivo con tus entitlements VIP. Si ya compraste un add-on, tu contenido aparecerá aquí."
      >
        <template #action>
          <UiButton to="/addons">Ver add-ons</UiButton>
        </template>
      </UiEmptyState>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })
</script>
