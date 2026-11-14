import { useState, type ReactNode } from 'react'
import CharCounter from './CharCounter'
import { validateField, type FieldRule } from './utils/fieldRules'

interface AdminFieldProps {
  label: string
  value: string | undefined
  rule: FieldRule
  onChange: (value: string) => void
  /** Textarea instead of input. */
  multiline?: boolean
  rows?: number
  placeholder?: string
  /** Allows the field to be empty without showing an error. */
  allowEmpty?: boolean
  /** Extra class for the control (e.g. uppercase, font-mono). */
  className?: string
  /** Hint shown under the field when the value is invalid. */
  error?: string | null
  /** Rendered on the right of the label row (e.g. a toggle). */
  aside?: ReactNode
  autoFocus?: boolean
  onBlur?: () => void
}

/**
 * Single source of truth for admin form controls:
 * label + character counter + red border + inline error message.
 *
 * The control itself is never blocked from receiving text - the red border and
 * the hint tell the user what to fix, and the caller decides whether to save.
 */
export default function AdminField({
  label,
  value,
  rule,
  onChange,
  multiline = false,
  rows = 3,
  placeholder,
  allowEmpty = false,
  className = '',
  error,
  aside,
  autoFocus,
  onBlur,
}: AdminFieldProps) {
  const val = value ?? ''
  const computedError = error !== undefined ? error : validateField(val, rule, allowEmpty)
  const isInvalid = !!computedError
  const currentLength = val.length
  const isOver = currentLength > rule.max

  const borderClass = isInvalid
    ? 'border-rose-500/80 bg-rose-500/[0.04] text-rose-100 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/40'
    : 'border-white/20 bg-white/[0.03] text-white focus:border-white focus:ring-0'

  const baseControl = `w-full border p-2.5 text-xs focus:outline-none transition-colors ${borderClass} ${
    multiline ? 'resize-none' : ''
  } ${className}`

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <label className="text-[10px] text-white/40 uppercase">{label}</label>
        <div className="flex items-center gap-2 shrink-0">
          {aside}
          <CharCounter current={currentLength} max={rule.max} />
        </div>
      </div>

      {multiline ? (
        <textarea
          rows={rows}
          value={val}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          className={baseControl}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${label}-error` : undefined}
        />
      ) : (
        <input
          type="text"
          value={val}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          className={baseControl}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${label}-error` : undefined}
        />
      )}

      {isInvalid ? (
        <p
          id={`${label}-error`}
          role="alert"
          className="mt-1 text-[10px] text-rose-300/90 leading-snug flex items-start gap-1"
        >
          <span aria-hidden="true">⚠</span>
          <span>{computedError}</span>
        </p>
      ) : isOver ? (
        <p className="mt-1 text-[10px] text-rose-300/90 leading-snug">
          {rule.label ?? 'This field'} is {currentLength - rule.max} characters over the limit.
        </p>
      ) : rule.hint ? (
        <p className="mt-1 text-[10px] text-white/30 leading-snug">{rule.hint}</p>
      ) : null}
    </div>
  )
}
