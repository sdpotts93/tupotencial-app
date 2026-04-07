<template>
  <div class="ai-layout">
    <!-- Desktop sidebar: chat history -->
    <aside class="ai-sidebar">
      <div class="ai-sidebar__top">
        <NuxtLink to="/cuenta/hoy" class="ai-sidebar__logo">
          <img src="/logo-word/logo-word-black.png" alt="Tu Potencial" />
        </NuxtLink>

        <button class="ai-sidebar__new" @click="navigateTo('/cuenta/ia/chat/new')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva conversación
        </button>
      </div>

      <div class="ai-sidebar__sessions">
        <p class="ai-sidebar__section-title">Historial</p>
        <NuxtLink
          v-for="session in sessions"
          :key="session.id"
          :to="`/cuenta/ia/chat/${session.id}`"
          :class="['ai-sidebar__session', { 'ai-sidebar__session--active': isActiveSession(session.id) }]"
        >
          <span class="ai-sidebar__session-preview">{{ session.preview }}</span>
          <span class="ai-sidebar__session-meta">
            <span :class="['ai-sidebar__session-tone', `ai-sidebar__session-tone--${session.tone}`]">{{ session.tone === 'carlotta' ? 'Carlotta' : 'Gabriel' }}</span>
            <span class="ai-sidebar__session-date">{{ session.date }}</span>
          </span>
        </NuxtLink>
        <div v-if="hasMore" ref="sentinelRef" style="min-height: 1px;">
          <UiSkeleton v-if="loadingMore" variant="rect" width="100%" height="40px" style="border-radius: var(--radius-md); margin: var(--space-2) var(--space-3);" />
        </div>
      </div>

      <div class="ai-sidebar__bottom">
        <NuxtLink to="/cuenta/ia" class="ai-sidebar__back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Coach IA
        </NuxtLink>
      </div>
    </aside>

    <!-- Desktop top bar -->
    <header class="ai-layout__topbar">
      <div class="ai-layout__topbar-left">
        <h1 class="ai-layout__topbar-title">Coach IA</h1>
      </div>
      <div class="ai-layout__topbar-right">
        <NuxtLink to="/cuenta/hoy/progreso" class="ai-layout__streak">
          <Icon name="lucide:flame" size="14" class="ai-layout__streak-icon" />
          <span>{{ streak }}</span>
        </NuxtLink>
        <div class="ai-layout__avatar" @click="navigateTo('/cuenta/mis-datos')">
          {{ initials }}
        </div>
      </div>
    </header>

    <slot />
    <UiToast />
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const { user } = useAuth()
const route = useRoute()

const { data: streakData } = await useAsyncData('ai-chat-streak', async () => {
  const { data } = await client.from('user_streaks').select('current_streak').eq('user_id', user.value?.id ?? '').maybeSingle()
  return data?.current_streak ?? 0
})
const streak = computed(() => streakData.value ?? 0)

const initials = computed(() => {
  const name = user.value?.display_name || '?'
  return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
})

function isActiveSession(id: string) {
  return route.params.sessionId === id
}

const PAGE_SIZE = 10

const { data: rawSessions } = await useAsyncData('ai-chat-sessions', async () => {
  const { data } = await client.from('ai_sessions').select('*, ai_messages(content)').eq('user_id', user.value?.id ?? '').order('created_at', { ascending: false }).order('created_at', { referencedTable: 'ai_messages', ascending: true }).limit(1, { foreignTable: 'ai_messages' }).range(0, PAGE_SIZE - 1)
  return data ?? []
})

const extraSessions = ref<any[]>([])
const offset = ref(PAGE_SIZE)
const hasMore = ref(true)
const loadingMore = ref(false)

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  const { data } = await client.from('ai_sessions').select('*, ai_messages(content)').eq('user_id', user.value?.id ?? '').order('created_at', { ascending: false }).order('created_at', { referencedTable: 'ai_messages', ascending: true }).limit(1, { foreignTable: 'ai_messages' }).range(offset.value, offset.value + PAGE_SIZE - 1)
  const batch = data ?? []
  extraSessions.value.push(...batch)
  offset.value += batch.length
  hasMore.value = batch.length >= PAGE_SIZE
  loadingMore.value = false
}

watch(rawSessions, () => {
  extraSessions.value = []
  offset.value = PAGE_SIZE
  hasMore.value = true
})

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
onUnmounted(() => { observer?.disconnect() })

function mapSession(s: any) {
  const firstMsg = Array.isArray(s.ai_messages) ? s.ai_messages[0]?.content ?? '' : ''
  return {
    id: s.id,
    preview: firstMsg.slice(0, 80) || 'Nueva conversación',
    tone: s.tone ?? 'carlotta',
    date: new Date(s.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
  }
}

const sessions = computed(() =>
  [...(rawSessions.value ?? []), ...extraSessions.value].map(mapSession),
)
</script>

<style scoped>
/* Mobile: completely blank — no sidebar, no top bar */
.ai-layout {
  min-height: 100dvh;
}

.ai-sidebar {
  display: none;
}

.ai-layout__topbar {
  display: none;
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .ai-layout {
    padding-left: var(--sidebar-width);
    background: var(--color-desktop-bg);
  }

  /* ─── Sidebar ─── */
  .ai-sidebar {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--sidebar-width);
    height: 100dvh;
    background: var(--color-desktop-card);
    border-right: 1px solid var(--color-desktop-border);
    z-index: var(--z-fixed);
    overflow: hidden;
  }

  .ai-sidebar__top {
    padding: var(--space-5) var(--space-5) var(--space-4);
    flex-shrink: 0;
    border-bottom: 1px solid var(--color-desktop-border);
  }

  .ai-sidebar__logo {
    display: flex;
    align-items: center;
    margin-bottom: var(--space-5);
    text-decoration: none;
  }

  .ai-sidebar__logo img {
    height: 20px;
    width: auto;
  }

  .ai-sidebar__new {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: 10px var(--space-4);
    background: none;
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text);
    cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast);
  }

  @media (hover: hover) {
    .ai-sidebar__new:hover {
      background: rgba(var(--tint-rgb), 0.04);
      border-color: var(--color-border);
    }
  }

  /* ─── Sessions list ─── */
  .ai-sidebar__sessions {
    flex: 1;
    min-height: 0;
    padding: 0 var(--space-3);
    overflow-y: auto;
    scrollbar-width: none;
  }

  .ai-sidebar__sessions::-webkit-scrollbar {
    display: none;
  }

  .ai-sidebar__section-title {
    font-family: var(--font-eyebrow);
    font-size: 10px;
    font-weight: var(--weight-bold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-muted);
    padding: var(--space-3) var(--space-3) var(--space-2);
  }

  .ai-sidebar__session {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px var(--space-3);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);
    border-left: 3px solid transparent;
    margin-bottom: 1px;
  }

  @media (hover: hover) {
    .ai-sidebar__session:hover {
      background: rgba(var(--tint-rgb), 0.04);
      color: var(--color-text);
      text-decoration: none;
    }
  }

  .ai-sidebar__session--active {
    background: rgba(var(--tint-rgb), 0.06);
    color: var(--color-text);
    border-left-color: var(--color-primary);
  }

  .ai-sidebar__session-preview {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    line-height: var(--leading-snug);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ai-sidebar__session--active .ai-sidebar__session-preview {
    font-weight: var(--weight-semibold);
  }

  .ai-sidebar__session-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .ai-sidebar__session-tone {
    font-family: var(--font-eyebrow);
    font-size: 9px;
    font-weight: var(--weight-semibold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: var(--radius-full);
  }

  .ai-sidebar__session-tone--carlotta {
    background: var(--color-ai-warm-bg);
    color: var(--color-ai-warm);
  }

  .ai-sidebar__session-tone--gabriel {
    background: var(--color-ai-cool-bg);
    color: var(--color-ai-cool);
  }

  .ai-sidebar__session-date {
    font-size: var(--text-xs);
    color: var(--color-muted);
  }

  /* ─── Bottom link ─── */
  .ai-sidebar__bottom {
    flex-shrink: 0;
    padding: var(--space-3) var(--space-3) var(--space-4);
    border-top: 1px solid var(--color-desktop-border);
  }

  .ai-sidebar__back-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 9px var(--space-3);
    border-radius: var(--radius-md);
    text-decoration: none;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-muted);
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  @media (hover: hover) {
    .ai-sidebar__back-link:hover {
      background: rgba(var(--tint-rgb), 0.04);
      color: var(--color-text-secondary);
      text-decoration: none;
    }
  }

  /* ─── Top bar ─── */
  .ai-layout__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--topbar-height);
    padding: 0 var(--space-8);
    background: var(--color-desktop-bg);
    border-bottom: 1px solid var(--color-desktop-border);
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
  }

  .ai-layout__topbar-left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .ai-layout__topbar-title {
    font-family: var(--font-body);
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    color: var(--color-text);
    margin: 0;
  }

  .ai-layout__topbar-right {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .ai-layout__streak {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px var(--space-3);
    background: var(--color-pro-bg);
    border-radius: var(--radius-full);
    text-decoration: none;
    font-family: var(--font-eyebrow);
    font-size: var(--text-sm);
    font-weight: var(--weight-bold);
    color: var(--color-pro-dark);
    transition: background var(--transition-fast);
  }

  .ai-layout__streak-icon {
    color: var(--color-pro);
  }

  @media (hover: hover) {
    .ai-layout__streak:hover {
      background: var(--color-pro-bg-strong);
      text-decoration: none;
    }
  }

  .ai-layout__avatar {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-full);
    background: var(--color-sand);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    color: var(--color-dark);
    cursor: pointer;
    transition: box-shadow var(--transition-fast);
  }

  @media (hover: hover) {
    .ai-layout__avatar:hover {
      box-shadow: 0 0 0 2px var(--color-desktop-border);
    }
  }
}
</style>
