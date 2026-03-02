<template>
  <nav ref="navRef" class="bottom-nav">
    <div class="bottom-nav__logo">
      <img src="/logo-word/logo-word-black.png" alt="Tu Potencial" />
    </div>
    <div class="bottom-nav__pill" :style="pillStyle" />

    <!-- Primary nav items (shown on mobile bottom bar + desktop sidebar) -->
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

    <!-- Desktop-only: additional sections -->
    <template v-for="section in sections" :key="section.title">
      <div class="bottom-nav__section">
        <span class="bottom-nav__section-title">{{ section.title }}</span>
        <NuxtLink
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          :class="['bottom-nav__item', { 'bottom-nav__item--active': isActive(item.to) }]"
        >
          <span class="bottom-nav__icon" v-html="item.icon" />
          <span class="bottom-nav__label">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </template>

    <!-- Desktop-only: bottom items (pushed to bottom with spacer) -->
    <div class="bottom-nav__spacer" />
    <div class="bottom-nav__bottom">
      <NuxtLink
        v-for="item in bottomItems"
        :key="item.to"
        :to="item.to"
        :class="['bottom-nav__item bottom-nav__item--bottom', { 'bottom-nav__item--active': isActive(item.to) }]"
      >
        <span class="bottom-nav__icon" v-html="item.icon" />
        <span class="bottom-nav__label">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface NavItem {
  label: string
  to: string
  icon: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface Props {
  items: NavItem[]
  sections?: NavSection[]
  bottomItems?: NavItem[]
}

const props = withDefaults(defineProps<Props>(), {
  sections: () => [],
  bottomItems: () => [],
})

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
  const itemCenterX = itemRect.left + itemRect.width / 2 - navRect.left
  const pillWidth = navRect.width * (1 / props.items.length)
  let x = itemCenterX - pillWidth / 2
  const isLast = idx === props.items.length - 1
  if (isLast) x -= 1

  pillStyle.value = {
    opacity: '1',
    transform: `translateX(${x}px)`,
    width: `${pillWidth}px`,
    transition: animated.value
      ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease'
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
/* ─── Mobile: Floating bottom bar ─── */
.bottom-nav {
  position: fixed;
  bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  left: 16px;
  right: 16px;
  z-index: var(--z-fixed);
  background: rgb(255 255 255 / 60%);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 40px;
  display: flex;
  align-items: center;
  padding: 4px;
}

.bottom-nav__logo {
  display: none;
}

/* Desktop-only sections hidden on mobile */
.bottom-nav__section,
.bottom-nav__spacer,
.bottom-nav__bottom {
  display: none;
}

/* ─── Sliding pill (capsule) ─── */
.bottom-nav__pill {
  position: absolute;
  top: 3px;
  left: 0;
  bottom: 3px;
  border-radius: 32px;
  background: rgba(0, 0, 0, 0.08);
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
  padding: 4px 12px;
  text-decoration: none;
  color: var(--color-dark);
  transition: color 0.25s ease, flex 0.4s ease;
  -webkit-tap-highlight-color: transparent;
  border-radius: 32px;
  flex: 0 0 20%;
  min-width: 0;
}

.bottom-nav__item--active {
  flex: 1 0 20%;
  color: var(--color-text);
}

.bottom-nav__item:hover {
  text-decoration: none;
}

.bottom-nav__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.bottom-nav__icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.bottom-nav__label {
  font-size: 10px;
  font-weight: 500;
  margin-top: 2px;
  letter-spacing: 0.02em;
}

/* ─── Section title (desktop only) ─── */
.bottom-nav__section-title {
  display: none;
}

/* ─── Desktop: SaaS left sidebar ─── */
@media (min-width: 1024px) {
  .bottom-nav {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: auto;
    width: var(--sidebar-width);
    height: 100dvh;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    background: var(--color-desktop-card);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    border-radius: 0;
    border: none;
    border-right: 1px solid var(--color-desktop-border);
    box-shadow: none;
    padding: 0;
    gap: 0;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .bottom-nav::-webkit-scrollbar {
    display: none;
  }

  .bottom-nav__logo {
    display: flex;
    align-items: center;
    padding: var(--space-5) var(--space-6) var(--space-6);
    flex-shrink: 0;
  }

  .bottom-nav__logo img {
    height: 20px;
    width: auto;
  }

  /* Hide mobile pill on desktop */
  .bottom-nav__pill {
    display: none;
  }

  /* ─── Nav items (desktop) ─── */
  .bottom-nav__item {
    flex-direction: row;
    gap: var(--space-3);
    padding: 9px var(--space-5);
    border-radius: var(--radius-md);
    margin: 1px var(--space-3);
    color: var(--color-text-secondary);
    flex: none;
    min-width: 0;
    border-left: 3px solid transparent;
    transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
  }

  .bottom-nav__item:hover {
    background: rgba(0, 0, 0, 0.04);
    color: var(--color-text);
    text-decoration: none;
  }

  .bottom-nav__item--active {
    flex: none;
    background: rgba(0, 0, 0, 0.06);
    color: var(--color-text);
    border-left-color: var(--color-primary);
  }

  .bottom-nav__item--active .bottom-nav__icon :deep(svg) {
    fill: none;
  }

  .bottom-nav__icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .bottom-nav__icon :deep(svg) {
    width: 18px;
    height: 18px;
  }

  .bottom-nav__label {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    letter-spacing: normal;
    margin-top: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bottom-nav__item--active .bottom-nav__label {
    font-weight: var(--weight-semibold);
  }

  /* ─── Desktop sections ─── */
  .bottom-nav__section {
    display: flex;
    flex-direction: column;
    padding-top: var(--space-4);
    margin-top: var(--space-2);
    border-top: 1px solid var(--color-desktop-border);
  }

  .bottom-nav__section-title {
    display: block;
    font-family: var(--font-eyebrow);
    font-size: 10px;
    font-weight: var(--weight-bold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-muted);
    padding: 0 var(--space-6) var(--space-2);
  }

  /* ─── Desktop spacer + bottom items ─── */
  .bottom-nav__spacer {
    display: block;
    flex: 1;
  }

  .bottom-nav__bottom {
    display: flex;
    flex-direction: column;
    padding-top: var(--space-3);
    padding-bottom: var(--space-4);
    margin-top: var(--space-2);
    border-top: 1px solid var(--color-desktop-border);
    flex-shrink: 0;
  }

  .bottom-nav__item--bottom {
    color: var(--color-muted);
    font-size: var(--text-xs);
  }

  .bottom-nav__item--bottom:hover {
    color: var(--color-text-secondary);
  }
}
</style>
