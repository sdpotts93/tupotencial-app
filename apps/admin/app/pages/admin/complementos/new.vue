<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Nuevo add-on</h1>
      <div class="page-header__actions">
        <UiButton variant="soft" size="sm" to="/admin/complementos">Cancelar</UiButton>
        <UiButton variant="primary-outline" size="sm" @click="handleSave">Guardar</UiButton>
      </div>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.name"
              label="Nombre del add-on"
              placeholder="Nombre descriptivo del add-on"
            />

            <UiTextarea
              v-model="form.description"
              label="Descripcion"
              placeholder="Describe que incluye este add-on..."
              :rows="4"
            />

            <UiInput
              v-model="form.cover_url"
              label="URL de imagen"
              placeholder="https://ejemplo.com/addon.jpg"
            />

            <UiTextarea
              v-model="form.features"
              label="Caracteristicas incluidas"
              placeholder="Lista las caracteristicas, una por linea"
              :rows="4"
              hint="Escribe una caracteristica por linea"
            />

            <UiInput
              v-model="form.stripe_price_id"
              label="Stripe Price ID"
              placeholder="price_..."
              hint="ID del precio en Stripe para el cobro automatico"
            />

            <UiInput
              v-model="form.entitlement_key"
              label="Clave de entitlement"
              placeholder="vip_nutrition"
              hint="La clave que se otorga al comprar (ej. vip_nutrition)"
            />
          </div>
        </UiCard>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiSelect
              v-model="form.addon_type"
              label="Tipo de add-on"
              :options="typeOptions"
            />

            <UiInput
              v-model="form.price"
              label="Precio (MXN)"
              type="number"
              placeholder="149"
            />

            <UiSelect
              v-model="form.billing_period"
              label="Periodo de facturacion"
              :options="periodOptions"
            />

            <UiSelect
              v-model="form.available_for"
              label="Disponible para"
              :options="segmentOptions"
            />

            <UiSelect
              v-model="form.status"
              label="Estado"
              :options="statusOptions"
            />
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const form = reactive({
  name: '',
  description: '',
  cover_url: '',
  features: '',
  stripe_price_id: '',
  entitlement_key: '',
  addon_type: 'module',
  price: '',
  billing_period: 'monthly',
  available_for: 'premium',
  status: 'draft',
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
]

function handleSave() {
  alert('Add-on creado (mock)')
  navigateTo('/admin/complementos')
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

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
}
</style>
