import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

/** In-page confirmation dialog (instead of window.confirm). Escape or the backdrop cancels. */
export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, busy, onCancel])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-40 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={busy ? undefined : onCancel}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="relative w-full max-w-sm animate-enter rounded-[20px] bg-white p-6 shadow-window"
      >
        <h2 id="confirm-title" className="font-display text-xl tracking-[-0.02em]">
          {title}
        </h2>
        <p id="confirm-description" className="mt-2 text-sm text-muted">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
