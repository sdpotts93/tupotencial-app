<template>
  <div class="screen">
    <div class="screen__content">
      <header class="ai__header">
        <button class="ai__back" aria-label="Volver" @click="navigateTo('/cuenta/mas')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="ai__header-title">Mi Coach IA</h1>
      </header>

      <!-- Intro + Tone (side-by-side on desktop) -->
      <div class="ai-home__top-row">
        <div class="ai-home__hero">
          <div class="ai-home__icon"><Icon name="lucide:bot" size="48" /></div>
          <h1 class="title title--lg">Tu acompañamiento diario</h1>
          <p class="ai-home__desc">
            Orientación personalizada según tu energía y ánimo.
          </p>
          <p class="ai-home__disclaimer">No es consejo médico/terapéutico.</p>
        </div>

        <!-- Tone selector -->
        <section class="ai-home__tone">
        <p class="eyebrow">ELIGE TU TONO</p>
        <div class="ai-home__tone-options">
          <button
            :class="['onboarding-opt', { 'onboarding-opt--selected': selectedTone === 'carlotta' }]"
            @click="selectedTone = 'carlotta'"
          >
            <span class="onboarding-opt__icon"><Icon name="lucide:flower" size="20" /></span>
            <span class="onboarding-opt__label">Carlotta</span>
          </button>
          <button
            :class="['onboarding-opt', { 'onboarding-opt--selected': selectedTone === 'gabriel' }]"
            @click="selectedTone = 'gabriel'"
          >
            <span class="onboarding-opt__icon"><Icon name="lucide:waves" size="20" /></span>
            <span class="onboarding-opt__label">Gabriel</span>
          </button>
        </div>
      </section>
      </div>

      <!-- Session history -->
      <section v-if="sessions.length" class="ai-home__history">
        <p class="eyebrow">HISTORIAL</p>
        <div class="ai-home__history-list">
          <NuxtLink
            v-for="session in sessions"
            :key="session.id"
            :to="`/cuenta/ia/chat/${session.id}`"
            class="ai-home__session"
          >
            <div class="ai-home__session-body">
              <span class="ai-home__session-preview">{{ session.preview }}</span>
              <span :class="['ai-home__session-tone', `ai-home__session-tone--${session.tone}`]">{{ session.tone === 'carlotta' ? 'Carlotta' : 'Gabriel' }}</span>
              <span class="ai-home__session-date">{{ session.date }}</span>
            </div>
            <svg class="ai-home__session-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </NuxtLink>
        </div>
      </section>

      <!-- Actions -->
      <div class="ai-home__actions">
        <UiButton variant="outline" block @click="startChat()">Nueva conversación</UiButton>
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
definePageMeta({ layout: 'default' })

const selectedTone = ref<'carlotta' | 'gabriel'>('carlotta')
const limitReached = ref(false)

const sessions = ref([
  { id: 'mock-ai-session-001', preview: 'Hablamos sobre gratitud y propósito...', tone: 'carlotta', date: 'Hoy, 8:30' },
  { id: 'mock-ai-session-002', preview: 'Plan de productividad matutina', tone: 'gabriel', date: 'Ayer, 7:15' },
])

function startChat(prompt?: string) {
  navigateTo('/cuenta/ia/chat/mock-ai-session-new')
}
</script>

<style scoped>
/* ─── Header (standard) ─── */
.ai__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.ai__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.ai__back {
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
.ai__back:hover { background: rgba(var(--tint-rgb), 0.04); }

/* ─── Top row wrapper (transparent on mobile) ─── */
.ai-home__top-row { display: contents; }

/* ─── Hero ─── */
.ai-home__hero { text-align: center; margin-bottom: var(--space-8); }

.ai-home__icon { font-size: 1rem; margin-bottom: var(--space-3); }

.ai-home__desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  margin-top: var(--space-2);
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
}

.ai-home__disclaimer {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-3);
  font-style: italic;
}

/* ─── Tone selector (onboarding-opt style) ─── */
.ai-home__tone { margin-bottom: var(--space-6); }
.ai-home__tone > .eyebrow { margin-bottom: var(--space-3); }

.ai-home__tone-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.onboarding-opt {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: rgba(var(--tint-rgb), 0.04);
  color: var(--color-text);
  border: 1.5px solid transparent;
  border-radius: var(--radius-xl);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.onboarding-opt--selected {
  border-color: var(--color-border);
  background: var(--color-surface);
}

.onboarding-opt__icon {
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
  color: var(--color-sand);
}

.onboarding-opt__label {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  line-height: var(--leading-normal);
}

/* ─── History ─── */
.ai-home__history { margin-bottom: var(--space-6); }
.ai-home__history > .eyebrow { margin-bottom: var(--space-3); }

.ai-home__history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.ai-home__session {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  text-decoration: none;
  color: var(--color-text);
  border-radius: var(--radius-xl);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  background: rgba(var(--tint-rgb), 0.04);
  transition: background var(--transition-fast);
}
.ai-home__session:hover { background: rgba(var(--tint-rgb), 0.06); }

.ai-home__session-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-home__session-preview {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  line-height: var(--leading-snug);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-home__session-date {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-left: 2px;
  margin-top: 5px;
}

.ai-home__session-tone {
  font-family: var(--font-eyebrow);
  font-size: 10px;
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
  width: fit-content;
}

.ai-home__session-tone--carlotta {
  background: var(--color-ai-warm-bg);
  color: var(--color-ai-warm);
}

.ai-home__session-tone--gabriel {
  background: var(--color-ai-cool-bg);
  color: var(--color-ai-cool);
}

.ai-home__session-chevron {
  flex-shrink: 0;
  color: var(--color-muted);
}

/* ─── Actions (login__cta-area style) ─── */
.ai-home__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

/* ─── Limit warning ─── */
.ai-home__limit {
  background: var(--color-ai-action-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-ai-action);
  line-height: var(--leading-relaxed);
}

/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .ai__header {
    justify-content: flex-start;
  }

  .ai__header-title {
    display: none;
  }

  .ai__back {
    display: none;
  }

  .ai-home__top-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5);
    align-items: stretch;
    margin-bottom: var(--space-6);
  }

  .ai-home__hero {
    text-align: left;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    margin-bottom: 0;
  }

  .ai-home__tone {
    margin-bottom: 0;
  }

  .ai-home__icon {
    margin-bottom: 0;
  }

  .ai-home__desc {
    margin-left: 0;
    max-width: none;
  }

  .ai-home__tone-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .onboarding-opt {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
  }

  .onboarding-opt--selected {
    border-color: var(--color-sand);
    background:var(--color-surface);
  }

  .ai-home__session {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
  }

  .ai-home__session:hover {
    background: var(--color-desktop-card);
    border-color: var(--color-border);
  }

  .ai-home__actions :deep(.btn) {
    max-width: 280px;
  }
}
</style>
