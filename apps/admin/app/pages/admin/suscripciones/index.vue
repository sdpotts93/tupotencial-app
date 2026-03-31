<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Suscripciones</h1>
    </div>

    <UiDataTable fill :columns="columns" :rows="rows ?? []" @row-click="goToEdit">
      <template #cell-price="{ row }">
        {{ row.price > 0 ? `$${(row.price / 100).toLocaleString('es-MX')} MXN/${row.interval === 'year' ? 'año' : 'mes'}` : 'Gratis' }}
      </template>

      <template #cell-benefitCount="{ row }">
        {{ row.benefitCount }} {{ row.benefitCount === 1 ? 'beneficio' : 'beneficios' }}
      </template>

      <template #actions="{ row }">
        <UiButton variant="soft" size="sm" :to="`/admin/suscripciones/${row.id}`">
          <template #icon><Icon name="lucide:pencil" size="16" /></template>
          Editar
        </UiButton>
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const router = useRouter()

const columns = [
  { key: 'title', label: 'Plan', width: '25%' },
  { key: 'price', label: 'Precio' },
  { key: 'benefitCount', label: 'Beneficios' },
]

const { data: rows } = await useAsyncData('admin-subscription-plans', async () => {
  const [plansRes, benefitsRes] = await Promise.all([
    client.from('subscription_plans').select('*').order('price'),
    client.from('benefits').select('id, plan'),
  ])

  const countByPlan = new Map<string, number>()
  for (const b of benefitsRes.data ?? []) {
    countByPlan.set(b.plan, (countByPlan.get(b.plan) ?? 0) + 1)
  }

  return (plansRes.data ?? []).map(p => ({
    ...p,
    benefitCount: countByPlan.get(p.id) ?? 0,
  }))
})

function goToEdit(row: Record<string, any>) {
  router.push(`/admin/suscripciones/${row.id}`)
}
</script>
