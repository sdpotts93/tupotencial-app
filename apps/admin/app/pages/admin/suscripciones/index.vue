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

    <!-- Error state -->
    <template v-else-if="plansStatus === 'error'">
      <div class="plans__error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="plans__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="plans__error-title">No pudimos cargar las suscripciones</h2>
        <p class="plans__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refreshPlans()">Reintentar</UiButton>
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
  router.push(`/admin/suscripciones/${row.id}`)
}
</script>

<style scoped>
/* ─── Error state ─── */
.plans__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 40dvh;
  gap: var(--space-3);
}

.plans__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.plans__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.plans__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
