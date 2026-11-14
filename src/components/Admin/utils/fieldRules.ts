import {
  sanitizeByKind,
  clampByMax,
  applyFieldRule,
  findForbiddenChars,
  validateField,
  formatPhoneWithSpaces,
  FIELD_RULES,
} from './fieldRules.mjs'

/**
 * Typed wrapper around the shared field rules.
 *
 * The implementation lives in `fieldRules.mjs` so the Node test runner can
 * import it directly; this file only adds the TypeScript types.
 */

export type FieldKind = 'text' | 'location' | 'email' | 'url' | 'phone' | 'tech'

export interface FieldRule {
  kind: FieldKind
  max: number
  /** Shown under the input when the value is invalid. */
  hint?: string
  /** Used in toast messages, e.g. "Role subtitle is required." */
  label?: string
}

export {
  sanitizeByKind,
  clampByMax,
  applyFieldRule,
  findForbiddenChars,
  validateField,
  formatPhoneWithSpaces,
  FIELD_RULES,
}

export type FieldRuleKey = keyof typeof FIELD_RULES
