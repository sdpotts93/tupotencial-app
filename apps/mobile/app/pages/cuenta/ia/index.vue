<template>
  <div class="screen">
    <div class="screen__content">
      <header class="ai__header">
        <button class="ai__back" aria-label="Volver" @click="useRouter().back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="ai__header-title">Mi Coach IA</h1>
      </header>

      <template v-if="iaStatus === 'pending'">
        <div style="text-align: center; margin-bottom: var(--space-8);">
          <UiSkeleton variant="circle" width="48px" height="48px" style="margin: 0 auto var(--space-3);" />
          <UiSkeleton variant="text" width="60%" height="24px" style="margin: 0 auto var(--space-2);" />
          <UiSkeleton variant="text" width="80%" height="14px" style="margin: 0 auto;" />
        </div>

        <div style="margin-bottom: var(--space-6);">
          <UiSkeleton variant="text" width="30%" height="10px" style="margin-bottom: var(--space-3);" />
          <UiSkeleton variant="rect" width="100%" height="52px" style="border-radius: var(--radius-xl); margin-bottom: var(--space-3);" />
          <UiSkeleton variant="rect" width="100%" height="52px" style="border-radius: var(--radius-xl);" />
        </div>

        <div style="margin-bottom: var(--space-6);">
          <UiSkeleton variant="text" width="25%" height="10px" style="margin-bottom: var(--space-3);" />
          <div v-for="i in 3" :key="i" style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) var(--space-4); border-radius: var(--radius-xl); background: rgba(var(--tint-rgb), 0.04); margin-bottom: var(--space-3);">
            <div style="flex: 1;">
              <UiSkeleton variant="text" width="70%" height="14px" style="margin-bottom: 4px;" />
              <UiSkeleton variant="text" width="30%" height="10px" style="margin-bottom: 4px;" />
              <UiSkeleton variant="text" width="20%" height="10px" />
            </div>
          </div>
        </div>

        <UiSkeleton variant="rect" width="100%" height="44px" style="border-radius: var(--radius-lg);" />
      </template>
      <!-- Error state -->
      <template v-else-if="iaStatus === 'error'">
        <div class="ia__error">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="ia__error-icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
          <h2 class="ia__error-title">No pudimos cargar el Coach IA</h2>
          <p class="ia__error-desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
          <UiButton variant="primary-outline" size="sm" @click="refreshSessions()">Reintentar</UiButton>
        </div>
      </template>
      <template v-else>

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
        <UiButton variant="outline" block :disabled="limitReached" @click="startChat()">Nueva conversación</UiButton>
      </div>

      <!-- Limit state -->
      <div v-if="limitReached" class="ai-home__limit">
        <p><strong>Límite alcanzado</strong></p>
        <p>Has usado todos tus mensajes de hoy. El límite se restablece mañana a las 00:00 (CDMX).</p>
      </div>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const { user } = useAuth()

const selectedTone = ref<'carlotta' | 'gabriel'>('carlotta')
const limitReached = ref(false)

const { data: rawSessions, refresh: refreshSessions, status: iaStatus } = useAsyncData('mobile-ai-sessions', async () => {
  if (!user.value?.id) return []
  const { data } = await client.from('ai_sessions').select('*, ai_messages(content)').eq('user_id', user.value.id).order('created_at', { ascending: false })
  return data ?? []
}, { lazy: true, watch: [() => user.value?.id] })

// Check daily quota
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
const { data: quota } = useAsyncData('ai-quota-check', async () => {
  if (!user.value?.id) return null
  const { data } = await client.from('ai_quotas').select('messages_used')
    .eq('user_id', user.value.id).eq('day', today).maybeSingle()
  return data
}, { lazy: true, watch: [() => user.value?.id] })
watchEffect(() => {
  limitReached.value = (quota.value?.messages_used ?? 0) >= 20
})

const sessions = computed(() =>
  (rawSessions.value ?? []).map(s => {
    const firstMsg = Array.isArray(s.ai_messages) ? s.ai_messages[0]?.content ?? '' : ''
    return {
      id: s.id,
      preview: firstMsg.slice(0, 80) || 'Nueva conversación',
      tone: s.tone ?? 'carlotta',
      date: new Date(s.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    }
  }),
)

function startChat() {
  navigateTo(`/cuenta/ia/chat/new?tone=${selectedTone.value}`)
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
@media (hover: hover) {
  .ai__back:hover { background: rgba(var(--tint-rgb), 0.04); }
}

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
@media (hover: hover) {
  .ai-home__session:hover { background: rgba(var(--tint-rgb), 0.06); }
}

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

  @media (hover: hover) {
    .ai-home__session:hover {
      background: var(--color-desktop-card);
      border-color: var(--color-border);
    }
  }

  .ai-home__actions :deep(.btn) {
    max-width: 280px;
  }
}

/* ─── Error state ─── */
.ia__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 60dvh;
  gap: var(--space-3);
}

.ia__error-icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.ia__error-title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.ia__error-desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
