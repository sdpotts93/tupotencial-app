<template>
  <div class="screen">
    <div class="screen__content">
      <header class="retos__header">
        <h1 class="retos__title">Programas / Retos / Bootcamps</h1>
      </header>

      <p class="retos__subtitle">Programas guiados para construir hábitos con estructura y constancia.</p>

      <!-- Tabs -->
      <UiTabs v-model="activeTab" :tabs="tabs" />

      <!-- Programs list -->
      <div class="retos__list">
        <div
          v-for="item in filteredPrograms"
          :key="item.id"
          :class="['retos__card', { 'retos__card--locked': isLocked(item.entitlement_key) }]"
          @click="handleCardClick(item)"
        >
          <div class="retos__card-img-wrap">
            <img :src="item.img" alt="" class="retos__card-img" />
            <EntitlementLockBadge :locked="isLocked(item.entitlement_key)" />
          </div>
          <div class="retos__card-info">
            <span class="retos__card-eyebrow">{{ item.typeLabel }} · {{ item.duration }}</span>
            <h3 class="retos__card-name">{{ item.title }}</h3>
            <p class="retos__card-desc">{{ item.description }}</p>
            <div class="retos__card-footer">
              <span v-if="isLocked(item.entitlement_key)" class="retos__tag retos__tag--locked">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Complemento
              </span>
              <span v-else :class="['retos__tag', item.enrolled ? 'retos__tag--inscrito' : (item.free ? 'retos__tag--gratis' : 'retos__tag--core')]">
                {{ item.enrolled ? 'Inscrito' : (item.free ? 'Gratis' : 'Core') }}
              </span>
              <span v-if="item.progress" class="retos__progress-text">{{ item.progress }}</span>
            </div>
          </div>
        </div>
      </div>

      <EntitlementPurchaseModal v-model="showPurchaseModal" :addon="selectedAddon" />
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { isLocked, getAddonForEntitlement } = useEntitlementGating()

const activeTab = ref('all')
const showPurchaseModal = ref(false)
const selectedAddon = ref<{ id: string; title: string; description: string | null } | null>(null)

const tabs = [
  { value: 'all', label: 'Todos' },
  { value: 'program', label: 'Programas' },
  { value: 'reto', label: 'Retos' },
  { value: 'bootcamp', label: 'Bootcamps' },
]

const programs = ref([
  {
    id: 'mock-prog-001', type: 'reto', typeLabel: 'RETO', title: 'Reto 7 días de gratitud',
    description: 'Transforma tu perspectiva con un ejercicio diario de agradecimiento.',
    duration: '7 días', img: '/images/lib-3.jpg', enrolled: true, free: true, progress: 'Día 5/7',
    entitlement_key: null as string | null,
  },
  {
    id: 'mock-prog-002', type: 'program', typeLabel: 'PROGRAMA', title: 'Despertar consciente',
    description: 'Un programa de 30 días para desarrollar una rutina matutina transformadora.',
    duration: '30 días', img: '/images/lib-5.jpg', enrolled: true, free: false, progress: 'Día 12/30',
    entitlement_key: null as string | null,
  },
  {
    id: 'mock-prog-003', type: 'reto', typeLabel: 'RETO', title: 'Reto 15 días sin quejas',
    description: 'Desarrolla consciencia sobre tu lenguaje interno y externo.',
    duration: '15 días', img: '/images/lib-7.jpg', enrolled: false, free: true, progress: null,
    entitlement_key: null as string | null,
  },
  {
    id: 'mock-prog-004', type: 'bootcamp', typeLabel: 'BOOTCAMP', title: 'Liderazgo interior',
    description: 'Intensivo de 5 días para descubrir tu estilo de liderazgo.',
    duration: '5 días', img: '/images/lib-2.jpg', enrolled: false, free: false, progress: null,
    entitlement_key: 'bootcamp_liderazgo' as string | null,
  },
  {
    id: 'mock-prog-005', type: 'program', typeLabel: 'PROGRAMA', title: 'Equilibrio emocional',
    description: 'Aprende técnicas para manejar tus emociones día a día.',
    duration: '30 días', img: '/images/lib-8.jpg', enrolled: false, free: false, progress: null,
    entitlement_key: null as string | null,
  },
])

const filteredPrograms = computed(() => {
  if (activeTab.value === 'all') return programs.value
  return programs.value.filter(p => p.type === activeTab.value)
})

function handleCardClick(item: typeof programs.value[number]) {
  if (isLocked(item.entitlement_key)) {
    selectedAddon.value = getAddonForEntitlement(item.entitlement_key!)
    showPurchaseModal.value = true
    return
  }
  router.push(`/cuenta/retos/${item.id}`)
}
</script>

<style scoped>
/* ─── Header (matches library) ─── */
.retos__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
  position: relative;
}

.retos__title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.retos__subtitle {
  font-size: var(--text-md);
  color: var(--color-muted);
  margin: 0 0 var(--space-5);
  text-align: left;
  line-height: var(--leading-normal);
}

/* ─── Cards list ─── */
.retos__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  margin-top: var(--space-5);
}

/* ─── Card ─── */
.retos__card {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-decoration: none;
  color: var(--color-text);
}
.retos__card + .retos__card {
  border-top: 1px solid rgba(var(--tint-rgb), 0.1);
  padding-top: var(--space-8);
}

.retos__card-img-wrap {
  position: relative;
}

.retos__card-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-2xl);
}

.retos__card--locked .retos__card-img {
  opacity: 0.65;
  filter: grayscale(20%);
}

.retos__card-info {
  padding: var(--space-4) var(--space-1) 0;
}

.retos__card-eyebrow {
  display: block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.retos__card-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  margin: 0 0 var(--space-1);
  line-height: var(--leading-snug);
}

.retos__card-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

/* ─── Card footer ─── */
.retos__card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-3);
}

.retos__progress-text {
  font-size: var(--eyebrow-sm);
  font-family: var(--font-eyebrow);
  font-weight: var(--weight-medium);
  color: var(--color-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ─── Tags (per plan type) ─── */
.retos__tag {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
  white-space: nowrap;
}

.retos__tag--core {
  background: var(--color-gold-bg);
  color: var(--color-gold);
}

.retos__tag--gratis {
  background: var(--color-silver-bg);
  color: var(--color-silver);
}

.retos__tag--inscrito {
  background: var(--color-complete-bg);
  color: var(--color-complete);
}

.retos__tag--locked {
  background: var(--color-surface-alt);
  color: var(--color-muted);
}

.retos__card--locked {
  cursor: pointer;
}

/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .retos__header {
    justify-content: flex-start;
  }

  .retos__title {
    display: none; /* shown in top bar */
  }

  .retos__list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }

  .retos__card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: border-color var(--transition-fast);
  }

  @media (hover: hover) {
    .retos__card:hover {
      border-color: var(--color-border);
    }
  }

  .retos__card + .retos__card {
    border-top: none;
    padding-top: 0;
  }

  .retos__card-img {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    aspect-ratio: 16 / 9;
  }

  .retos__card-info {
    padding: var(--space-4) var(--space-5);
  }
}
</style>
