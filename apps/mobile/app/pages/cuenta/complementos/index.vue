<template>
  <div class="screen">
    <div class="screen__content">
      <header class="addons__header">
        <button class="addons__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="addons__header-title">VIP</h1>
      </header>

      <template v-if="addonsStatus === 'pending'">
        <UiSkeleton variant="text" width="80%" height="14px" style="margin-bottom: var(--space-5);" />
        <div style="display: flex; flex-direction: column; gap: var(--space-6);">
          <div v-for="i in 3" :key="i">
            <UiSkeleton variant="rect" width="100%" height="160px" radius="var(--radius-2xl)" style="margin-bottom: var(--space-3);" />
            <UiSkeleton variant="text" width="60%" height="16px" style="margin-bottom: var(--space-2);" />
            <UiSkeleton variant="text" width="90%" height="12px" />
          </div>
        </div>
      </template>
      <!-- Error state -->
      <template v-else-if="addonsStatus === 'error'">
        <div class="screen__content">
          <div class="addons__error">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="addons__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
            <h2 class="addons__error-title">No pudimos cargar los complementos</h2>
            <p class="addons__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
            <UiButton variant="primary-outline" size="sm" @click="refreshAddons()">Reintentar</UiButton>
          </div>
        </div>
      </template>

      <template v-else>
        <p class="addons__intro">Lleva tu experiencia al siguiente nivel con contenido y experiencias exclusivas.</p>

        <UiEmptyState
          v-if="!addons.length"
          title="Aún no hay complementos disponibles"
          description="Los complementos y experiencias VIP aparecerán aquí cuando estén publicados."
        >
          <template #icon>
            <Icon name="lucide:sparkles" size="32" />
          </template>
          <template #action>
            <UiButton variant="primary-outline" size="sm" @click="refreshAddons()">Reintentar</UiButton>
          </template>
        </UiEmptyState>

        <div v-else class="addons__list">
          <NuxtLink
            v-for="addon in addons"
            :key="addon.id"
            :to="`/cuenta/complementos/${addon.id}`"
            class="addons__card"
          >
            <div class="addons__card-hero">
              <img :src="addon.img || ''" alt="" class="addons__card-img" />
              <span class="addons__card-price">{{ addon.priceLabel }}</span>
            </div>
            <div class="addons__card-info">
              <h3 class="addons__card-name">{{ addon.title }}</h3>
              <p class="addons__card-desc">{{ addon.description }}</p>
              <div v-if="addon.owned" class="addons__card-footer">
                <span class="addons__tag addons__tag--unlocked">Desbloqueado</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const { user } = useAuth()

function formatPrice(cents: number) {
  return cents > 0 ? `$${(cents / 100).toLocaleString('es-MX')} MXN` : 'Gratis'
}

const { data: addonsData, status: addonsStatus, refresh: refreshAddons } = useAsyncData('mobile-addons', async () => {
  const { data: addonsList } = await client.from('addons').select('*').eq('status', 'active').order('created_at')
  let purchasedIds = new Set<string>()
  if (user.value?.id) {
    const { data: purchases } = await client.from('addon_purchases').select('addon_id').eq('user_id', user.value.id)
    purchasedIds = new Set((purchases ?? []).map(p => p.addon_id))
  }
  return (addonsList ?? []).map(a => ({
    id: a.id,
    title: a.title,
    description: a.description,
    priceLabel: formatPrice(a.price),
    img: a.cover_url,
    bg: 'linear-gradient(135deg, var(--color-surface-alt) 0%, var(--color-surface) 100%)',
    owned: purchasedIds.has(a.id),
  }))
}, { watch: [() => user.value?.id], lazy: true })
const addons = computed(() => addonsData.value ?? [])
</script>

<style scoped>
/* ─── Header (matches events) ─── */
.addons__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.addons__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.addons__back {
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
  .addons__back:hover { background: rgba(var(--tint-rgb), 0.04); }
}

/* ─── Intro ─── */
.addons__intro {
  font-size: var(--text-md);
  color: var(--color-muted);
  margin-bottom: var(--space-6);
  line-height: var(--leading-relaxed);
}

/* ─── Card list ─── */
.addons__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* ─── Card ─── */
.addons__card {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-decoration: none;
  color: var(--color-text);
}
.addons__card + .addons__card {
  border-top: 1px solid rgba(var(--tint-rgb), 0.1);
  padding-top: var(--space-8);
}

.addons__card-hero {
  position: relative;
}

.addons__card-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-2xl);
}

.addons__card-gradient {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-2xl);
}

/* ─── Price badge (floating top-right on image) ─── */
.addons__card-price {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  font-family: var(--font-eyebrow);
  font-size: 0.8rem;
  font-weight: var(--weight-bold);
  background: var(--color-surface);
  color: var(--color-text);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1;
}

.addons__card-info {
  padding: var(--space-4) var(--space-1) 0;
}

.addons__card-eyebrow {
  display: block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.addons__card-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  margin: 0 0 var(--space-1);
  line-height: var(--leading-snug);
}

.addons__card-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

.addons__card-footer {
  margin-top: var(--space-3);
}

.addons__tag {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
  white-space: nowrap;
}

.addons__tag--unlocked {
    background: var(--color-complete-bg);
    color: var(--color-complete);
}

/* ─── Error state ─── */
.addons__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.addons__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.addons__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.addons__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}

/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .addons__header {
    justify-content: flex-start;
  }

  .addons__header-title {
    display: none;
  }

  .addons__back {
    display: none;
  }

  .addons__list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }

  .addons__card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: border-color var(--transition-fast);
  }

  @media (hover: hover) {
    .addons__card:hover {
      border-color: var(--color-border);
    }
  }

  .addons__card + .addons__card {
    border-top: none;
    padding-top: 0;
  }

  .addons__card-img {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    aspect-ratio: 16 / 9;
  }

  .addons__card-info {
    padding: var(--space-4) var(--space-5);
  }
}
</style>
