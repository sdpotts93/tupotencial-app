<template>
  <div :class="['onboarding', { 'onboarding--redirecting': isRedirecting }]">
    <div v-if="isRedirecting" class="onboarding__loading" aria-live="polite" aria-busy="true">
      <BlobLoader />
      <p class="onboarding__loading-text">Guardando tu experiencia...</p>
    </div>

    <!-- Header: back + progress -->
    <div class="onboarding__header">
      <button class="onboarding__back" aria-label="Volver" :disabled="isRedirecting" @click="handleBack">
        <Icon name="lucide:chevron-left" size="20" />
      </button>
      <div class="onboarding__progress">
        <div class="onboarding__progress-fill" :style="{ width: progressWidth }" />
      </div>
    </div>

    <!-- Body -->
    <div class="onboarding__body">
      <h1 :key="`q-${step}`" class="title title--md onboarding__question onboarding__fade-in">{{ currentStep.question }}</h1>

      <div class="onboarding__options">
        <button
          v-for="(opt, i) in currentStep!.options"
          :key="`${step}-${opt.value}`"
          :class="['onboarding-opt', { 'onboarding-opt--selected': isSelected(opt.value) }]"
          :style="{ animationDelay: `${i * 70}ms` }"
          :disabled="isRedirecting"
          @click="toggleOption(opt.value)"
        >
          <span class="onboarding-opt__icon">
            <img
              v-if="optionAvatar(opt)"
              :src="optionAvatar(opt)!"
              :alt="opt.label"
              class="onboarding-opt__avatar"
              @error="handleAvatarError(opt.value)"
            />
            <Icon v-else :name="opt.icon" size="20" />
          </span>
          <span class="onboarding-opt__label">{{ opt.label }}</span>
        </button>
      </div>

      <!-- Desktop: button inside card -->
      <UiButton
        :key="`desk-${step}`"
        block
        variant="secondary"
        :disabled="isRedirecting || !hasAnswer"
        class="onboarding__desktop-btn"
        @click="handleContinue"
      >
        Continuar
      </UiButton>
    </div>

    <!-- Mobile: bottom-pinned button -->
    <div :key="`foot-${step}`" class="onboarding__footer">
      <UiButton block variant="secondary" :disabled="isRedirecting || !hasAnswer" @click="handleContinue">
        Continuar
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

type OnboardingOption = {
  value: string
  icon: string
  label: string
  avatar?: string
}

const { setSegment, user, isOnboarded } = useAuth()
const supaUser = useSupabaseUser()
const supabase = useSupabaseClient()
const { avatarUrl } = useCharacterAvatars()

const step = ref(0)
const isRedirecting = ref(false)
const failedAvatarOptions = ref<Record<string, boolean>>({})

const steps = computed(() => [
  {
    question: '¿Qué te motiva a estar aquí?',
    key: 'motivation',
    multi: true,
    options: [
      { value: 'calm', icon: 'lucide:flower-2', label: 'Encontrar calma y reducir estrés' },
      { value: 'discipline', icon: 'lucide:target', label: 'Ser más disciplinado/a' },
      { value: 'growth', icon: 'lucide:sprout', label: 'Crecimiento personal' },
      { value: 'motivation', icon: 'lucide:zap', label: 'Motivación diaria' },
      { value: 'community', icon: 'lucide:handshake', label: 'Conectar con una comunidad' },
    ],
  },
  {
    question: '¿En qué área quieres enfocarte?',
    key: 'focus',
    multi: true,
    options: [
      { value: 'emotional', icon: 'lucide:heart', label: 'Bienestar emocional' },
      { value: 'productivity', icon: 'lucide:clipboard-list', label: 'Productividad y hábitos' },
      { value: 'relationships', icon: 'lucide:message-circle', label: 'Relaciones y comunicación' },
      { value: 'confidence', icon: 'lucide:shield-check', label: 'Autoconfianza' },
      { value: 'mindfulness', icon: 'lucide:brain', label: 'Mindfulness y meditación' },
    ],
  },
  {
    question: 'Elige tu voz guía',
    key: 'segment',
    options: [
      { value: 'gabriel', icon: 'lucide:waves', label: 'Gabriel — Disciplina consciente', avatar: avatarUrl('gabriel') },
      { value: 'carlotta', icon: 'lucide:flower', label: 'Carlotta — Bienestar emocional', avatar: avatarUrl('carlotta') },
      { value: 'conjunta', icon: 'lucide:sparkles', label: 'Combinada — Equilibrio integral' },
    ],
  },
  {
    question: '¿Cuánto tiempo al día puedes dedicar?',
    key: 'time',
    options: [
      { value: '5', icon: 'lucide:zap', label: '5 minutos' },
      { value: '10', icon: 'lucide:coffee', label: '10 minutos' },
      { value: '15', icon: 'lucide:leaf', label: '15 minutos' },
      { value: '20', icon: 'lucide:star', label: '20+ minutos' },
    ],
  },
])

const answers = ref<Record<string, string | string[]>>({})

const currentStep = computed(() => steps.value[step.value]!)

// Profile-setup is step 1 of 5, these are steps 2–5
const progressWidth = computed(() => `${((step.value + 2) / 5) * 100}%`)

function optionAvatar(opt: OnboardingOption) {
  const avatar = opt.avatar?.trim()
  if (!avatar) return ''
  if (failedAvatarOptions.value[opt.value]) return ''
  return avatar
}

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

const hasAnswer = computed(() => {
  const answer = answers.value[currentStep.value.key]
  if (Array.isArray(answer)) return answer.length > 0
  return !!answer
})

function handleAvatarError(value: string) {
  failedAvatarOptions.value = {
    ...failedAvatarOptions.value,
    [value]: true,
  }
}

function handleBack() {
  if (step.value > 0) {
    step.value--
  } else {
    navigateTo('/configurar-perfil')
  }
}

async function handleContinue() {
  if (!hasAnswer.value || isRedirecting.value) return

  if (step.value < steps.value.length - 1) {
    step.value++
  } else {
    isRedirecting.value = true

    try {
      // Final step — save segment + onboarding preferences
      const segment = answers.value.segment as 'gabriel' | 'carlotta' | 'conjunta'
      if (segment) {
        await setSegment(segment)
      }

      // Save onboarding preferences for AI context
      if (user.value) {
        await supabase.from('profiles').update({
          onboarding_motivation: answers.value.motivation,
          onboarding_focus: answers.value.focus,
          onboarding_time: answers.value.time,
        } as any).eq('id', user.value.id)
      }

      await navigateTo('/cuenta/hoy', { replace: true })
    } finally {
      if (useRoute().path === '/cuenta/bienvenida/segmento') {
        isRedirecting.value = false
      }
    }
  }
}

async function redirectIfAlreadyOnboarded() {
  const sessionUserId = supaUser.value?.id ?? (supaUser.value as any)?.sub as string | undefined
  const hasHydratedCurrentUser = !!sessionUserId && user.value?.id === sessionUserId

  if (hasHydratedCurrentUser && isOnboarded.value) {
    isRedirecting.value = true
    await navigateTo('/cuenta/hoy', { replace: true })
  }
}

onMounted(() => {
  redirectIfAlreadyOnboarded()
})
</script>

<style scoped>
.onboarding {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  position: relative;
}

.onboarding--redirecting {
  pointer-events: none;
}

.onboarding__loading {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-6);
  background: rgba(255, 255, 255, 0.92);
}

.onboarding__loading-text {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-align: center;
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
  color: var(--color-dark-lighter);
  cursor: pointer;
  flex-shrink: 0;
}

.onboarding__back:disabled {
  cursor: default;
}

/* ─── Progress bar ─── */
.onboarding__progress {
  flex: 1;
  height: 4px;
  background: rgba(var(--tint-rgb), 0.08);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.onboarding__progress-fill {
  height: 100%;
  background: var(--color-dark-lighter);
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
  color: var(--color-text);
}

.onboarding__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* ─── Staggered elastic entrance for options ─── */
@keyframes slide-in-elastic {
  0% {
    opacity: 0;
    transform: translateX(40px);
  }
  60% {
    opacity: 1;
    transform: translateX(-6px);
  }
  80% {
    transform: translateX(2px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ─── Fade-in for question title ─── */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.onboarding__fade-in {
  animation: fade-in-up 0.4s ease-out both;
}

.onboarding__btn-fade {
  animation: btn-fade-in 0.5s ease-out 0.35s both;
}

/* ─── Option items ─── */
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
  transition: border-color var(--transition-fast), background var(--transition-fast);
  animation: slide-in-elastic 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.onboarding-opt:disabled {
  cursor: default;
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

.onboarding-opt__avatar {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.onboarding-opt__label {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-text);
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
    background: var(--color-accent);
    color: var(--color-text);
    border-radius: var(--radius-2xl);
    box-shadow: none;
    padding: var(--space-8);
    max-width: 440px;
    flex: none;
    min-height: 540px;
    display: flex;
    flex-direction: column;
  }

  .onboarding__options {
    margin-bottom: var(--space-6);
  }

  .onboarding__desktop-btn {
    display: flex;
    margin-top: auto;
  }

  .onboarding__question {
    color: var(--color-text);
  }

  .onboarding-opt {
    background: var(--color-desktop-card);
    color: var(--color-text);
    border: 1px solid var(--color-desktop-border);
  }

  .onboarding-opt--selected {
    border-color: var(--color-sand);
    background: var(--color-surface);
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
