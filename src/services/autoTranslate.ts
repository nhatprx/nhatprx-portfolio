import type {
  TranslationDict,
  ExperienceItem,
  ProjectItem,
  LocalizedBlogPost,
} from '../data/translations'

type BlogSection = LocalizedBlogPost['content']['sections'][number]

/**
 * Public Google Translate endpoint (client=gtx).
 * Fast, free, and does not require third-party SDKs or API keys.
 */
export async function fetchGoogleTranslate(text: string, targetLang: 'vi' | 'fr' | 'ja'): Promise<string> {
  if (!text || !text.trim()) return text

  const cleanText = text.trim()
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    // data[0] is an array of segments: [[translatedChunk, originalChunk, ...], ...]
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0].map((chunk: unknown[]) => (chunk && chunk[0] ? String(chunk[0]) : '')).join('')
      return translated.trim() || text
    }
  } catch (err) {
    console.warn(`Translation error for "${cleanText.slice(0, 20)}..." to ${targetLang}:`, err)
  }
  return text
}

/**
 * Truncates text cleanly without cutting words in half when exceeding limit.
 */
export function clampToLimit(text: string, maxLen?: number): string {
  if (!maxLen || text.length <= maxLen) return text
  const sliced = text.slice(0, maxLen).trim()
  const lastSpace = sliced.lastIndexOf(' ')
  if (lastSpace > maxLen * 0.75) {
    return sliced.slice(0, lastSpace).trim()
  }
  return sliced
}

/**
 * Translate single text and ensure it stays within max character length.
 */
export async function translateText(
  text: string,
  targetLang: 'vi' | 'fr' | 'ja',
  maxLen?: number
): Promise<string> {
  const translated = await fetchGoogleTranslate(text, targetLang)
  return clampToLimit(translated, maxLen)
}

/**
 * Translate an array of string items (e.g. bullets, tags, tech list).
 */
export async function translateList(
  items: string[],
  targetLang: 'vi' | 'fr' | 'ja',
  maxLenPerItem?: number
): Promise<string[]> {
  const results: string[] = []
  for (const item of items) {
    const trans = await translateText(item, targetLang, maxLenPerItem)
    results.push(trans)
  }
  return results
}

export { CONTENT_LIMITS } from './contentLimits'
import { CONTENT_LIMITS } from './contentLimits'

/**
 * Translates an entire ExperienceItem from English
 */
export async function translateExperienceItem(
  item: ExperienceItem,
  targetLang: 'vi' | 'fr' | 'ja'
): Promise<ExperienceItem> {
  const [role, company, summary, bullets] = await Promise.all([
    translateText(item.role, targetLang, CONTENT_LIMITS.work.title),
    translateText(item.company, targetLang, CONTENT_LIMITS.work.company),
    translateText(item.summary, targetLang, CONTENT_LIMITS.work.summary),
    Promise.all(item.bullets.map((b) => translateText(b, targetLang, CONTENT_LIMITS.work.bullet))),
  ])

  return {
    ...item,
    role,
    company,
    summary,
    bullets,
    // tech names remain universal (e.g. React, PostgreSQL, Docker)
  }
}

/**
 * Translates an entire ProjectItem from English
 */
export async function translateProjectItem(
  item: ProjectItem,
  targetLang: 'vi' | 'fr' | 'ja'
): Promise<ProjectItem> {
  const [title, meta, desc, bullets] = await Promise.all([
    translateText(item.title, targetLang, CONTENT_LIMITS.work.title),
    translateText(item.meta, targetLang, CONTENT_LIMITS.work.company),
    translateText(item.desc, targetLang, CONTENT_LIMITS.work.summary),
    Promise.all(item.bullets.map((b) => translateText(b, targetLang, CONTENT_LIMITS.work.bullet))),
  ])

  return {
    ...item,
    title,
    meta,
    desc,
    bullets,
    // tech and repoUrl remain unchanged
  }
}

/**
 * Translates a single LocalizedBlogPost from English
 */
export async function translateBlogPost(
  post: LocalizedBlogPost,
  targetLang: 'vi' | 'fr' | 'ja'
): Promise<LocalizedBlogPost> {
  const [title, summary, lead] = await Promise.all([
    translateText(post.title, targetLang, CONTENT_LIMITS.blog.title),
    translateText(post.summary, targetLang, CONTENT_LIMITS.blog.summary),
    translateText(post.content.lead, targetLang, CONTENT_LIMITS.blog.lead),
  ])

  const translatedSections: BlogSection[] = []
  for (const s of post.content.sections) {
    const heading = await translateText(s.heading, targetLang, CONTENT_LIMITS.blog.sectionHeading)
    const body = await Promise.all(
      s.body.map((p) => translateText(p, targetLang, CONTENT_LIMITS.blog.sectionBodyPara))
    )
    translatedSections.push({
      ...s,
      heading,
      body,
      // code snippets remain verbatim
    })
  }

  return {
    ...post,
    title,
    summary,
    content: {
      lead,
      sections: translatedSections,
    },
  }
}

/**
 * Full English Translation Dictionary to Target Language
 */
export async function translateEntireDict(
  enDict: TranslationDict,
  targetLang: 'vi' | 'fr' | 'ja',
  onProgress?: (msg: string) => void
): Promise<TranslationDict> {
  onProgress?.(`Translating About & Education to [${targetLang.toUpperCase()}]...`)
  const [
    aboutTitle,
    aboutTitleSub,
    aboutP1,
    aboutP2,
    educationTitle,
    edu1School,
    edu1Degree,
    edu1Major,
    edu1Location,
    edu2School,
    edu2Degree,
    edu2Major,
    edu2Location,
    skillsTitle,
    skillsTitleSub,
    contactTitle,
    contactSub,
    contactDesc,
  ] = await Promise.all([
    translateText(enDict.about.title, targetLang, CONTENT_LIMITS.about.title),
    translateText(enDict.about.titleSub, targetLang, CONTENT_LIMITS.about.titleSub),
    translateText(enDict.about.p1, targetLang, CONTENT_LIMITS.about.p1),
    translateText(enDict.about.p2, targetLang, CONTENT_LIMITS.about.p2),
    translateText(enDict.about.educationTitle, targetLang, CONTENT_LIMITS.about.educationTitle),
    translateText(enDict.about.edu1School, targetLang, CONTENT_LIMITS.about.eduSchool),
    translateText(enDict.about.edu1Degree, targetLang, CONTENT_LIMITS.about.eduDegree),
    translateText(enDict.about.edu1Major, targetLang, CONTENT_LIMITS.about.eduMajor),
    translateText(enDict.about.edu1Location, targetLang, CONTENT_LIMITS.about.eduLocation),
    translateText(enDict.about.edu2School, targetLang, CONTENT_LIMITS.about.eduSchool),
    translateText(enDict.about.edu2Degree, targetLang, CONTENT_LIMITS.about.eduDegree),
    translateText(enDict.about.edu2Major, targetLang, CONTENT_LIMITS.about.eduMajor),
    translateText(enDict.about.edu2Location, targetLang, CONTENT_LIMITS.about.eduLocation),
    translateText(enDict.skills.title, targetLang, CONTENT_LIMITS.skills.title),
    translateText(enDict.skills.titleSub, targetLang, CONTENT_LIMITS.skills.titleSub),
    translateText(enDict.contact.title, targetLang, 35),
    translateText(enDict.contact.titleSub, targetLang, 50),
    translateText(enDict.contact.desc, targetLang, 180),
  ])

  // Skills Categories Title Translation
  onProgress?.(`Translating Skill categories to [${targetLang.toUpperCase()}]...`)
  const translatedCategories = await Promise.all(
    enDict.skills.categories.map(async (cat) => ({
      ...cat,
      title: await translateText(cat.title, targetLang, 30),
      // Skills names (e.g. JavaScript, Docker) remain universal
    }))
  )

  // Experience Items Translation
  onProgress?.(`Translating Experience history to [${targetLang.toUpperCase()}]...`)
  const translatedExpItems: ExperienceItem[] = []
  for (const item of enDict.experience.items) {
    translatedExpItems.push(await translateExperienceItem(item, targetLang))
  }

  // Projects Items Translation
  onProgress?.(`Translating Projects to [${targetLang.toUpperCase()}]...`)
  const translatedProjItems: ProjectItem[] = []
  for (const item of enDict.projects.items) {
    translatedProjItems.push(await translateProjectItem(item, targetLang))
  }

  // Blog Posts Translation
  onProgress?.(`Translating Blog posts to [${targetLang.toUpperCase()}]...`)
  const translatedBlogPosts: LocalizedBlogPost[] = []
  for (const post of enDict.blog.posts) {
    translatedBlogPosts.push(await translateBlogPost(post, targetLang))
  }

  return {
    ...enDict,
    about: {
      ...enDict.about,
      title: aboutTitle,
      titleSub: aboutTitleSub,
      p1: aboutP1,
      p2: aboutP2,
      educationTitle,
      edu1School,
      edu1Degree,
      edu1Major,
      edu1Location,
      edu1Dates: edu1Location,
      edu2School,
      edu2Degree,
      edu2Major,
      edu2Location,
      edu2Dates: edu2Location,
    },
    skills: {
      ...enDict.skills,
      title: skillsTitle,
      titleSub: skillsTitleSub,
      categories: translatedCategories,
    },
    experience: {
      ...enDict.experience,
      items: translatedExpItems,
    },
    projects: {
      ...enDict.projects,
      items: translatedProjItems,
    },
    blog: {
      ...enDict.blog,
      posts: translatedBlogPosts,
    },
    contact: {
      ...enDict.contact,
      title: contactTitle,
      titleSub: contactSub,
      desc: contactDesc,
    },
  }
}
