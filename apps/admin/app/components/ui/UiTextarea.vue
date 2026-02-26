<template>
  <div :class="['textarea-field', { 'textarea-field--error': error }]">
    <label v-if="label" :for="id" class="textarea-field__label">{{ label }}</label>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      class="textarea-field__input"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" class="textarea-field__error">{{ error }}</p>
    <p v-else-if="hint" class="textarea-field__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  rows?: number
  id?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  rows: 4,
  disabled: false,
  id: () => `ta-${Math.random().toString(36).slice(2, 8)}`,
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.textarea-field { display: flex; flex-direction: column; gap: var(--space-1); }

.textarea-field__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.textarea-field__input {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-bottom-color: #cdcdcd;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-md);
  color: var(--color-text);
  resize: vertical;
  width: 100%;
  transition: border-color var(--transition-fast);
}

.textarea-field__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(40, 55, 74, 0.1);
}

.textarea-field__input::placeholder { color: var(--color-placeholder); }

.textarea-field__error { font-size: var(--text-xs); color: var(--color-danger); }
.textarea-field__hint { font-size: var(--text-xs); color: var(--color-muted); }

.textarea-field--error .textarea-field__input { border-color: var(--color-danger); }
</style>
