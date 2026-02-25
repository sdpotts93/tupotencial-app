<template>
  <div class="screen">
    <UiTopNav title="Coach IA" show-back @back="navigateTo('/more')" />
    <div class="screen__content">
      <!-- Intro (inspired by inspiration-ai) -->
      <div class="ai-home__hero">
        <div class="ai-home__icon"><Icon name="lucide:brain" size="48" /></div>
        <h1 class="title title--lg">Tu acompañamiento diario</h1>
        <p class="ai-home__desc">
          Recibe orientación personalizada según tu estado de energía, ánimo y tiempo disponible. Elige la voz que más resuene contigo.
        </p>
        <p class="ai-home__disclaimer">No es consejo médico/terapéutico.</p>
      </div>

      <!-- Tone selector -->
      <section class="ai-home__tone">
        <p class="eyebrow">ELIGE TU TONO</p>
        <div class="ai-home__tone-options">
          <button
            :class="['ai-home__tone-btn', { 'ai-home__tone-btn--active': selectedTone === 'carlotta' }]"
            @click="selectedTone = 'carlotta'"
          >
            <span class="ai-home__tone-emoji"><Icon name="lucide:flower" size="24" /></span>
            <span class="ai-home__tone-name">Carlotta</span>
            <span class="ai-home__tone-desc">Contención, calma y presencia</span>
          </button>
          <button
            :class="['ai-home__tone-btn', { 'ai-home__tone-btn--active': selectedTone === 'gabriel' }]"
            @click="selectedTone = 'gabriel'"
          >
            <span class="ai-home__tone-emoji"><Icon name="lucide:waves" size="24" /></span>
            <span class="ai-home__tone-name">Gabriel</span>
            <span class="ai-home__tone-desc">Estructura, disciplina y acción</span>
          </button>
        </div>
      </section>

      <!-- Quick prompts -->
      <section class="ai-home__prompts">
        <p class="eyebrow">EMPIEZA UNA CONVERSACIÓN</p>
        <div class="ai-home__prompts-list">
          <button v-for="prompt in quickPrompts" :key="prompt" class="ai-home__prompt-chip" @click="startChat(prompt)">
            {{ prompt }}
          </button>
        </div>
      </section>

      <!-- Session history -->
      <section v-if="sessions.length" class="ai-home__history">
        <p class="eyebrow">HISTORIAL</p>
        <UiList>
          <UiListItem
            v-for="session in sessions"
            :key="session.id"
            :label="session.preview"
            :description="session.date"
            :to="`/ai/chat/${session.id}`"
          />
        </UiList>
      </section>

      <!-- Actions -->
      <div class="ai-home__actions">
        <UiButton block @click="startChat()">Nueva conversación</UiButton>
        <UiButton v-if="lastActiveSession" block variant="outline" :to="`/ai/chat/${lastActiveSession}`">
          Continuar
        </UiButton>
      </div>

      <!-- Limit state -->
      <div v-if="limitReached" class="ai-home__limit">
        <p><strong>Límite alcanzado</strong></p>
        <p>Has usado todos tus mensajes de hoy. El límite se restablece mañana a las 00:00 (CDMX).</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const selectedTone = ref<'carlotta' | 'gabriel'>('carlotta')
const limitReached = ref(false)
const lastActiveSession = ref('mock-ai-session-001')

const quickPrompts = [
  '¿Qué hago hoy para empezar bien?',
  'Necesito un momento de calma',
  'Ayúdame a reflexionar sobre mi día',
  'Dame estructura para esta mañana',
]

const sessions = ref([
  { id: 'mock-ai-session-001', preview: 'Hablamos sobre gratitud y propósito...', tone: 'carlotta', date: 'Hoy, 8:30' },
  { id: 'mock-ai-session-002', preview: 'Plan de productividad matutina', tone: 'gabriel', date: 'Ayer, 7:15' },
])

function startChat(prompt?: string) {
  // Create new session and navigate
  navigateTo('/ai/chat/mock-ai-session-new')
}
</script>

<style scoped>
.ai-home__hero { text-align: center; margin-bottom: var(--space-8); }

.ai-home__icon { font-size: 3rem; margin-bottom: var(--space-3); }

.ai-home__desc {
  font-size: var(--text-sm); color: var(--color-text-secondary);
  line-height: var(--leading-relaxed); margin-top: var(--space-2); max-width: 300px;
  margin-left: auto; margin-right: auto;
}

.ai-home__disclaimer {
  font-size: var(--text-xs); color: var(--color-muted);
  margin-top: var(--space-3); font-style: italic;
}

.ai-home__tone { margin-bottom: var(--space-6); }
.ai-home__tone > .eyebrow { margin-bottom: var(--space-3); }

.ai-home__tone-options { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }

.ai-home__tone-btn {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-1);
  padding: var(--space-5); border: 2px solid var(--color-border); border-radius: var(--radius-xl);
  background: var(--color-surface); color: var(--color-text); cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.ai-home__tone-btn:hover { border-color: var(--color-text-secondary); }

.ai-home__tone-btn--active { border-color: var(--color-accent); background: var(--color-success-light); }

.ai-home__tone-emoji { font-size: 1.5rem; }
.ai-home__tone-name { font-weight: var(--weight-semibold); font-size: var(--text-md); }
.ai-home__tone-desc { font-size: var(--text-xs); color: var(--color-muted); }

.ai-home__prompts { margin-bottom: var(--space-6); }
.ai-home__prompts > .eyebrow { margin-bottom: var(--space-3); }

.ai-home__prompts-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }

.ai-home__prompt-chip {
  padding: var(--space-2) var(--space-4); border: 1px solid var(--color-border);
  border-radius: var(--radius-full); background: var(--color-surface);
  font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-secondary);
  cursor: pointer; transition: background var(--transition-fast);
}
.ai-home__prompt-chip:hover { background: var(--color-surface-alt); }

.ai-home__history { margin-bottom: var(--space-6); }
.ai-home__history > .eyebrow { margin-bottom: var(--space-3); }

.ai-home__actions { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-6); }

.ai-home__limit {
  background: var(--color-warning-light); border-radius: var(--radius-lg);
  padding: var(--space-4); font-size: var(--text-sm); color: var(--color-warning);
  line-height: var(--leading-relaxed);
}
</style>
