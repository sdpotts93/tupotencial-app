<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { isAuthenticated } = useAdminAuth()

onMounted(() => {
  if (!isAuthenticated.value) {
    navigateTo('/login')
  } else {
    navigateTo('/admin')
  }
})
</script>
