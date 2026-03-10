<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { isAuthenticated } = useAdminAuth()

onMounted(() => {
  if (!isAuthenticated.value) {
    navigateTo('/iniciar-sesion')
  } else {
    navigateTo('/admin')
  }
})
</script>
