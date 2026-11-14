// Shared Admin field rules - plain JS core.
//
// Lives in .mjs so it can be imported by the Vite app (via fieldRules.ts) and
// by the Node test runner (server/test/field-rules.test.mjs) without a build
// step or an extra dependency.
//
// Every editable field in the dashboard is described once here: its validation
// type, its maximum length, and the human-readable message shown when the
// input is wrong. The UI (border + inline hint + toast) is driven from these
// rules so a field cannot be red in one tab and unchecked in another.

/**
 * Characters that are safe in every free-text field.
 *
 * Unicode letters/digits are allowed so accented names (Nguyễn, 川) work.
 *
 * Deliberately NOT blacklisted: # % ~ + - ( ) / & ' " . , : ; ? !
 * The shipped content legitimately uses "C#", "~17%", "1,000+" and "C++",
 * and the brief asks for readable prose - only characters that break layout
 * or inject markup are rejected.
 */
const FORBIDDEN = /[@$^*_={}[\]|\\<>]/g

/**
 * Strips characters that would break layout or rendering.
 * Called on every keystroke so invalid characters never enter the state.
 */
export function sanitizeByKind(value, kind) {
  switch (kind) {
    case 'tech':
      // Tech names legitimately contain . + # / - and digits.
      return value.replace(/[<>{}|`]/g, '')
    case 'location':
      return value.replace(FORBIDDEN, '')
    case 'email':
      return value.replace(/[^a-zA-Z0-9@._+-]/g, '')
    case 'url':
      return value.replace(/[^a-zA-Z0-9:/._?=#%&+-]/g, '')
    case 'phone':
      return value.replace(/[^0-9+ ]/g, '')
    case 'text':
    default:
      return value.replace(FORBIDDEN, '')
  }
}

/** Enforces the maximum length of a field. */
export function clampByMax(value, max) {
  return value.length > max ? value.slice(0, max) : value
}

/**
 * Applies the sanitizing + clamping rules in one call.
 * This is the function every controlled input should run its value through.
 */
export function applyFieldRule(value, rule) {
  return clampByMax(sanitizeByKind(value, rule.kind), rule.max)
}

/**
 * Returns the list of forbidden characters present in the value.
 * Empty array means the value is clean.
 */
export function findForbiddenChars(value, kind) {
  const cleaned = sanitizeByKind(value, kind)
  if (value.length === cleaned.length) return []
  const forbidden = new Set()
  for (const ch of value) {
    if (!cleaned.includes(ch)) forbidden.add(ch)
  }
  return [...forbidden]
}

/**
 * Checks whether the value satisfies the rule.
 * Returns an error message, or null when the value is acceptable.
 */
export function validateField(value, rule, allowEmpty = false) {
  const val = value ?? ''

  if (val.trim().length === 0) {
    return allowEmpty ? null : `${rule.label ?? 'This field'} is required.`
  }

  if (val.length > rule.max) {
    return `${rule.label ?? 'This field'} must be at most ${rule.max} characters (currently ${val.length}).`
  }

  const forbidden = findForbiddenChars(val, rule.kind)
  if (forbidden.length > 0) {
    return `${rule.label ?? 'This field'} cannot contain ${forbidden
      .map((c) => `"${c}"`)
      .join(', ')}.`
  }

  switch (rule.kind) {
    case 'email': {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
        return `${rule.label ?? 'Email'} must look like name@example.com.`
      }
      break
    }
    case 'url': {
      try {
        const parsed = new URL(val.trim())
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return `${rule.label ?? 'URL'} must start with http:// or https://`
        }
      } catch {
        return `${rule.label ?? 'URL'} must be a full link starting with http:// or https://`
      }
      break
    }
    case 'phone': {
      const clean = val.replace(/\s+/g, '')
      if (clean.length > 12) {
        return `${rule.label ?? 'Phone'} must be at most 12 digits (currently ${clean.length}).`
      }
      if (!/^\+?[0-9]{3,12}$/.test(clean)) {
        return `${rule.label ?? 'Phone'} must contain 3-12 digits and may start with "+".`
      }
      break
    }
  }

  return null
}

/**
 * Formats a phone number: max 12 digits WITHOUT spaces, grouped by 3.
 */
export function formatPhoneWithSpaces(val) {
  const clean = val.replace(/\s+/g, '').slice(0, 12)
  const chunks = clean.match(/.{1,3}/g) || []
  return chunks.join(' ')
}

/* ------------------------------------------------------------------ *
 * Field rule registry
 * One entry per editable field so limits never drift between tabs.
 * ------------------------------------------------------------------ */

const L = {
  about: {
    title: 35,
    titleSub: 35,
    p1: 340,
    p2: 340,
    educationTitle: 25,
    eduSchool: 32,
    eduLocation: 28,
    eduDegree: 35,
    eduMajor: 35,
  },
  skills: { title: 35, titleSub: 35, itemSmall: 14, itemMedium: 18, itemLarge: 26, itemXLarge: 50 },
  work: { title: 48, company: 60, period: 25, summary: 200, bullet: 240, techItem: 18 },
}

// Short guidance shown while the field is focused. The long explanation of
// the blocked characters lives in the FORBIDDEN comment above.
const TEXT_HINT = 'Plain text. Avoid @ $ ^ * _ = { } [ ] | \\ < >.'
const BODY_HINT = 'Plain prose. Avoid @ $ ^ * _ = { } [ ] | \\ < >.'

export const FIELD_RULES = {
  /* Hero & About */
  heroRole: { kind: 'text', max: 40, label: 'Role subtitle', hint: TEXT_HINT },
  aboutTitle: { kind: 'text', max: L.about.title, label: 'Section title', hint: TEXT_HINT },
  aboutTitleSub: { kind: 'text', max: L.about.titleSub, label: 'Subtitle', hint: TEXT_HINT },
  aboutP1: { kind: 'text', max: L.about.p1, label: 'About paragraph', hint: BODY_HINT },
  educationTitle: {
    kind: 'text',
    max: L.about.educationTitle,
    label: 'Education heading',
    hint: TEXT_HINT,
  },
  eduSchool: { kind: 'text', max: L.about.eduSchool, label: 'University', hint: TEXT_HINT },
  eduLocation: {
    kind: 'location',
    max: L.about.eduLocation,
    label: 'Location',
    hint: 'Use "City, Country" format. Letters, numbers, spaces and commas only.',
  },
  eduDegree: { kind: 'text', max: L.about.eduDegree, label: 'Degree title', hint: TEXT_HINT },
  eduMajor: { kind: 'text', max: L.about.eduMajor, label: 'Major', hint: TEXT_HINT },

  /* Technical */
  skillsTitle: { kind: 'text', max: L.skills.title, label: 'Section title', hint: TEXT_HINT },
  skillsTitleSub: { kind: 'text', max: L.skills.titleSub, label: 'Subtitle', hint: TEXT_HINT },
  skillGroupTitle: { kind: 'text', max: 30, label: 'Group title', hint: TEXT_HINT },
  skillName: {
    kind: 'tech',
    max: 50,
    label: 'Stack name',
    hint: 'Tech names may contain . + # / - (e.g. C++, C#, .NET, Node.js).',
  },

  /* Work (Experience & Projects) */
  workTitle: { kind: 'text', max: L.work.title, label: 'Title', hint: TEXT_HINT },
  workCompany: { kind: 'text', max: L.work.company, label: 'Company', hint: TEXT_HINT },
  workPeriod: { kind: 'text', max: L.work.period, label: 'Period', hint: TEXT_HINT },
  workSummary: { kind: 'text', max: L.work.summary, label: 'Summary', hint: BODY_HINT },
  workBullet: { kind: 'text', max: L.work.bullet, label: 'Bullet', hint: BODY_HINT },
  workTech: {
    kind: 'tech',
    max: L.work.techItem,
    label: 'Technology',
    hint: 'Tech names may contain . + # / - (e.g. C++, C#, .NET, Node.js).',
  },

  /* Contact */
  contactTitle: { kind: 'text', max: 40, label: 'Section title', hint: TEXT_HINT },
  contactTitleSub: { kind: 'text', max: 50, label: 'Subtitle', hint: TEXT_HINT },
  contactDesc: { kind: 'text', max: 450, label: 'Description', hint: BODY_HINT },
  contactEmail: { kind: 'email', max: 120, label: 'Email', hint: 'Format: name@example.com' },
  contactPhone: {
    kind: 'phone',
    max: 16,
    label: 'Phone',
    hint: '3-12 digits, may start with "+". Spaces are added automatically.',
  },
  contactUrl: {
    kind: 'url',
    max: 300,
    label: 'URL',
    hint: 'Full link starting with http:// or https://',
  },
  contactLocation: {
    kind: 'location',
    max: 50,
    label: 'Location',
    hint: 'Use "City, Country" format. Letters, numbers, spaces and commas only.',
  },

  /* Identity (global - shared by every language) */
  identityName: {
    kind: 'text',
    max: 40,
    label: 'Display name',
    hint: 'Shown in the header, the hero and the footer on every language.',
  },
}
