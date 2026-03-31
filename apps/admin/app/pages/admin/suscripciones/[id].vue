<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Editar plan — {{ plan?.title }}</h1>
    </div>

    <div class="form-layout">
      <div class="form-layout__main">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput v-model="form.title" label="Nombre del plan" />

            <UiTextarea v-model="form.description" label="Descripción" :rows="3" />
          </div>
        </UiCard>

        <!-- Benefits from benefits table -->
        <UiCard variant="outlined">
          <div class="form-section">
            <div class="benefits-header">
              <div>
                <label class="benefits__label">Beneficios del plan</label>
                <p class="benefits__hint">Alianzas y descuentos asociados a este plan. Edítalos en Beneficios.</p>
              </div>
              <UiButton variant="soft" size="sm" to="/admin/beneficios">Ir a Beneficios</UiButton>
            </div>

            <div v-if="planBenefits?.length" class="benefits-list">
              <div v-for="b in planBenefits" :key="b.id" class="benefits-list__item">
                <span class="benefits-list__title">{{ b.title }}</span>
                <UiTag :variant="b.status === 'active' ? 'success' : 'warning'" size="sm">
                  {{ b.status === 'active' ? 'Activo' : 'Inactivo' }}
                </UiTag>
              </div>
            </div>
            <p v-else class="benefits__empty">No hay beneficios asociados a este plan.</p>
          </div>
        </UiCard>
      </div>

      <div class="form-layout__sidebar">
        <UiCard variant="outlined">
          <div class="form-section">
            <UiInput
              v-model="form.price"
              label="Precio (MXN)"
              type="number"
              placeholder="399"
              hint="Precio en pesos mexicanos"
            />

            <UiSelect
              v-model="form.interval"
              label="Intervalo"
              :options="intervalOptions"
            />
          </div>
        </UiCard>

        <UiCard variant="filled">
          <div class="form-section">
            <p class="meta-label">ID: {{ route.params.id }}</p>
            <p class="meta-hint">Los planes no se pueden crear ni eliminar.</p>
          </div>
        </UiCard>
      </div>
    </div>

    <div class="page-actions">
      <UiButton variant="soft" size="sm" to="/admin/suscripciones">Cancelar</UiButton>
      <UiButton variant="primary-outline" size="sm" :loading="saving" @click="handleSave">Guardar cambios</UiButton>
      <p v-if="formError" class="form-error">{{ formError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const client = useSupabaseClient()
const planId = route.params.id as string
const toast = useToast()

// ── Fetch plan ──
const { data: plan } = await useAsyncData(`sub-plan-${planId}`, async () => {
  const { data } = await client.from('subscription_plans').select('*').eq('id', planId).single()
  return data
})

// ── Fetch benefits for this plan ──
const { data: planBenefits } = await useAsyncData(`sub-plan-benefits-${planId}`, async () => {
  const { data } = await client
    .from('benefits')
    .select('id, title, status')
    .eq('plan', planId)
    .order('position')
  return data ?? []
})

const formError = ref('')
const saving = ref(false)

// ── Form state ──
const form = reactive({
  title: plan.value?.title ?? '',
  description: plan.value?.description ?? '',
  price: plan.value ? String(plan.value.price / 100) : '0',
  interval: plan.value?.interval ?? 'month',
})

const intervalOptions = [
  { value: 'month', label: 'Mensual' },
  { value: 'year', label: 'Anual' },
]

async function handleSave() {
  formError.value = ''
  saving.value = true
  try {
    const payload = {
      title: form.title,
      description: form.description || null,
      price: Math.round(Number(form.price) * 100),
      interval: form.interval,
      updated_at: new Date().toISOString(),
    }

    const { error } = await client.from('subscription_plans').update(payload).eq('id', planId)
    if (error) throw error
    toast.show('Plan actualizado', 'success')
    navigateTo('/admin/suscripciones')
  } catch {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
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

.form-layout__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-layout__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: sticky;
  top: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.meta-hint {
  font-size: var(--text-xs);
  color: var(--color-muted);
  opacity: 0.7;
}

/* ─── Benefits section ─── */
.benefits-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.benefits__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.benefits__hint {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.benefits-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: rgba(var(--tint-rgb), 0.03);
  border-radius: var(--radius-md);
}

.benefits-list__title {
  font-size: var(--text-sm);
  color: var(--color-text);
}

.benefits__empty {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

@media (max-width: 768px) {
  .form-layout { grid-template-columns: 1fr; }
}

.form-error {
  width: 100%;
  font-size: var(--text-sm);
  color: var(--color-danger);
  text-align: center;
  order: -1;
}
</style>
