import { en } from './locales/en'
import { vi } from './locales/vi'
import { fr } from './locales/fr'
import { ja } from './locales/ja'
import type { SupportedLang, TranslationDict } from './translationTypes'

export * from './translationTypes'
export * from './blogSnippets'

export function ensureDot(str?: string): string {
  if (!str) return ''
  const trimmed = str.trim()
  if (!trimmed) return ''
  if (trimmed.endsWith('.') || trimmed.endsWith('。')) return trimmed
  return `${trimmed}.`
}

export const TRANSLATIONS: Record<SupportedLang, TranslationDict> = {
  en,
  vi,
  fr,
  ja,
}
