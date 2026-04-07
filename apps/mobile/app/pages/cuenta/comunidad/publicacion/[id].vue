<template>
  <div class="screen">
    <div class="screen__content">
      <header class="pdetail__header">
        <button class="pdetail__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="pdetail__header-title">Publicación</h1>
      </header>

      <!-- Skeleton -->
      <template v-if="postStatus === 'pending'">
        <div class="post-detail">
          <div class="post-detail__header">
            <UiSkeleton variant="circle" width="40px" height="40px" />
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <UiSkeleton variant="text" width="100px" height="14px" />
              <UiSkeleton variant="text" width="60px" height="10px" />
            </div>
          </div>
          <UiSkeleton variant="text" width="70%" height="20px" style="margin-bottom: var(--space-3);" />
          <UiSkeleton variant="text" width="100%" height="14px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="90%" height="14px" style="margin-bottom: var(--space-2);" />
          <UiSkeleton variant="text" width="60%" height="14px" style="margin-bottom: var(--space-4);" />
          <UiSkeleton variant="rect" width="100%" height="200px" radius="var(--radius-lg)" />
        </div>
        <section class="post-detail__comments">
          <UiSkeleton variant="text" width="40%" height="10px" style="margin-bottom: var(--space-4);" />
          <div v-for="i in 3" :key="i" style="display: flex; gap: var(--space-3); padding: var(--space-3) 0;">
            <UiSkeleton variant="circle" width="28px" height="28px" />
            <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
              <UiSkeleton variant="text" width="30%" height="10px" />
              <UiSkeleton variant="text" width="80%" height="12px" />
            </div>
          </div>
        </section>
      </template>

      <!-- Error state -->
      <template v-else-if="postStatus === 'error'">
        <div class="post__error">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="post__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
          <h2 class="post__error-title">No pudimos cargar la publicacion</h2>
          <p class="post__error-desc">Hubo un problema al conectar. Revisa tu conexion e intenta de nuevo.</p>
          <UiButton variant="primary-outline" size="sm" @click="refreshPost()">Reintentar</UiButton>
        </div>
      </template>

      <!-- Content -->
      <template v-else>
      <!-- Post -->
      <article class="post-detail">
        <div class="post-detail__header">
          <img :src="post.avatar" alt="" class="post-detail__avatar" />
          <div>
            <span class="post-detail__author">{{ post.author }}</span>
            <span class="post-detail__time">{{ post.timeAgo }}</span>
          </div>
        </div>
        <h1 v-if="post.title" class="post-detail__title">{{ post.title }}</h1>
        <p class="post-detail__body">{{ post.body }}</p>

        <template v-if="post.media_url">
          <video v-if="isVideo(post.media_url)" :src="post.media_url" controls class="post-detail__media" />
          <img v-else :src="post.media_url" alt="" class="post-detail__media" />
        </template>
        <div class="post-detail__stats">
          <button class="post-detail__like" @click="toggleLike">
            <svg class="icon-t" width="16" height="16" viewBox="0 0 24 24" :fill="post.liked ? 'var(--color-danger)' : 'none'" :stroke="post.liked ? 'var(--color-danger)' : 'currentColor'" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            {{ post.reactions }}
          </button>
        </div>
      </article>

      <!-- Comments -->
      <section class="post-detail__comments">
        <p class="eyebrow">COMENTARIOS ({{ totalCommentCount }})</p>
        <div class="post-detail__comment-list">
          <div v-for="comment in allComments" :key="comment.id" class="comment">
            <div class="comment__avatar"><span>{{ comment.initials }}</span></div>
            <div class="comment__content">
              <div class="comment__top">
                <span class="comment__author">{{ comment.author }}</span>
                <span class="comment__dot">&middot;</span>
                <span class="comment__time">{{ comment.timeAgo }}</span>
              </div>
              <p class="comment__body">{{ comment.body }}</p>
            </div>
          </div>
        </div>

        <!-- Infinite scroll sentinel -->
        <div v-if="hasMoreComments" ref="commentSentinelRef" class="post-detail__comment-sentinel">
          <div v-for="i in 2" :key="i" style="display: flex; gap: var(--space-3); padding: var(--space-3) 0;">
            <UiSkeleton variant="circle" width="28px" height="28px" />
            <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
              <UiSkeleton variant="text" width="30%" height="10px" />
              <UiSkeleton variant="text" width="80%" height="12px" />
            </div>
          </div>
        </div>
      </section>
      </template>
    </div>

    <!-- Fixed input bar -->
    <div class="post-detail__add safe-bottom">
      <div class="post-detail__add-inner">
        <input
          v-model="newComment"
          class="post-detail__input"
          placeholder="Escribe un comentario..."
        />
        <button class="post-detail__send" :disabled="!newComment.trim() || submitting" @click="submitComment">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const client = useSupabaseClient()
const { user } = useAuth()
const { avatarUrl } = useCharacterAvatars()
const toast = useToast()
const postId = route.params.id as string

function formatTimeAgo(dateStr: string) {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  const days = Math.floor(hours / 24)
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm)(\?|$)/i.test(url)
}

// Load post data
const segmentAuthor: Record<string, string> = { gabriel: 'Gabriel', carlotta: 'Carlotta' }


const { data: postData, refresh: refreshPost, status: postStatus } = useAsyncData(`post-${postId}`, async () => {
  const { data } = await client
    .from('posts')
    .select('*, post_reactions(user_id, reaction)')
    .eq('id', postId)
    .single()
  if (!data) return null
  return {
    ...data,
    author: segmentAuthor[data.community_segment ?? ''] ?? 'Gabriel',
    avatar: avatarUrl(data.community_segment ?? 'gabriel'),
    reactions: ((data.post_reactions as any) ?? []).length,
    liked: ((data.post_reactions as any) ?? []).some((r: any) => r.user_id === user.value?.id),
    timeAgo: formatTimeAgo(data.created_at),
  }
}, { lazy: true })

const post = computed(() => postData.value ?? {
  author: '', avatar: '', timeAgo: '', title: '', body: '', media_url: null, reactions: 0, liked: false,
})

// Load comments
const COMMENT_PAGE_SIZE = 20

function mapComment(c: any) {
  return {
    id: c.id,
    author: (c.profiles as any)?.display_name ?? 'Anónimo',
    initials: getInitials((c.profiles as any)?.display_name ?? 'A'),
    body: c.body,
    timeAgo: formatTimeAgo(c.created_at),
  }
}

const { data: commentsData } = useAsyncData(`post-comments-${postId}`, async () => {
  const { data } = await client
    .from('post_comments')
    .select('*, profiles:user_id(display_name)')
    .eq('post_id', postId)
    .eq('status', 'published')
    .order('created_at', { ascending: true })
    .range(0, COMMENT_PAGE_SIZE - 1)
  const items = (data ?? []).map(mapComment)
  return { items, hasMore: items.length >= COMMENT_PAGE_SIZE }
}, { lazy: true })

// ── Comment pagination state ──
const extraComments = ref<any[]>([])
const hasMoreComments = ref(false)
const loadingMoreComments = ref(false)
const commentOffset = ref(0)

watch(() => commentsData.value, (val) => {
  extraComments.value = []
  hasMoreComments.value = val?.hasMore ?? false
  commentOffset.value = val?.items.length ?? 0
}, { immediate: true })

const allComments = computed(() => [...(commentsData.value?.items ?? []), ...extraComments.value])

// Total count: use post_comments count from post query if available, otherwise use loaded length
const { data: commentCountData } = useAsyncData(`post-comment-count-${postId}`, async () => {
  const { count } = await client
    .from('post_comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
    .eq('status', 'published')
  return count ?? 0
}, { lazy: true })
const totalCommentCount = computed(() => commentCountData.value ?? allComments.value.length)

async function loadMoreComments() {
  if (loadingMoreComments.value || !hasMoreComments.value) return
  loadingMoreComments.value = true

  const { data } = await client
    .from('post_comments')
    .select('*, profiles:user_id(display_name)')
    .eq('post_id', postId)
    .eq('status', 'published')
    .order('created_at', { ascending: true })
    .range(commentOffset.value, commentOffset.value + COMMENT_PAGE_SIZE - 1)

  const batch = (data ?? []).map(mapComment)
  extraComments.value.push(...batch)
  commentOffset.value += batch.length
  hasMoreComments.value = batch.length >= COMMENT_PAGE_SIZE
  loadingMoreComments.value = false
}

// ── IntersectionObserver for comment sentinel ──
const commentSentinelRef = ref<HTMLElement | null>(null)
let commentObserver: IntersectionObserver | null = null

onMounted(() => {
  commentObserver = new IntersectionObserver(
    (entries) => { if (entries[0]?.isIntersecting) loadMoreComments() },
    { rootMargin: '200px' },
  )
  watchEffect(() => {
    commentObserver?.disconnect()
    if (commentSentinelRef.value) commentObserver?.observe(commentSentinelRef.value)
  })
})

onBeforeUnmount(() => commentObserver?.disconnect())

// Toggle like
async function toggleLike() {
  if (!user.value?.id) return
  if (post.value.liked) {
    await client.from('post_reactions').delete().eq('post_id', postId).eq('user_id', user.value.id)
  } else {
    await client.from('post_reactions').insert({ post_id: postId, reaction: 'like' })
  }
  await refreshPost()
}

// Submit comment
const newComment = ref('')
const submitting = ref(false)

async function submitComment() {
  if (!newComment.value.trim() || !user.value?.id || submitting.value) return
  submitting.value = true
  try {
    const { data: inserted } = await client.from('post_comments').insert({
      post_id: postId,
      body: newComment.value.trim(),
    }).select('*, profiles:user_id(display_name)').single()
    newComment.value = ''
    if (inserted) {
      extraComments.value.push(mapComment(inserted))
    }
  } catch {
    toast.show('Error al publicar comentario', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.screen__content { padding-bottom: 80px; }

/* ─── Header (matches retos/library) ─── */
.pdetail__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.pdetail__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.pdetail__back {
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
  .pdetail__back:hover { background: rgba(var(--tint-rgb), 0.06); }
}

.post-detail {
  background: rgba(var(--tint-rgb), 0.04);
  color: var(--color-text);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  margin-bottom: var(--space-6);
}

.post-detail__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.post-detail__avatar {
  width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0;
}

.post-detail__author { font-weight: var(--weight-semibold); font-size: var(--text-sm); display: block; }
.post-detail__time { font-size: var(--text-xs); color: var(--color-muted); }

.post-detail__title {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  margin-bottom: var(--space-3);
}

.post-detail__body {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.post-detail__media {
  width: 100%;
  border-radius: var(--radius-lg);
  margin-top: var(--space-4);
  object-fit: cover;
  max-height: 400px;
}

.post-detail__stats {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid rgba(var(--tint-rgb), 0.04);
}

.post-detail__like {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-muted);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .post-detail__like:hover { color: var(--color-text-secondary); }
}

.post-detail__comments > .eyebrow { margin-bottom: var(--space-4); }

.post-detail__comment-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: var(--space-6);
}

/* ─── Comment (Reddit-style) ─── */
.comment {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) 0;
}

.comment__avatar {
  width: 28px; height: 28px; border-radius: 50%; background: rgba(var(--tint-rgb), 0.06);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: var(--weight-semibold); color: var(--color-muted);
  flex-shrink: 0;
}

.comment__content { flex: 1; min-width: 0; }

.comment__top {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: 2px;
}

.comment__author { font-size: var(--text-xs); font-weight: var(--weight-semibold); color: var(--color-text); }
.comment__dot { font-size: var(--text-xs); color: var(--color-muted); }
.comment__time { font-size: var(--text-xs); color: var(--color-muted); }

.comment__body {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

/* ─── Fixed input bar ─── */
.post-detail__add {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky, 10);
  background: var(--color-white);
  border-top: none;
  padding: var(--space-3) var(--space-5);
}

.post-detail__add-inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-white);
  border: 1px solid rgba(var(--tint-rgb), 0.1);
  border-radius: 24px;
  padding: 6px 6px 6px var(--space-5);
  box-shadow: 0 2px 16px rgba(var(--tint-rgb), 0.06);
}

.post-detail__input {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: var(--space-3) 0;
  font-size: var(--text-base);
  font-family: var(--font-body);
  color: var(--color-text);
  outline: none;
}
.post-detail__input::placeholder { color: var(--color-muted); }
.post-detail__input:focus { background: transparent; }

.post-detail__send {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-dark);
  border: none;
  border-radius: 50%;
  color: var(--color-white);
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  transition: opacity var(--transition-fast);
}
.post-detail__send:disabled {
  opacity: 0.15;
  cursor: default;
}
@media (hover: hover) {
  .post-detail__send:not(:disabled):hover {
    opacity: 0.85;
  }
}

/* ─── Error state ─── */
.post__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.post__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.post__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.post__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}

/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .screen {
    height: calc(100dvh - var(--topbar-height));
    min-height: auto;
    display: flex;
    flex-direction: column;
  }

  .screen__content {
    max-width: 760px;
    width: 100%;
    margin: 0 auto;
    flex: 1;
    overflow: auto;
    scrollbar-color: transparent transparent;
    padding-bottom: 120px;
  }

  @media (hover: hover) {
    .screen__content:hover {
      scrollbar-color: rgba(var(--tint-rgb), 0.15) transparent;
    }
  }

  /* Hide mobile header on desktop */
  .pdetail__header {
    display: none;
  }

  /* Post card – match desktop cards */
  .post-detail {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
  }

  .post-detail__body {
    font-size: var(--text-base);
    line-height: 1.7;
  }

  /* Comments – match chat message style */
  .comment__body {
    font-size: var(--text-base);
    line-height: 1.7;
  }

  /* ─── Floating card input bar ─── */
  .post-detail__add {
    left: var(--sidebar-width);
    background: var(--color-desktop-bg);
    border-top: none;
    padding: 0 var(--space-6) var(--space-5);
  }

  .post-detail__add-inner {
    max-width: 760px;
    margin: 0 auto;
  }
}
</style>
