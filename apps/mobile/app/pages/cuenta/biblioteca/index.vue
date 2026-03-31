<template>
  <div class="screen">
    <div class="screen__content">
      <header class="library__header">
        <h1 class="library__title">Biblioteca</h1>
        <button v-if="!searching" class="library__search-btn" aria-label="Buscar" @click="openSearch">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span class="library__search-btn-label">Buscar</span>
        </button>
        <button v-else class="library__search-btn" aria-label="Cerrar búsqueda" @click="closeSearch">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <span class="library__search-btn-label">Cerrar</span>
        </button>
      </header>

      <!-- Inline search -->
      <div v-if="searching" class="library__search">
        <UiInput
          ref="searchInputRef"
          v-model="query"
          placeholder="Buscar contenido..."
          type="search"
          class="library__search-input"
        >
          <template #prefix>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </template>
        </UiInput>

        <div v-if="query" class="library__search-results">
          <p v-if="filteredResults.length" class="eyebrow library__search-results-label">RESULTADOS</p>

          <div class="library__search-list">
            <div
              v-for="item in filteredResults"
              :key="item.id"
              :class="['library__search-item', { 'library__search-item--locked': isLocked(item.entitlement_key) }]"
              @click="handleSearchClick(item)"
            >
              <div class="library__search-item-thumb-wrap">
                <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="library__search-item-thumb" />
                <EntitlementLockBadge :locked="isLocked(item.entitlement_key)" />
              </div>
              <div class="library__search-item-body">
                <h3 class="library__search-item-name">{{ item.title }}</h3>
                <p class="library__search-item-meta">{{ item.meta }}</p>
                <span class="library__search-item-category">{{ item.category }}</span>
              </div>
            </div>
          </div>

          <UiEmptyState v-if="!filteredResults.length" title="Sin resultados" description="Intenta con otros términos de búsqueda." />
        </div>
      </div>

      <!-- Library content (hidden while searching) -->
      <template v-else>
        <!-- Tabs -->
        <UiTabs v-model="activeTab" :tabs="tabs" />

        <!-- ═══════════ TAB: Categorías ═══════════ -->
        <template v-if="activeTab === 'categorias'">
          <!-- Featured / hero -->
          <section v-if="featuredItem" class="library__featured">
            <h2 class="library__section-title">Destacado</h2>
            <div :class="['library__featured-card', { 'library__featured-card--locked': isContentLocked(featuredItem) }]" @click="handleContentClick(featuredItem)">
              <div class="library__featured-img-wrap">
                <img :src="featuredItem.thumbnail" alt="" class="library__featured-img" />
                <EntitlementLockBadge :locked="isContentLocked(featuredItem)" />
              </div>
              <div class="library__featured-info">
                <div class="library__featured-eyebrow-row">
                  <span class="library__featured-eyebrow">{{ featuredItem.typeLabel }} {{ featuredItem.duration ? `\u2022 ${featuredItem.duration}` : '' }}</span>
                  <Icon name="lucide:arrow-up-right" size="16" class="library__featured-arrow" />
                </div>
                <h3 class="library__featured-name">{{ featuredItem.title }}</h3>
              </div>
            </div>
          </section>

          <!-- Categories -->
          <section v-for="cat in categories" :key="cat.slug" class="library__section">
            <div class="section__header">
              <h2 class="library__section-title">{{ cat.title }}</h2>
              <NuxtLink :to="`/cuenta/biblioteca/c/${cat.slug}`" class="library__see-all">Ver todo</NuxtLink>
            </div>
            <div class="library__scroll">
              <div
                v-for="item in cat.items"
                :key="item.id"
                :class="['library__scroll-card', { 'library__scroll-card--locked': isLocked(item.entitlement_key) }]"
                @click="handleContentClick(item)"
              >
                <div class="library__scroll-img-wrap">
                  <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="library__scroll-img" />
                  <EntitlementLockBadge :locked="isLocked(item.entitlement_key)" />
                </div>
                <div class="library__scroll-info">
                  <span class="library__scroll-title">{{ item.title }}</span>
                  <span v-if="item.duration" class="library__scroll-duration">
                    <Icon class="clock-icon" name="lucide:clock" size="12" /> {{ item.duration }}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- Eventos Grabados -->
          <section class="library__section">
            <div class="section__header">
              <h2 class="library__section-title">Eventos Grabados</h2>
              <NuxtLink to="/cuenta/eventos" class="library__see-all">Ver todo</NuxtLink>
            </div>
            <div class="library__scroll">
              <div
                v-for="ev in recordedEvents"
                :key="ev.id"
                :class="['library__scroll-card', { 'library__scroll-card--locked': isContentLocked(ev) }]"
                @click="handleEventClick(ev)"
              >
                <div class="library__scroll-img-wrap">
                  <img :src="ev.img" :alt="ev.title" loading="lazy" class="library__scroll-img" />
                  <EntitlementLockBadge :locked="isContentLocked(ev)" />
                </div>
                <div class="library__scroll-info">
                  <span class="library__scroll-title">{{ ev.title }}</span>
                  <span class="library__scroll-duration">
                    <Icon class="clock-icon" name="lucide:clock" size="12" /> {{ ev.dateLabel }}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </template>

        <!-- ═══════════ TAB: Programas ═══════════ -->
        <template v-if="activeTab === 'programas'">
          <p class="library__tab-intro">Contenido incluido en cada programa, reto o bootcamp.</p>

          <section v-for="prog in programsWithContent" :key="prog.id" class="library__section">
            <div class="section__header">
              <div class="library__prog-header">
                <h2 class="library__section-title library__section-title--prog">{{ prog.title }}</h2>
                <div class="library__prog-tags">
                  <span class="library__prog-badge">{{ prog.typeLabel }}</span>
                  <span :class="['library__prog-status', prog.enrolled ? 'library__prog-status--inscrito' : (prog.free ? 'library__prog-status--gratis' : 'library__prog-status--core')]">
                    {{ prog.enrolled ? 'Inscrito' : (prog.free ? 'Gratis' : 'Core') }}
                  </span>
                </div>
              </div>
              <NuxtLink :to="`/cuenta/retos/${prog.id}`" class="library__see-all">Ver programa</NuxtLink>
            </div>
            <div class="library__scroll">
              <NuxtLink
                v-for="item in prog.items"
                :key="item.id"
                :to="`/cuenta/contenido/${item.id}`"
                class="library__scroll-card"
              >
                <img :src="item.thumbnail" :alt="item.title" loading="lazy" class="library__scroll-img" />
                <div class="library__scroll-info">
                  <span class="library__scroll-title">{{ item.title }}</span>
                  <span v-if="item.duration" class="library__scroll-duration">
                    <Icon class="clock-icon" name="lucide:clock" size="12" /> {{ item.duration }}
                  </span>
                </div>
              </NuxtLink>
            </div>
          </section>
        </template>

        <!-- ═══════════ TAB: Objetivos ═══════════ -->
        <template v-if="activeTab === 'objetivos'">
          <p class="library__tab-intro">Encuentra contenido según lo que quieres trabajar.</p>

          <div class="library__objectives-grid">
            <NuxtLink
              v-for="obj in objectives"
              :key="obj.slug"
              :to="`/cuenta/biblioteca/o/${obj.slug}`"
              class="library__objective-card"
            >
              <div class="library__objective-icon-wrap">
                <Icon :name="obj.icon" size="22" class="library__objective-icon" />
              </div>
              <div class="library__objective-body">
                <h3 class="library__objective-name">{{ obj.title }}</h3>
                <p class="library__objective-desc">{{ obj.description }}</p>
              </div>
              <span class="library__objective-count">{{ obj.count }} {{ obj.count === 1 ? 'contenido' : 'contenidos' }}</span>
            </NuxtLink>
          </div>
        </template>
      </template>

      <EntitlementPurchaseModal v-model="showPurchaseModal" :addon="selectedAddon" />
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { user, isSubscriber } = useAuth()
const { isLocked, getAddonForEntitlement } = useEntitlementGating()
const client = useSupabaseClient()

const searching = ref(false)
const query = ref('')
const searchInputRef = ref()
const activeTab = useState('library-tab', () => 'categorias')
const showPurchaseModal = ref(false)
const selectedAddon = ref<{ id: string; title: string; description: string | null } | null>(null)

const tabs = [
  { value: 'categorias', label: 'Categorías' },
  { value: 'programas', label: 'Programas' },
  { value: 'objetivos', label: 'Objetivos' },
]

function openSearch() {
  searching.value = true
  nextTick(() => {
    searchInputRef.value?.$el?.querySelector('input')?.focus()
  })
}

function closeSearch() {
  searching.value = false
  query.value = ''
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null
  const m = Math.round(seconds / 60)
  return `${m} min`
}

// ─── Database-powered search via Postgres full-text search ───
const searchResults = ref<{ id: string; title: string; meta: string; category: string; thumbnail: string; entitlement_key: string | null }[]>([])
const searchLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(query, (q) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (!q || q.length < 2) {
    searchResults.value = []
    return
  }
  searchLoading.value = true
  searchTimer = setTimeout(async () => {
    const { data } = await client.rpc('search_content', { search_query: q, max_results: 20 })
    searchResults.value = (data ?? []).map((c: any) => ({
      id: c.id,
      title: c.title,
      meta: `${formatDuration(c.duration_seconds) ?? ''} ${c.type ? `\u2022 ${c.type.charAt(0).toUpperCase() + c.type.slice(1)}` : ''}`.trim(),
      category: c.category_title ?? '',
      thumbnail: c.thumbnail_url ?? '/images/lib-1.jpg',
      entitlement_key: c.entitlement_key ?? null,
    }))
    searchLoading.value = false
  }, 300)
})

const filteredResults = computed(() => searchResults.value)

// ─── Tab: Categorías ───
const { data: categoriesData } = await useAsyncData('mobile-library-categories', async () => {
  // Fetch categories
  const { data: cats } = await client
    .from('content_categories')
    .select('id, title, slug')
    .eq('status', 'active')
    .order('sort_order')
  // Fetch content items with their category links
  const { data: itemCats } = await client
    .from('content_item_categories')
    .select('category_id, position, content_items(id, title, type, plan, duration_seconds, thumbnail_url, entitlement_key, status)')
    .order('position')
  // Group items by category
  const catItemsMap = new Map<string, any[]>()
  for (const ic of itemCats ?? []) {
    const item = ic.content_items as any
    if (!item || item.status !== 'published') continue
    const arr = catItemsMap.get(ic.category_id) ?? []
    arr.push({
      id: item.id,
      title: item.title,
      typeLabel: item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : '',
      duration: formatDuration(item.duration_seconds),
      thumbnail: item.thumbnail_url ?? '/images/lib-1.jpg',
      entitlement_key: item.entitlement_key,
      plan: item.plan,
    })
    catItemsMap.set(ic.category_id, arr)
  }
  return (cats ?? []).filter(cat => (catItemsMap.get(cat.id) ?? []).length > 0).map(cat => ({
    title: cat.title,
    slug: cat.slug,
    items: catItemsMap.get(cat.id) ?? [],
  }))
})
const categories = computed(() => categoriesData.value ?? [])

// Featured content from app_settings
const { data: featuredContentId } = await useAsyncData('biblioteca-featured', async () => {
  const { data } = await client.from('app_settings').select('value').eq('key', 'biblioteca_featured').single()
  return (data?.value as any)?.content_id ?? null
})
const featuredItem = computed(() => {
  const fid = featuredContentId.value
  if (fid) {
    for (const cat of categories.value) {
      const found = cat.items.find((i: any) => i.id === fid)
      if (found) return found
    }
  }
  // Fallback to first item if featured not found
  const firstCat = categories.value[0]
  return firstCat?.items?.[0] ?? null
})

const { data: recordedEvents } = await useAsyncData('mobile-library-recorded-events', async () => {
  const { data } = await client
    .from('events')
    .select('id, title, start_at, cover_url, entitlement_key, plan')
    .eq('status', 'published')
    .lt('start_at', new Date().toISOString())
    .order('start_at', { ascending: false })
    .limit(5)
  return (data ?? []).map(e => ({
    id: e.id,
    title: e.title,
    dateLabel: new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(e.start_at)),
    img: e.cover_url ?? '/images/lib-2.jpg',
    entitlement_key: e.entitlement_key,
    plan: e.plan,
  }))
})

function isContentLocked(item: { entitlement_key: string | null; plan?: string }) {
  if (isLocked(item.entitlement_key)) return true
  if (item.plan === 'core' && !isSubscriber.value) return true
  return false
}

function handleContentClick(item: { id: string; entitlement_key: string | null; plan?: string }) {
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

function handleSearchClick(item: { id: string; entitlement_key: string | null }) {
  if (isLocked(item.entitlement_key)) {
    selectedAddon.value = getAddonForEntitlement(item.entitlement_key!)
    showPurchaseModal.value = true
    return
  }
  router.push(`/cuenta/contenido/${item.id}`)
}

function handleEventClick(ev: { id: string; entitlement_key: string | null; plan?: string }) {
  if (isLocked(ev.entitlement_key)) {
    selectedAddon.value = getAddonForEntitlement(ev.entitlement_key!)
    showPurchaseModal.value = true
    return
  }
  if (ev.plan === 'core' && !isSubscriber.value) {
    selectedAddon.value = { id: 'core', title: 'Plan Core', description: 'Suscríbete al plan Core para acceder a este contenido.' }
    showPurchaseModal.value = true
    return
  }
  router.push(`/cuenta/eventos/${ev.id}`)
}

// ─── Tab: Programas ───
const { data: programsWithContent } = await useAsyncData('mobile-library-programs', async () => {
  if (!user.value?.id) return []
  const { data: progs } = await client.from('programs').select('id, type, title, plan, is_active').eq('is_active', true).order('created_at')
  const { data: enrollments } = await client.from('program_enrollments').select('program_id').eq('user_id', user.value.id)
  const enrolledIds = new Set((enrollments ?? []).map(e => e.program_id))
  // Get content items linked to programs via program_days -> program_day_items -> content_items
  const { data: dayItems } = await client
    .from('program_day_items')
    .select('program_days(program_id), content_items(id, title, duration_seconds, thumbnail_url)')
    .eq('type', 'content')
    .order('position')
  // Group content items by program_id
  const progContentMap = new Map<string, any[]>()
  for (const di of dayItems ?? []) {
    const programId = (di.program_days as any)?.program_id
    const item = di.content_items as any
    if (!programId || !item) continue
    const arr = progContentMap.get(programId) ?? []
    // Avoid duplicates
    if (!arr.some(existing => existing.id === item.id)) {
      arr.push({
        id: item.id,
        title: item.title,
        duration: formatDuration(item.duration_seconds),
        thumbnail: item.thumbnail_url ?? '/images/lib-1.jpg',
      })
    }
    progContentMap.set(programId, arr)
  }
  return (progs ?? []).filter(p => (progContentMap.get(p.id) ?? []).length > 0).map(p => ({
    id: p.id,
    type: p.type,
    typeLabel: p.type.toUpperCase(),
    title: p.title,
    enrolled: enrolledIds.has(p.id),
    free: p.plan === 'free',
    items: progContentMap.get(p.id) ?? [],
  }))
}, { watch: [() => user.value?.id] })

// ─── Tab: Objetivos ───
const { data: objectives } = await useAsyncData('mobile-library-objectives', async () => {
  const { data: objs } = await client.from('content_objectives').select('id, title, slug').order('position')
  // Count published content per objective
  const { data: items } = await client
    .from('content_items')
    .select('id, objective_id')
    .eq('status', 'published')
    .not('objective_id', 'is', null)
  const countMap = new Map<string, number>()
  for (const item of items ?? []) {
    if (item.objective_id) {
      countMap.set(item.objective_id, (countMap.get(item.objective_id) ?? 0) + 1)
    }
  }
  return (objs ?? []).map(o => ({
    slug: o.slug,
    title: o.title,
    description: '',
    icon: 'lucide:target',
    count: countMap.get(o.id) ?? 0,
  }))
})
</script>

<style scoped>
/* ─── Header ─── */
.library__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
  position: relative;
}

.library__title {
  font-family: var(--font-eyebrow);
  font-size: 14px;
  text-transform: uppercase;
}

.library__search-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  position: absolute;
  right: 0;
  -webkit-tap-highlight-color: transparent;
}
.library__search-btn-label { display: none; }
@media (hover: hover) {
  .library__search-btn:hover { background: rgba(var(--tint-rgb), 0.06); }
}

/* ─── Inline search ─── */
.library__search-input { margin-bottom: var(--space-6); }

.library__search-input :deep(.input-field__input) {
  color: var(--color-text);
}

.library__search-results-label { margin-bottom: var(--space-4); }

.library__search-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.library__search-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  text-decoration: none;
  color: var(--color-text);
  cursor: pointer;
}

.library__search-item-thumb-wrap {
  position: relative;
  flex-shrink: 0;
}

.library__search-item-thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.library__search-item--locked .library__search-item-thumb {
  opacity: 0.65;
  filter: grayscale(20%);
}

.library__search-item-body {
  flex: 1;
  min-width: 0;
}

.library__search-item-name {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  margin-bottom: 2px;
}

.library__search-item-meta {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  margin-bottom: 4px;
}

.library__search-item-category {
  display: inline-block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  color: var(--color-sand);
}

/* ─── Tab intro text ─── */
.library__tab-intro {
  font-size: var(--text-md);
  color: var(--color-muted);
  margin: var(--space-5) 0 var(--space-4);
  text-align: left;
  line-height: var(--leading-normal);
}

/* ─── Section titles ─── */
.library__section-title {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--space-3);
}

.library__section-title--prog {
  margin-bottom: 0;
}

/* ─── Featured ─── */
.library__featured { margin-bottom: var(--space-8); margin-top: var(--space-5); }

.library__featured-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: var(--radius-2xl);
  text-decoration: none;
  color: var(--color-text);
  cursor: pointer;
}

.library__featured-img-wrap {
  position: relative;
}

.library__featured-card--locked .library__featured-img {
  opacity: 0.65;
  filter: grayscale(20%);
}

.library__featured-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-2xl);
}

.library__featured-info {
  padding: var(--space-4) var(--space-1) 0;
}

.library__featured-eyebrow-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-1);
}

.library__featured-eyebrow {
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.library__featured-arrow {
  color: var(--color-muted);
  flex-shrink: 0;
}

.library__featured-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  margin: 0 0 var(--space-1);
  line-height: var(--leading-snug);
}

.library__featured-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

/* ─── Sections ─── */
.library__section { margin-bottom: var(--space-8); }

.section__header {
  align-items: baseline;
  margin-bottom: var(--space-4);
}

.library__see-all {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  text-decoration: none;
}

/* ─── Horizontal scroll ─── */
.library__scroll {
  display: flex;
  gap: var(--space-3);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline-start: var(--space-5);
  -webkit-overflow-scrolling: touch;
  margin: 0 calc(-1 * var(--space-5));
  scrollbar-width: none;
}

.library__scroll::before,
.library__scroll::after {
  content: '';
  flex: 0 0 var(--space-5);
}

.library__scroll::-webkit-scrollbar { display: none; }

.library__scroll-card {
  flex: 0 0 60%;
  scroll-snap-align: start;
  text-decoration: none;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.library__scroll-img-wrap {
  position: relative;
}

.library__scroll-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-xl);
}

.library__scroll-card--locked .library__scroll-img {
  opacity: 0.65;
  filter: grayscale(20%);
}

.library__scroll-info {
  padding: var(--space-3) var(--space-1) 0;
}

.library__scroll-title {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.library__scroll-duration {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--color-muted);
  margin-top: var(--space-1);
  font-family: var(--font-eyebrow);
  text-transform: uppercase;
}

/* ─── Programs tab: header + badge ─── */
.library__prog-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.library__prog-tags {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-block: var(--space-1);
}

.library__prog-badge {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  white-space: nowrap;
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
}

.library__prog-status {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.library__prog-status--core {
  background: var(--color-gold-bg);
  color: var(--color-gold);
}

.library__prog-status--gratis {
  background: var(--color-silver-bg);
  color: var(--color-silver);
}

.library__prog-status--inscrito {
  background: var(--color-complete-bg);
  color: var(--color-complete);
}

/* ─── Objectives tab: grid ─── */
.library__objectives-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.library__objective-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  background: var(--color-surface-alt);
  text-decoration: none;
  color: var(--color-text);
  transition: background var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}

@media (hover: hover) {
  .library__objective-card:hover {
    background: var(--color-surface);
  }
}

.library__objective-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: rgba(var(--tint-rgb), 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-3);
  color: var(--color-text-secondary);
}

.library__objective-body {
  flex: 1;
  min-width: 0;
}

.library__objective-name {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  margin-bottom: var(--space-1);
}

.library__objective-desc {
  font-size: var(--text-xs);
  color: var(--color-muted);
  line-height: var(--leading-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.library__objective-count {
  display: block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-medium);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-sand);
  margin-top: var(--space-3);
}


/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .library__header {
    justify-content: flex-start;
    gap: var(--space-4);
  }

  .library__title {
    font-size: var(--text-lg);
    display: none; /* title shown in top bar */
  }

  .library__search-btn {
    position: static;
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-md);
    width: auto;
    height: 36px;
    padding: 0 var(--space-3);
    gap: var(--space-2);
    color: var(--color-muted);
  }

  @media (hover: hover) {
    .library__search-btn:hover {
      border-color: var(--color-border);
      color: var(--color-text);
    }
  }

  .library__search-btn-label {
    display: inline;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }

  .library__featured-card {
    flex-direction: row;
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    position: relative;
  }

  .library__featured-arrow {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    color: var(--color-muted);
  }

  .library__featured-img {
    width: 520px;
    aspect-ratio: 4 / 3;
    border-radius: var(--radius-lg);
    margin: var(--space-4);
    flex-shrink: 0;
  }

  .library__featured-info {
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0 auto;
  }

  .library__scroll {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-4);
    overflow-x: visible;
    margin: 0;
  }

  .library__scroll::before,
  .library__scroll::after {
    display: none;
  }

  .library__scroll-card {
    flex: none;
    min-width: 0;
  }

  .library__scroll-img {
    border-radius: var(--radius-lg);
  }

  .library__search-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .library__search-item {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-4);
    transition: border-color var(--transition-fast);
  }

  @media (hover: hover) {
    .library__search-item:hover {
      border-color: var(--color-border);
    }
  }

  /* Objectives: 3 columns on desktop */
  .library__objectives-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }

  .library__objective-card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    transition: border-color var(--transition-fast), background var(--transition-fast);
  }

  @media (hover: hover) {
    .library__objective-card:hover {
      border-color: var(--color-border);
      background: var(--color-desktop-card);
    }
  }
}
</style>
