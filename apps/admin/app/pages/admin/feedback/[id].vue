<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Detalle de respuesta</h1>
      <div class="page-header__actions">
        <UiButton variant="soft" size="sm" to="/admin/feedback">Volver</UiButton>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="dataStatus === 'pending'" class="detail">
      <UiCard variant="outlined">
        <div class="detail__header">
          <UiSkeleton variant="circle" width="56px" height="56px" />
          <div style="flex: 1; display: flex; flex-direction: column; gap: var(--space-2);">
            <UiSkeleton variant="text" width="40%" height="20px" />
            <UiSkeleton variant="text" width="120px" height="12px" />
          </div>
        </div>
      </UiCard>

      <div class="detail__stats">
        <div v-for="i in 3" :key="i" class="detail__stat">
          <UiSkeleton variant="text" width="60%" height="10px" />
          <UiSkeleton variant="text" width="40%" height="16px" />
        </div>
      </div>

      <UiSkeleton variant="text" width="100px" height="10px" style="margin-top: var(--space-2);" />
      <UiCard variant="outlined">
        <div v-for="j in 3" :key="j" style="display: flex; flex-direction: column; gap: var(--space-1); padding: var(--space-3) 0; border-bottom: 1px solid rgba(var(--tint-rgb), 0.06);">
          <UiSkeleton variant="text" width="40%" height="10px" />
          <UiSkeleton variant="text" width="70%" height="14px" />
        </div>
      </UiCard>
    </div>

    <!-- Error state -->
    <template v-else-if="dataStatus === 'error'">
      <div class="detail__error">
        <h2 class="detail__error-title">No pudimos cargar la respuesta</h2>
        <p class="detail__error-desc">Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refresh()">Reintentar</UiButton>
      </div>
    </template>

    <template v-else>
      <div v-if="submission" class="detail">
        <!-- User header -->
        <UiCard variant="outlined">
          <div class="detail__header">
            <div class="detail__avatar">{{ avatarInitials(submission.user_name) }}</div>
            <div class="detail__info">
              <h2 class="detail__name">{{ submission.user_name }}</h2>
              <p class="detail__email">{{ submission.user_email }}</p>
            </div>
          </div>
        </UiCard>

        <!-- Meta stats -->
        <div class="detail__stats">
          <div class="detail__stat">
            <span class="eyebrow detail__stat-label">Formulario</span>
            <span class="detail__stat-value">{{ submission.form_title || 'Sin título' }}</span>
          </div>
          <div class="detail__stat">
            <span class="eyebrow detail__stat-label">Origen</span>
            <span class="detail__stat-value">
              <UiTag :variant="submission.source === 'program' ? 'info' : 'warning'">
                {{ sourceLabel(submission.source) }}
              </UiTag>
            </span>
          </div>
          <div class="detail__stat">
            <span class="eyebrow detail__stat-label">Fecha</span>
            <span class="detail__stat-value">{{ formatDate(submission.created_at) }}</span>
          </div>
        </div>

        <!-- Program (if applicable) -->
        <template v-if="submission.program_title && submission.program_title !== '—'">
          <h3 class="detail__section-title">Programa</h3>
          <UiCard variant="outlined">
            <div class="detail__row">
              <span>{{ submission.program_title }}</span>
            </div>
          </UiCard>
        </template>

        <!-- Answers -->
        <h3 class="detail__section-title">Respuestas</h3>
        <UiCard variant="outlined">
          <div v-if="answerEntries.length">
            <div v-for="([question, answer], i) in answerEntries" :key="i" class="detail__answer">
              <span class="detail__answer-q">{{ question }}</span>
              <span class="detail__answer-a">{{ answer || '—' }}</span>
            </div>
          </div>
          <p v-else class="detail__empty">Sin respuestas</p>
        </UiCard>
      </div>

      <div v-else class="detail__loading">
        <p>Respuesta no encontrada</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const client = useSupabaseClient()
const id = route.params.id as string

const { data: submission, status: dataStatus, refresh } = useAsyncData(`feedback-${id}`, async () => {
  const { data } = await client
    .from('form_submissions')
    .select('id, form_id, user_id, answers, source, program_id, created_at, forms(title), profiles!form_submissions_profile_fk(display_name, email), programs(title)')
    .eq('id', id)
    .single()

  if (!data) return null

  return {
    ...data,
    form_title: (data.forms as any)?.title ?? '',
    user_name: (data.profiles as any)?.display_name ?? 'Sin nombre',
    user_email: (data.profiles as any)?.email ?? '',
    program_title: (data.programs as any)?.title ?? '—',
  }
}, { lazy: true })

const answerEntries = computed(() => {
  const answers = submission.value?.answers
  if (!answers || typeof answers !== 'object') return []
  return Object.entries(answers as Record<string, unknown>)
})

function sourceLabel(source: string) {
  const map: Record<string, string> = { daily_action: 'Acción diaria', program: 'Programa' }
  return map[source] ?? source ?? '—'
}

function avatarInitials(name: string) {
  return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ─── Header ─── */
.detail__header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.detail__avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-desktop-border);
  color: var(--color-accent-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
}

.detail__name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  line-height: 1.2;
  font-weight: 100;
}

.detail__email {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

/* ─── Stats ─── */
.detail__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.detail__stat {
  background: rgba(var(--tint-rgb), 0.04);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.detail__stat-value {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.detail__stat-label {
  max-width: 12ch;
  line-height: 1.3;
}

/* ─── Section title ─── */
.detail__section-title {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-top: var(--space-2);
}

/* ─── Rows ─── */
.detail__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) 0;
  font-size: var(--text-sm);
}

/* ─── Answers ─── */
.detail__answer {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3) 0;
  border-bottom: 1px solid rgba(var(--tint-rgb), 0.06);
}

.detail__answer:last-child {
  border-bottom: none;
}

.detail__answer-q {
  font-size: var(--text-xs);
  color: var(--color-muted);
  font-weight: var(--weight-medium);
}

.detail__answer-a {
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: var(--leading-relaxed);
}

/* ─── Empty / Error ─── */
.detail__empty {
  font-size: var(--text-sm);
  color: var(--color-muted);
  padding: var(--space-2) 0;
}

.detail__loading {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-muted);
}

.detail__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 40dvh;
  gap: var(--space-3);
}

.detail__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
}

.detail__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
}

@media (max-width: 768px) {
  .detail__stats {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .detail__stat {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
  }
}
</style>
