<template>
  <div class="onboarding">
    <!-- Header: back + progress -->
    <div class="onboarding__header">
      <button class="onboarding__back" aria-label="Volver" @click="handleBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="onboarding__progress">
        <div class="onboarding__progress-fill" :style="{ width: progressWidth }" />
      </div>
    </div>

    <!-- Body -->
    <div class="onboarding__body">
      <h1 class="title title--md onboarding__question">{{ currentStep.question }}</h1>

      <div class="onboarding__options">
        <button
          v-for="opt in currentStep!.options"
          :key="opt.value"
          :class="['onboarding-opt', { 'onboarding-opt--selected': isSelected(opt.value) }]"
          @click="toggleOption(opt.value)"
        >
          <span class="onboarding-opt__icon">{{ opt.icon }}</span>
          <span class="onboarding-opt__label">{{ opt.label }}</span>
        </button>
      </div>

      <!-- Desktop: button inside card -->
      <UiButton
        block
        :disabled="!hasAnswer()"
        class="onboarding__desktop-btn"
        @click="handleContinue"
      >
        Continuar
      </UiButton>
    </div>

    <!-- Mobile: bottom-pinned button -->
    <div class="onboarding__footer">
      <UiButton block :disabled="!hasAnswer()" @click="handleContinue">
        Continuar
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { setSegment } = useAuth()

const step = ref(0)

const steps = [
  {
    question: '¿Qué te motiva a estar aquí?',
    key: 'motivation',
    multi: true,
    options: [
      { value: 'calm', icon: '🧘', label: 'Encontrar calma y reducir estrés' },
      { value: 'discipline', icon: '🎯', label: 'Ser más disciplinado/a' },
      { value: 'growth', icon: '🌱', label: 'Crecimiento personal' },
      { value: 'motivation', icon: '⚡', label: 'Motivación diaria' },
      { value: 'community', icon: '🤝', label: 'Conectar con una comunidad' },
    ],
  },
  {
    question: '¿En qué área quieres enfocarte?',
    key: 'focus',
    multi: true,
    options: [
      { value: 'emotional', icon: '💚', label: 'Bienestar emocional' },
      { value: 'productivity', icon: '📋', label: 'Productividad y hábitos' },
      { value: 'relationships', icon: '💬', label: 'Relaciones y comunicación' },
      { value: 'confidence', icon: '💪', label: 'Autoconfianza' },
      { value: 'mindfulness', icon: '🧠', label: 'Mindfulness y meditación' },
    ],
  },
  {
    question: 'Elige tu voz guía',
    key: 'segment',
    options: [
      { value: 'gabriel', icon: '🌊', label: 'Gabriel — Disciplina consciente' },
      { value: 'carlotta', icon: '🌸', label: 'Carlotta — Bienestar emocional' },
      { value: 'conjunta', icon: '✨', label: 'Combinada — Equilibrio integral' },
    ],
  },
  {
    question: '¿Cuánto tiempo al día puedes dedicar?',
    key: 'time',
    options: [
      { value: '5', icon: '⚡', label: '5 minutos' },
      { value: '10', icon: '☕', label: '10 minutos' },
      { value: '15', icon: '🌿', label: '15 minutos' },
      { value: '20', icon: '🌟', label: '20+ minutos' },
    ],
  },
]

const answers = ref<Record<string, string | string[]>>({})

const currentStep = computed(() => steps[step.value]!)

// Profile-setup is step 1 of 5, these are steps 2–5
const progressWidth = computed(() => `${((step.value + 2) / 5) * 100}%`)

function isSelected(value: string) {
  const answer = answers.value[currentStep.value.key]
  if (Array.isArray(answer)) return answer.includes(value)
  return answer === value
}

function toggleOption(value: string) {
  const key = currentStep.value.key
  if (currentStep.value.multi) {
    const current = (answers.value[key] as string[]) || []
    if (current.includes(value)) {
      answers.value[key] = current.filter(v => v !== value)
    } else {
      answers.value[key] = [...current, value]
    }
  } else {
    answers.value[key] = value
  }
}

function hasAnswer() {
  const answer = answers.value[currentStep.value.key]
  if (Array.isArray(answer)) return answer.length > 0
  return !!answer
}

function handleBack() {
  if (step.value > 0) {
    step.value--
  } else {
    navigateTo('/auth/profile-setup')
  }
}

function handleContinue() {
  if (!hasAnswer()) return

  if (step.value < steps.length - 1) {
    step.value++
  } else {
    // Final step — save segment and finish
    const segment = answers.value.segment as 'gabriel' | 'carlotta' | 'conjunta'
    if (segment) {
      setSegment(segment)
    }
    navigateTo('/hoy')
  }
}
</script>

<style scoped>
.onboarding {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* ─── Header ─── */
.onboarding__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) var(--space-3);
  flex-shrink: 0;
}

.onboarding__back {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  color: var(--color-text-inverse);
  cursor: pointer;
  flex-shrink: 0;
}

/* ─── Progress bar ─── */
.onboarding__progress {
  flex: 1;
  height: 4px;
  background: #ffffff30;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.onboarding__progress-fill {
  height: 100%;
  background: white;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

/* ─── Body ─── */
.onboarding__body {
  flex: 1;
  padding: var(--space-2) var(--space-6) var(--space-6);
  max-width: var(--max-content-width);
  width: 100%;
  margin: 0 auto;
}

.onboarding__question {
  margin-bottom: var(--space-8);
  line-height: var(--leading-snug);
  color: white;
}

.onboarding__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* ─── Option items ─── */
.onboarding-opt {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: #ffffff21;
  color: white;
  border: 1.5px solid #ffffff00;
  border-radius: var(--radius-xl);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}


.onboarding-opt--selected {
  border-color: white;
  background: var(--color-surface);
}

.onboarding-opt--selected .onboarding-opt__label {
  color: var(--color-accent);
}

.onboarding-opt__icon {
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.onboarding-opt__label {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: white;
  line-height: var(--leading-normal);
}

/* Hide desktop button on mobile */
.onboarding__desktop-btn {
  display: none;
}

/* ─── Footer ─── */
.onboarding__footer {
  padding: var(--space-4) var(--space-6);
  padding-bottom: calc(var(--space-6) + var(--safe-area-bottom));
  max-width: var(--max-content-width);
  width: 100%;
  margin: 0 auto;
  flex-shrink: 0;
}

.onboarding__footer :deep(.btn) {
  background: white;
  color: var(--color-dark);
  border: none;
}

/* ─── Desktop ─── */
@media (min-width: 1024px) {
  .onboarding {
    min-height: auto;
    background: transparent;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .onboarding__header {
    max-width: 440px;
    width: 100%;
    padding: 0 0 var(--space-4);
  }

  .onboarding__body {
    background: var(--color-surface);
    color: var(--color-text);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-2);
    padding: var(--space-8);
    max-width: 440px;
    flex: none;
  }

  .onboarding__options {
    margin-bottom: var(--space-6);
  }

  .onboarding__desktop-btn {
    display: flex;
  }

  .onboarding__question {
    color: var(--color-text);
  }

  .onboarding-opt {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1.5px solid var(--color-border);
  }

  .onboarding-opt:hover {
    border-color: var(--color-text-secondary);
  }

  .onboarding-opt--selected {
    border-color: var(--color-accent);
    background: color-mix(in srgb, var(--color-accent) 8%, var(--color-surface));
  }

  .onboarding-opt__label {
    color: var(--color-text);
  }

  .onboarding__back {
    color: var(--color-text);
  }

  .onboarding__progress {
    background: var(--color-border);
  }

  .onboarding__progress-fill {
    background: var(--color-dark);
  }

  .onboarding__footer {
    display: none;
  }
}
</style>
