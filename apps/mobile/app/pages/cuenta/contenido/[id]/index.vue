<template>
  <div class="screen">
    <!-- Skeleton -->
    <template v-if="contentStatus === 'pending'">
      <div class="detail">
        <div class="detail__media">
          <UiSkeleton variant="rect" width="100%" height="100%" />
        </div>
        <div class="detail__info">
          <UiSkeleton variant="text" width="30%" height="10px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="80%" height="24px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="50%" height="14px" style="margin-bottom: var(--space-5);" />
          <UiSkeleton variant="rect" width="100%" height="44px" radius="var(--radius-lg)" style="margin-bottom: var(--space-5);" />
          <UiSkeleton variant="text" width="100%" height="14px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="85%" height="14px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="60%" height="14px" style="margin-bottom: var(--space-5);" />
          <UiSkeleton variant="text" width="60px" height="24px" radius="var(--radius-full)" />
        </div>
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="contentStatus === 'error'">
      <div class="content__error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="content__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="content__error-title">No pudimos cargar el contenido</h2>
        <p class="content__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refreshContent()">Reintentar</UiButton>
      </div>
    </template>

    <!-- Content -->
    <template v-else>
    <div class="detail">
      <!-- Media hero (video/audio show play button, article/link show static image) -->
      <div class="detail__media">
        <img v-if="content.thumbnail" :src="content.thumbnail" alt="" class="detail__img" />
        <div class="detail__overlay" />
        <div class="detail__nav safe-top">
          <button class="detail__back" aria-label="Volver" @click="$router.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
        <!-- Play button: only for video/audio -->
        <button v-if="isPlayable" class="detail__play-btn" aria-label="Reproducir" @click="navigateTo(`/cuenta/contenido/${id}/reproducir`)">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
        </button>
      </div>

      <!-- Info -->
      <div class="detail__info">
        <button class="detail__back-link" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <p class="eyebrow">{{ content.typeLabel }}</p>
        <h1 class="title title--lg detail__title">{{ content.title }}</h1>
        <p v-if="content.subtitle" class="detail__subtitle">{{ content.subtitle }}</p>

        <!-- Actions: type-specific -->
        <div class="detail__actions">
          <!-- Video / Audio → Reproducir -->
          <UiButton v-if="isPlayable" variant="outline" block @click="navigateTo(`/cuenta/contenido/${id}/reproducir`)">
            Reproducir
          </UiButton>
          <!-- Link → Abrir enlace -->
          <UiButton v-else-if="content.type === 'link' && content.externalUrl" variant="outline" block @click="openLink">
            Abrir enlace
          </UiButton>
          <!-- Article has no action button — body renders below -->
        </div>

        <p v-if="content.description" class="detail__description">{{ content.description }}</p>

        <div class="detail__meta">
          <UiTag v-if="content.duration">{{ content.duration }}</UiTag>
        </div>

        <!-- Article body: rendered HTML from Tiptap WYSIWYG (sanitized) -->
        <div v-if="content.type === 'article' && content.body" class="detail__body" v-html="sanitizeRichHtml(content.body)" />
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { sanitizeRichHtml } from '~/composables/useHtmlSanitizer'

definePageMeta({
  layout: 'default',
  hideBottomNav: true,
})

const route = useRoute()
const id = route.params.id as string
const client = useSupabaseClient()

function formatDuration(seconds: number | null) {
  if (!seconds) return null
  const m = Math.round(seconds / 60)
  return `${m} min`
}

const typeLabels: Record<string, string> = {
  video: 'Video',
  audio: 'Audio',
  article: 'Artículo',
  link: 'Enlace',
}

const { data: contentData, status: contentStatus, refresh: refreshContent } = useAsyncData(`content-detail-${id}`, async () => {
  const { data } = await (client.rpc as any)('get_secure_content', { p_content_id: id })
  if (!data) return null
  return {
    title: data.title as string,
    subtitle: (data.subtitle as string) ?? '',
    typeLabel: typeLabels[data.type as string] ?? (data.type as string),
    type: data.type as string,
    description: (data.description as string) ?? '',
    body: (data.body as string) ?? '',
    externalUrl: (data.external_url as string) ?? '',
    duration: formatDuration(data.duration_seconds as number | null),
    thumbnail: (data.thumbnail_url as string) ?? null,
    vimeoId: (data.vimeo_id as string) ?? null,
    accessGranted: data.access_granted as boolean,
  }
}, { lazy: true })


const content = computed(() => contentData.value ?? {
  title: '',
  subtitle: '',
  typeLabel: '',
  type: 'video',
  description: '',
  body: '',
  externalUrl: '',
  duration: null,
  thumbnail: null as string | null,
  vimeoId: null as string | null,
})

const isPlayable = computed(() => {
  if (content.value.type === 'audio') return true
  if (content.value.type === 'video') return !!content.value.vimeoId
  return false
})

function openLink() {
  if (content.value.externalUrl) {
    window.open(content.value.externalUrl, '_blank', 'noopener')
  }
}

// Flag article as viewed for Hoy acción auto-complete (video/audio flagged on reproducir page)
onMounted(() => {
  if (content.value.type === 'article') {
    // Use local date — Hoy reads with the user's local day, so UTC would
    // mismatch for evening hours west of UTC.
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    localStorage.setItem(`hoy-content-done-${today}`, id)
  }

  // Mark program day item as completed when navigating from a program day
  const dayItemId = route.query.dayItemId as string | undefined
  const programIdParam = route.query.programId as string | undefined
  const dayIndexParam = route.query.dayIndex as string | undefined
  const runParam = route.query.run as string | undefined
  if (dayItemId && programIdParam && dayIndexParam && runParam) {
    const { markDayItemCompleted } = useDayItemCompletion()
    markDayItemCompleted({ programId: programIdParam, dayIndex: Number(dayIndexParam), dayItemId, run: Number(runParam) })
  }
})
</script>

<style scoped>
/* ─── Mobile layout ─── */
.detail {
  display: flex;
  flex-direction: column;
}

/* ─── Media ─── */
.detail__media {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
}

.detail__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail__overlay {
  position: absolute;
  inset: 0;
}

/* ─── Nav (mobile back) ─── */
.detail__nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: var(--space-3) var(--space-4);
}

.detail__back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dark-lighter);
  background: rgba(var(--tint-inverse-rgb), 0.85);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .detail__back:hover { background: rgba(var(--tint-inverse-rgb), 1); }
}

/* ─── Play button ─── */
.detail__play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(var(--tint-rgb), 0.45);
  backdrop-filter: blur(8px);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: background var(--transition-fast);
}
@media (hover: hover) {
  .detail__play-btn:hover { background: rgba(var(--tint-rgb), 0.65); }
}

/* ─── Back link (desktop only) ─── */
.detail__back-link {
  display: none;
}

/* ─── Info ─── */
.detail__info {
  padding: var(--space-4);
  padding-bottom: 2rem;
  width: 100%;
  max-width: var(--max-content-width);
  margin: 0 auto;
}

.detail__title {
  margin-top: var(--space-1);
  margin-bottom: var(--space-2);
}

.detail__subtitle {
  font-size: var(--text-md);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

.detail__actions { margin: var(--space-5) 0; }

.detail__description {
  font-size: var(--text-base);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-5);
}

.detail__meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.detail__meta :deep(.tag) {
  background: var(--color-sand);
  color: var(--color-white);
}

/* ─── Article body (Tiptap HTML) ─── */
.detail__body {
  margin-top: var(--space-5);
  font-size: var(--text-base);
  color: var(--color-text);
  line-height: var(--leading-relaxed);
}

.detail__body :deep(h2) {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  font-weight: var(--weight-semibold);
  margin: var(--space-6) 0 var(--space-3);
}

.detail__body :deep(h3) {
  font-family: var(--font-title);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  margin: var(--space-5) 0 var(--space-2);
}

.detail__body :deep(p) {
  margin: var(--space-3) 0;
}

.detail__body :deep(ul),
.detail__body :deep(ol) {
  padding-left: var(--space-6);
  margin: var(--space-3) 0;
}

.detail__body :deep(li) {
  margin: var(--space-1) 0;
}

.detail__body :deep(blockquote) {
  border-left: 3px solid var(--color-border);
  padding-left: var(--space-4);
  color: var(--color-muted);
  font-style: italic;
  margin: var(--space-4) 0;
}

.detail__body :deep(a) {
  color: var(--color-tint);
  text-decoration: underline;
}

.detail__body :deep(strong) {
  font-weight: var(--weight-semibold);
}

.detail__body :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-md);
  margin: var(--space-4) 0;
}

/* ─── Tablet ─── */
@media (min-width: 768px) {
  .detail__info {
    max-width: var(--max-page-width);
    padding: var(--space-6);
  }
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .detail {
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

  .detail__media {
    order: 2;
    aspect-ratio: unset;
  }

  .detail__play-btn {
    width: 72px;
    height: 72px;
  }

  .detail__nav { display: none; }

  .detail__back-link {
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
    .detail__back-link:hover { background: rgba(var(--tint-rgb), 0.06); }
  }

  .detail__info {
    order: 1;
    max-width: none;
    margin: 0;
    padding: var(--space-10);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .detail__title {
    font-size: var(--title-xl);
  }

  .detail__subtitle {
    font-size: var(--text-lg);
  }

  .detail__description {
    font-size: var(--text-lg);
  }

  .detail__info > .eyebrow {
    font-size: var(--eyebrow-lg);
  }

  .detail__actions :deep(.btn) {
    width: auto;
    display: inline-flex;
  }
}

/* ─── Error state ─── */
.content__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.content__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.content__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.content__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
