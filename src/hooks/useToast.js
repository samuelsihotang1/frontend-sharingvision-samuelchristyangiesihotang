import { useContext } from 'react'
import { ToastContext } from '../components/toast/toastContext'

// Returns notify(message, { tone: 'success' | 'error' }).
export function useToast() {
  const notify = useContext(ToastContext)
  if (!notify) throw new Error('useToast must be used inside <ToastProvider>')
  return notify
}
