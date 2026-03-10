<template>
  <div :class="['editor-field', { 'editor-field--error': error }]">
    <label v-if="label" class="editor-field__label">{{ label }}</label>
    <div v-if="editor" class="editor-field__toolbar">
      <button
        v-for="btn in toolbarButtons"
        :key="btn.action"
        type="button"
        :class="['editor-toolbar__btn', { 'editor-toolbar__btn--active': btn.isActive?.() }]"
        :title="btn.title"
        @click="btn.command"
      >
        <span v-html="btn.icon" />
      </button>
    </div>
    <EditorContent :editor="editor" class="editor-field__content" />
    <p v-if="error" class="editor-field__error">{{ error }}</p>
    <p v-else-if="hint" class="editor-field__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Escribe aqui...',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    Placeholder.configure({ placeholder: props.placeholder }),
    Link.configure({ openOnClick: false }),
    Image,
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val, { emitUpdate: false })
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const toolbarButtons = computed(() => {
  if (!editor.value) return []
  const e = editor.value
  return [
    {
      action: 'bold',
      title: 'Negrita',
      icon: '<b>B</b>',
      isActive: () => e.isActive('bold'),
      command: () => e.chain().focus().toggleBold().run(),
    },
    {
      action: 'italic',
      title: 'Cursiva',
      icon: '<i>I</i>',
      isActive: () => e.isActive('italic'),
      command: () => e.chain().focus().toggleItalic().run(),
    },
    {
      action: 'underline',
      title: 'Subrayado',
      icon: '<u>U</u>',
      isActive: () => e.isActive('underline'),
      command: () => e.chain().focus().toggleUnderline().run(),
    },
    {
      action: 'h2',
      title: 'Titulo',
      icon: 'H2',
      isActive: () => e.isActive('heading', { level: 2 }),
      command: () => e.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      action: 'h3',
      title: 'Subtitulo',
      icon: 'H3',
      isActive: () => e.isActive('heading', { level: 3 }),
      command: () => e.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      action: 'bulletList',
      title: 'Lista',
      icon: '&#8226;',
      isActive: () => e.isActive('bulletList'),
      command: () => e.chain().focus().toggleBulletList().run(),
    },
    {
      action: 'orderedList',
      title: 'Lista numerada',
      icon: '1.',
      isActive: () => e.isActive('orderedList'),
      command: () => e.chain().focus().toggleOrderedList().run(),
    },
    {
      action: 'blockquote',
      title: 'Cita',
      icon: '&ldquo;',
      isActive: () => e.isActive('blockquote'),
      command: () => e.chain().focus().toggleBlockquote().run(),
    },
    {
      action: 'link',
      title: 'Enlace',
      icon: '&#128279;',
      isActive: () => e.isActive('link'),
      command: () => {
        if (e.isActive('link')) {
          e.chain().focus().unsetLink().run()
          return
        }
        const url = window.prompt('URL del enlace:')
        if (url) {
          e.chain().focus().setLink({ href: url }).run()
        }
      },
    },
  ]
})
</script>

<style scoped>
.editor-field {
  display: flex;
  flex-direction: column;
}

.editor-field__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.editor-field__toolbar {
  display: flex;
  gap: 2px;
  padding: var(--space-1) var(--space-2);
  background: var(--color-input-bg);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: 0px 0px 2px var(--color-input-shadow);
  border-bottom: 1px solid var(--color-border-light);
  flex-wrap: wrap;
}

.editor-toolbar__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-muted);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.editor-toolbar__btn:hover {
  background: var(--color-hover);
  color: var(--color-text);
}

.editor-toolbar__btn--active {
  background: var(--color-hover);
  color: var(--color-tint);
}

.editor-field__content {
  background: var(--color-input-bg);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  box-shadow: 0px 0px 2px var(--color-input-shadow);
  min-height: 240px;
}

.editor-field__content :deep(.tiptap) {
  padding: var(--space-3) var(--space-4);
  min-height: 240px;
  font-family: var(--font-body);
  font-size: var(--text-md);
  color: var(--color-text);
  outline: none;
}

.editor-field__content :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: var(--color-placeholder);
  pointer-events: none;
  float: left;
  height: 0;
}

.editor-field__content :deep(.tiptap h2) {
  font-size: var(--text-xl, 1.25rem);
  font-weight: var(--weight-semibold, 600);
  margin: var(--space-4) 0 var(--space-2);
}

.editor-field__content :deep(.tiptap h3) {
  font-size: var(--text-lg, 1.125rem);
  font-weight: var(--weight-semibold, 600);
  margin: var(--space-3) 0 var(--space-1);
}

.editor-field__content :deep(.tiptap p) {
  margin: var(--space-2) 0;
}

.editor-field__content :deep(.tiptap ul),
.editor-field__content :deep(.tiptap ol) {
  padding-left: var(--space-6);
  margin: var(--space-2) 0;
}

.editor-field__content :deep(.tiptap li) {
  margin: var(--space-1) 0;
}

.editor-field__content :deep(.tiptap blockquote) {
  border-left: 3px solid var(--color-border);
  padding-left: var(--space-4);
  color: var(--color-muted);
  margin: var(--space-3) 0;
}

.editor-field__content :deep(.tiptap a) {
  color: var(--color-tint);
  text-decoration: underline;
}

.editor-field__content :deep(.tiptap img) {
  max-width: 100%;
  border-radius: var(--radius-md);
}

.editor-field__error { font-size: var(--text-xs); color: var(--color-danger); }
.editor-field__hint { font-size: var(--text-xs); color: var(--color-muted); }

.editor-field--error .editor-field__content {
  box-shadow: 0px 0px 2px var(--color-danger);
}
</style>
