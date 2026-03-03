<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Editar beneficio</h1>
      <div class="page-header__actions">
        <UiButton variant="ghost" size="sm" @click="handleDelete">Eliminar</UiButton>
        <UiButton variant="outline" size="sm" to="/admin/benefits">Cancelar</UiButton>
        <UiButton size="sm" @click="handleSave">Guardar cambios</UiButton>
      </div>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput v-model="form.title" label="Titulo del beneficio" />
            <UiInput v-model="form.partner_name" label="Nombre del aliado" />
            <UiTextarea v-model="form.description" label="Descripcion" :rows="4" />
            <UiInput v-model="form.cover_url" label="URL de imagen" />
            <UiInput v-model="form.redemption_url" label="URL de canje" />

            <UiInput
              v-model="form.utm_template"
              label="Plantilla UTM"
              placeholder="?utm_source=tupotencial&utm_medium=benefit&utm_campaign=..."
              hint="Parametros UTM que se agregan a la URL de canje"
            />

            <UiInput v-model="form.promo_code" label="Codigo promocional" />

            <div class="form-row">
              <UiInput v-model="form.valid_from" label="Valido desde" type="date" />
              <UiInput v-model="form.valid_until" label="Valido hasta" type="date" />
            </div>
          </div>
        </UiCard>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiSelect v-model="form.discount_type" label="Tipo de descuento" :options="discountTypeOptions" />
            <UiInput v-model="form.discount_value" label="Valor del descuento" type="number" />
            <UiSelect v-model="form.segment" label="Segmento" :options="segmentOptions" />
            <UiInput v-model="form.max_redemptions" label="Maximo de canjes" type="number" />
            <UiSelect v-model="form.status" label="Estado" :options="statusOptions" />
          </div>
        </UiCard>

        <UiCard variant="filled">
          <div class="form-section">
            <p class="meta-label">ID: {{ route.params.id }}</p>
            <p class="meta-label">Canjes totales: 1,234</p>
            <p class="meta-label">Canjes este mes: 187</p>
            <p class="meta-label">Creado: 15 ene 2026</p>
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
  title: '20% en suplementos',
  partner_name: 'NutriVida',
  description: 'Obtén un 20% de descuento en toda la línea de suplementos NutriVida. Incluye vitaminas, minerales, proteínas y más. Válido en compras en línea y tiendas físicas.',
  cover_url: 'https://images.tupotencial.app/benefits/nutrivida.jpg',
  redemption_url: 'https://nutrivida.com/tupotencial',
  utm_template: '?utm_source=tupotencial&utm_medium=benefit&utm_campaign=nutrivida',
  promo_code: 'TUPOTENCIAL20',
  valid_from: '2026-01-01',
  valid_until: '2026-06-30',
  discount_type: 'percentage',
  discount_value: '20',
  segment: 'premium',
  max_redemptions: '5000',
  status: 'active',
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
  { value: 'expired', label: 'Expirado' },
]

function handleSave() {
  alert('Beneficio actualizado (mock)')
}

function handleDelete() {
  if (confirm('Seguro que deseas eliminar este beneficio?')) {
    alert('Beneficio eliminado (mock)')
    navigateTo('/admin/benefits')
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
