const _state = reactive({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Eliminar',
  cancelLabel: 'Cancelar',
  variant: 'danger' as 'danger' | 'warning',
  resolve: null as ((value: boolean) => void) | null,
})

export function useConfirmState() {
  return _state
}

export function useConfirm() {
  return (opts: {
    title?: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'warning'
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      _state.title = opts.title ?? 'Confirmar acción'
      _state.message = opts.message
      _state.confirmLabel = opts.confirmLabel ?? 'Eliminar'
      _state.cancelLabel = opts.cancelLabel ?? 'Cancelar'
      _state.variant = opts.variant ?? 'danger'
      _state.resolve = resolve
      _state.open = true
    })
  }
}
