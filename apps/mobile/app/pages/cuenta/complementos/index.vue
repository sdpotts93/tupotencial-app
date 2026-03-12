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

      <p class="addons__intro">Lleva tu experiencia al siguiente nivel con contenido y experiencias exclusivas.</p>

      <div class="addons__list">
        <NuxtLink
          v-for="addon in addons"
          :key="addon.id"
          :to="`/cuenta/complementos/${addon.id}`"
          class="addons__card"
        >
          <div class="addons__card-hero">
            <img v-if="addon.img" :src="addon.img" alt="" class="addons__card-img" />
            <div v-else class="addons__card-gradient" :style="{ background: addon.bg }" />
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

const { data: addons } = await useAsyncData('mobile-addons', async () => {
  if (!user.value?.id) return []
  const { data: addonsList } = await client.from('addons').select('*').eq('status', 'active').order('created_at')
  const { data: purchases } = await client.from('addon_purchases').select('addon_id').eq('user_id', user.value.id)
  const purchasedIds = new Set((purchases ?? []).map(p => p.addon_id))
  return (addonsList ?? []).map(a => ({
    id: a.id,
    title: a.title,
    description: a.description,
    priceLabel: formatPrice(a.price),
    img: a.cover_url,
    bg: 'linear-gradient(135deg, var(--color-surface-alt) 0%, var(--color-surface) 100%)',
    owned: purchasedIds.has(a.id),
  }))
}, { watch: [() => user.value?.id] })
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
