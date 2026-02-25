<template>
  <div class="chat">
    <!-- Top bar -->
    <header class="chat__header safe-top">
      <button class="chat__back" aria-label="Volver" @click="navigateTo('/ai')">
        <Icon name="lucide:chevron-left" size="24" />
      </button>
      <div class="chat__header-info">
        <span class="chat__tone-label">{{ toneName }}</span>
        <span class="chat__disclaimer">No es consejo médico/terapéutico.</span>
      </div>
      <button class="chat__close" @click="closeSession">Cerrar</button>
    </header>

    <!-- Messages -->
    <div class="chat__messages" ref="messagesContainer">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['chat__bubble', `chat__bubble--${msg.role}`]"
      >
        <p>{{ msg.content }}</p>
        <span class="chat__bubble-time">{{ msg.time }}</span>
      </div>

      <div v-if="generating" class="chat__bubble chat__bubble--assistant chat__bubble--typing">
        <span class="chat__typing-dots">
          <span /><span /><span />
        </span>
        <span class="chat__typing-label">Escribiendo…</span>
      </div>
    </div>

    <!-- Quick prompts -->
    <div v-if="messages.length <= 1" class="chat__quick-prompts">
      <button v-for="p in quickPrompts" :key="p" class="chat__quick-btn" @click="sendMessage(p)">
        {{ p }}
      </button>
    </div>

    <!-- Composer -->
    <div class="chat__composer safe-bottom">
      <textarea
        v-model="inputText"
        class="chat__input"
        placeholder="Escribe tu mensaje..."
        rows="1"
        :disabled="generating || limitReached"
        @keydown.enter.prevent="sendMessage()"
      />
      <button
        class="chat__send"
        :disabled="!inputText.trim() || generating || limitReached"
        @click="sendMessage()"
      >
        <Icon name="lucide:send" size="20" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()

const toneName = ref('Carlotta')
const generating = ref(false)
const limitReached = ref(false)
const inputText = ref('')
const messagesContainer = ref<HTMLElement>()

const quickPrompts = ['¿Qué hago hoy?', 'Ayúdame a reflexionar', 'Plan de 5 minutos']

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
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

  // Add user message
  messages.value.push({
    id: `msg-${Date.now()}`,
    role: 'user',
    content,
    time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
  })
  inputText.value = ''
  generating.value = true

  // Simulate AI response
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

function closeSession() {
  navigateTo('/ai')
}
</script>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: var(--color-bg);
}

.chat__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-surface);
  color: var(--color-text);
}

.chat__back {
  background: none; border: none; cursor: pointer; color: var(--color-text);
  display: flex; align-items: center;
}

.chat__header-info { flex: 1; }

.chat__tone-label {
  font-weight: var(--weight-semibold); font-size: var(--text-md); display: block;
}

.chat__disclaimer {
  font-size: var(--text-xs); color: var(--color-muted); font-style: italic;
}

.chat__close {
  background: none; border: none; cursor: pointer;
  font-family: var(--font-body); font-size: var(--text-sm);
  font-weight: var(--weight-medium); color: var(--color-muted);
}

.chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.chat__bubble {
  max-width: 85%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-xl);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  white-space: pre-wrap;
}

.chat__bubble--user {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  align-self: flex-end;
  border-bottom-right-radius: var(--radius-sm);
}

.chat__bubble--assistant {
  background: #ffffff21;
  color: white;
  align-self: flex-start;
  border-bottom-left-radius: var(--radius-sm);
}

.chat__bubble-time {
  display: block;
  font-size: var(--text-xs);
  opacity: 0.6;
  margin-top: var(--space-1);
}

.chat__bubble--typing {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.chat__typing-dots {
  display: flex;
  gap: 4px;
}

.chat__typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-muted);
  animation: typingDot 1.2s infinite;
}
.chat__typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.chat__typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingDot {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1); }
}

.chat__typing-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
  font-style: italic;
}

.chat__quick-prompts {
  display: flex;
  gap: var(--space-2);
  padding: 0 var(--space-4) var(--space-2);
  overflow-x: auto;
  scrollbar-width: none;
}
.chat__quick-prompts::-webkit-scrollbar { display: none; }

.chat__quick-btn {
  flex-shrink: 0;
  padding: var(--space-2) var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-full);
  background: #ffffff21;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: white;
  cursor: pointer;
  white-space: nowrap;
}

.chat__composer {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border-light);
  background: var(--color-surface);
  color: var(--color-text);
}

.chat__input {
  flex: 1;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text);
  resize: none;
  max-height: 100px;
}
.chat__input:focus { outline: none; border-color: var(--color-primary); }
.chat__input::placeholder { color: var(--color-placeholder); }

.chat__send {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.chat__send:disabled { opacity: 0.4; cursor: not-allowed; }

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .chat {
    max-width: 720px;
    margin: 0 auto;
    border-left: 1px solid var(--color-border-light);
    border-right: 1px solid var(--color-border-light);
  }
}
</style>
