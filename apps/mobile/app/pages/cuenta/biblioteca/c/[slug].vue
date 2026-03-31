<template>
  <div class="screen">
    <div class="screen__content">
      <header class="cat__header">
        <NuxtLink to="/cuenta/biblioteca" class="cat__back" aria-label="Volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </NuxtLink>
        <h1 class="cat__title">{{ category.title }}</h1>
      </header>

      <div class="cat__list">
        <div
          v-for="item in items"
          :key="item.id"
          :class="['cat__item', { 'cat__item--locked': isContentLocked(item) }]"
          @click="handleItemClick(item)"
        >
          <div class="cat__item-thumb-wrap">
            <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="cat__item-thumb" />
            <EntitlementLockBadge :locked="isContentLocked(item)" />
          </div>
          <div class="cat__item-body">
            <h3 class="cat__item-name">{{ item.title }}</h3>
            <p class="cat__item-meta">{{ item.meta }}</p>
            <span class="cat__item-category">{{ category.title }}</span>
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
const slug = route.params.slug as string
const client = useSupabaseClient()
const { isSubscriber } = useAuth()
const { isLocked, getAddonForEntitlement } = useEntitlementGating()

const showPurchaseModal = ref(false)
const selectedAddon = ref<{ id: string; title: string; description: string | null } | null>(null)

function formatDuration(seconds: number | null) {
  if (!seconds) return null
  const m = Math.round(seconds / 60)
  return `${m} min`
}

const { data: categoryData } = await useAsyncData(`category-${slug}`, async () => {
  // Fetch the category by slug
  const { data: cat } = await client
    .from('content_categories')
    .select('id, title, slug')
    .eq('slug', slug)
    .single()
  if (!cat) return { title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), items: [] }

  // Fetch content items linked to this category
  const { data: itemCats } = await client
    .from('content_item_categories')
    .select('position, content_items(id, title, type, duration_seconds, thumbnail_url, entitlement_key, plan)')
    .eq('category_id', cat.id)
    .order('position')

  const items = (itemCats ?? [])
    .map(ic => {
      const item = ic.content_items as any
      if (!item) return null
      const durationLabel = formatDuration(item.duration_seconds)
      const typeLabel = item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : ''
      return {
        id: item.id,
        title: item.title,
        meta: [durationLabel, typeLabel].filter(Boolean).join(' \u2022 '),
        thumbnail: item.thumbnail_url ?? '/images/lib-1.jpg',
        entitlement_key: item.entitlement_key,
        plan: item.plan,
      }
    })
    .filter(Boolean)

  return { title: cat.title, items }
})

const category = computed(() => ({
  title: categoryData.value?.title ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
}))

const items = computed(() => categoryData.value?.items ?? [])

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
/* ─── Header (matches /library) ─── */
.cat__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
  position: relative;
}

.cat__title {
  font-family: var(--font-eyebrow);
  font-size: 14px;
  text-transform: uppercase;
}

.cat__back {
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
  .cat__back:hover { background: rgba(var(--tint-rgb), 0.06); }
}

/* ─── Item list ─── */
.cat__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.cat__item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  text-decoration: none;
  color: var(--color-text);
  cursor: pointer;
}
@media (hover: hover) {
  .cat__item:hover { text-decoration: none; }
}

.cat__item-thumb-wrap {
  position: relative;
  flex-shrink: 0;
}

.cat__item-thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.cat__item--locked .cat__item-thumb {
  opacity: 0.65;
  filter: grayscale(20%);
}

.cat__item-body {
  flex: 1;
  min-width: 0;
}

.cat__item-name {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  margin-bottom: 2px;
}

.cat__item-meta {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: 4px;
}

.cat__item-category {
  display: inline-block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  color: var(--color-sand);
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .cat__header {
    justify-content: flex-start;
  }

  .cat__title {
    display: none;
  }

  .cat__back {
    display: none;
  }

  .cat__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .cat__item {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-4);
    transition: border-color var(--transition-fast);
  }

  @media (hover: hover) {
    .cat__item:hover {
      border-color: var(--color-border);
    }
  }
}
</style>
