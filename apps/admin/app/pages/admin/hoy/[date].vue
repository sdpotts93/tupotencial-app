<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Plan del día: {{ formatDate(dateParam) }}</h1>
    </div>

    <div class="form-layout__main">

      <!-- 1. Frase del día -->
      <UiCard variant="outlined">
        <div class="form-section">
          <h3 class="section-title">Frase del día</h3>
          <UiTextarea
            v-model="form.phrase_text"
            label="Frase"
            placeholder="Escribe la frase motivacional del día..."
            :rows="3"
          />
          <UiSelect
            v-model="form.phrase_author"
            label="Quién dice la frase"
            :options="authorOptions"
          />
        </div>
      </UiCard>

      <!-- 2. Acción del día -->
      <UiCard variant="outlined">
        <div class="form-section">
          <h3 class="section-title">Acción del día</h3>
          <p class="section-hint">El usuario verá esta acción como su reto principal del día. Selecciona el tipo y configura los detalles.</p>
          <UiSelect
            v-model="form.action_type"
            label="Tipo"
            :options="actionTypeOptions"
          />

          <!-- Contenido -->
          <UiSelect
            v-if="form.action_type === 'content'"
            v-model="form.content_id"
            label="Contenido"
            :options="contentOptions"
            placeholder="Selecciona contenido"
            :error="errors.content_id"
          />

          <!-- Formulario -->
          <UiSelect
            v-if="form.action_type === 'form'"
            v-model="form.form_id"
            label="Formulario"
            :options="formOptions"
            placeholder="Selecciona formulario"
            :error="errors.form_id"
          />

          <!-- Talk to AI: no extra fields -->
        </div>
      </UiCard>

      <!-- 3. Badge -->
      <UiCard variant="outlined">
        <div class="form-section">
          <h3 class="section-title">Badge</h3>
          <p class="section-hint">El badge aparece después de que el usuario completa la acción del día.</p>
          <UiInput
            v-model="form.badge_title"
            label="Título del badge"
            placeholder="Ej: Día completado"
          />
          <UiInput
            v-model="form.badge_subtitle"
            label="Subtítulo del badge"
            placeholder="Ej: Sigue así, vas genial"
          />

        </div>
      </UiCard>

    </div>

    <div class="page-actions">
      <p v-if="formError" class="form-error">{{ formError }}</p>
      <UiButton variant="soft" size="sm" to="/admin/hoy">Cancelar</UiButton>
      <UiButton variant="primary-outline" size="sm" :loading="saving" @click="handleSave">Guardar</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const client = useSupabaseClient()
const toast = useToast()
const dateParam = computed(() => route.params.date as string)
const saving = ref(false)
const formError = ref('')
const errors = reactive({ content_id: '', form_id: '' })

// ── Fetch existing daily plan for this date ──
const { data: existingPlan } = await useAsyncData(`daily-plan-${dateParam.value}`, async () => {
  const { data } = await client.from('daily_plans').select('*').eq('date', dateParam.value).maybeSingle()
  return data
})

const existingPayload = existingPlan.value?.primary_action_payload as Record<string, any> | null

const form = reactive({
  phrase_text: existingPayload?.quote_text ?? '',
  phrase_author: (existingPayload?.quote_author ?? '') as string,
  action_type: existingPlan.value?.primary_action_type ?? 'ai_prompt' as string,
  content_id: existingPayload?.content_id ?? '',
  form_id: existingPayload?.form_id ?? '',
  badge_title: existingPlan.value?.badge_title ?? '',
  badge_subtitle: existingPlan.value?.badge_subtitle ?? '',

})

const authorOptions = [
  { value: 'gabriel', label: 'Gabriel' },
  { value: 'carlotta', label: 'Carlotta' },
]

const actionTypeOptions = [
  { value: 'ai_prompt', label: 'Habla con tu Coach IA' },
  { value: 'content', label: 'Contenido' },
  { value: 'form', label: 'Formulario' },
]

// ── Fetch content items and forms for dropdowns ──
const { data: contentItemsList } = await useAsyncData('daily-plan-content-items', async () => {
  const { data } = await client.from('content_items').select('id, title').order('title')
  return data ?? []
})

const { data: formsList } = await useAsyncData('daily-plan-forms', async () => {
  const { data } = await client.from('forms').select('id, title').order('title')
  return data ?? []
})

const contentOptions = computed(() =>
  (contentItemsList.value ?? []).map(c => ({ value: c.id, label: c.title })),
)

const formOptions = computed(() =>
  (formsList.value ?? []).map(f => ({ value: f.id, label: f.title })),
)

watch(() => form.action_type, () => {
  form.content_id = ''
  form.form_id = ''
  errors.content_id = ''
  errors.form_id = ''
})

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function handleSave() {
  saving.value = true
  formError.value = ''

  errors.content_id = ''
  errors.form_id = ''

  if (form.action_type === 'content' && !form.content_id) {
    errors.content_id = 'El contenido es obligatorio'
    saving.value = false
    return
  }
  if (form.action_type === 'form' && !form.form_id) {
    errors.form_id = 'El formulario es obligatorio'
    saving.value = false
    return
  }

  try {
    const actionPayload: Record<string, any> = {
      quote_text: form.phrase_text,
      quote_author: form.phrase_author,
    }
    if (form.action_type === 'content' && form.content_id) {
      actionPayload.content_id = form.content_id
    }
    if (form.action_type === 'form' && form.form_id) {
      actionPayload.form_id = form.form_id
    }

    const payload = {
      date: dateParam.value,
      primary_action_type: form.action_type,
      primary_action_payload: actionPayload,
      badge_title: form.badge_title,
      badge_subtitle: form.badge_subtitle,

      status: 'published',
    }

    if (existingPlan.value) {
      await client.from('daily_plans').update(payload).eq('id', existingPlan.value.id)
    } else {
      await client.from('daily_plans').insert(payload)
    }
    navigateTo('/admin/hoy')
  } catch {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form-layout__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
}

.section-hint {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
}

.form-error {
  width: 100%;
  font-size: var(--text-sm);
  color: var(--color-danger);
  text-align: center;
  order: -1;
}
</style>
