<template>
  <div :class="['datepicker-field', { 'datepicker-field--error': error }]">
    <label v-if="label" :for="id" class="datepicker-field__label">{{ label }}<span v-if="required" class="datepicker-field__required">*</span></label>
    <ClientOnly>
      <VueDatePicker
        :uid="id"
        :model-value="modelValue"
        :enable-time-picker="enableTime"
        :min-date="minDate ?? undefined"
        :max-date="maxDate ?? undefined"
        :placeholder="placeholder"
        :disabled="disabled"
        :format="formatDisplay"
        :locale="locale"
        :teleport="true"
        auto-apply
        text-input
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </ClientOnly>
    <p v-if="error" class="datepicker-field__error">{{ error }}</p>
    <p v-else-if="hint" class="datepicker-field__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker'
import type { DateValue } from '@vuepic/vue-datepicker'
import { es } from 'date-fns/locale'
import '@vuepic/vue-datepicker/dist/main.css'

interface Props {
  modelValue?: DateValue | null
  label?: string
  placeholder?: string
  enableTime?: boolean
  minDate?: DateValue | null
  maxDate?: DateValue | null
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  enableTime: true,
  disabled: false,
  required: false,
  placeholder: 'Selecciona fecha y hora',
  id: undefined,
})

const id = props.id ?? useId()

const locale = es

defineEmits<{ 'update:modelValue': [value: Date | null] }>()

function formatDisplay(date: Date): string {
  if (!date) return ''
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.datepicker-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.datepicker-field__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.datepicker-field__required {
  color: var(--color-danger);
  margin-left: 2px;
}

.datepicker-field__error {
  font-size: var(--text-xs);
  color: var(--color-danger);
}

.datepicker-field__hint {
  font-size: var(--text-xs);
  color: var(--color-muted);
}
</style>
