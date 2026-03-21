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
        :type="isPassword ? (showPassword ? 'text' : 'password') : type"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        class="input-field__input"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="isPassword"
        type="button"
        class="input-field__toggle"
        tabindex="-1"
        :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        @click="showPassword = !showPassword"
      >
        <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      </button>
      <span v-if="$slots.suffix" class="input-field__suffix">
        <slot name="suffix" />
      </span>
    </div>
    <p v-if="error" class="input-field__error">{{ error }}</p>
    <p v-else-if="hint" class="input-field__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from '#imports'

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

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  id: undefined,
})

const id = props.id ?? useId()

defineEmits<{ 'update:modelValue': [value: string] }>()

const isPassword = computed(() => props.type === 'password')
const showPassword = ref(false)
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
  border: 1.5px solid transparent;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: 0px 0px 2px var(--color-input-shadow);
}

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

.input-field__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-muted);
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.input-field__error {
  font-size: var(--text-sm);
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
