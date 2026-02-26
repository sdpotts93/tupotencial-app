<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="['card', `card--${variant}`, 'card--clickable']"
  >
    <div v-if="$slots.media" class="card__media">
      <slot name="media" />
    </div>
    <div class="card__body">
      <p v-if="eyebrow" class="eyebrow card__eyebrow">{{ eyebrow }}</p>
      <h3 v-if="title" class="card__title">{{ title }}</h3>
      <p v-if="subtitle" class="card__subtitle">{{ subtitle }}</p>
      <slot />
    </div>
    <div v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </div>
  </NuxtLink>
  <div
    v-else
    :class="['card', `card--${variant}`, { 'card--clickable': clickable }]"
  >
    <div v-if="$slots.media" class="card__media">
      <slot name="media" />
    </div>
    <div class="card__body">
      <p v-if="eyebrow" class="eyebrow card__eyebrow">{{ eyebrow }}</p>
      <h3 v-if="title" class="card__title">{{ title }}</h3>
      <p v-if="subtitle" class="card__subtitle">{{ subtitle }}</p>
      <slot />
    </div>
    <div v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">

interface Props {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'dark'
  eyebrow?: string
  title?: string
  subtitle?: string
  clickable?: boolean
  to?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  clickable: false,
})
</script>

<style scoped>
.card {
  background: rgba(0, 0, 0, 0.04);
  border-radius: var(--radius-xl);
  overflow: hidden;
  text-decoration: none;
  color: var(--color-text);
}

.card--default { }
.card--elevated { box-shadow: var(--shadow-2); }
.card--outlined { box-shadow: none; border: 1px solid var(--color-border); }
.card--filled { background: var(--color-surface-alt); }
.card--dark { background: var(--color-surface); color: var(--color-text); }

.card--clickable {
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.card--clickable:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-2);
}
.card--clickable:active { transform: scale(0.99); }

.card__media {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-surface-alt);
}

.card__media :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card__body {
  padding: var(--card-p);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.card__eyebrow { margin-bottom: var(--space-1); color: var(--color-muted); }

.card__title {
  font-family: var(--font-body);
  font-weight: var(--weight-semibold);
  font-size: var(--text-md);
  line-height: var(--leading-snug);
}

.card__subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-normal);
}

.card__footer {
  padding: 0 var(--card-p) var(--card-p);
}

.card--dark .card__subtitle { color: var(--color-sand); }
</style>
