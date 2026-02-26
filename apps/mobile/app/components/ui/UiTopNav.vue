<template>
  <header class="top-nav safe-top">
    <div class="top-nav__content">
      <div class="top-nav__left">
        <button v-if="showBack" class="top-nav__back" aria-label="Volver" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <slot name="left" />
      </div>
      <div v-if="title" class="top-nav__title">{{ title }}</div>
      <div class="top-nav__right">
        <slot name="right" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  showBack?: boolean
}

withDefaults(defineProps<Props>(), {
  showBack: false,
})

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<style scoped>
.top-nav {
  background: var(--color-bg);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.top-nav__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--nav-height);
  padding: 0 var(--space-4);
  gap: var(--space-3);
}

.top-nav__left,
.top-nav__right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 40px;
}

.top-nav__right { justify-content: flex-end; }

.top-nav__title {
  font-family: var(--font-body);
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  text-align: center;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-nav__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text);
  border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}
.top-nav__back:hover { background: var(--color-surface-alt); }
</style>
