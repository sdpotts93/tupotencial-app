<template>
  <div>
    <h1 class="auth-title">Iniciar sesion</h1>
    <p class="auth-subtitle">Accede al panel de administracion de Tu Potencial</p>

    <form class="auth-form" @submit.prevent="handleLogin">
      <UiInput
        v-model="email"
        label="Correo electronico"
        type="email"
        placeholder="admin@tupotencial.app"
        :error="errors.email"
        autocomplete="email"
      />

      <UiInput
        v-model="password"
        label="Contrasena"
        type="password"
        placeholder="Tu contrasena"
        :error="errors.password"
        autocomplete="current-password"
      />

      <p v-if="loginError" class="auth-error">{{ loginError }}</p>

      <UiButton type="submit" block :loading="isLoading">
        Entrar
      </UiButton>
    </form>

    <p class="auth-hint">
      Credenciales de prueba: admin@tupotencial.app / admin123
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { login, isLoading, isAuthenticated } = useAdminAuth()

const email = ref('')
const password = ref('')
const loginError = ref('')
const errors = reactive({ email: '', password: '' })

// Redirect if already authenticated
if (isAuthenticated.value) {
  navigateTo('/admin')
}

async function handleLogin() {
  errors.email = ''
  errors.password = ''
  loginError.value = ''

  if (!email.value) {
    errors.email = 'El correo es obligatorio'
    return
  }
  if (!password.value) {
    errors.password = 'La contrasena es obligatoria'
    return
  }

  const success = await login(email.value, password.value)
  if (success) {
    navigateTo('/admin')
  } else {
    loginError.value = 'Credenciales incorrectas'
  }
}
</script>

<style scoped>
.auth-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  text-align: center;
}

.auth-subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-align: center;
  margin-top: var(--space-2);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.auth-error {
  font-size: var(--text-sm);
  color: var(--color-danger);
  text-align: center;
}

.auth-hint {
  font-size: var(--text-xs);
  color: var(--color-muted);
  text-align: center;
  margin-top: var(--space-4);
}
</style>
