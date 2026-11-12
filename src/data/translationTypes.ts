export type SupportedLang = 'en' | 'vi' | 'fr' | 'ja'

export interface ExperienceItem {
  role: string
  company: string
  period: string
  summary: string
  bullets: string[]
  tech: string[]
}

export interface ProjectItem {
  title: string
  meta: string
  period: string
  desc: string
  bullets: string[]
  tech: string[]
  repoUrl?: string
}

export interface SkillGroup {
  title: string
  gridClass: string
  skills: string[]
  fullWidth?: boolean
}

export interface LocalizedBlogPost {
  slug: string
  title: string
  date: string
  readTime: string
  summary: string
  tags: string[]
  content: {
    lead: string
    sections: {
      heading: string
      body: string[]
      code?: {
        language: string
        snippet: string
      }
    }[]
  }
}

export interface TranslationDict {
  label: string
  nav: {
    liveLab: string
    about: string
    experience: string
    projects: string
    skills: string
    blog: string
    contact: string
  }
  hero: {
    role: string
    desc: string
    getInTouch: string
    resume: string
    resumeUrl?: string
    resumeFileName?: string
  }
  server: {
    tag: string
    title: string
    titleSub: string
    desc: string
  }
  about: {
    tag: string
    title: string
    titleSub: string
    p1: string
    p2: string
    educationTitle: string
    languagesTitle: string
    edu1School: string
    edu1Degree: string
    edu1Major: string
    edu1Dates: string
    edu1Location: string
    edu2School: string
    edu2Degree: string
    edu2Major: string
    edu2Dates: string
    edu2Location: string
    languages: string[]
  }
  experience: {
    tag: string
    title: string
    titleSub: string
    desc?: string
    items: ExperienceItem[]
  }
  projects: {
    tag: string
    title: string
    titleSub: string
    desc?: string
    items: ProjectItem[]
  }
  skills: {
    tag: string
    title: string
    titleSub: string
    desc?: string
    categories: SkillGroup[]
  }
  blog: {
    tag: string
    title: string
    titleSub: string
    desc?: string
    readNote: string
    backToPortfolio: string
    modalNoteLabel: string
    modalClose: string
    modalOtherNotes: string
    modalReadInModal: string
    posts: LocalizedBlogPost[]
  }
  contact: {
    tag: string
    title: string
    titleSub: string
    desc: string
    emailLabel: string
    msgLabel: string
    sendBtn: string
    sendingBtn: string
    successMsg: string
    errorMsg: string
  }
  footer: {
    rights: string
    edition: string
  }
}
