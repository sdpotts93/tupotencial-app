<template>
  <div class="screen">
    <div class="screen__content">
      <header class="obj__header page-header-sticky">
        <NuxtLink to="/cuenta/biblioteca" class="obj__back" aria-label="Volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </NuxtLink>
        <h1 class="obj__title">{{ objective.title }}</h1>
      </header>

      <!-- Loading skeleton -->
      <template v-if="objStatus === 'pending'">
        <UiSkeleton variant="text" width="80%" height="14px" style="margin-bottom: var(--space-6);" />
        <div class="obj__list">
          <div v-for="i in 6" :key="i" class="obj__item">
            <div class="obj__item-thumb-wrap">
              <UiSkeleton variant="rect" width="72px" height="72px" radius="var(--radius-lg)" />
            </div>
            <div class="obj__item-body">
              <UiSkeleton variant="text" width="70%" height="14px" style="margin-bottom: var(--space-2);" />
              <div class="obj__item-meta-row">
                <UiSkeleton variant="text" width="40px" height="12px" />
                <UiSkeleton variant="text" width="50px" height="12px" />
              </div>
              <UiSkeleton variant="text" width="30%" height="10px" style="margin-top: 4px;" />
            </div>
          </div>
        </div>
      </template>

      <!-- Error state -->
      <template v-else-if="objStatus === 'error'">
        <div class="obj__error">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="obj__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
          <h2 class="obj__error-title">No pudimos cargar el contenido</h2>
          <p class="obj__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
          <UiButton variant="primary-outline" size="sm" @click="refreshObjective()">Reintentar</UiButton>
        </div>
      </template>

      <!-- Actual content -->
      <template v-else>
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
              <div class="obj__item-meta-row">
                <span v-if="item.duration" class="obj__item-meta">{{ item.duration }}</span>
                <span v-if="item.typeLabel" class="obj__type-tag">{{ item.typeLabel }}</span>
              </div>
              <span class="obj__item-tag">{{ objective.title }}</span>
            </div>
          </div>
        </div>

        <!-- Infinite scroll sentinel -->
        <div v-if="hasMore" ref="sentinelRef" class="obj__sentinel">
          <UiSkeleton v-for="i in 2" :key="i" variant="rect" width="100%" height="72px" radius="var(--radius-lg)" />
        </div>
      </template>

      <EntitlementPurchaseModal v-model="showPurchaseModal" :addon="selectedAddon" />
    </div>
  </div>
</template>

<script setup lang="ts">
const PAGE_SIZE = 50

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const slug = route.params.slug as string
const { isSubscriber } = useAuth()
const { isLocked, getAddonForEntitlement } = useEntitlementGating()

const showPurchaseModal = ref(false)
const selectedAddon = ref<{ id: string; title: string; description: string | null } | null>(null)

const typeLabels: Record<string, string> = { video: 'Video', audio: 'Audio', article: 'Artículo', link: 'Enlace' }

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const mins = Math.round(seconds / 60)
  return `${mins} min`
}

function mapItem(r: any) {
  const item = r.content_items as any
  if (!item || item.status !== 'published') return null
  return {
    id: item.id,
    title: item.title,
    duration: formatDuration(item.duration_seconds),
    typeLabel: typeLabels[item.type] ?? item.type,
    thumbnail: item.thumbnail_url ?? undefined,
    entitlement_key: item.entitlement_key,
    plan: item.plan,
  }
}

// ── Initial load: objective + first page ──
const { data: pageData, status: objStatus, refresh: refreshObjective } = await useAsyncData(`objective-page-${slug}`, async () => {
  const { data: obj } = await client
    .from('content_objectives')
    .select('id, title, slug')
    .eq('slug', slug)
    .single()
  if (!obj) return { objective: null, objectiveId: null, items: [], hasMore: false }

  const { data: junctionRows } = await client
    .from('content_item_objectives')
    .select('position, content_items(id, title, type, duration_seconds, thumbnail_url, entitlement_key, plan, status)')
    .eq('objective_id', obj.id)
    .order('position')
    .range(0, PAGE_SIZE - 1)

  const items = (junctionRows ?? []).map(mapItem).filter((x): x is NonNullable<typeof x> => x != null)

  return { objective: obj, objectiveId: obj.id, items, hasMore: (junctionRows ?? []).length >= PAGE_SIZE }
})

const objective = computed(() => {
  if (pageData.value?.objective) return { title: pageData.value.objective.title, description: '' }
  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: '',
  }
})

// ── Infinite scroll state ──
const extraItems = ref<NonNullable<ReturnType<typeof mapItem>>[]>([])
const hasMore = ref(pageData.value?.hasMore ?? false)
const loadingMore = ref(false)
const offset = ref(PAGE_SIZE)

const items = computed(() => [...(pageData.value?.items ?? []), ...extraItems.value])

async function loadMore() {
  const objectiveId = pageData.value?.objectiveId
  if (!objectiveId || loadingMore.value || !hasMore.value) return
  loadingMore.value = true

  const { data: junctionRows } = await client
    .from('content_item_objectives')
    .select('position, content_items(id, title, type, duration_seconds, thumbnail_url, entitlement_key, plan, status)')
    .eq('objective_id', objectiveId)
    .order('position')
    .range(offset.value, offset.value + PAGE_SIZE - 1)

  const batch = (junctionRows ?? []).map(mapItem).filter((x): x is NonNullable<typeof x> => x != null)
  extraItems.value.push(...batch)
  offset.value += (junctionRows ?? []).length
  hasMore.value = (junctionRows ?? []).length >= PAGE_SIZE
  loadingMore.value = false
}

// ── IntersectionObserver for sentinel ──
const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => { if (entries[0]?.isIntersecting) loadMore() },
    { rootMargin: '200px' },
  )
  watchEffect(() => {
    observer?.disconnect()
    if (sentinelRef.value) observer?.observe(sentinelRef.value)
  })
})

onBeforeUnmount(() => observer?.disconnect())

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

.obj__item-meta-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: 4px;
}

.obj__item-meta {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
}

.obj__type-tag {
  display: inline-block;
  font-size: 10px;
  font-family: var(--font-eyebrow);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
  background: #ebebeb;
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
}

.obj__item-tag {
  display: inline-block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  color: var(--color-sand);
}

/* ─── Infinite scroll sentinel ─── */
.obj__sentinel {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  margin-top: var(--space-5);
}

/* ─── Error state ─── */
.obj__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.obj__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.obj__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.obj__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
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
