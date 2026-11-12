import type { TranslationDict } from '../../../data/translations'

/**
 * Validation utilities for Admin Dashboard form inputs.
 * Detects special characters: ! @ # $ % ^ * _ + = { } [ ] | \ < > ~ ` ?
 * Allows human letters (all Unicode alphabets/accents), digits, spaces, and safe punctuation (. , - ' " / & : ; ( ))
 */
export function hasSpecialChar(val?: string | null): boolean {
  if (!val) return false
  return /[!@#$%^*_+={}[\]|\\<>~`?]/.test(val)
}

/**
 * Validates email format strictly: user@domain.tld
 */
export function isValidEmail(val?: string | null): boolean {
  if (!val || !val.trim()) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
}

/**
 * Validates URL format: must have valid http or https protocol
 */
export function isValidUrl(val?: string | null, optional = false): boolean {
  if (!val || !val.trim()) return optional
  try {
    const parsed = new URL(val.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Validates phone number: digits, spaces, optional leading +, max 12 non-space characters.
 */
export function isValidPhone(val?: string | null): boolean {
  if (!val || !val.trim()) return false
  const clean = val.replace(/\s+/g, '')
  if (clean.length === 0 || clean.length > 12) return false
  return /^\+?[0-9]{3,12}$/.test(clean)
}

/**
 * Validates location: allows letters, digits, spaces, and commas. Forbidden special chars are not allowed.
 */
export function isValidLocation(val?: string | null): boolean {
  if (!val || !val.trim()) return false
  // All special characters except comma are forbidden
  return !/[!@#$%^*_+={}[\]|\\<>~`?]/.test(val)
}

export type FieldValidationType = 'default' | 'email' | 'url' | 'phone' | 'location' | 'tech'

/**
 * Checks if a field is invalid based on its specified type:
 * - 'tech': allowed special chars (C++, C#, .NET, etc.)
 * - 'email': requires valid email format
 * - 'url': requires valid URL format
 * - 'phone': max 12 chars without spaces, phone format
 * - 'location': letters, spaces, commas allowed
 * - 'default': forbidden special characters not allowed; cannot be empty unless allowEmpty=true
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

  const isEmpty = !val || val.trim().length === 0
  if (isEmpty) return !canBeEmpty

  if (maxLimit && val && val.length > maxLimit) return true

  if (type === 'email') return !isValidEmail(val)
  if (type === 'url') return !isValidUrl(val, canBeEmpty)
  if (type === 'phone') return !isValidPhone(val)
  if (type === 'location') return !isValidLocation(val)

  return hasSpecialChar(val)
}

/**
 * Returns Tailwind border & focus classes based on validity:
 * Red border when field is invalid; normal subtle border otherwise.
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
 * Formats phone number: max 12 characters WITHOUT spaces, automatically grouped with spaces every 3 chars.
 */
export function formatPhoneWithSpaces(val: string): string {
  const clean = val.replace(/\s+/g, '').slice(0, 12)
  const chunks = clean.match(/.{1,3}/g) || []
  return chunks.join(' ')
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
 * Merges current edited dictionary into stored dictionary, discarding any invalid field
 * so that an invalid field is never saved while all valid fields are safely auto-saved.
 */
export function mergeValidDict(current: TranslationDict, saved: TranslationDict): TranslationDict {
  const valid = (val: string | undefined, type: FieldValidationType = 'default', allowEmpty = false) =>
    isFieldInvalid(val, type, allowEmpty) ? false : true

  return {
    ...current,
    hero: {
      ...current.hero,
      role: valid(current.hero.role) ? current.hero.role : saved.hero.role,
    },
    about: {
      ...current.about,
      title: valid(current.about.title) ? current.about.title : saved.about.title,
      titleSub: valid(current.about.titleSub) ? current.about.titleSub : saved.about.titleSub,
      p1: valid(current.about.p1) ? current.about.p1 : saved.about.p1,
      p2: valid(current.about.p2, 'default', true) ? current.about.p2 : saved.about.p2,
      educationTitle: valid(current.about.educationTitle)
        ? current.about.educationTitle
        : saved.about.educationTitle,
      edu1School: valid(current.about.edu1School) ? current.about.edu1School : saved.about.edu1School,
      edu1Degree: valid(current.about.edu1Degree) ? current.about.edu1Degree : saved.about.edu1Degree,
      edu1Major: valid(current.about.edu1Major) ? current.about.edu1Major : saved.about.edu1Major,
      edu1Location: valid(current.about.edu1Location, 'location')
        ? current.about.edu1Location
        : saved.about.edu1Location,
      edu2School: valid(current.about.edu2School, 'default', true)
        ? current.about.edu2School
        : saved.about.edu2School,
      edu2Degree: valid(current.about.edu2Degree, 'default', true)
        ? current.about.edu2Degree
        : saved.about.edu2Degree,
      edu2Major: valid(current.about.edu2Major, 'default', true)
        ? current.about.edu2Major
        : saved.about.edu2Major,
      edu2Location: valid(current.about.edu2Location, 'location', true)
        ? current.about.edu2Location
        : saved.about.edu2Location,
    },
    skills: {
      ...current.skills,
      title: valid(current.skills.title) ? current.skills.title : saved.skills.title,
      titleSub: valid(current.skills.titleSub) ? current.skills.titleSub : saved.skills.titleSub,
      categories: current.skills.categories.map((cat, i) => ({
        ...cat,
        title: valid(cat.title) ? cat.title : (saved.skills.categories[i]?.title ?? cat.title),
        skills: cat.skills, // tech stack names allow special characters
      })),
    },
    experience: {
      ...current.experience,
      title: valid(current.experience.title) ? current.experience.title : saved.experience.title,
      titleSub: valid(current.experience.titleSub)
        ? current.experience.titleSub
        : saved.experience.titleSub,
      items: current.experience.items,
    },
    projects: {
      ...current.projects,
      title: valid(current.projects.title) ? current.projects.title : saved.projects.title,
      titleSub: valid(current.projects.titleSub)
        ? current.projects.titleSub
        : saved.projects.titleSub,
      items: current.projects.items,
    },
    contact: {
      ...current.contact,
      title: valid(current.contact.title) ? current.contact.title : saved.contact.title,
      titleSub: valid(current.contact.titleSub)
        ? current.contact.titleSub
        : saved.contact.titleSub,
      desc: valid(current.contact.desc) ? current.contact.desc : saved.contact.desc,
      directEmail: valid(current.contact.directEmail, 'email')
        ? current.contact.directEmail
        : saved.contact.directEmail,
      directPhone: valid(current.contact.directPhone, 'phone')
        ? current.contact.directPhone
        : saved.contact.directPhone,
      githubUrl: valid(current.contact.githubUrl, 'url')
        ? current.contact.githubUrl
        : saved.contact.githubUrl,
      linkedinUrl: valid(current.contact.linkedinUrl, 'url')
        ? current.contact.linkedinUrl
        : saved.contact.linkedinUrl,
      availabilityLocation: valid(current.contact.availabilityLocation, 'location')
        ? current.contact.availabilityLocation
        : saved.contact.availabilityLocation,
    },
  }
}
