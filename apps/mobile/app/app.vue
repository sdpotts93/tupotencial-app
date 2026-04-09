<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppBootShell :visible="!bootReady" />
</template>

<script setup lang="ts">
const bootReady = useState<boolean>('app-boot-ready', () => false)
</script>
