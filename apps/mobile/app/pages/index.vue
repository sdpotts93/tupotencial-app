<template>
  <div />
</template>

<script setup lang="ts">
// Root redirect — send to /hoy if onboarded, else auth
definePageMeta({ layout: 'blank' })

const { isLoggedIn, isOnboarded } = useAuth()

onMounted(() => {
  if (!isLoggedIn.value) {
    navigateTo('/auth/login')
  } else if (!isOnboarded.value) {
    navigateTo('/onboarding/segment')
  } else {
    navigateTo('/hoy')
  }
})
</script>
