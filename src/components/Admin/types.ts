import type { SupportedLang, TranslationDict } from '../../services/contentStorage'

export type TabType =
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'blog'
  | 'contact'
  | 'terminal'
  | 'system'
  | 'settings'

export interface AdminTabProps {
  currentDict: TranslationDict
  selectedLang: SupportedLang
  updateCurrentDict: (updater: (prev: TranslationDict) => TranslationDict) => void
  showToast: (msg: string) => void
}

export const SKILL_GROUP_LIMITS: Record<number, { maxItems: number; maxLen: number; label: string }> = {
  0: { maxItems: 3, maxLen: 14, label: 'Languages (Max 3 items, ≤14 chars)' },
  1: { maxItems: 3, maxLen: 14, label: 'Databases (Max 3 items, ≤14 chars)' },
  2: { maxItems: 4, maxLen: 18, label: 'Frameworks (Max 4 items, ≤18 chars)' },
  3: { maxItems: 10, maxLen: 26, label: 'DevOps & Cloud (Max 10 items, ≤26 chars)' },
  4: { maxItems: 5, maxLen: 50, label: 'Architecture (Max 5 items, ≤50 chars)' },
}
