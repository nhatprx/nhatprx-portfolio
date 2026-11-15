import { TRANSLATIONS, type SupportedLang, type TranslationDict, type LocalizedBlogPost, type ExperienceItem, type ProjectItem } from '../data/translations'
import { resolveIdentity } from '../data/identity'
import { resolveWorkTag } from '../data/workTag'
import { fetchRemoteContent, saveRemoteContent } from './adminApi'
import { mergeSkillCategories } from './skillCategories'

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
  } catch {
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
  } catch {
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

    // Experience and Projects render as one #work section with a single tag
    // above it, so both tabs always read the same value.
    const workTag = resolveWorkTag(custom, base.experience.tag)

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
        tag: custom.about?.tag || base.about.tag,
      },
      skills: {
        ...base.skills,
        ...(custom.skills || {}),
        tag: custom.skills?.tag || base.skills.tag,
        // Categories are matched by title, not by index: an admin can delete or
        // reorder a group, and matching by index would hand every later group
        // the wrong title and skills.
        categories: mergeSkillCategories(base.skills.categories, custom.skills?.categories),
      },
      experience: {
        ...base.experience,
        ...(custom.experience || {}),
        tag: workTag,
        items: Array.isArray(custom.experience?.items)
          ? custom.experience.items
          : base.experience.items,
      },
      projects: {
        ...base.projects,
        ...(custom.projects || {}),
        // One section, one tag: the site swaps the heading between the two
        // tabs but the tag above it is shared.
        tag: workTag,
        items: Array.isArray(custom.projects?.items)
          ? custom.projects.items
          : base.projects.items,
      },
      blog: {
        ...base.blog,
        ...customBlog,
        tag: customBlog.tag || base.blog.tag,
        posts,
      },
      contact: {
        ...base.contact,
        ...(custom.contact || {}),
        tag: custom.contact?.tag || base.contact.tag,
      },
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
  } catch {
    // localStorage parse error
  }
  return {}
}

export function getStoredPresets(): ContentPreset[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PRESETS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
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
  } catch {
    // localStorage save error
  }

  return preset
}

export function deletePreset(id: string): void {
  try {
    const presets = getStoredPresets()
    const filtered = presets.filter((p) => p.id !== id)
    localStorage.setItem(PRESETS_KEY, JSON.stringify(filtered))
  } catch {
    // localStorage delete error
  }
}

export type { LocalizedBlogPost, ExperienceItem, ProjectItem, SupportedLang, TranslationDict }
