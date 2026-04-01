<template>
  <div class="screen">
    <div class="screen__content">
      <header class="obj__header">
        <NuxtLink to="/cuenta/biblioteca" class="obj__back" aria-label="Volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </NuxtLink>
        <h1 class="obj__title">{{ objective.title }}</h1>
      </header>

      <p v-if="objective.description" class="obj__description">{{ objective.description }}</p>

      <div class="obj__list">
        <div
          v-for="item in items"
          :key="item.id"
          :class="['obj__item', { 'obj__item--locked': isContentLocked(item) }]"
          @click="handleItemClick(item)"
        >
          <div class="obj__item-thumb-wrap">
            <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="obj__item-thumb" />
            <EntitlementLockBadge :locked="isContentLocked(item)" />
          </div>
          <div class="obj__item-body">
            <h3 class="obj__item-name">{{ item.title }}</h3>
            <p class="obj__item-meta">{{ item.meta }}</p>
            <span class="obj__item-tag">{{ objective.title }}</span>
          </div>
        </div>
      </div>

      <EntitlementPurchaseModal v-model="showPurchaseModal" :addon="selectedAddon" />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const slug = route.params.slug as string
const { isSubscriber } = useAuth()
const { isLocked, getAddonForEntitlement } = useEntitlementGating()

const showPurchaseModal = ref(false)
const selectedAddon = ref<{ id: string; title: string; description: string | null } | null>(null)

// ── Fetch objective + content in one call (avoids SSR auth race) ──
const typeLabels: Record<string, string> = { video: 'Video', audio: 'Audio', article: 'Texto' }

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const mins = Math.round(seconds / 60)
  return `${mins} min`
}

const { data: pageData } = await useAsyncData(`objective-page-${slug}`, async () => {
  const { data: obj } = await client
    .from('content_objectives')
    .select('id, title, slug')
    .eq('slug', slug)
    .single()
  if (!obj) return { objective: null, items: [] }

  const { data: contentItems } = await client
    .from('content_items')
    .select('id, title, type, duration_seconds, thumbnail_url, entitlement_key, plan')
    .eq('objective_id', obj.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return {
    objective: obj,
    items: (contentItems ?? []).map(item => ({
      id: item.id,
      title: item.title,
      meta: [formatDuration(item.duration_seconds), typeLabels[item.type] ?? item.type].filter(Boolean).join(' \u2022 '),
      thumbnail: item.thumbnail_url ?? null,
      entitlement_key: item.entitlement_key,
      plan: item.plan,
    })),
  }
})

const objective = computed(() => {
  if (pageData.value?.objective) return { title: pageData.value.objective.title, description: '' }
  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: '',
  }
})

const items = computed(() => pageData.value?.items ?? [])

function isContentLocked(item: { entitlement_key: string | null; plan?: string }) {
  if (isLocked(item.entitlement_key)) return true
  if (item.plan === 'core' && !isSubscriber.value) return true
  return false
}

function handleItemClick(item: { id: string; entitlement_key: string | null; plan?: string }) {
  if (isLocked(item.entitlement_key)) {
    selectedAddon.value = getAddonForEntitlement(item.entitlement_key!)
    showPurchaseModal.value = true
    return
  }
  if (item.plan === 'core' && !isSubscriber.value) {
    selectedAddon.value = { id: 'core', title: 'Plan Core', description: 'Suscríbete al plan Core para acceder a este contenido.' }
    showPurchaseModal.value = true
    return
  }
  router.push(`/cuenta/contenido/${item.id}`)
}
</script>

<style scoped>
/* ─── Header ─── */
.obj__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
  position: relative;
}

.obj__title {
  font-family: var(--font-eyebrow);
  font-size: 14px;
  text-transform: uppercase;
}

.obj__back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dark-lighter);
  border-radius: var(--radius-md);
  position: absolute;
  left: 0;
}
@media (hover: hover) {
  .obj__back:hover { background: rgba(var(--tint-rgb), 0.06); }
}

/* ─── Description ─── */
.obj__description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-6);
}

/* ─── Item list ─── */
.obj__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.obj__item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  text-decoration: none;
  color: var(--color-text);
  cursor: pointer;
}
@media (hover: hover) {
  .obj__item:hover { text-decoration: none; }
}

.obj__item-thumb-wrap {
  position: relative;
  flex-shrink: 0;
}

.obj__item-thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.obj__item--locked .obj__item-thumb {
  opacity: 0.65;
  filter: grayscale(20%);
}

.obj__item-body {
  flex: 1;
  min-width: 0;
}

.obj__item-name {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  margin-bottom: 2px;
}

.obj__item-meta {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: 4px;
}

.obj__item-tag {
  display: inline-block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  color: var(--color-sand);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .obj__header {
    justify-content: flex-start;
  }

  .obj__title {
    display: none;
  }

  .obj__back {
    display: none;
  }

  .obj__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .obj__item {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-4);
    transition: border-color var(--transition-fast);
  }

  @media (hover: hover) {
    .obj__item:hover {
      border-color: var(--color-border);
    }
  }
}
</style>
