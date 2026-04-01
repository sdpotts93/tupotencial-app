<template>
  <div
    ref="containerRef"
    :class="['select-field', { 'select-field--error': error, 'select-field--disabled': disabled, 'select-field--open': open }]"
  >
    <label v-if="label" :for="id" class="select-field__label">{{ label }}<span v-if="required" class="select-field__required">*</span></label>

    <div class="select-field__wrapper">
      <button
        :id="id"
        type="button"
        class="select-field__trigger"
        :disabled="disabled"
        :aria-expanded="open"
        aria-haspopup="listbox"
        @click="toggle"
      >
        <span :class="['select-field__value', { 'select-field__value--placeholder': !selectedLabel }]">
          {{ selectedLabel || placeholder || '' }}
        </span>
        <svg class="select-field__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <Teleport to="body">
        <div v-if="open" class="select-field__backdrop" @click="close" />

        <Transition name="select-dropdown">
          <div
            v-if="open"
            ref="dropdownRef"
            class="select-field__dropdown"
            :style="dropdownStyle"
            role="listbox"
          >
            <div v-if="searchable" class="select-field__search">
              <svg class="select-field__search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input
                ref="searchInputRef"
                v-model="search"
                type="text"
                class="select-field__search-input"
                placeholder="Buscar..."
                @keydown.escape="close"
              />
            </div>

            <div class="select-field__options">
              <button
                v-for="opt in filteredOptions"
                :key="opt.value"
                type="button"
                role="option"
                :class="['select-field__option', { 'select-field__option--selected': opt.value === modelValue }]"
                :aria-selected="opt.value === modelValue"
                @click="select(opt.value)"
              >
                {{ opt.label }}
                <svg v-if="opt.value === modelValue" class="select-field__check" width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <p v-if="filteredOptions.length === 0" class="select-field__empty">
                Sin resultados
              </p>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <p v-if="error" class="select-field__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from '#imports'

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
  required?: boolean
  searchable?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
  searchable: false,
  id: undefined,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const id = props.id ?? useId()

const open = ref(false)
const search = ref('')
const containerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const searchInputRef = ref<HTMLInputElement>()
const triggerRect = ref<DOMRect | null>(null)

const dropdownStyle = computed(() => {
  if (!triggerRect.value) return {}
  const r = triggerRect.value
  return {
    position: 'fixed' as const,
    top: `${r.bottom + 4}px`,
    left: `${r.left}px`,
    width: `${r.width}px`,
  }
})

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue)
  return found?.label ?? ''
})

const filteredOptions = computed(() => {
  if (!search.value) return props.options
  const q = search.value.toLowerCase()
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

function toggle() {
  if (open.value) {
    close()
  } else {
    openDropdown()
  }
}

function openDropdown() {
  const trigger = containerRef.value?.querySelector('.select-field__trigger')
  if (trigger) {
    triggerRect.value = trigger.getBoundingClientRect()
  }
  open.value = true
  search.value = ''
  if (props.searchable) {
    nextTick(() => searchInputRef.value?.focus())
  }
}

function close() {
  open.value = false
  search.value = ''
}

function select(value: string) {
  emit('update:modelValue', value)
  close()
}

function onClickOutside(e: MouseEvent) {
  if (!open.value) return
  const target = e.target as Node
  if (containerRef.value?.contains(target)) return
  if (dropdownRef.value?.contains(target)) return
  close()
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
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

.select-field__trigger {
  appearance: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: var(--color-input-bg);
  border: 1.5px solid transparent;
  box-shadow: 0px 0px 2px var(--color-input-shadow);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-md);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  text-align: left;
}

.select-field__trigger:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-input-focus-ring);
}

.select-field--open .select-field__trigger {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-input-focus-ring);
}

.select-field--open .select-field__chevron {
  transform: rotate(180deg);
}

.select-field__value { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.select-field__value--placeholder { color: var(--color-placeholder); }

.select-field__chevron {
  flex-shrink: 0;
  color: var(--color-muted);
  transition: transform var(--transition-fast);
}

.select-field--error .select-field__trigger { border-color: var(--color-danger); }
.select-field__required { color: var(--color-danger); margin-left: 2px; }
.select-field__error { font-size: var(--text-xs); color: var(--color-danger); }

.select-field--disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>

<!-- Unscoped styles for teleported dropdown -->
<style>
.select-field__backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.select-field__dropdown {
  z-index: 100;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.select-field__search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.select-field__search-icon {
  flex-shrink: 0;
  color: var(--color-muted);
}

.select-field__search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text);
  padding: var(--space-1) 0;
}

.select-field__search-input::placeholder {
  color: var(--color-placeholder);
}

.select-field__options {
  max-height: 256px;
  overflow-y: auto;
  padding: var(--space-1) 0;
}

.select-field__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px var(--space-3);
  border: none;
  background: none;
  font-family: var(--font-body);
  font-size: var(--text-md);
  color: var(--color-text);
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast);
}

.select-field__option:hover {
  background: #f3f4f6;
}

.select-field__option--selected {
  color: var(--color-primary);
  font-weight: var(--weight-medium);
}

.select-field__check {
  flex-shrink: 0;
  color: var(--color-primary);
}

.select-field__empty {
  padding: var(--space-4) var(--space-3);
  text-align: center;
  color: var(--color-muted);
  font-size: var(--text-sm);
}

/* Transition */
.select-dropdown-enter-active,
.select-dropdown-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.select-dropdown-enter-from,
.select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
