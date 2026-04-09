<template>
  <div class="screen">
    <template v-if="benefitStatus === 'pending'">
      <div class="benefit">
        <div class="benefit__media" style="background: rgba(var(--tint-rgb), 0.06);">
          <UiSkeleton variant="rect" width="100%" height="100%" />
          <div class="benefit__nav safe-top">
            <button class="benefit__back" aria-label="Volver" @click="$router.back()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="benefit__info">
          <UiSkeleton variant="text" width="40%" height="12px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="70%" height="24px" style="margin-bottom: var(--space-3);" />
          <UiSkeleton variant="text" width="100%" height="14px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="85%" height="14px" style="margin-bottom: var(--space-5);" />
          <UiSkeleton variant="rect" width="100%" height="44px" style="border-radius: var(--radius-lg);" />
        </div>
      </div>
    </template>
    <!-- Error state -->
    <template v-else-if="benefitStatus === 'error'">
      <div class="benefit__error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="benefit__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="benefit__error-title">No pudimos cargar el beneficio</h2>
        <p class="benefit__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refreshBenefit()">Reintentar</UiButton>
      </div>
    </template>
    <div v-else class="benefit">
      <!-- Media (cover image or icon fallback) -->
      <div class="benefit__media" :style="{ background: benefit.bgGradient }">
        <img v-if="benefit.cover_url" :src="benefit.cover_url" :alt="benefit.title" class="benefit__cover" />
        <div v-else class="benefit__icon" :style="{ color: benefit.color }">
          <Icon :name="benefit.icon" size="64" />
        </div>
        <div class="benefit__nav safe-top">
          <button class="benefit__back" aria-label="Volver" @click="$router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="benefit__info">
        <button class="benefit__back-link" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <p class="eyebrow">BENEFICIO EXCLUSIVO</p>
        <h1 class="title title--lg benefit__title">{{ benefit.title }}</h1>

        <p class="benefit__desc">{{ benefit.description }}</p>

        <div v-if="benefit.code" class="benefit__code">
          <p class="benefit__code-label">TU CÓDIGO</p>
          <p class="benefit__code-value">{{ benefit.code }}</p>
        </div>

        <div class="benefit__actions">
          <UiButton variant="outline" block @click="handleOpen">Abrir enlace</UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  hideBottomNav: true,
})

const route = useRoute()
const id = route.params.id as string
const client = useSupabaseClient()

const { data: benefitData, status: benefitStatus, refresh: refreshBenefit } = useAsyncData(`benefit-${id}`, async () => {
  const { data } = await client.from('benefits').select('*').eq('id', id).single()
  return data
}, { lazy: true })

const BENEFIT_COLORS = [
  { color: 'var(--color-mood-great)', colorRgb: 'var(--color-mood-great-rgb)' },
  { color: 'var(--color-benefit-purple)', colorRgb: 'var(--color-benefit-purple-rgb)' },
  { color: 'var(--color-mood-low)', colorRgb: 'var(--color-mood-low-rgb)' },
  { color: 'var(--color-benefit-pink)', colorRgb: 'var(--color-benefit-pink-rgb)' },
]

const benefit = computed(() => {
  const b = benefitData.value
  const palette = BENEFIT_COLORS[0]!
  if (!b) return { title: '', description: '', code: null, url: null, cover_url: null, icon: 'lucide:gift', color: palette.color, bgGradient: `linear-gradient(135deg, rgba(${palette.colorRgb}, 0.3), rgba(${palette.colorRgb}, 0.08))` }
  const c = BENEFIT_COLORS[b.position % BENEFIT_COLORS.length]!
  return {
    title: b.title,
    description: b.description ?? '',
    code: b.code,
    url: b.url,
    cover_url: b.cover_url,
    icon: 'lucide:gift',
    color: c.color,
    bgGradient: `linear-gradient(135deg, rgba(${c.colorRgb}, 0.3), rgba(${c.colorRgb}, 0.08))`,
  }
})

function handleOpen() {
  if (benefit.value.url) window.open(benefit.value.url, '_blank')
}
</script>

<style scoped>
/* ─── Mobile layout ─── */
.benefit {
  display: flex;
  flex-direction: column;
}

/* ─── Media (icon hero) ─── */
.benefit__media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray);
}

.benefit__cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.benefit__icon {
  color: var(--color-text-secondary);
}

/* ─── Nav (mobile back) ─── */
.benefit__nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: var(--space-3) var(--space-4);
}

.benefit__back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dark-lighter);
  background: rgba(var(--tint-rgb), 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .benefit__back:hover { background: rgba(var(--tint-rgb), 0.5); }
}

/* ─── Back link (desktop only) ─── */
.benefit__back-link {
  display: none;
}

/* ─── Info ─── */
.benefit__info {
  padding: var(--space-4);
  padding-bottom: 2rem;
  width: 100%;
  max-width: var(--max-content-width);
  margin: 0 auto;
}

.benefit__title {
  margin-top: var(--space-1);
  margin-bottom: var(--space-2);
}

/* ─── Description ─── */
.benefit__desc {
  font-size: var(--text-base);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-5);
}

/* ─── Code ─── */
.benefit__code {
  background: rgba(var(--tint-rgb), 0.04);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  text-align: center;
}

.benefit__code-label {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.benefit__code-value {
  font-family: var(--font-eyebrow);
  font-size: var(--title-md);
  font-weight: var(--weight-bold);
  letter-spacing: 0.1em;
}

/* ─── Actions ─── */
.benefit__actions {
  margin-bottom: var(--space-5);
}

/* ─── Tablet ─── */
@media (min-width: 768px) {
  .benefit__info {
    max-width: var(--max-page-width);
    padding: var(--space-6);
  }
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .benefit {
    display: grid;
    grid-template-columns: 55fr 45fr;
    background: var(--color-desktop-card);
    border-radius: var(--radius-2xl);
    overflow: hidden;
    border: 1px solid var(--color-desktop-border);
    margin: var(--space-6);
    min-height: 480px;
    max-width: 1100px;
  }

  .benefit__media {
    order: 2;
    aspect-ratio: unset;
    min-height: 100%;
  }

  .benefit__icon :deep(svg) {
    width: 96px;
    height: 96px;
  }

  .benefit__nav { display: none; }

  .benefit__back-link {
    display: flex;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    color: var(--color-dark-lighter);
    background: none;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    padding: 0;
    margin-bottom: var(--space-6);
  }
  @media (hover: hover) {
    .benefit__back-link:hover { background: rgba(var(--tint-rgb), 0.06); }
  }

  .benefit__info {
    order: 1;
    max-width: none;
    margin: 0;
    padding: var(--space-10);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .benefit__title {
    font-size: var(--title-xl);
  }

  .benefit__desc {
    font-size: var(--text-lg);
  }

  .benefit__info > .eyebrow {
    font-size: var(--eyebrow-lg);
  }

  .benefit__code-value {
    font-size: var(--title-lg);
  }

  .benefit__actions :deep(.btn) {
    width: auto;
  }
}

/* ─── Error state ─── */
.benefit__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.benefit__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.benefit__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.benefit__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
