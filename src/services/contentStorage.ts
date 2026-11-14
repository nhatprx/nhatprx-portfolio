import { TRANSLATIONS, type SupportedLang, type TranslationDict, type LocalizedBlogPost, type ExperienceItem, type ProjectItem } from '../data/translations'
import { resolveIdentity } from '../data/identity'
import { fetchRemoteContent, saveRemoteContent } from './adminApi'

const CONTENT_STORAGE_KEY = 'nhatprx_content_overrides'
const TERMINAL_COMMANDS_KEY = 'nhatprx_custom_terminal_commands'

/** The languages, in the order the global identity override is scanned. */
const LANG_ORDER: SupportedLang[] = ['en', 'vi', 'fr', 'ja']

export type CustomTerminalCommands = Record<string, string>

export function getStoredTranslations(): Record<SupportedLang, TranslationDict> {
  if (typeof window === 'undefined') return TRANSLATIONS
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY)
    if (raw) {
      return mergeTranslations(JSON.parse(raw))
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

/**
 * Loads content overrides from the remote API (S3-backed) and merges them on
 * top of the factory defaults. Falls back to localStorage when the API is
 * unreachable so the site still renders offline.
 */
export async function loadRemoteTranslations(): Promise<Record<SupportedLang, TranslationDict>> {
  try {
    const remote = await fetchRemoteContent<Record<SupportedLang, TranslationDict>>()
    if (!remote) return getStoredTranslations()
    // Always persist the fresh remote data to localStorage immediately
    saveStoredTranslations(remote)
    return mergeTranslations(remote)
  } catch (err) {
    console.warn('Remote content unavailable, using local cache:', err)
    return getStoredTranslations()
  }
}

/**
 * Persists content overrides to the remote API (S3-backed) and mirrors them to
 * localStorage as an offline cache.
 */
export async function saveRemoteTranslations(
  data: Record<SupportedLang, TranslationDict>
): Promise<boolean> {
  try {
    await saveRemoteContent(data)
    return true
  } catch (err) {
    console.error('Failed to save translations to remote storage:', err)
    return false
  }
}

/** Merges a partial override payload on top of the factory defaults. */
function mergeTranslations(
  parsed: Partial<Record<SupportedLang, Partial<TranslationDict>>>
): Record<SupportedLang, TranslationDict> {
  // The identity is global: collect the first override found across all
  // languages, then spread that single copy into every merged locale. This is
  // what makes an edit in the admin apply to every locale at once.
  const identity = resolveIdentity(parsed, LANG_ORDER)

  const mergeLang = (code: SupportedLang): TranslationDict => {
    const base = TRANSLATIONS[code]
    const custom: Partial<TranslationDict> = parsed[code] ?? {}
    const customBlog: Partial<TranslationDict['blog']> = custom.blog ?? {}
    // Ensure new default posts are never hidden by an older stored snapshot
    const customPosts = customBlog.posts
    const posts =
      customPosts && customPosts.length >= base.blog.posts.length ? customPosts : base.blog.posts

    const customHero: Partial<TranslationDict['hero']> = custom.hero ?? {}
    const safeResumeUrl = customHero.resumeUrl?.startsWith('blob:')
      ? base.hero.resumeUrl
      : customHero.resumeUrl || base.hero.resumeUrl
    const safeResumeFileName = customHero.resumeFileName || base.hero.resumeFileName

    return {
      ...base,
      ...custom,
      identity, // Always override with the resolved global identity from remote
      hero: {
        ...base.hero,
        ...customHero,
        resumeUrl: safeResumeUrl,
        resumeFileName: safeResumeFileName,
      },
      about: {
        ...base.about,
        ...(custom.about || {}),
        languages:
          custom.about?.languages && custom.about.languages.length > 0
            ? custom.about.languages
            : base.about.languages,
        languagesTitle: custom.about?.languagesTitle || base.about.languagesTitle,
        tag: base.about.tag,
      },
      skills: {
        ...base.skills,
        ...(custom.skills || {}),
        tag: base.skills.tag,
        categories: base.skills.categories.map((baseCat, idx) => {
          const customCat = custom.skills?.categories?.[idx]
          if (!customCat) return baseCat
          return {
            ...baseCat,
            ...customCat,
            title: customCat.title ?? baseCat.title,
            skills: Array.isArray(customCat.skills) ? customCat.skills : baseCat.skills,
            gridClass: baseCat.gridClass,
            fullWidth: baseCat.fullWidth,
          }
        }),
      },
      experience: {
        ...base.experience,
        ...(custom.experience || {}),
        tag: base.experience.tag,
        items: Array.isArray(custom.experience?.items)
          ? custom.experience.items
          : base.experience.items,
      },
      projects: {
        ...base.projects,
        ...(custom.projects || {}),
        tag: base.projects.tag,
        items: Array.isArray(custom.projects?.items)
          ? custom.projects.items
          : base.projects.items,
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

export type { LocalizedBlogPost, ExperienceItem, ProjectItem, SupportedLang, TranslationDict }

