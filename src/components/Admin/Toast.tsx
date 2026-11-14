import { useEffect } from 'react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  variant: ToastVariant
  onDismiss: () => void
  /** Auto-dismiss delay in ms. Errors stay longer so they can be read. */
  duration?: number
}

const VARIANTS: Record<ToastVariant, { box: string; icon: string; label: string }> = {
  success: {
    box: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200',
    icon: '✓',
    label: 'OK',
  },
  error: {
    box: 'bg-rose-500/15 border-rose-500/60 text-rose-200',
    icon: '✕',
    label: 'ERROR',
  },
  warning: {
    box: 'bg-amber-500/15 border-amber-500/50 text-amber-200',
    icon: '⚠',
    label: 'WARNING',
  },
  info: {
    box: 'bg-white/10 border-white/25 text-white/90',
    icon: '●',
    label: 'INFO',
  },
}

/**
 * Single toast slot for the admin dashboard.
 * Errors and warnings linger longer than confirmations so the user can read
 * the guidance before it disappears.
 */
export default function Toast({ message, variant, onDismiss, duration }: ToastProps) {
  const ms = duration ?? (variant === 'error' ? 6000 : variant === 'warning' ? 5000 : 3000)
  const style = VARIANTS[variant]

  useEffect(() => {
    const timer = setTimeout(onDismiss, ms)
    return () => clearTimeout(timer)
  }, [message, variant, ms, onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-4 right-4 z-[60] max-w-sm border px-4 py-2.5 text-xs font-mono backdrop-blur-md shadow-2xl flex items-start gap-2.5 animate-modal-pop ${style.box}`}
    >
      <span aria-hidden="true" className="font-bold shrink-0 leading-5">
        {style.icon}
      </span>
      <div className="min-w-0">
        <div className="text-[9px] font-bold tracking-widest uppercase opacity-70 mb-0.5">
          {style.label}
        </div>
        <div className="leading-relaxed break-words">{message}</div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity text-xs leading-5 cursor-pointer"
      >
        ✕
      </button>
    </div>
  )
}
