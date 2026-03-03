<template>
  <div :class="['input-field', { 'input-field--error': error, 'input-field--disabled': disabled }]">
    <label v-if="label" :for="id" class="input-field__label">{{ label }}</label>
    <div class="input-field__wrapper">
      <span v-if="$slots.prefix" class="input-field__prefix">
        <slot name="prefix" />
      </span>
      <input
        :id="id"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        class="input-field__input"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <span v-if="$slots.suffix" class="input-field__suffix">
        <slot name="suffix" />
      </span>
    </div>
    <p v-if="error" class="input-field__error">{{ error }}</p>
    <p v-else-if="hint" class="input-field__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
  disabled?: boolean
  id?: string
  autocomplete?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  id: () => `input-${Math.random().toString(36).slice(2, 8)}`,
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.input-field { display: flex; flex-direction: column; gap: var(--space-1); }

.input-field__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.input-field__wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-input-bg);
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: 0px 0px 2px var(--color-input-shadow);
}

/* .input-field__wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-input-focus-ring);
} */

.input-field__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: var(--text-md);
  color: var(--color-text);
  width: 100%;
}

.input-field__input::placeholder { color: var(--color-placeholder); }

.input-field__prefix,
.input-field__suffix {
  display: flex;
  color: var(--color-muted);
  flex-shrink: 0;
}

.input-field__error {
  font-size: var(--text-xs);
  color: var(--color-danger);
}

.input-field__hint {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.input-field--error .input-field__wrapper {
  border-color: var(--color-danger);
}

.input-field--disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
