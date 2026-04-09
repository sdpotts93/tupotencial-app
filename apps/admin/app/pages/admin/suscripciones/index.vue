<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Suscripciones</h1>
    </div>

    <!-- Skeleton loader -->
    <template v-if="plansStatus === 'pending'">
      <UiTableSkeleton :toolbar-widths="[]" :row-count="4" columns="25% 1fr 1fr auto">
        <UiSkeleton variant="text" width="80%" height="14px" />
        <UiSkeleton variant="text" width="60%" height="14px" />
        <UiSkeleton variant="text" width="50%" height="14px" />
        <UiSkeleton variant="rect" width="80px" height="30px" radius="var(--radius-md)" />
      </UiTableSkeleton>
    </template>

    <!-- Error state -->
    <template v-else-if="plansStatus === 'error'">
      <UiErrorState title="No pudimos cargar las suscripciones" @retry="refreshPlans()" />
    </template>

    <template v-else>
      <UiDataTable fill :columns="columns" :rows="rows ?? []" @row-click="goToEdit" @retry="refreshPlans()">
        <template #cell-price="{ row }">
          {{ row.price > 0 ? `$${(row.price / 100).toLocaleString('es-MX')} MXN/${row.interval === 'year' ? 'año' : 'mes'}` : 'Gratis' }}
        </template>

        <template #cell-benefitCount="{ row }">
          {{ row.benefitCount }} {{ row.benefitCount === 1 ? 'beneficio' : 'beneficios' }}
        </template>

        <template #actions="{ row }">
          <UiButton v-if="canEdit" variant="soft" size="sm" :to="`/admin/suscripciones/${row.id}`">
            <template #icon><Icon name="lucide:pencil" size="16" /></template>
            Editar
          </UiButton>
        </template>
      </UiDataTable>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const router = useRouter()
const { canEdit } = useAdminAuth()

const columns = [
  { key: 'title', label: 'Plan', width: '25%' },
  { key: 'price', label: 'Precio' },
  { key: 'benefitCount', label: 'Beneficios' },
]

const { data: rows, status: plansStatus, refresh: refreshPlans } = useAsyncData('admin-subscription-plans', async () => {
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
}, { lazy: true })

function goToEdit(row: Record<string, any>) {
  if (!canEdit.value) return
  router.push(`/admin/suscripciones/${row.id}`)
}
</script>

<style scoped>
</style>
