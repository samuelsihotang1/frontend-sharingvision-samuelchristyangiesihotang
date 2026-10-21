import { CircleCheck, CircleAlert } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ToastContext } from './toastContext'

const DISMISS_AFTER_MS = 3000

/** Provides notify() to the app and renders the toasts bottom-right. */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback((message, { tone = 'success' } = {}) => {
    const id = nextId.current++
    setToasts((current) => [...current, { id, message, tone }])
  }, [])

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {createPortal(
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
        >
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

/** Glassy notification card: icon tile, app name, message and "now". */
function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), DISMISS_AFTER_MS)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const Icon = toast.tone === 'error' ? CircleAlert : CircleCheck
  const iconColor = toast.tone === 'error' ? 'text-danger' : 'text-success'

  return (
    <div className="pointer-events-auto flex animate-enter items-center gap-3 rounded-2xl border border-white/60 bg-white/70 bg-linear-to-r from-white/80 to-lavender-200/60 p-3 shadow-glass backdrop-blur-xl">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
        <Icon size={18} className={iconColor} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Sharing Vision</p>
        <p className="truncate text-[13px] text-ink/75">{toast.message}</p>
      </div>
      <span className="self-start text-xs text-muted">now</span>
    </div>
  )
}
