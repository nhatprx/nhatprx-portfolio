import type {
  TranslationDict,
  ExperienceItem,
  ProjectItem,
  LocalizedBlogPost,
} from '../data/translations'
import { CONTENT_LIMITS } from './contentLimits'

export { CONTENT_LIMITS } from './contentLimits'

type BlogSection = LocalizedBlogPost['content']['sections'][number]
type TranslationTarget = 'vi' | 'fr' | 'ja'

type TextStyle = 'sentence' | 'uppercase' | 'preserve'

interface TranslateOptions {
  maxLen?: number
  style?: TextStyle
  signal?: AbortSignal
}

interface TranslateRequest {
  text: string
  targetLang: TranslationTarget
  style?: TextStyle
  signal?: AbortSignal
}

const REQUEST_TIMEOUT_MS = 12_000
const MAX_CONCURRENT_REQUESTS = 6

/** Maps a field to its intended casing instead of letting the translator guess. */
function getTextStyle(text: string, requested?: TextStyle): TextStyle {
  if (requested && requested !== 'preserve') return requested
  if (!text.trim()) return 'sentence'

  const letters = text.match(/\p{L}/gu)
  if (!letters?.length) return 'preserve'

  const uppercase = letters.filter((letter) => letter === letter.toLocaleUpperCase()).length
  if (uppercase / letters.length >= 0.9) return 'uppercase'
  return 'sentence'
}

function applyTextStyle(text: string, style: TextStyle): string {
  const trimmed = text.trim()
  if (!trimmed) return text
  if (style === 'uppercase') return trimmed.toLocaleUpperCase()
  if (style === 'sentence') {
    const lower = trimmed.toLocaleLowerCase()
    return lower.charAt(0).toLocaleUpperCase() + lower.slice(1)
  }
  return trimmed
}

/** Protects code-like tokens and URLs from being translated or recased. */
function protectTokens(text: string): { text: string; tokens: string[] } {
  const tokens: string[] = []
  const protectedText = text.replace(
    /(https?:\/\/[^\s]+|\b[A-Za-z0-9_+.-]+\.[A-Za-z]{2,}\b|\b[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b)/g,
    (token) => {
      const index = tokens.push(token) - 1
      return `__TOKEN_${index}__`
    }
  )
  return { text: protectedText, tokens }
}

function restoreTokens(text: string, tokens: string[]): string {
  return text.replace(/__TOKEN_(\d+)__/g, (_, index: string) => tokens[Number(index)] ?? '')
}

/** Google Translate's free endpoint is unreliable under many parallel calls. */
async function translateRequest({
  text,
  targetLang,
  style = 'sentence',
  signal,
}: TranslateRequest): Promise<string> {
  if (!text.trim()) return text

  const cleanText = text.trim()
  const { text: protectedText, tokens } = protectTokens(cleanText)
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(protectedText)}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data: unknown = await response.json()
    if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error('Invalid translation response')

    const translated = data[0]
      .map((chunk: unknown[]) => (Array.isArray(chunk) && chunk[0] ? String(chunk[0]) : ''))
      .join('')
      .trim()

    if (!translated) throw new Error('Empty translation')
    return restoreTokens(applyTextStyle(translated, style), tokens)
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>
): Promise<void> {
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      await worker(items[index], index)
    }
  })
  await Promise.all(runners)
}

/**
 * Translates one field. Failed requests throw so the admin can avoid silently
 * replacing a locale with partially translated content.
 */
export async function translateText(
  text: string,
  targetLang: TranslationTarget,
  options: TranslateOptions = {}
): Promise<string> {
  if (!text.trim()) return text

  const style = getTextStyle(text, options.style)
  const translated = await translateRequest({
    text,
    targetLang,
    style,
    signal: options.signal,
  })
  return clampToLimit(translated, options.maxLen)
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
 * Translate an array of string items (e.g. bullets, tags, tech list).
 */
export async function translateList(
  items: string[],
  targetLang: TranslationTarget,
  maxLenPerItem?: number
): Promise<string[]> {
  return Promise.all(items.map((item) => translateText(item, targetLang, { maxLen: maxLenPerItem })))
}

export async function translateExperienceItem(
  item: ExperienceItem,
  targetLang: TranslationTarget,
  signal?: AbortSignal
): Promise<ExperienceItem> {
  const [role, company, summary, bullets] = await Promise.all([
    translateText(item.role, targetLang, { maxLen: CONTENT_LIMITS.work.title, signal }),
    translateText(item.company, targetLang, { maxLen: CONTENT_LIMITS.work.company, signal }),
    translateText(item.summary, targetLang, { maxLen: CONTENT_LIMITS.work.summary, signal }),
    Promise.all(
      item.bullets.map((bullet) =>
        translateText(bullet, targetLang, { maxLen: CONTENT_LIMITS.work.bullet, signal })
      )
    ),
  ])

  return { ...item, role, company, summary, bullets }
}

export async function translateProjectItem(
  item: ProjectItem,
  targetLang: TranslationTarget,
  signal?: AbortSignal
): Promise<ProjectItem> {
  const [title, meta, desc, bullets] = await Promise.all([
    translateText(item.title, targetLang, { maxLen: CONTENT_LIMITS.work.title, signal }),
    translateText(item.meta, targetLang, { maxLen: CONTENT_LIMITS.work.company, signal }),
    translateText(item.desc, targetLang, { maxLen: CONTENT_LIMITS.work.summary, signal }),
    Promise.all(
      item.bullets.map((bullet) =>
        translateText(bullet, targetLang, { maxLen: CONTENT_LIMITS.work.bullet, signal })
      )
    ),
  ])

  return { ...item, title, meta, desc, bullets }
}

export async function translateBlogPost(
  post: LocalizedBlogPost,
  targetLang: TranslationTarget,
  signal?: AbortSignal
): Promise<LocalizedBlogPost> {
  const [title, summary, lead, tags, sections] = await Promise.all([
    translateText(post.title, targetLang, { maxLen: CONTENT_LIMITS.blog.title, signal }),
    translateText(post.summary, targetLang, { maxLen: CONTENT_LIMITS.blog.summary, signal }),
    translateText(post.content.lead, targetLang, { maxLen: CONTENT_LIMITS.blog.lead, signal }),
    Promise.all(post.tags.map((tag) => translateText(tag, targetLang, { maxLen: CONTENT_LIMITS.blog.tag, signal }))),
    Promise.all(
      post.content.sections.map(async (section): Promise<BlogSection> => ({
        ...section,
        heading: await translateText(section.heading, targetLang, {
          maxLen: CONTENT_LIMITS.blog.sectionHeading,
          signal,
        }),
        body: await Promise.all(
          section.body.map((paragraph) =>
            translateText(paragraph, targetLang, {
              maxLen: CONTENT_LIMITS.blog.sectionBodyPara,
              signal,
            })
          )
        ),
      }))
    ),
  ])

  return {
    ...post,
    title,
    summary,
    tags,
    content: { lead, sections },
  }
}

export async function translateEntireDict(
  sourceDict: TranslationDict,
  targetLang: TranslationTarget,
  onProgress?: (msg: string) => void,
  signal?: AbortSignal
): Promise<TranslationDict> {
  const jobs: { label: string; run: () => Promise<void> }[] = []
  const about = { ...sourceDict.about }
  const skills = { ...sourceDict.skills, categories: [...sourceDict.skills.categories] }
  const experience = { ...sourceDict.experience, items: [...sourceDict.experience.items] }
  const projects = { ...sourceDict.projects, items: [...sourceDict.projects.items] }
  const blog = { ...sourceDict.blog, posts: [...sourceDict.blog.posts] }

  // `about.languages` is a string[], so writing back through the generic key
  // widens the assignment type. Narrow to the string-valued fields instead.
  type AboutTextKey = {
    [K in keyof TranslationDict['about']]: TranslationDict['about'][K] extends string ? K : never
  }[keyof TranslationDict['about']]

  const addTextJob = (key: AboutTextKey, maxLen: number, style?: TextStyle) => {
    jobs.push({
      label: String(key),
      run: async () => {
        const value = about[key]
        about[key] = (await translateText(value, targetLang, {
          maxLen,
          style,
          signal,
        })) as (typeof about)[typeof key]
      },
    })
  }

  addTextJob('title', CONTENT_LIMITS.about.title, 'sentence')
  addTextJob('titleSub', CONTENT_LIMITS.about.titleSub, 'sentence')
  addTextJob('p1', CONTENT_LIMITS.about.p1, 'sentence')
  addTextJob('p2', CONTENT_LIMITS.about.p2, 'sentence')
  addTextJob('educationTitle', CONTENT_LIMITS.about.educationTitle, 'uppercase')
  addTextJob('edu1School', CONTENT_LIMITS.about.eduSchool, 'sentence')
  addTextJob('edu1Degree', CONTENT_LIMITS.about.eduDegree, 'uppercase')
  addTextJob('edu1Major', CONTENT_LIMITS.about.eduMajor, 'sentence')
  addTextJob('edu2School', CONTENT_LIMITS.about.eduSchool, 'sentence')
  addTextJob('edu2Degree', CONTENT_LIMITS.about.eduDegree, 'uppercase')
  addTextJob('edu2Major', CONTENT_LIMITS.about.eduMajor, 'sentence')

  jobs.push({
    label: 'skills',
    run: async () => {
      skills.title = await translateText(skills.title, targetLang, {
        maxLen: CONTENT_LIMITS.skills.title,
        style: 'sentence',
        signal,
      })
      skills.titleSub = await translateText(skills.titleSub, targetLang, {
        maxLen: CONTENT_LIMITS.skills.titleSub,
        style: 'sentence',
        signal,
      })
      await runWithConcurrency(skills.categories, MAX_CONCURRENT_REQUESTS, async (category, index) => {
        category.title = await translateText(category.title, targetLang, {
          maxLen: 30,
          style: 'uppercase',
          signal,
        })
        skills.categories[index] = category
      })
    },
  })

  jobs.push({
    label: 'experience',
    run: async () => {
      await runWithConcurrency(experience.items, MAX_CONCURRENT_REQUESTS, async (item, index) => {
        experience.items[index] = await translateExperienceItem(item, targetLang, signal)
      })
    },
  })

  jobs.push({
    label: 'projects',
    run: async () => {
      await runWithConcurrency(projects.items, MAX_CONCURRENT_REQUESTS, async (item, index) => {
        projects.items[index] = await translateProjectItem(item, targetLang, signal)
      })
    },
  })

  jobs.push({
    label: 'blog',
    run: async () => {
      await runWithConcurrency(blog.posts, MAX_CONCURRENT_REQUESTS, async (post, index) => {
        blog.posts[index] = await translateBlogPost(post, targetLang, signal)
      })
    },
  })

  let completed = 0
  await runWithConcurrency(jobs, 1, async (job) => {
    onProgress?.(`Đang dịch ${job.label} [${targetLang.toUpperCase()}]...`)
    await job.run()
    completed++
    onProgress?.(`Đã dịch ${completed}/${jobs.length} nhóm [${targetLang.toUpperCase()}]`)
  })

  return {
    ...sourceDict,
    about,
    skills,
    experience,
    projects,
    blog,
  }
}