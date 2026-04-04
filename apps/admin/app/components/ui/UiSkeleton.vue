<template>
  <div
    :class="['skeleton', `skeleton--${variant}`]"
    :style="{ width, height, borderRadius: radius }"
  />
</template>

<script setup lang="ts">
interface Props {
  variant?: 'text' | 'circle' | 'rect' | 'card'
  width?: string
  height?: string
  radius?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'text',
  width: '100%',
  height: undefined,
  radius: undefined,
})
</script>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, #e0e0e0 25%, var(--color-border-light) 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton--text { height: 14px; border-radius: var(--radius-sm); }
.skeleton--circle { border-radius: 50%; aspect-ratio: 1; }
.skeleton--rect { border-radius: var(--radius-md); height: 120px; }
.skeleton--card { border-radius: var(--radius-xl); height: 200px; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
