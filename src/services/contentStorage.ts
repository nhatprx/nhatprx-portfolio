import { TRANSLATIONS, type SupportedLang, type TranslationDict, type LocalizedBlogPost, type ExperienceItem, type ProjectItem } from '../data/translations'
import { resolveIdentity } from '../data/identity'
import { fetchRemoteContent, saveRemoteContent } from './adminApi'

const TERMINAL_COMMANDS_KEY = 'nhatprx_custom_terminal_commands'
const PRESETS_KEY = 'nhatprx_content_presets'

/** The languages, in the order the global identity override is scanned. */
const LANG_ORDER: SupportedLang[] = ['en', 'vi', 'fr', 'ja']

export type CustomTerminalCommands = Record<string, string>

export interface ContentPreset {
  id: string
  name: string
  description: string
  timestamp: number
  translations: Record<SupportedLang, TranslationDict>
  resumeUrl?: string
  resumeFileName?: string
}

/**
 * Loads content overrides from the remote API (S3-backed) and merges them on
 * top of the factory defaults. S3 is the single source of truth; no localStorage cache.
 * Falls back to factory defaults only when S3 is unreachable.
 */
export async function loadRemoteTranslations(): Promise<Record<SupportedLang, TranslationDict>> {
  try {
    const remote = await fetchRemoteContent<Record<SupportedLang, TranslationDict>>()
    if (!remote) {
      // S3 returned no data; use factory defaults
      return mergeTranslations({})
    }
    return mergeTranslations(remote)
  } catch (err) {
    // On network error, return clean defaults
    return mergeTranslations({})
  }
}

/**
 * Persists content overrides to the remote API (S3-backed).
 * S3 is the single source of truth; no local cache needed.
 */
export async function saveRemoteTranslations(
  data: Record<SupportedLang, TranslationDict>
): Promise<boolean> {
  try {
    await saveRemoteContent(data)
    return true
  } catch (err) {
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
    // Use custom posts if provided, otherwise factory defaults
    const posts = Array.isArray(customBlog.posts) ? customBlog.posts : base.blog.posts

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
    // localStorage parse error
  }
  return {}
}

export function saveStoredTerminalCommands(commands: CustomTerminalCommands): void {
  try {
    localStorage.setItem(TERMINAL_COMMANDS_KEY, JSON.stringify(commands))
  } catch (err) {
    // localStorage save error
  }
}

export function getStoredPresets(): ContentPreset[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PRESETS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    // localStorage parse error
  }
  return []
}

export function savePreset(
  name: string,
  description: string,
  translations: Record<SupportedLang, TranslationDict>,
  resumeUrl?: string,
  resumeFileName?: string
): ContentPreset {
  const preset: ContentPreset = {
    id: Date.now().toString(),
    name,
    description,
    timestamp: Date.now(),
    translations,
    resumeUrl,
    resumeFileName,
  }

  try {
    const presets = getStoredPresets()
    presets.push(preset)
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
  } catch (err) {
    // localStorage save error
  }

  return preset
}

export function deletePreset(id: string): void {
  try {
    const presets = getStoredPresets()
    const filtered = presets.filter((p) => p.id !== id)
    localStorage.setItem(PRESETS_KEY, JSON.stringify(filtered))
  } catch (err) {
    // localStorage delete error
  }
}

export function updatePreset(
  id: string,
  updates: Partial<Omit<ContentPreset, 'id' | 'timestamp'>>
): void {
  try {
    const presets = getStoredPresets()
    const idx = presets.findIndex((p) => p.id === id)
    if (idx !== -1) {
      presets[idx] = { ...presets[idx], ...updates }
      localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
    }
  } catch (err) {
    // localStorage update error
  }
}

export type { LocalizedBlogPost, ExperienceItem, ProjectItem, SupportedLang, TranslationDict }
