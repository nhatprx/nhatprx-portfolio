import { en } from './locales/en'
import { vi } from './locales/vi'
import { fr } from './locales/fr'
import { ja } from './locales/ja'
import type { SupportedLang, TranslationDict } from './translationTypes'

export * from './translationTypes'
export * from './blogSnippets'

export const TRANSLATIONS: Record<SupportedLang, TranslationDict> = {
  en,
  vi,
  fr,
  ja,
}
