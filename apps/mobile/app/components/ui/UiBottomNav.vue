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
  const itemCenterX = itemRect.left + itemRect.width / 2 - navRect.left
  const pillWidth = navRect.width * 0.25
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
/* ─── Mobile: Floating bottom bar (Match style) ─── */
.bottom-nav {
  position: fixed;
  bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  left: 16px;
  right: 16px;
  z-index: var(--z-fixed);
  background: rgb(255 255 255 / 26%);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 40px;
  display: flex;
  align-items: center;
  padding: 4px;
}

.bottom-nav__logo {
  display: none;
}

/* ─── Sliding pill (capsule) ─── */
.bottom-nav__pill {
  position: absolute;
  top: 3px;
  left: 0;
  bottom: 3px;
  border-radius: 32px;
  background: rgb(255 255 255 / 32%);
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
  flex: 0 0 25%;
  min-width: 0;
}

.bottom-nav__item--active {
  flex: 1 0 25%;
  color: #fff;
}

.bottom-nav__item:hover {
  text-decoration: none;
}

/* Active icon: outline only, no fill */

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
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
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
