<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Beneficios</h1>
      <div class="page-header__actions">
        <UiButton size="sm" to="/admin/benefits/new">+ Nuevo beneficio</UiButton>
      </div>
    </div>

    <UiDataTable :columns="columns" :rows="benefits" @row-click="goToEdit">
      <template #cell-sort_order="{ row }">
        <div class="order-controls">
          <button class="order-btn" :disabled="row.sort_order === 1" @click.stop="moveUp(row)">&#9650;</button>
          <span>{{ row.sort_order }}</span>
          <button class="order-btn" :disabled="row.sort_order === benefits.length" @click.stop="moveDown(row)">&#9660;</button>
        </div>
      </template>

      <template #cell-partner_name="{ value }">
        <strong>{{ value }}</strong>
      </template>

      <template #cell-discount_value="{ value, row }">
        {{ row.discount_type === 'percentage' ? `${value}%` : `$${value} MXN` }}
      </template>

      <template #cell-segment="{ value }">
        {{ segmentLabel(value) }}
      </template>

      <template #cell-status="{ value }">
        <UiTag :variant="value === 'active' ? 'success' : value === 'expired' ? 'danger' : 'warning'">
          {{ statusLabel(value) }}
        </UiTag>
      </template>

      <template #cell-redemptions="{ value }">
        {{ value?.toLocaleString('es-MX') ?? 0 }}
      </template>

      <template #actions="{ row }">
        <UiButton variant="ghost" size="sm" :to="`/admin/benefits/${row.id}`">Editar</UiButton>
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()

const columns = [
  { key: 'sort_order', label: 'Orden', width: '80px' },
  { key: 'partner_name', label: 'Aliado' },
  { key: 'title', label: 'Beneficio', width: '25%' },
  { key: 'discount_value', label: 'Descuento' },
  { key: 'segment', label: 'Segmento' },
  { key: 'status', label: 'Estado' },
  { key: 'redemptions', label: 'Canjes' },
]

const benefits = ref([
  { id: 'ben-001', sort_order: 1, partner_name: 'NutriVida', title: '20% en suplementos', discount_type: 'percentage', discount_value: 20, segment: 'premium', status: 'active', redemptions: 1234 },
  { id: 'ben-002', sort_order: 2, partner_name: 'YogaFlow Studio', title: 'Clase gratis de yoga', discount_type: 'percentage', discount_value: 100, segment: 'all', status: 'active', redemptions: 856 },
  { id: 'ben-003', sort_order: 3, partner_name: 'Cafe Mindful', title: '$50 de descuento en pedido', discount_type: 'fixed', discount_value: 50, segment: 'premium', status: 'active', redemptions: 2103 },
  { id: 'ben-004', sort_order: 4, partner_name: 'SleepWell', title: '15% en colchones y almohadas', discount_type: 'percentage', discount_value: 15, segment: 'enterprise', status: 'active', redemptions: 312 },
  { id: 'ben-005', sort_order: 5, partner_name: 'GymFit', title: '2 meses gratis de membresía', discount_type: 'percentage', discount_value: 100, segment: 'premium', status: 'active', redemptions: 567 },
  { id: 'ben-006', sort_order: 6, partner_name: 'Libreria Zen', title: '30% en libros de bienestar', discount_type: 'percentage', discount_value: 30, segment: 'all', status: 'expired', redemptions: 945 },
])

function segmentLabel(segment: string) {
  const map: Record<string, string> = { all: 'General', free: 'Gratuito', premium: 'Premium', enterprise: 'Empresarial' }
  return map[segment] ?? segment
}

function statusLabel(status: string) {
  const map: Record<string, string> = { active: 'Activo', expired: 'Expirado', draft: 'Borrador' }
  return map[status] ?? status
}

function moveUp(row: Record<string, any>) {
  const idx = benefits.value.findIndex(b => b.id === row.id)
  if (idx > 0) {
    benefits.value[idx].sort_order--
    benefits.value[idx - 1].sort_order++
    benefits.value.sort((a, b) => a.sort_order - b.sort_order)
  }
}

function moveDown(row: Record<string, any>) {
  const idx = benefits.value.findIndex(b => b.id === row.id)
  if (idx < benefits.value.length - 1) {
    benefits.value[idx].sort_order++
    benefits.value[idx + 1].sort_order--
    benefits.value.sort((a, b) => a.sort_order - b.sort_order)
  }
}

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/benefits/${row.id}`)
}
</script>

<style scoped>
.order-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.order-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  color: var(--color-muted);
  transition: background var(--transition-fast);
}

.order-btn:hover:not(:disabled) {
  background: var(--color-surface-alt);
  color: var(--color-text);
}

.order-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
