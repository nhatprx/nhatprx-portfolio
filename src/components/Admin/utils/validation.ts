import type { TranslationDict } from '../../../data/translations'

/**
 * Validation utilities for Admin Dashboard form inputs.
 *
 * The rules themselves live in `./fieldRules` - a single registry that owns the
 * regex, the max length and the guidance message for every editable field.
 * This module keeps the older helper names working so existing callers do not
 * break, and adds the merge helper used by the auto-save engine.
 */

export {
  sanitizeByKind,
  clampByMax,
  applyFieldRule,
  findForbiddenChars,
  validateField,
  formatPhoneWithSpaces,
  FIELD_RULES,
  type FieldKind,
  type FieldRule,
  type FieldRuleKey,
} from './fieldRules'

import { validateField, type FieldKind } from './fieldRules'

export type FieldValidationType = 'default' | 'email' | 'url' | 'phone' | 'location' | 'tech'

/** Maps the legacy validation type onto the shared field rule kinds. */
const KIND_MAP: Record<FieldValidationType, FieldKind> = {
  default: 'text',
  email: 'email',
  url: 'url',
  phone: 'phone',
  location: 'location',
  tech: 'tech',
}

/**
 * Checks if a field is invalid based on its specified type.
 * @deprecated Prefer `validateField` from ./fieldRules.
 */
export function isFieldInvalid(
  val?: string | null,
  typeOrAllowEmpty: FieldValidationType | boolean = 'default',
  allowEmpty = false,
  maxLimit?: number
): boolean {
  const type: FieldValidationType =
    typeof typeOrAllowEmpty === 'boolean' ? 'default' : typeOrAllowEmpty
  const canBeEmpty: boolean =
    typeof typeOrAllowEmpty === 'boolean' ? typeOrAllowEmpty : allowEmpty

  if (type === 'tech') return false

  const error = validateField(
    val ?? '',
    { kind: KIND_MAP[type], max: maxLimit ?? Number.MAX_SAFE_INTEGER, label: 'This field' },
    canBeEmpty
  )
  return error !== null
}

/**
 * Returns Tailwind border & focus classes based on validity.
 * @deprecated Prefer the `AdminField` component, which also renders the message.
 */
export function getInputValidationClass(
  val?: string | null,
  typeOrAllowEmpty: FieldValidationType | boolean = 'default',
  allowEmpty = false,
  maxLimit?: number
): string {
  if (isFieldInvalid(val, typeOrAllowEmpty, allowEmpty, maxLimit)) {
    return 'border-rose-500 text-rose-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/50'
  }
  return 'border-white/20 text-white focus:border-white'
}

/**
 * Handles auto-bullet insertion on Enter key in Admin textareas with max bullet enforcement.
 */
export function handleBulletInputKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  bulletText: string,
  onUpdate: (updatedText: string, bullets: string[]) => void,
  maxBullets = 5
) {
  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
    const currentBullets = bulletText
      .split('\n')
      .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
      .filter(Boolean)
    if (currentBullets.length >= maxBullets) {
      e.preventDefault()
      return
    }
    e.preventDefault()
    const target = e.currentTarget
    const { selectionStart, selectionEnd } = target
    const before = bulletText.slice(0, selectionStart)
    const after = bulletText.slice(selectionEnd)
    const updated = `${before}\n• ${after}`
    const bullets = updated
      .split('\n')
      .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
      .filter(Boolean)
      .slice(0, maxBullets)
    onUpdate(updated, bullets)
    setTimeout(() => {
      target.selectionStart = selectionStart + 3
      target.selectionEnd = selectionStart + 3
    }, 0)
  }
}

/**
 * Merges the current edited dictionary into the stored dictionary.
 *
 * Only structurally-typed fields (email / url / phone) are reverted when they
 * are malformed. Free-text fields are always kept: the character blacklist is
 * a visual hint in the input, and reverting on it made typing silently undo
 * the user's keystrokes (e.g. a single "_" or "?" anywhere in the text).
 */
export function mergeValidDict(current: TranslationDict, saved: TranslationDict): TranslationDict {
  // Free text: never reverted. Malformed text is still flagged in the UI.
  const text = (val: string | undefined, fallback: string | undefined) =>
    (val ?? fallback) as string

  // Structured fields: revert only when the value is malformed (not merely empty).
  const structured = (
    val: string | undefined,
    type: FieldValidationType,
    fallback: string | undefined
  ) => {
    if (val === undefined) return fallback as string
    if (val.trim() === '') return fallback as string
    return isFieldInvalid(val, type, true) ? (fallback as string) : val
  }

  return {
    ...current,
    hero: {
      ...current.hero,
      role: text(current.hero.role, saved.hero.role),
    },
    about: {
      ...current.about,
      tag: text(current.about.tag, saved.about.tag),
      title: text(current.about.title, saved.about.title),
      titleSub: text(current.about.titleSub, saved.about.titleSub),
      p1: text(current.about.p1, saved.about.p1),
      p2: text(current.about.p2, saved.about.p2),
      educationTitle: text(current.about.educationTitle, saved.about.educationTitle),
      edu1School: text(current.about.edu1School, saved.about.edu1School),
      edu1Degree: text(current.about.edu1Degree, saved.about.edu1Degree),
      edu1Major: text(current.about.edu1Major, saved.about.edu1Major),
      edu1Location: text(current.about.edu1Location, saved.about.edu1Location),
      edu2School: text(current.about.edu2School, saved.about.edu2School),
      edu2Degree: text(current.about.edu2Degree, saved.about.edu2Degree),
      edu2Major: text(current.about.edu2Major, saved.about.edu2Major),
      edu2Location: text(current.about.edu2Location, saved.about.edu2Location),
    },
    skills: {
      ...current.skills,
      tag: text(current.skills.tag, saved.skills.tag),
      title: text(current.skills.title, saved.skills.title),
      titleSub: text(current.skills.titleSub, saved.skills.titleSub),
      desc: text(current.skills.desc, saved.skills.desc),
      categories: current.skills.categories.map((cat, i) => ({
        ...cat,
        title: text(cat.title, saved.skills.categories[i]?.title ?? cat.title),
        skills: cat.skills, // tech stack names allow special characters
      })),
    },
    experience: {
      ...current.experience,
      tag: text(current.experience.tag, saved.experience.tag),
      title: text(current.experience.title, saved.experience.title),
      titleSub: text(current.experience.titleSub, saved.experience.titleSub),
      desc: text(current.experience.desc, saved.experience.desc),
      items: current.experience.items,
    },
    projects: {
      ...current.projects,
      tag: text(current.projects.tag, saved.projects.tag),
      title: text(current.projects.title, saved.projects.title),
      titleSub: text(current.projects.titleSub, saved.projects.titleSub),
      desc: text(current.projects.desc, saved.projects.desc),
      items: current.projects.items,
    },
    blog: {
      ...current.blog,
      tag: text(current.blog.tag, saved.blog.tag),
      title: text(current.blog.title, saved.blog.title),
      titleSub: text(current.blog.titleSub, saved.blog.titleSub),
      desc: text(current.blog.desc, saved.blog.desc),
      posts: current.blog.posts,
    },
    identity: {
      displayName: text(current.identity.displayName, saved.identity.displayName),
      email: structured(current.identity.email, 'email', saved.identity.email),
      phone: structured(current.identity.phone, 'phone', saved.identity.phone),
      githubUrl: structured(current.identity.githubUrl, 'url', saved.identity.githubUrl),
      linkedinUrl: structured(current.identity.linkedinUrl, 'url', saved.identity.linkedinUrl),
    },
    contact: {
      ...current.contact,
      tag: text(current.contact.tag, saved.contact.tag),
      title: text(current.contact.title, saved.contact.title),
      titleSub: text(current.contact.titleSub, saved.contact.titleSub),
      desc: text(current.contact.desc, saved.contact.desc),
      availabilityLocation: text(
        current.contact.availabilityLocation,
        saved.contact.availabilityLocation
      ),
    },
  }
}
