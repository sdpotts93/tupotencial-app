<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransition" />
  </NuxtLayout>
</template>

<script setup lang="ts">
const pageTransition = {
  name: 'page-slide',
  mode: 'default' as const,
  onBeforeLeave(el: Element) {
    (el as HTMLElement).style.top = `-${window.scrollY}px`
  },
}
</script>
