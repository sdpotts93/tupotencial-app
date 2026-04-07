<template>
  <div class="screen">
    <!-- Standard header (always visible, outside scrollable area) -->
    <header class="chat__header">
      <button class="chat__back" aria-label="Volver" @click="useRouter().back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div class="chat__header-center">
        <img :src="coachAvatar" :alt="toneName" class="chat__header-avatar" />
        <h1 class="chat__header-title">{{ toneName }}</h1>
      </div>
    </header>

    <div class="screen__content">
      <p class="chat__disclaimer">No es consejo médico/terapéutico.</p>

      <template v-if="chatStatus === 'pending'">
        <div class="chat__messages">
          <div v-for="i in 3" :key="i" class="chat__msg">
            <UiSkeleton variant="circle" width="28px" height="28px" />
            <div style="flex: 1;">
              <UiSkeleton variant="text" width="25%" height="10px" style="margin-bottom: 6px;" />
              <UiSkeleton variant="text" :width="i % 2 === 0 ? '90%' : '60%'" height="14px" style="margin-bottom: 4px;" />
              <UiSkeleton v-if="i % 2 === 0" variant="text" width="75%" height="14px" />
            </div>
          </div>
        </div>
      </template>
      <!-- Error state -->
      <template v-else-if="chatStatus === 'error'">
        <div class="chat__error-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="chat__error-state-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
          <h2 class="chat__error-state-title">No pudimos cargar la conversación</h2>
          <p class="chat__error-state-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
          <UiButton variant="primary-outline" size="sm" @click="refreshChat()">Reintentar</UiButton>
        </div>
      </template>
      <template v-else>

      <!-- Messages (comment-style) -->
      <div ref="messagesRef" class="chat__messages">
        <div v-if="hasOlderMessages && !isNewSession" ref="olderSentinelRef" class="chat__load-older">
          <UiSkeleton v-if="loadingOlder" variant="rect" width="100%" height="40px" style="border-radius: var(--radius-xl);" />
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="chat__msg"
        >
          <div :class="['chat__msg-avatar', msg.role === 'assistant' ? 'chat__msg-avatar--coach' : '']">
            <img v-if="msg.role === 'assistant'" :src="coachAvatar" :alt="toneName" class="chat__msg-avatar-img" />
            <img v-else-if="user?.avatar_url" :src="user.avatar_url" alt="Tú" class="chat__msg-avatar-img" />
            <span v-else>Tú</span>
          </div>
          <div class="chat__msg-content">
            <div class="chat__msg-top">
              <span class="chat__msg-author">{{ msg.role === 'assistant' ? toneName : 'Tú' }}</span>
              <span class="chat__msg-dot">&middot;</span>
              <span class="chat__msg-time">{{ msg.time }}</span>
            </div>
            <div v-if="msg.role === 'assistant'" class="chat__msg-body">
              <span v-html="renderMarkdown(msg.content)" />
            </div>
            <p v-else class="chat__msg-body">{{ msg.content }}</p>
          </div>
        </div>

        <!-- Typing indicator (only before first chunk arrives) -->
        <div v-if="generating && !streamingStarted" class="chat__msg">
          <div class="chat__msg-avatar chat__msg-avatar--coach">
            <img :src="coachAvatar" :alt="toneName" class="chat__msg-avatar-img" />
          </div>
          <div class="chat__msg-content">
            <div class="chat__msg-top">
              <span class="chat__msg-author">{{ toneName }}</span>
            </div>
            <span class="chat__glow-dot" />
          </div>
        </div>
      </div>

      <!-- Error / retry -->
      <div v-if="error" class="chat__error">
        <p>No se pudo generar la respuesta.</p>
        <button class="chat__retry-btn" @click="retry">Reintentar</button>
      </div>

      <!-- Limit reached -->
      <div v-if="limitReached" class="chat__limit">
        <p>Has alcanzado tu límite de mensajes por hoy. Vuelve mañana para continuar.</p>
      </div>

      <!-- Quick prompts -->
      <div v-if="messages.length <= 1" class="chat__prompts">
        <button v-for="p in quickPrompts" :key="p" class="chat__prompt-btn" @click="sendMessage(p)">
          {{ p }}
        </button>
      </div>

      </template>
    </div>

    <!-- Fixed input bar (community post style) -->
    <div class="chat__add safe-bottom">
      <div class="chat__add-inner">
        <input
          v-model="inputText"
          class="chat__input"
          placeholder="Escribe tu mensaje..."
          :disabled="generating || limitReached"
          @keydown.enter.prevent="sendMessage()"
        />
        <button
          class="chat__send"
          :disabled="!inputText.trim() || generating || limitReached"
          @click="sendMessage()"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

// Configure marked for inline rendering (no wrapping <p> tags)
marked.setOptions({ breaks: true })

function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false }) as string
}

definePageMeta({ layout: 'ai-chat', pageTransition: false })

const route = useRoute()
const client = useSupabaseClient()
const { user } = useAuth()

const currentSessionId = ref(route.params.sessionId as string)
const isNewSession = computed(() => currentSessionId.value === 'new')

// Tone — resolve from query param (new session) or from DB (existing)
const toneParam = (route.query.tone as string) ?? 'carlotta'
const toneName = ref(toneParam === 'gabriel' ? 'Gabriel' : 'Carlotta')
const { avatarUrl } = useCharacterAvatars()
const coachAvatar = computed(() => avatarUrl(toneName.value.toLowerCase()))

const generating = ref(false)
const streamingStarted = ref(false)
const limitReached = ref(false)
const inputText = ref('')
const error = ref(false)
const lastFailedMessage = ref('')

// ─── Auto-scroll ───
const messagesRef = ref<HTMLElement | null>(null)
const userScrolledUp = ref(false)

function scrollToBottom() {
  if (userScrolledUp.value) return
  nextTick(() => {
    const el = messagesRef.value
    if (!el) return
    // Scroll the nearest scrollable parent (screen__content on desktop, window on mobile)
    const scrollParent = el.closest('.screen__content') as HTMLElement | null
    if (scrollParent && scrollParent.scrollHeight > scrollParent.clientHeight) {
      scrollParent.scrollTop = scrollParent.scrollHeight
    } else {
      window.scrollTo({ top: document.body.scrollHeight })
    }
  })
}

function onMessagesScroll() {
  if (!generating.value) return
  const scrollParent = messagesRef.value?.closest('.screen__content') as HTMLElement | null
  if (scrollParent && scrollParent.scrollHeight > scrollParent.clientHeight) {
    const distFromBottom = scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight
    userScrolledUp.value = distFromBottom > 100
  } else {
    const distFromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight
    userScrolledUp.value = distFromBottom > 100
  }
}

// ─── Typewriter effect ───
const typewriterBuffer = ref('')
const typewriterTarget = ref<ChatMessage | null>(null)
let typewriterTimer: ReturnType<typeof setTimeout> | null = null
const TYPE_SPEED = 18 // ms per character — feels natural

function startTypewriter(msg: ChatMessage) {
  typewriterTarget.value = msg
  if (!typewriterTimer) drainTypewriter()
}

function drainTypewriter() {
  if (!typewriterBuffer.value.length) {
    typewriterTimer = null
    return
  }
  // Type 1-2 chars per tick for natural rhythm
  const chars = typewriterBuffer.value.length > 50 ? 3 : typewriterBuffer.value.length > 20 ? 2 : 1
  const chunk = typewriterBuffer.value.slice(0, chars)
  typewriterBuffer.value = typewriterBuffer.value.slice(chars)
  if (typewriterTarget.value) {
    typewriterTarget.value.content += chunk
    scrollToBottom()
  }
  typewriterTimer = setTimeout(drainTypewriter, TYPE_SPEED)
}

function flushTypewriter() {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer)
    typewriterTimer = null
  }
  if (typewriterTarget.value && typewriterBuffer.value) {
    typewriterTarget.value.content += typewriterBuffer.value
    typewriterBuffer.value = ''
  }
  typewriterTarget.value = null
}

const olderSentinelRef = ref<HTMLElement | null>(null)
let olderObserver: IntersectionObserver | null = null

onMounted(() => {
  // Listen for scroll to detect user scrolling up during streaming
  const scrollParent = messagesRef.value?.closest('.screen__content') as HTMLElement | null
  if (scrollParent && scrollParent.scrollHeight > scrollParent.clientHeight) {
    scrollParent.addEventListener('scroll', onMessagesScroll, { passive: true })
  } else {
    window.addEventListener('scroll', onMessagesScroll, { passive: true })
  }
  scrollToBottom()

  // Observe sentinel for loading older messages
  olderObserver = new IntersectionObserver(
    (entries) => { if (entries[0]?.isIntersecting) loadOlderMessages() },
    { rootMargin: '100px' },
  )
  watchEffect(() => {
    olderObserver?.disconnect()
    if (olderSentinelRef.value) olderObserver?.observe(olderSentinelRef.value)
  })
})

onBeforeUnmount(() => {
  if (typewriterTimer) clearTimeout(typewriterTimer)
  olderObserver?.disconnect()
  const scrollParent = messagesRef.value?.closest('.screen__content') as HTMLElement | null
  if (scrollParent) scrollParent.removeEventListener('scroll', onMessagesScroll)
  window.removeEventListener('scroll', onMessagesScroll)
})

const quickPrompts = ['¿Qué hago hoy?', 'Ayúdame a reflexionar', 'Plan de 5 minutos']

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

const messages = ref<ChatMessage[]>([])

function formatTime(date?: string) {
  const d = date ? new Date(date) : new Date()
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

// Load existing session messages (or show welcome for new)
const { data: sessionData, status: chatStatus, refresh: refreshChat } = useAsyncData(`ai-session-${currentSessionId.value}`, async () => {
  if (isNewSession.value) return null
  const { data } = await client.from('ai_sessions').select('tone').eq('id', currentSessionId.value).single()
  return data
}, { lazy: true })

const MSG_PAGE_SIZE = 10

const { data: dbMessages } = useAsyncData(`ai-messages-${currentSessionId.value}`, async () => {
  if (isNewSession.value) return []
  // Fetch last N messages (desc) then reverse for chronological display
  const { data } = await client.from('ai_messages')
    .select('id, role, content, created_at')
    .eq('session_id', currentSessionId.value)
    .order('created_at', { ascending: false })
    .range(0, MSG_PAGE_SIZE - 1)
  return (data ?? []).reverse()
}, { lazy: true })

const hasOlderMessages = ref(true)
const loadingOlder = ref(false)

async function loadOlderMessages() {
  if (loadingOlder.value || !hasOlderMessages.value) return
  const oldest = messages.value.find(m => m.id !== 'welcome')
  if (!oldest) return

  // Find the created_at of the oldest loaded message from DB
  const oldestDb = dbMessages.value?.find(m => m.id === oldest.id)
  if (!oldestDb) return

  loadingOlder.value = true

  const { data } = await client.from('ai_messages')
    .select('id, role, content, created_at')
    .eq('session_id', currentSessionId.value)
    .lt('created_at', oldestDb.created_at)
    .order('created_at', { ascending: false })
    .range(0, MSG_PAGE_SIZE - 1)

  const batch = (data ?? []).reverse()
  hasOlderMessages.value = batch.length >= MSG_PAGE_SIZE

  if (batch.length) {
    // Preserve scroll position when prepending
    const scrollParent = messagesRef.value?.closest('.screen__content') as HTMLElement | null
    const prevHeight = scrollParent?.scrollHeight ?? document.documentElement.scrollHeight
    const prevScroll = scrollParent ? scrollParent.scrollTop : window.scrollY

    const older: ChatMessage[] = batch
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content, time: formatTime(m.created_at) }))

    messages.value.unshift(...older)

    nextTick(() => {
      const newHeight = scrollParent?.scrollHeight ?? document.documentElement.scrollHeight
      const diff = newHeight - prevHeight
      if (scrollParent) {
        scrollParent.scrollTop = prevScroll + diff
      } else {
        window.scrollTo(0, prevScroll + diff)
      }
    })
  }

  loadingOlder.value = false
}

watch([sessionData, dbMessages], () => {
  if (sessionData.value) {
    toneName.value = sessionData.value.tone === 'gabriel' ? 'Gabriel' : 'Carlotta'
  }

  if (dbMessages.value?.length) {
    hasOlderMessages.value = dbMessages.value.length >= MSG_PAGE_SIZE
    messages.value = dbMessages.value
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        time: formatTime(m.created_at),
      }))
  } else {
    hasOlderMessages.value = false
  }

  // Show welcome message if no messages yet
  if (!messages.value.length) {
    const welcome = toneName.value === 'Carlotta'
      ? '¡Hola! Soy tu coach Carlotta. Estoy aquí para ayudarte a reflexionar y encontrar claridad. ¿Qué te gustaría explorar hoy?'
      : '¡Hey! Soy Gabriel, tu coach. Estoy aquí para ayudarte a tomar acción y crecer. ¿Qué quieres lograr hoy?'
    messages.value.push({ id: 'welcome', role: 'assistant', content: welcome, time: formatTime() })
  }
}, { immediate: true })

// Show welcome for new sessions immediately
if (isNewSession.value && !messages.value.length) {
  const welcome = toneName.value === 'Carlotta'
    ? '¡Hola! Soy tu coach Carlotta. Estoy aquí para ayudarte a reflexionar y encontrar claridad. ¿Qué te gustaría explorar hoy?'
    : '¡Hey! Soy Gabriel, tu coach. Estoy aquí para ayudarte a tomar acción y crecer. ¿Qué quieres lograr hoy?'
  messages.value.push({ id: 'welcome', role: 'assistant', content: welcome, time: formatTime() })
}

async function sendMessage(text?: string) {
  const content = text || inputText.value.trim()
  if (!content || generating.value) return

  error.value = false
  lastFailedMessage.value = ''

  // Flag AI coach usage for Hoy acción auto-complete
  const todayLocal = new Date()
  const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, '0')}-${String(todayLocal.getDate()).padStart(2, '0')}`
  localStorage.setItem(`hoy-ai-done-${todayStr}`, 'true')

  // Add user message to UI immediately
  messages.value.push({
    id: `temp-${Date.now()}`,
    role: 'user',
    content,
    time: formatTime(),
  })
  inputText.value = ''
  generating.value = true
  streamingStarted.value = false
  userScrolledUp.value = false
  scrollToBottom()

  // Placeholder for streaming assistant response — must be reactive for Vue to track content mutations
  const assistantMsg = reactive<ChatMessage>({ id: '', role: 'assistant', content: '', time: formatTime() })

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId.value,
        message: content,
        tone: toneName.value.toLowerCase(),
      }),
    })

    if (response.status === 429) {
      limitReached.value = true
      generating.value = false
      return
    }

    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? '' // keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6))
          if (data.type === 'chunk') {
            typewriterBuffer.value += data.content
            if (!streamingStarted.value) {
              streamingStarted.value = true
              messages.value.push(assistantMsg)
              startTypewriter(assistantMsg)
            }
          } else if (data.type === 'done') {
            assistantMsg.id = data.messageId ?? assistantMsg.id
            if (data.sessionId && isNewSession.value) {
              currentSessionId.value = data.sessionId
              window.history.replaceState(null, '', `/cuenta/ia/chat/${data.sessionId}`)
            }
          }
        } catch {
          // skip malformed SSE lines
        }
      }
    }
  } catch {
    flushTypewriter()
    error.value = true
    lastFailedMessage.value = content
    // Remove empty assistant placeholder if streaming never started
    if (!assistantMsg.content) {
      const idx = messages.value.indexOf(assistantMsg)
      if (idx !== -1) messages.value.splice(idx, 1)
    }
    generating.value = false
    return
  }

  // Stream ended — wait for typewriter to finish draining
  const waitForTypewriter = () => new Promise<void>((resolve) => {
    const check = () => {
      if (!typewriterBuffer.value.length) {
        typewriterTarget.value = null
        resolve()
      } else {
        setTimeout(check, 50)
      }
    }
    check()
  })
  await waitForTypewriter()
  generating.value = false
}

async function retry() {
  if (lastFailedMessage.value) {
    // Remove the last user message (it will be re-added by sendMessage)
    const lastUserIdx = messages.value.findLastIndex(m => m.role === 'user')
    if (lastUserIdx !== -1) messages.value.splice(lastUserIdx, 1)
    await sendMessage(lastFailedMessage.value)
  }
}
</script>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
}
.screen__content { padding-bottom: 80px; flex: 1; }

/* ─── Header (standard) ─── */
.chat__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky, 10);
  background: var(--color-white);
  padding: var(--space-3) var(--space-5);
  flex-shrink: 0;
  border-bottom: 1px solid rgba(var(--tint-rgb), 0.08);
}

.chat__header-center {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.chat__header-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
}

.chat__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.chat__back {
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
  .chat__back:hover { background: rgba(var(--tint-rgb), 0.04); }
}

/* ─── Disclaimer ─── */
.chat__disclaimer {
  font-size: var(--text-xs);
  color: var(--color-muted);
  font-style: italic;
  text-align: center;
  margin-bottom: var(--space-6);
}

/* ─── Messages (comment-style) ─── */
.chat__messages {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: var(--space-4);
}

.chat__msg {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) 0;
}

.chat__msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(var(--tint-rgb), 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: var(--weight-semibold);
  color: var(--color-muted);
  flex-shrink: 0;
}

.chat__msg-avatar--coach {
  background: rgba(var(--tint-rgb), 0.04);
  color: var(--color-sand);
}

.chat__msg-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.chat__msg-content { flex: 1; min-width: 0; }

.chat__msg-top {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: 2px;
}

.chat__msg-author { font-size: var(--text-xs); font-weight: var(--weight-semibold); color: var(--color-text); }
.chat__msg-dot { font-size: var(--text-xs); color: var(--color-muted); }
.chat__msg-time { font-size: var(--text-xs); color: var(--color-muted); }

.chat__msg-body {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

p.chat__msg-body {
  white-space: pre-wrap;
}

/* Markdown inside assistant messages — reset all block spacing */
.chat__msg-body :deep(p),
.chat__msg-body :deep(ol),
.chat__msg-body :deep(ul),
.chat__msg-body :deep(li) { margin: 0; padding: 0; }

.chat__msg-body :deep(p + p) { margin-top: 0.45em; }
.chat__msg-body :deep(p + ol),
.chat__msg-body :deep(p + ul) { margin-top: 0.35em; }
.chat__msg-body :deep(ol + p),
.chat__msg-body :deep(ul + p) { margin-top: 0.35em; }
.chat__msg-body :deep(ol),
.chat__msg-body :deep(ul) { padding-left: 1.2em; }
.chat__msg-body :deep(li + li) { margin-top: 0.15em; }
.chat__msg-body :deep(strong) { font-weight: var(--weight-semibold); color: var(--color-text); }
.chat__msg-body :deep(em) { font-style: italic; }
.chat__msg-body :deep(code) {
  background: rgba(var(--tint-rgb), 0.06);
  padding: 0.1em 0.3em;
  border-radius: 4px;
  font-size: 0.9em;
}

/* ─── Glowing dot (ChatGPT-style) ─── */
.chat__glow-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-sand, rgba(var(--tint-rgb), 0.4));
  margin-top: var(--space-1);
  animation: glowPulse 1.4s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.4; box-shadow: 0 0 4px 1px rgba(var(--tint-rgb), 0.15); }
  50% { opacity: 1; box-shadow: 0 0 8px 3px rgba(var(--tint-rgb), 0.3); }
}

/* ─── Error / limit states ─── */
.chat__error,
.chat__limit {
  text-align: center;
  padding: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.chat__retry-btn {
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid rgba(var(--tint-rgb), 0.1);
  border-radius: var(--radius-full);
  background: rgba(var(--tint-rgb), 0.04);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text);
  cursor: pointer;
}

/* ─── Quick prompts ─── */
.chat__prompts {
  display: flex;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  overflow-x: auto;
  scrollbar-width: none;
  margin-right: -1rem;
}
.chat__prompts::-webkit-scrollbar { display: none; }

.chat__prompt-btn {
  flex-shrink: 0;
  padding: var(--space-2) var(--space-4) var(--space-1);
  border: 1px solid rgba(var(--tint-rgb), 0.075);
  border-radius: var(--radius-full);
  background: rgba(var(--tint-rgb), 0.04);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text);
  cursor: pointer;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}

.chat__prompt-btn:last-child {
  margin-right: 1rem;
}
/* ─── Fixed input bar (community post style) ─── */
.chat__add {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky, 10);
  border-top: none;
  padding: var(--space-3) var(--space-5);
}

.chat__add-inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-white);
  border: 1px solid rgba(var(--tint-rgb), 0.1);
  border-radius: 24px;
  padding: 6px 6px 6px var(--space-5);
  box-shadow: 0 2px 16px rgba(var(--tint-rgb), 0.06);
}

.chat__input {
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
.chat__input::placeholder { color: var(--color-muted); }
.chat__input:focus { background: transparent; }

.chat__send {
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
.chat__send:disabled {
  opacity: 0.15;
  cursor: default;
}
@media (hover: hover) {
  .chat__send:not(:disabled):hover {
    opacity: 0.85;
  }
}

/* ─── Desktop SaaS (ChatGPT-style) ─── */
@media (min-width: 1024px) {
  .screen {
    height: calc(100dvh - var(--topbar-height));
    min-height: auto;
  }

  .screen__content {
    max-width: 760px;
    width: 100%;
    margin: 0 auto;
    flex: 1;
    overflow-y: auto;
    scrollbar-gutter: stable;
    padding-bottom: 120px;
  }

  .chat__header {
    max-width: 760px;
    width: 100%;
    margin: 0 auto;
    background: var(--color-desktop-bg);
    border-bottom: none;
  }

  .chat__disclaimer {
    margin-top: var(--space-2);
    margin-bottom: var(--space-8);
  }

  .chat__msg-body {
    font-size: var(--text-base);
    line-height: 1.7;
  }

  .chat__prompts {
    justify-content: center;
    margin-right: 0;
    flex-wrap: wrap;
  }

  .chat__prompt-btn:last-child {
    margin-right: 0;
  }

  /* ─── Floating card input bar ─── */
  .chat__add {
    left: var(--sidebar-width);
    border-top: none;
    padding: 0 var(--space-6) var(--space-5);
  }

  .chat__add-inner {
    max-width: 760px;
    margin: 0 auto;
  }
}

/* ─── Error state ─── */
.chat__error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.chat__error-state-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.chat__error-state-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.chat__error-state-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
