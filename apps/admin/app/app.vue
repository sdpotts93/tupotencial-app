<template>
  <NuxtLayout>
    <NuxtErrorBoundary @error="handleError">
      <NuxtPage />
      <template #error="{ error, clearError }">
        <UiErrorState
          title="Algo salió mal"
          description="Ocurrió un error inesperado. Intenta recargar la página."
          @retry="clearError({ redirect: $route.fullPath })"
        />
      </template>
    </NuxtErrorBoundary>
  </NuxtLayout>
</template>

<script setup lang="ts">
function handleError(error: unknown) {
  console.error('[ErrorBoundary]', error)
}
</script>
