<template>
  <div :class="['select-field', { 'select-field--error': error }]">
    <label v-if="label" :for="id" class="select-field__label">{{ label }}</label>
    <div class="select-field__wrapper">
      <select
        :id="id"
        :value="modelValue"
        :disabled="disabled"
        class="select-field__input"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <svg class="select-field__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <p v-if="error" class="select-field__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface SelectOption {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  options: SelectOption[]
  error?: string
  disabled?: boolean
  id?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
  id: () => `sel-${Math.random().toString(36).slice(2, 8)}`,
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.select-field { display: flex; flex-direction: column; gap: var(--space-1); }

.select-field__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.select-field__wrapper {
  position: relative;
}

.select-field__input {
  appearance: none;
  width: 100%;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-bottom-color: #cdcdcd;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-9) var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-md);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.select-field__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(40, 55, 74, 0.1);
}

.select-field__chevron {
  position: absolute;
  right: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
  pointer-events: none;
}

.select-field--error .select-field__input { border-color: var(--color-danger); }
.select-field__error { font-size: var(--text-xs); color: var(--color-danger); }
</style>
