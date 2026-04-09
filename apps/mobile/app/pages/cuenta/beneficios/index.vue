<template>
  <div class="screen">
    <div class="screen__content">
      <header class="benefits__header">
        <button class="benefits__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="benefits__header-title">Beneficios</h1>
      </header>

      <template v-if="beneficiosStatus === 'pending'">
        <UiSkeleton variant="text" width="70%" height="14px" style="margin-bottom: var(--space-5);" />
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          <div v-for="i in 4" :key="i" style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4); border-radius: var(--radius-xl); background: rgba(var(--tint-rgb), 0.04);">
            <UiSkeleton variant="circle" width="44px" height="44px" />
            <div style="flex: 1;">
              <UiSkeleton variant="text" width="50%" height="14px" style="margin-bottom: 4px;" />
              <UiSkeleton variant="text" width="80%" height="12px" />
            </div>
          </div>
        </div>
      </template>
      <!-- Error state -->
      <template v-else-if="beneficiosStatus === 'error'">
        <div class="screen__content">
          <div class="benefits__error">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="benefits__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
            <h2 class="benefits__error-title">No pudimos cargar los beneficios</h2>
            <p class="benefits__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
            <UiButton variant="primary-outline" size="sm" @click="refreshBeneficios()">Reintentar</UiButton>
          </div>
        </div>
      </template>

      <template v-else>
        <p class="benefits__intro">Alianzas y descuentos exclusivos de tu plan <UiTag :variant="isSubscriber ? 'accent' : 'default'" size="sm">{{ planTitle }}</UiTag></p>

        <div v-if="benefits?.length" class="benefits__list">
          <NuxtLink
            v-for="benefit in benefits"
            :key="benefit.id"
            :to="`/cuenta/beneficios/${benefit.id}`"
            class="benefits__card"
            :style="{ '--benefit-accent': benefit.color, '--benefit-bg': benefit.bgColor }"
          >
            <div class="benefits__icon-wrap">
              <img v-if="benefit.cover_url" :src="benefit.cover_url" :alt="benefit.title" class="benefits__icon-img" />
              <Icon v-else :name="benefit.emoji" size="28" />
            </div>
            <div class="benefits__body">
              <h3 class="benefits__name">{{ benefit.title }}</h3>
              <p class="benefits__desc">{{ benefit.description }}</p>
            </div>
            <svg class="benefits__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </NuxtLink>
        </div>
        <UiEmptyState
          v-else
          title="No hay beneficios disponibles en tu plan"
          description="Los descuentos y alianzas aparecerán aquí cuando haya beneficios activos para tu plan."
        >
          <template #icon>
            <Icon name="lucide:gift" size="32" />
          </template>
          <template #action>
            <UiButton variant="primary-outline" size="sm" @click="refreshBeneficios()">Reintentar</UiButton>
          </template>
        </UiEmptyState>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const { isSubscriber, refreshProfile } = useAuth()

const { data: currentPlan, status: beneficiosStatus, refresh: refreshBeneficios } = useAsyncData('beneficios-plan', async () => {
  const planId = isSubscriber.value ? 'core' : 'free'
  const { data } = await client.from('subscription_plans').select('title').eq('id', planId).single()
  return data
}, { watch: [isSubscriber], lazy: true })

const planTitle = computed(() => currentPlan.value?.title ?? (isSubscriber.value ? 'Core' : 'Gratis'))

const BENEFIT_COLORS = [
  { color: 'var(--color-mood-great)', bgColor: 'rgba(var(--color-mood-great-rgb), 0.15)' },
  { color: 'var(--color-benefit-purple)', bgColor: 'rgba(var(--color-benefit-purple-rgb), 0.15)' },
  { color: 'var(--color-mood-low)', bgColor: 'rgba(var(--color-mood-low-rgb), 0.15)' },
  { color: 'var(--color-benefit-pink)', bgColor: 'rgba(var(--color-benefit-pink-rgb), 0.15)' },
]

const { data: benefits } = useAsyncData('mobile-benefits', async () => {
  const planId = isSubscriber.value ? 'core' : 'free'
  const { data } = await client.from('benefits').select('*').eq('status', 'active').eq('plan', planId).order('position')
  return (data ?? []).map((b) => ({
    ...b,
    emoji: 'lucide:gift',
    color: BENEFIT_COLORS[b.position % BENEFIT_COLORS.length]!.color,
    bgColor: BENEFIT_COLORS[b.position % BENEFIT_COLORS.length]!.bgColor,
  }))
}, { watch: [isSubscriber], lazy: true })

onMounted(() => {
  void refreshProfile()
})

onActivated(() => {
  void refreshProfile()
})

if (import.meta.client) {
  const onVisChange = () => {
    if (document.visibilityState === 'visible') {
      void refreshProfile()
    }
  }
  onMounted(() => document.addEventListener('visibilitychange', onVisChange))
  onUnmounted(() => document.removeEventListener('visibilitychange', onVisChange))
}
</script>

<style scoped>
/* ─── Header (standard) ─── */
.benefits__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.benefits__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.benefits__back {
  position: absolute;
  left: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-dark-lighter);
  cursor: pointer;
  border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .benefits__back:hover { background: rgba(var(--tint-rgb), 0.04); }
}

/* ─── Intro ─── */
.benefits__intro {
  font-size: var(--text-md);
  color: var(--color-muted);
  margin-bottom: var(--space-6);
  line-height: var(--leading-relaxed);
}

.benefits__intro strong {
  font-weight: 500;    
}


/* ─── Card list ─── */
.benefits__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ─── Card ─── */
.benefits__card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  text-decoration: none;
  color: var(--color-text);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  cursor: pointer;
  background: rgba(var(--tint-rgb), 0.04);
  transition: background var(--transition-fast);
}
@media (hover: hover) {
  .benefits__card:hover { background: rgba(var(--tint-rgb), 0.06); }
}
.benefits__card:active { background: rgba(var(--tint-rgb), 0.08); }

/* ─── Colorful icon ─── */
.benefits__icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--benefit-bg);
  color: var(--benefit-accent);
  overflow: hidden;
}

.benefits__icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ─── Body ─── */
.benefits__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.benefits__name {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
}

.benefits__desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
}

.benefits__chevron {
  flex-shrink: 0;
  color: var(--color-muted);
}

/* ─── Error state ─── */
.benefits__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.benefits__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.benefits__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.benefits__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}

/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .benefits__header {
    justify-content: flex-start;
  }

  .benefits__header-title {
    display: none;
  }

  .benefits__back {
    display: none;
  }

  .benefits__list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }

  .benefits__card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    transition: border-color var(--transition-fast);
  }

  @media (hover: hover) {
    .benefits__card:hover {
      background: var(--color-desktop-card);
      border-color: var(--color-border);
    }
  }
}
</style>
