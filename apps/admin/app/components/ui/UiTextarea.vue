<template>
  <div :class="['textarea-field', { 'textarea-field--error': error }]">
    <label v-if="label" :for="id" class="textarea-field__label">{{ label }}<span v-if="required" class="textarea-field__required">*</span></label>
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
  required?: boolean
  rows?: number
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  rows: 4,
  disabled: false,
  id: undefined,
})

const id = props.id ?? useId()

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
  background: var(--color-input-bg);
  border: none;
  box-shadow: 0px 0px 2px var(--color-input-shadow);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-md);
  color: var(--color-text);
  resize: vertical;
  width: 100%;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.textarea-field__input:focus {
  outline: none;
}

.textarea-field__input::placeholder { color: var(--color-placeholder); }

.textarea-field__required { color: var(--color-danger); margin-left: 2px; }
.textarea-field__error { font-size: var(--text-xs); color: var(--color-danger); }
.textarea-field__hint { font-size: var(--text-xs); color: var(--color-muted); }

.textarea-field--error .textarea-field__input { border-color: var(--color-danger); }
</style>
