<template>
  <div />
</template>

<script setup lang="ts">
// Root redirect — send to /hoy if onboarded, else auth
definePageMeta({ layout: 'blank' })

const { isLoggedIn, isOnboarded } = useAuth()

onMounted(() => {
  if (!isLoggedIn.value) {
    navigateTo('/iniciar-sesion')
  } else if (!isOnboarded.value) {
    navigateTo('/cuenta/bienvenida/segmento')
  } else {
    navigateTo('/cuenta/hoy')
  }
})
</script>
