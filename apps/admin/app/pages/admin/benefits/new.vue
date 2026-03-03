<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Nuevo beneficio</h1>
      <div class="page-header__actions">
        <UiButton variant="outline" size="sm" to="/admin/benefits">Cancelar</UiButton>
        <UiButton size="sm" @click="handleSave">Guardar</UiButton>
      </div>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.title"
              label="Titulo del beneficio"
              placeholder="Ej: 20% en suplementos"
            />

            <UiInput
              v-model="form.partner_name"
              label="Nombre del aliado"
              placeholder="Nombre de la empresa o marca"
            />

            <UiTextarea
              v-model="form.description"
              label="Descripcion"
              placeholder="Describe el beneficio en detalle..."
              :rows="4"
            />

            <UiInput
              v-model="form.cover_url"
              label="URL de imagen"
              placeholder="https://ejemplo.com/imagen.jpg"
            />

            <UiInput
              v-model="form.redemption_url"
              label="URL de canje"
              placeholder="https://aliado.com/codigo-descuento"
              hint="URL a la que se redirige al usuario para canjear"
            />

            <UiInput
              v-model="form.utm_template"
              label="Plantilla UTM"
              placeholder="?utm_source=tupotencial&utm_medium=benefit&utm_campaign=..."
              hint="Parametros UTM que se agregan a la URL de canje"
            />

            <UiInput
              v-model="form.promo_code"
              label="Codigo promocional"
              placeholder="TUPOTENCIAL20"
            />

            <div class="form-row">
              <UiInput
                v-model="form.valid_from"
                label="Valido desde"
                type="date"
              />
              <UiInput
                v-model="form.valid_until"
                label="Valido hasta"
                type="date"
              />
            </div>
          </div>
        </UiCard>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiSelect
              v-model="form.discount_type"
              label="Tipo de descuento"
              :options="discountTypeOptions"
            />

            <UiInput
              v-model="form.discount_value"
              label="Valor del descuento"
              type="number"
              :placeholder="form.discount_type === 'percentage' ? '20' : '50'"
            />

            <UiSelect
              v-model="form.segment"
              label="Segmento"
              :options="segmentOptions"
            />

            <UiInput
              v-model="form.max_redemptions"
              label="Maximo de canjes"
              type="number"
              placeholder="Sin limite"
              hint="Dejar vacio para sin limite"
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
  title: '',
  partner_name: '',
  description: '',
  cover_url: '',
  redemption_url: '',
  utm_template: '',
  promo_code: '',
  valid_from: '',
  valid_until: '',
  discount_type: 'percentage',
  discount_value: '',
  segment: 'premium',
  max_redemptions: '',
  status: 'draft',
})

const discountTypeOptions = [
  { value: 'percentage', label: 'Porcentaje (%)' },
  { value: 'fixed', label: 'Monto fijo ($)' },
]

const segmentOptions = [
  { value: 'all', label: 'General' },
  { value: 'free', label: 'Gratuito' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Empresarial' },
]

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
]

function handleSave() {
  alert('Beneficio creado (mock)')
  navigateTo('/admin/benefits')
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
