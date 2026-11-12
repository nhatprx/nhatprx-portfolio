import { useState, useEffect, useRef } from 'react'
import type { TranslationDict, SupportedLang } from '../../data/translations'
import {
  DownloadIcon,
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from './PreviewIcons'

interface SitePreviewProps {
  dict: TranslationDict
  lang: SupportedLang
  activeSection?: string
}

const CURRENT_YEAR = new Date().getFullYear()

export default function SitePreview({ dict, lang, activeSection }: SitePreviewProps) {
  const [workTab, setWorkTab] = useState<'experience' | 'projects'>('projects')
  const [activeExp, setActiveExp] = useState(0)
  const [activeProj, setActiveProj] = useState(0)
  const [viewMode, setViewMode] = useState<'fit' | 'mobile'>('fit')
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll preview when activeSection changes in Admin
  useEffect(() => {
    if (!activeSection || !containerRef.current) return
    const mapTabToId: Record<string, string> = {
      hero: 'preview-about',
      about: 'preview-about',
      skills: 'preview-skills',
      experience: 'preview-work',
      projects: 'preview-work',
      blog: 'preview-blog',
      contact: 'preview-contact',
    }
    const targetId = mapTabToId[activeSection]
    if (targetId) {
      const el = containerRef.current.querySelector(`#${targetId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [activeSection])

  const t = dict
  const isExp = activeSection === 'experience' ? true : activeSection === 'projects' ? false : workTab === 'experience'
  const expItems = t.experience.items
  const projItems = t.projects.items
  const items = isExp ? expItems : projItems
  const N = Math.max(1, items.length)
  const currentActive = isExp ? activeExp : activeProj
  const realIndex = ((currentActive % N) + N) % N

  return (
    <div className="h-full flex flex-col bg-black border-l border-white/10 select-none overflow-hidden font-sans">
      {/* Preview Sub-Header */}
      <div className="px-4 py-2 bg-neutral-950/90 border-b border-white/10 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-widest text-[11px] uppercase">
            LIVE PREVIEW
          </span>
          <span className="text-[9px] text-white/40 px-1.5 py-0.5 border border-white/10 font-bold uppercase">
            {lang}
          </span>
        </div>

        <div className="flex items-center gap-1.5 border border-white/15 p-0.5 bg-white/[0.02]">
          <button
            type="button"
            onClick={() => setViewMode('fit')}
            className={`px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider transition-colors ${
              viewMode === 'fit' ? 'bg-white text-black font-bold' : 'text-white/40 hover:text-white'
            }`}
          >
            DESKTOP
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider transition-colors ${
              viewMode === 'mobile' ? 'bg-white text-black font-bold' : 'text-white/40 hover:text-white'
            }`}
          >
            PHONE (390PX)
          </button>
        </div>
      </div>

      {/* Preview Scroll Container */}
      <div
        ref={containerRef}
        data-lenis-prevent
        className="flex-1 overflow-y-auto overscroll-contain admin-scroll bg-black text-white p-4 sm:p-6 lg:p-8 flex justify-center"
      >
        <div
          className={`w-full transition-all duration-300 flex flex-col gap-16 ${
            viewMode === 'mobile'
              ? 'max-w-[390px] border border-white/20 p-4 rounded-xl shadow-2xl bg-black'
              : 'max-w-2xl'
          }`}
        >
          {/* ========== 00 - HEADER SLAB ========== */}
          <div className="w-full px-5 py-4 bg-black/90 backdrop-blur-xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold tracking-tight text-white">
                nhatprx <span className="text-white/30">.</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/20 px-2 py-0.5 bg-emerald-500/5">
                ● AVAILABLE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-white/50 border border-white/15 px-2 py-1">
                {t.hero.resume}
              </span>
              <span className="font-mono text-[10px] text-white/80 font-bold border border-white/20 px-2 py-1 uppercase">
                {lang}
              </span>
            </div>
          </div>

          {/* ========== 01 - HERO & ABOUT ========== */}
          <section id="preview-about" className="flex flex-col gap-6 text-left pt-2">
            <div>
              <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
                {t.hero.role}
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[0.98]">
                nhatprx <span className="text-white/25">.</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2.5 mt-5">
                <span className="px-5 py-2.5 bg-white text-black font-mono text-xs font-bold tracking-wider">
                  {t.hero.getInTouch} →
                </span>
                <span className="px-4 py-2.5 border border-white/20 text-white font-mono text-xs font-semibold flex items-center gap-1">
                  <DownloadIcon className="w-3.5 h-3.5 text-white/60" />
                  <span>{t.hero.resume}</span>
                </span>
              </div>
            </div>

            <div>
              <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
                {t.about.tag}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-white">
                {t.about.title} <span className="text-white/30">{t.about.titleSub}</span>
              </h2>
              <div className="text-xs sm:text-sm text-white/70 leading-relaxed text-justify [text-justify:inter-word]">
                <p>{t.about.p1}</p>
              </div>
            </div>

            {/* Education Cards */}
            <div>
              <h3 className="font-mono text-[10px] tracking-[0.25em] text-white/40 mb-2.5 uppercase">
                {t.about.educationTitle}
              </h3>
              <div className={`grid grid-cols-1 ${t.about.edu2School?.trim() ? 'sm:grid-cols-2' : ''} gap-3`}>
                <div className="border border-white/10 p-3 bg-white/[0.015] flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white tracking-wide truncate">
                      {t.about.edu1School}
                    </span>
                    <span className="font-mono text-[10px] text-white/35 shrink-0">
                      {t.about.edu1Location || t.about.edu1Dates}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 font-mono text-[11px] min-w-0">
                    <span className="text-emerald-400 font-semibold tracking-wider uppercase shrink-0 text-[10px]">
                      {t.about.edu1Degree}
                    </span>
                    <span className="text-white/20 shrink-0">/</span>
                    <span className="text-white/50 truncate text-[10.5px]">
                      {t.about.edu1Major}
                    </span>
                  </div>
                </div>

                {t.about.edu2School?.trim() && (
                  <div className="border border-white/10 p-3 bg-white/[0.015] flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white tracking-wide truncate">
                        {t.about.edu2School}
                      </span>
                      <span className="font-mono text-[10px] text-white/35 shrink-0">
                        {t.about.edu2Location || t.about.edu2Dates}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 font-mono text-[11px] min-w-0">
                      <span className="text-emerald-400 font-semibold tracking-wider uppercase shrink-0 text-[10px]">
                        {t.about.edu2Degree}
                      </span>
                      <span className="text-white/20 shrink-0">/</span>
                      <span className="text-white/50 truncate text-[10.5px]">
                        {t.about.edu2Major}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ========== 02 - TECHNICAL STACK ========== */}
          <section id="preview-skills" className="flex flex-col gap-4 text-left border-t border-white/10 pt-8">
            <div>
              <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
                {t.skills.tag}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-white">
                {t.skills.title} <span className="text-white/30">{t.skills.titleSub}</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {t.skills.categories.map((group, idx) => {
                const isFullWidth = Boolean(group.fullWidth)
                return (
                  <div
                    key={group.title}
                    className={`p-3.5 border border-white/10 bg-white/[0.02] flex flex-col justify-between ${
                      isFullWidth ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
                        <h3 className="font-mono text-[11px] tracking-wider text-white font-semibold uppercase">
                          {group.title}
                        </h3>
                        <span className="font-mono text-[10px] text-emerald-400">0{idx + 1}</span>
                      </div>
                      <div className={group.gridClass}>
                        {group.skills.map((s) => (
                          <span
                            key={s}
                            className="font-mono text-[10px] px-2 py-1.5 border border-white/15 bg-white/[0.03] text-white/85 text-center flex items-center justify-center"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ========== 03 - WORK (EXPERIENCE & PROJECTS) ========== */}
          <section id="preview-work" className="flex flex-col gap-4 text-left border-t border-white/10 pt-8">
            <div>
              <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
                {isExp ? t.experience.tag : t.projects.tag}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-white">
                {isExp ? t.experience.title : t.projects.title}{' '}
                <span className="text-white/30">{isExp ? t.experience.titleSub : t.projects.titleSub}</span>
              </h2>
            </div>

            {/* Tab switchers */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex p-1 border border-white/15 bg-white/[0.03]">
                <button
                  type="button"
                  onClick={() => setWorkTab('experience')}
                  className={`px-3 py-1 font-mono text-xs tracking-wider transition-all ${
                    isExp ? 'bg-white text-black font-semibold' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {t.nav.experience} ({expItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setWorkTab('projects')}
                  className={`px-3 py-1 font-mono text-xs tracking-wider transition-all ${
                    !isExp ? 'bg-white text-black font-semibold' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {t.nav.projects} ({projItems.length})
                </button>
              </div>
              <span className="font-mono text-xs text-white/50">
                0{realIndex + 1} / 0{N}
              </span>
            </div>

            {/* Active Card */}
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => (isExp ? setActiveExp((prev) => (prev - 1 + N) % N) : setActiveProj((prev) => (prev - 1 + N) % N))}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 border border-white/20 bg-neutral-950 text-white flex items-center justify-center hover:border-emerald-400"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
              </button>

              {isExp ? (() => {
                const exp = expItems[realIndex] || expItems[0]
                if (!exp) return null
                return (
                  <article className="border border-white/15 bg-white/[0.025] p-5 flex flex-col justify-between min-h-[340px]">
                    <div>
                      <div className="flex items-baseline justify-between gap-1 mb-1">
                        <h3 className="text-base font-bold text-white tracking-tight">{exp.role}</h3>
                        <span className="font-mono text-xs text-white/45">{exp.period}</span>
                      </div>
                      <p className="font-mono text-xs text-emerald-400 font-medium mb-3">{exp.company}</p>
                      <p className="text-xs text-white/80 leading-relaxed mb-3">{exp.summary}</p>
                      <ul className="space-y-1.5 text-xs text-white/70 leading-relaxed">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2">
                            <span className="text-emerald-400 shrink-0">▸</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {exp.tech && exp.tech.length > 0 && (
                      <div className="pt-3 border-t border-white/10 flex flex-wrap gap-1.5 mt-3">
                        {exp.tech.map((tech) => (
                          <span key={tech} className="font-mono text-[10px] px-2 py-0.5 border border-white/15 text-white/75 bg-white/[0.03]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                )
              })() : (() => {
                const proj = projItems[realIndex] || projItems[0]
                if (!proj) return null
                return (
                  <article className="border border-white/15 bg-white/[0.025] p-5 flex flex-col justify-between min-h-[340px]">
                    <div>
                      <div className="flex items-baseline justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white tracking-tight">{proj.title}</h3>
                          {proj.repoUrl && <GithubIcon className="w-3 h-3 text-white/40" />}
                        </div>
                        <span className="font-mono text-xs text-white/45">{proj.period}</span>
                      </div>
                      <p className="font-mono text-xs text-emerald-400 font-medium mb-3">{proj.meta}</p>
                      <p className="text-xs text-white/80 leading-relaxed mb-3">{proj.desc}</p>
                      <ul className="space-y-1.5 text-xs text-white/70 leading-relaxed">
                        {proj.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2">
                            <span className="text-emerald-400 shrink-0">▸</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {proj.tech && proj.tech.length > 0 && (
                      <div className="pt-3 border-t border-white/10 flex flex-wrap gap-1.5 mt-3">
                        {proj.tech.map((tech) => (
                          <span key={tech} className="font-mono text-[10px] px-2 py-0.5 border border-white/15 text-white/75 bg-white/[0.03]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                )
              })()}

              <button
                type="button"
                onClick={() => (isExp ? setActiveExp((prev) => (prev + 1) % N) : setActiveProj((prev) => (prev + 1) % N))}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 border border-white/20 bg-neutral-950 text-white flex items-center justify-center hover:border-emerald-400"
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          {/* ========== 04 - BLOG NOTES ========== */}
          <section id="preview-blog" className="flex flex-col gap-4 text-left border-t border-white/10 pt-8">
            <div>
              <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
                {t.blog.tag}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-white">
                {t.blog.title} <span className="text-white/30">{t.blog.titleSub}</span>
              </h2>
            </div>

            <div className="space-y-2.5">
              {t.blog.posts.slice(0, 3).map((post) => (
                <article
                  key={post.slug}
                  className="border border-white/10 p-3.5 bg-white/[0.015] hover:border-white/25 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1 font-mono text-[10px] text-white/40">
                    <span>{post.date}</span>
                    <span className="text-emerald-400/80">{post.readTime}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight mb-1 truncate line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-[11px] text-white/60 leading-relaxed mb-2 truncate line-clamp-1">
                    {post.summary}
                  </p>
                  <div className="flex items-center justify-end pt-1.5 border-t border-white/10">
                    <span className="font-mono text-[10px] text-emerald-400">
                      {t.blog.readNote} →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ========== 05 - CONTACT ========== */}
          <section id="preview-contact" className="flex flex-col gap-4 text-left border-t border-white/10 pt-8 pb-6">
            <div>
              <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
                {t.contact.tag}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-white">
                {t.contact.title} <span className="text-white/30">{t.contact.titleSub}</span>
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                {t.contact.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 border border-white/10 bg-white/[0.015] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-white/40 uppercase">EMAIL</span>
                  <MailIcon className="w-3.5 h-3.5 text-white/40" />
                </div>
                <p className="font-mono text-xs text-white truncate">nhatprx@gmail.com</p>
              </div>
              <div className="p-3.5 border border-white/10 bg-white/[0.015] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-white/40 uppercase">LINKEDIN</span>
                  <LinkedinIcon className="w-3.5 h-3.5 text-white/40" />
                </div>
                <p className="font-mono text-xs text-white truncate">linkedin.com/in/nhatprx</p>
              </div>
            </div>

            <div className="p-3 border border-white/10 bg-white/[0.02] flex items-center justify-between font-mono text-[11px]">
              <span className="text-white/40 uppercase text-[9.5px]">CURRENT AVAILABILITY</span>
              <span className="text-emerald-400 flex items-center gap-1.5 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ho Chi Minh City, Vietnam
              </span>
            </div>

            <footer className="pt-4 border-t border-white/5 text-[10px] font-mono text-white/30 text-center">
              &copy; {CURRENT_YEAR} nhatprx. {t.footer.rights}
            </footer>
          </section>
        </div>
      </div>
    </div>
  )
}
