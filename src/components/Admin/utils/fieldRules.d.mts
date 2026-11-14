export type FieldKind = 'text' | 'location' | 'email' | 'url' | 'phone' | 'tech'

export interface FieldRule {
  kind: FieldKind
  max: number
  hint?: string
  label?: string
}

export declare function sanitizeByKind(value: string, kind: FieldKind): string
export declare function clampByMax(value: string, max: number): string
export declare function applyFieldRule(value: string, rule: FieldRule): string
export declare function findForbiddenChars(value: string, kind: FieldKind): string[]
export declare function validateField(
  value: string | undefined | null,
  rule: FieldRule,
  allowEmpty?: boolean
): string | null
export declare function formatPhoneWithSpaces(val: string): string

export declare const FIELD_RULES: {
  readonly [key: string]: FieldRule
}
