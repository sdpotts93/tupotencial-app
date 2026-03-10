<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Complementos</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" to="/admin/complementos/new">+ Nuevo add-on</UiButton>
      </div>
    </div>

    <UiDataTable fill :columns="columns" :rows="filteredRows" @row-click="goToEdit">
      <template #toolbar>
        <UiInput
          v-model="search"
          placeholder="Buscar por nombre..."
          style="min-width: 200px;"
        >
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
      </template>

      <template #cell-addon_type="{ value }">
        <UiTag :variant="typeVariant(value)">{{ typeLabel(value) }}</UiTag>
      </template>

      <template #cell-price="{ value }">
        {{ value > 0 ? `$${value.toLocaleString('es-MX')} MXN` : 'Gratis' }}
      </template>

      <template #cell-billing_period="{ value }">
        {{ periodLabel(value) }}
      </template>

      <template #cell-status="{ value }">
        <UiTag :variant="value === 'active' ? 'success' : 'warning'">
          {{ value === 'active' ? 'Activo' : 'Borrador' }}
        </UiTag>
      </template>

      <template #cell-subscribers="{ value }">
        {{ value?.toLocaleString('es-MX') ?? 0 }}
      </template>

      <template #actions="{ row }">
        <UiButton variant="soft" size="sm" :to="`/admin/complementos/${row.id}`">
          <template #icon><Icon name="lucide:pencil" size="16" /></template>
          Editar
        </UiButton>
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const search = ref('')

const columns = [
  { key: 'name', label: 'Nombre', width: '25%' },
  { key: 'addon_type', label: 'Tipo' },
  { key: 'price', label: 'Precio' },
  { key: 'billing_period', label: 'Periodo' },
  { key: 'status', label: 'Estado' },
  { key: 'subscribers', label: 'Suscriptores' },
]

const addons = ref([
  { id: 'addon-001', name: 'Nutricion personalizada', addon_type: 'module', price: 149, billing_period: 'monthly', status: 'active', subscribers: 2340 },
  { id: 'addon-002', name: 'Coach personal', addon_type: 'service', price: 499, billing_period: 'monthly', status: 'active', subscribers: 456 },
  { id: 'addon-003', name: 'Meditaciones premium', addon_type: 'content_pack', price: 79, billing_period: 'monthly', status: 'active', subscribers: 3890 },
  { id: 'addon-004', name: 'Laboratorio de sueno', addon_type: 'module', price: 199, billing_period: 'monthly', status: 'active', subscribers: 1234 },
  { id: 'addon-005', name: 'Plan familiar (hasta 4)', addon_type: 'plan_upgrade', price: 299, billing_period: 'monthly', status: 'active', subscribers: 867 },
  { id: 'addon-006', name: 'Kit de bienestar corporativo', addon_type: 'module', price: 0, billing_period: 'one_time', status: 'draft', subscribers: 0 },
])

const filteredRows = computed(() => {
  if (!search.value) return addons.value
  const q = search.value.toLowerCase()
  return addons.value.filter(r => r.name.toLowerCase().includes(q))
})

function typeVariant(type: string) {
  const map: Record<string, string> = { module: 'info', service: 'accent', content_pack: 'warning', plan_upgrade: 'success' }
  return (map[type] ?? 'default') as any
}

function typeLabel(type: string) {
  const map: Record<string, string> = { module: 'Modulo', service: 'Servicio', content_pack: 'Pack de contenido', plan_upgrade: 'Upgrade de plan' }
  return map[type] ?? type
}

function periodLabel(period: string) {
  const map: Record<string, string> = { monthly: 'Mensual', yearly: 'Anual', one_time: 'Pago unico' }
  return map[period] ?? period
}

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/complementos/${row.id}`)
}
</script>
