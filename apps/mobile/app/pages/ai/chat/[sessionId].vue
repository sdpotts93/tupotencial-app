<template>
  <div class="screen">
    <div class="screen__content">
      <!-- Standard header -->
      <header class="chat__header">
        <button class="chat__back" aria-label="Volver" @click="navigateTo('/ai')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="chat__header-center">
          <Icon :name="toneIcon" size="14" />
          <h1 class="chat__header-title">{{ toneName }}</h1>
        </div>
      </header>

      <p class="chat__disclaimer">No es consejo médico/terapéutico.</p>

      <!-- Messages (comment-style) -->
      <div class="chat__messages">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="chat__msg"
        >
          <div :class="['chat__msg-avatar', msg.role === 'assistant' ? 'chat__msg-avatar--coach' : '']">
            <Icon v-if="msg.role === 'assistant'" :name="toneIcon" size="14" />
            <span v-else>Tú</span>
          </div>
          <div class="chat__msg-content">
            <div class="chat__msg-top">
              <span class="chat__msg-author">{{ msg.role === 'assistant' ? toneName : 'Tú' }}</span>
              <span class="chat__msg-dot">&middot;</span>
              <span class="chat__msg-time">{{ msg.time }}</span>
            </div>
            <p class="chat__msg-body">{{ msg.content }}</p>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="generating" class="chat__msg">
          <div class="chat__msg-avatar chat__msg-avatar--coach">
            <Icon :name="toneIcon" size="14" />
          </div>
          <div class="chat__msg-content">
            <div class="chat__msg-top">
              <span class="chat__msg-author">{{ toneName }}</span>
            </div>
            <span class="chat__typing-dots"><span /><span /><span /></span>
          </div>
        </div>
      </div>

      <!-- Quick prompts -->
      <div v-if="messages.length <= 1" class="chat__prompts">
        <button v-for="p in quickPrompts" :key="p" class="chat__prompt-btn" @click="sendMessage(p)">
          {{ p }}
        </button>
      </div>
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
definePageMeta({ layout: 'blank' })

const route = useRoute()

const toneName = ref('Carlotta')
const toneIcon = computed(() => toneName.value === 'Carlotta' ? 'lucide:flower' : 'lucide:waves')
const generating = ref(false)
const limitReached = ref(false)
const inputText = ref('')

const quickPrompts = ['¿Qué hago hoy?', 'Ayúdame a reflexionar', 'Plan de 5 minutos']

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

const messages = ref<ChatMessage[]>([
  {
    id: 'msg-001', role: 'assistant',
    content: '¡Hola! Soy tu coach Carlotta. Estoy aquí para ayudarte a reflexionar y encontrar claridad. ¿Qué te gustaría explorar hoy?',
    time: '8:30',
  },
])

async function sendMessage(text?: string) {
  const content = text || inputText.value.trim()
  if (!content || generating.value) return

  messages.value.push({
    id: `msg-${Date.now()}`,
    role: 'user',
    content,
    time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
  })
  inputText.value = ''
  generating.value = true

  await new Promise(r => setTimeout(r, 1500))

  messages.value.push({
    id: `msg-${Date.now()}-resp`,
    role: 'assistant',
    content: getResponse(content),
    time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
  })
  generating.value = false
}

function getResponse(input: string): string {
  const responses: Record<string, string> = {
    '¿Qué hago hoy?': 'Hoy te invito a dedicar 5 minutos a una respiración consciente. Siéntate cómodamente, cierra los ojos y enfoca tu atención en cada inhalación y exhalación. Después, escribe 3 cosas por las que estás agradecida. ¿Te parece un buen comienzo?',
    'Ayúdame a reflexionar': 'Claro. Piensa en un momento de esta semana que te haya hecho sentir orgullosa de ti misma. ¿Qué hiciste diferente? ¿Qué fortaleza usaste? Cuéntame, estoy aquí para escucharte.',
    'Plan de 5 minutos': 'Aquí tienes tu plan de 5 minutos:\n\n1. Respira profundo 3 veces (30s)\n2. Escribe tu intención del día (1 min)\n3. Estira tu cuerpo suavemente (1 min)\n4. Visualiza tu día ideal (1 min)\n5. Sonríe y agradece (30s)\n\n¿Listo para empezar?',
  }
  return responses[input] || 'Qué interesante lo que compartes. Me gustaría profundizar en eso. ¿Podrías contarme más sobre cómo te hace sentir? Recuerda que cada reflexión es un paso adelante en tu crecimiento.'
}
</script>

<style scoped>
.screen__content { padding-bottom: 80px; }

/* ─── Header (standard) ─── */
.chat__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-4);
}

.chat__header-center {
  display: flex;
  align-items: center;
  gap: var(--space-2);
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
  color: var(--color-text-inverse);
  cursor: pointer;
  border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}
.chat__back:hover { background: rgba(255, 255, 255, 0.1); }

/* ─── Disclaimer ─── */
.chat__disclaimer {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.3);
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
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: var(--weight-semibold);
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.chat__msg-avatar--coach {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-sand);
}

.chat__msg-content { flex: 1; min-width: 0; }

.chat__msg-top {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: 2px;
}

.chat__msg-author { font-size: var(--text-xs); font-weight: var(--weight-semibold); color: white; }
.chat__msg-dot { font-size: var(--text-xs); color: rgba(255, 255, 255, 0.3); }
.chat__msg-time { font-size: var(--text-xs); color: rgba(255, 255, 255, 0.35); }

.chat__msg-body {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.7);
  line-height: var(--leading-relaxed);
  white-space: pre-wrap;
}

/* ─── Typing dots ─── */
.chat__typing-dots {
  display: flex;
  gap: 4px;
  padding-top: var(--space-1);
}

.chat__typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  animation: typingDot 1.2s infinite;
}
.chat__typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.chat__typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingDot {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1); }
}

/* ─── Quick prompts ─── */
.chat__prompts {
  display: flex;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  overflow-x: auto;
  scrollbar-width: none;
}
.chat__prompts::-webkit-scrollbar { display: none; }

.chat__prompt-btn {
  flex-shrink: 0;
  padding: var(--space-2) var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.08);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: white;
  cursor: pointer;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}

/* ─── Fixed input bar (community post style) ─── */
.chat__add {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky, 10);
  background: var(--color-dark);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: var(--space-3) var(--space-5);
}

.chat__add-inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.chat__input {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: var(--radius-full);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-family: var(--font-body);
  color: white;
  outline: none;
}
.chat__input::placeholder { color: rgba(255, 255, 255, 0.35); }
.chat__input:focus { background: rgba(255, 255, 255, 0.12); }

.chat__send {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  border-radius: 50%;
  color: var(--color-dark);
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}
.chat__send:disabled {
  opacity: 0.3;
  cursor: default;
}
</style>
