import { TRANSLATIONS, type SupportedLang, type TranslationDict, type LocalizedBlogPost, type ExperienceItem, type ProjectItem } from '../data/translations'

const CONTENT_STORAGE_KEY = 'nhatprx_content_overrides'
const TERMINAL_COMMANDS_KEY = 'nhatprx_custom_terminal_commands'
const ADMIN_PASS_KEY = 'nhatprx_admin_pass'
const ADMIN_SESSION_KEY = 'nhatprx_admin_session'
const DEFAULT_PASSKEY = 'admin2026'

export type CustomTerminalCommands = Record<string, string>

export function getStoredTranslations(): Record<SupportedLang, TranslationDict> {
  if (typeof window === 'undefined') return TRANSLATIONS
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const mergeLang = (code: SupportedLang): TranslationDict => {
        const base = TRANSLATIONS[code]
        const custom = parsed[code] || {}
        const customBlog = custom.blog || {}
        // Ensure new default posts are never hidden by an older localStorage snapshot
        const posts = (customBlog.posts?.length ?? 0) >= base.blog.posts.length
          ? customBlog.posts
          : base.blog.posts

        return {
          ...base,
          ...custom,
          about: { ...base.about, ...(custom.about || {}), tag: base.about.tag },
          skills: { ...base.skills, ...(custom.skills || {}), tag: base.skills.tag },
          experience: {
            ...base.experience,
            ...(custom.experience || {}),
            tag: base.experience.tag,
            items: base.experience.items.map((baseItem, idx) => {
              const customItem = custom.experience?.items?.[idx]
              if (!customItem) return baseItem
              return {
                ...customItem,
                tech: baseItem.tech.length === 0 ? [] : (customItem.tech || baseItem.tech),
              }
            }),
          },
          projects: {
            ...base.projects,
            ...(custom.projects || {}),
            tag: base.projects.tag,
            items: base.projects.items.map((baseItem, idx) => {
              const customItem = custom.projects?.items?.[idx]
              if (!customItem) return baseItem
              return {
                ...baseItem,
                ...customItem,
                tech: customItem.tech && customItem.tech.length > 0 ? customItem.tech : baseItem.tech,
              }
            }),
          },
          blog: { ...base.blog, ...customBlog, tag: base.blog.tag, posts },
          contact: { ...base.contact, ...(custom.contact || {}), tag: base.contact.tag },
        }
      }

      return {
        en: mergeLang('en'),
        vi: mergeLang('vi'),
        fr: mergeLang('fr'),
        ja: mergeLang('ja'),
      }
    }
  } catch (err) {
    console.error('Failed to parse stored translations:', err)
  }
  return TRANSLATIONS
}

export function saveStoredTranslations(data: Record<SupportedLang, TranslationDict>): void {
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save translations to localStorage:', err)
  }
}

export function resetStoredTranslations(): void {
  try {
    localStorage.removeItem(CONTENT_STORAGE_KEY)
  } catch (err) {
    console.error('Failed to reset translations in localStorage:', err)
  }
}

export function getStoredTerminalCommands(): CustomTerminalCommands {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(TERMINAL_COMMANDS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to parse custom terminal commands:', err)
  }
  return {}
}

export function saveStoredTerminalCommands(commands: CustomTerminalCommands): void {
  try {
    localStorage.setItem(TERMINAL_COMMANDS_KEY, JSON.stringify(commands))
  } catch (err) {
    console.error('Failed to save terminal commands to localStorage:', err)
  }
}

export function getAdminPasskey(): string {
  if (typeof window === 'undefined') return DEFAULT_PASSKEY
  return localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_PASSKEY
}

export function setAdminPasskey(pass: string): void {
  localStorage.setItem(ADMIN_PASS_KEY, pass.trim() || DEFAULT_PASSKEY)
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated'
}

export function setAdminAuthenticated(auth: boolean): void {
  if (auth) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated')
  } else {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
  }
}

export type { LocalizedBlogPost, ExperienceItem, ProjectItem, SupportedLang, TranslationDict }

