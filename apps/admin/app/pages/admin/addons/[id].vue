<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Editar add-on</h1>
      <div class="page-header__actions">
        <UiButton variant="ghost" size="sm" @click="handleDelete">Eliminar</UiButton>
        <UiButton variant="outline" size="sm" to="/admin/addons">Cancelar</UiButton>
        <UiButton size="sm" @click="handleSave">Guardar cambios</UiButton>
      </div>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput v-model="form.name" label="Nombre del add-on" />
            <UiTextarea v-model="form.description" label="Descripcion" :rows="4" />
            <UiInput v-model="form.cover_url" label="URL de imagen" />
            <UiTextarea v-model="form.features" label="Caracteristicas incluidas" :rows="4" />
          </div>
        </UiCard>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiSelect v-model="form.addon_type" label="Tipo" :options="typeOptions" />
            <UiInput v-model="form.price" label="Precio (MXN)" type="number" />
            <UiSelect v-model="form.billing_period" label="Periodo" :options="periodOptions" />
            <UiSelect v-model="form.available_for" label="Disponible para" :options="segmentOptions" />
            <UiSelect v-model="form.status" label="Estado" :options="statusOptions" />
          </div>
        </UiCard>

        <UiCard variant="filled">
          <div class="form-section">
            <p class="meta-label">ID: {{ route.params.id }}</p>
            <p class="meta-label">Suscriptores: 2,340</p>
            <p class="meta-label">Ingresos mensual: $348,660 MXN</p>
            <p class="meta-label">Churn rate: 3.2%</p>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

const form = reactive({
  name: 'Nutricion personalizada',
  description: 'Un modulo completo de nutricion personalizada que incluye planes alimenticios semanales adaptados a tus objetivos, lista de compras automatica, recetas saludables y seguimiento de macronutrientes.',
  cover_url: 'https://images.tupotencial.app/addons/nutricion.jpg',
  features: 'Plan alimenticio semanal personalizado\nLista de compras automatica\n200+ recetas saludables\nSeguimiento de macronutrientes\nChat con nutriologo (1 sesion/mes)',
  addon_type: 'module',
  price: '149',
  billing_period: 'monthly',
  available_for: 'premium',
  status: 'active',
})

const typeOptions = [
  { value: 'module', label: 'Modulo' },
  { value: 'service', label: 'Servicio' },
  { value: 'content_pack', label: 'Pack de contenido' },
  { value: 'plan_upgrade', label: 'Upgrade de plan' },
]

const periodOptions = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly', label: 'Anual' },
  { value: 'one_time', label: 'Pago unico' },
]

const segmentOptions = [
  { value: 'all', label: 'Todos los planes' },
  { value: 'free', label: 'Plan gratuito' },
  { value: 'premium', label: 'Plan premium' },
  { value: 'enterprise', label: 'Plan empresarial' },
]

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'archived', label: 'Archivado' },
]

function handleSave() {
  alert('Add-on actualizado (mock)')
}

function handleDelete() {
  if (confirm('Seguro que deseas eliminar este add-on?')) {
    alert('Add-on eliminado (mock)')
    navigateTo('/admin/addons')
  }
}
</script>

<style scoped>
.form-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-6);
  align-items: start;
}

.form-layout__main,
.form-layout__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
}

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
}
</style>
