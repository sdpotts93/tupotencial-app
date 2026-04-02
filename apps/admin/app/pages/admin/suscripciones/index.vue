<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Suscripciones</h1>
    </div>

    <!-- Skeleton loader -->
    <template v-if="plansStatus === 'pending'">
      <div style="background: var(--color-desktop-card, var(--color-white)); border: 1px solid var(--color-desktop-border, var(--color-border-light)); border-radius: var(--radius-lg); overflow: hidden;">
        <div style="display: grid; grid-template-columns: 25% 1fr 1fr auto; gap: var(--space-2); padding: var(--space-3) var(--space-4); background: var(--color-gray); border-bottom: 1px solid var(--color-border-light);">
          <UiSkeleton variant="text" width="50px" height="10px" />
          <UiSkeleton variant="text" width="50px" height="10px" />
          <UiSkeleton variant="text" width="60px" height="10px" />
          <span />
        </div>
        <div v-for="i in 4" :key="i" style="display: grid; grid-template-columns: 25% 1fr 1fr auto; gap: var(--space-2); padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border-light); align-items: center;">
          <UiSkeleton variant="text" width="80%" height="14px" />
          <UiSkeleton variant="text" width="60%" height="14px" />
          <UiSkeleton variant="text" width="50%" height="14px" />
          <UiSkeleton variant="rect" width="80px" height="30px" radius="var(--radius-md)" />
        </div>
      </div>
    </template>

    <template v-else>
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
    </template>
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

const { data: rows, status: plansStatus } = useAsyncData('admin-subscription-plans', async () => {
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
  router.push(`/admin/suscripciones/${row.id}`)
}
</script>
