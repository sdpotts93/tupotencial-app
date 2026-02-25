<template>
  <nav ref="navRef" class="bottom-nav">
    <div class="bottom-nav__logo">
      <img src="/logo-icon/logo-icon-green.png" alt="Tu Potencial" />
    </div>
    <div class="bottom-nav__pill" :style="pillStyle" />
    <NuxtLink
      v-for="(item, idx) in items"
      :key="item.to"
      :ref="(el: any) => setItemRef(idx, el)"
      :to="item.to"
      :class="['bottom-nav__item', { 'bottom-nav__item--active': isActive(item.to) }]"
    >
      <span class="bottom-nav__icon" v-html="item.icon" />
      <span class="bottom-nav__label">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface NavItem {
  label: string
  to: string
  icon: string
}

interface Props {
  items: NavItem[]
}

const props = defineProps<Props>()
const route = useRoute()
const navRef = ref<HTMLElement | null>(null)
const itemEls: (HTMLElement | null)[] = []
const animated = ref(false)

function setItemRef(idx: number, el: any) {
  itemEls[idx] = el?.$el || el
}

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

const activeIndex = computed(() =>
  props.items.findIndex(item => isActive(item.to)),
)

const pillStyle = ref<Record<string, string>>({})

function updatePill() {
  const idx = activeIndex.value
  const nav = navRef.value
  if (idx < 0 || !itemEls[idx] || !nav) {
    pillStyle.value = { opacity: '0' }
    return
  }

  const navRect = nav.getBoundingClientRect()
  const itemRect = itemEls[idx]!.getBoundingClientRect()

  pillStyle.value = {
    opacity: '1',
    transform: `translate(${itemRect.left - navRect.left}px, ${itemRect.top - navRect.top}px)`,
    width: `${itemRect.width}px`,
    height: `${itemRect.height}px`,
    transition: animated.value
      ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, opacity 0.3s ease'
      : 'none',
  }
}

let ro: ResizeObserver | null = null

watch(() => route.path, () => nextTick(updatePill))

onMounted(() => {
  nextTick(() => {
    updatePill()
    setTimeout(() => { animated.value = true }, 60)
  })
  if (navRef.value) {
    ro = new ResizeObserver(() => updatePill())
    ro.observe(navRef.value)
  }
})

onBeforeUnmount(() => ro?.disconnect())
</script>

<style scoped>
/* ─── Mobile: Floating bottom bar (Dark style) ─── */
.bottom-nav {
  position: fixed;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  left: 16px;
  right: 16px;
  z-index: var(--z-fixed);
  background: rgba(20, 20, 22, 0.78);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.24);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 6px 4px;
}

.bottom-nav__logo {
  display: none;
}

/* ─── Sliding pill (capsule) ─── */
.bottom-nav__pill {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  pointer-events: none;
  z-index: 0;
}

/* ─── Nav items ─── */
.bottom-nav__item {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 18px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.25s ease;
  -webkit-tap-highlight-color: transparent;
  border-radius: 22px;
}

.bottom-nav__item:hover {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
}

.bottom-nav__item--active {
  color: #ffffff;
}

/* Active icon: outline only, no fill */

.bottom-nav__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}

.bottom-nav__icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.bottom-nav__label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* ─── Desktop: Left sidebar ─── */
@media (min-width: 1024px) {
  .bottom-nav {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: auto;
    width: 220px;
    height: 100dvh;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    background: var(--color-surface);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    border-radius: 0;
    border-right: 1px solid var(--color-border-light);
    padding: 0;
    padding-top: var(--space-2);
    gap: var(--space-1);
  }

  .bottom-nav__logo {
    display: flex;
    align-items: center;
    padding: var(--space-4) var(--space-5) var(--space-6);
  }

  .bottom-nav__logo img {
    height: 32px;
    width: auto;
  }

  .bottom-nav__pill {
    background: var(--color-surface-alt);
    border-radius: var(--radius-lg);
  }

  .bottom-nav__item {
    flex-direction: row;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-lg);
    margin: 0 var(--space-2);
    color: var(--color-muted);
  }

  .bottom-nav__item:hover {
    color: var(--color-text-secondary);
  }

  .bottom-nav__item--active {
    color: var(--color-primary);
  }

  .bottom-nav__item--active .bottom-nav__icon :deep(svg) {
    fill: none;
  }

  .bottom-nav__label {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    letter-spacing: normal;
  }

  .bottom-nav__item--active .bottom-nav__label {
    font-weight: var(--weight-semibold);
  }
}
</style>
