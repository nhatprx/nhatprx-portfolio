import { useRef, useState, useEffect } from 'react'
import { ensureDot, type TranslationDict } from '../../data/translations'
import { GithubIcon, ChevronLeftIcon, ChevronRightIcon } from '../Icons'

interface WorkSectionProps {
  t: TranslationDict
  workTab: 'experience' | 'projects'
  setWorkTab: (tab: 'experience' | 'projects') => void
  activeExp: number
  setActiveExp: (fn: ((prev: number) => number) | number) => void
  activeProj: number
  setActiveProj: (fn: ((prev: number) => number) | number) => void
}

export default function WorkSection({
  t,
  workTab,
  setWorkTab,
  activeExp,
  setActiveExp,
  activeProj,
  setActiveProj,
}: WorkSectionProps) {
  const isExp = workTab === 'experience'
  const expItems = t.experience.items
  const projItems = t.projects.items
  const items = isExp ? expItems : projItems
  const N = Math.max(1, items.length)
  const currentActive = isExp ? activeExp : activeProj
  const setCurrentActive = isExp ? setActiveExp : setActiveProj
  const realIndex = ((currentActive % N) + N) % N

  const workTitleRef = useRef<HTMLHeadingElement>(null)
  const [workTitleWidth, setWorkTitleWidth] = useState<number | null>(null)

  useEffect(() => {
    function measureTitle() {
      if (workTitleRef.current) setWorkTitleWidth(workTitleRef.current.offsetWidth)
    }
    measureTitle()
    window.addEventListener('resize', measureTitle)
    return () => window.removeEventListener('resize', measureTitle)
  }, [t.experience.title, t.projects.title, workTab])

  return (
    <section
      id="work"
      className="relative pt-20 sm:pt-24 lg:pt-24 pb-20 sm:pb-24 lg:pb-24 px-6 sm:px-10 lg:px-14 flex flex-col scroll-mt-28 sm:scroll-mt-32"
    >
      <div id="experience" className="absolute -top-28 sm:-top-32" />
      <div id="projects" className="absolute -top-28 sm:-top-32" />

      <div className="w-full text-left story-reveal">
        <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
          {isExp ? t.experience.tag : t.projects.tag}
        </p>
        <h2
          ref={workTitleRef}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-white w-fit inline-flex flex-wrap items-baseline gap-x-2.5 sm:gap-x-3.5"
        >
          <span>{(isExp ? t.experience.title : t.projects.title)?.trim()}</span>
          <span className="text-white/30">
            {ensureDot((isExp ? t.experience.titleSub : t.projects.titleSub)?.trim())}
          </span>
        </h2>
        <p
          key={workTab}
          style={{
            width: workTitleWidth ? `${workTitleWidth}px` : undefined,
            maxWidth: '100%',
          }}
          className="text-sm text-white/65 leading-relaxed mb-6 text-justify [text-justify:inter-word] animate-card-switch"
        >
          {isExp ? t.experience.desc : t.projects.desc}
        </p>

        {/* Section Switcher Tabs & Counter */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="inline-flex p-1 border border-white/15 bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setWorkTab('experience')}
              className={`px-3.5 py-1.5 font-mono text-xs tracking-wider transition-all cursor-pointer ${
                isExp
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {t.nav.experience} ({expItems.length})
            </button>
            <button
              type="button"
              onClick={() => setWorkTab('projects')}
              className={`px-3.5 py-1.5 font-mono text-xs tracking-wider transition-all cursor-pointer ${
                !isExp
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {t.nav.projects} ({projItems.length})
            </button>
          </div>

          <span className="font-mono text-xs text-white/50">
            0{realIndex + 1} / 0{N}
          </span>
        </div>

        {/* Card Display with Side Switch Buttons */}
        <div className="relative w-full story-reveal story-delay-1">
          <button
            type="button"
            onClick={() => setCurrentActive((realIndex - 1 + N) % N)}
            aria-label="Previous card"
            className="absolute -left-3 sm:-left-4.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 border border-white/20 bg-neutral-950/95 hover:border-emerald-400 hover:bg-emerald-950/50 text-white/70 hover:text-emerald-300 transition-all flex items-center justify-center cursor-pointer shadow-lg hover:shadow-[0_0_12px_rgba(52,211,153,0.3)] active:scale-95 group"
          >
            <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </button>

          {isExp ? (
            (() => {
              const exp = expItems[realIndex] || expItems[0]
              if (!exp) {
                return (
                  <div className="border border-white/15 bg-white/[0.025] p-6 text-center text-xs text-white/40 h-[200px] flex items-center justify-center font-mono">
                    No experience records found.
                  </div>
                )
              }
              const maxTags = 5
              const visibleTech = exp.tech ? exp.tech.slice(0, maxTags) : []
              const remainingCount = exp.tech ? exp.tech.length - maxTags : 0

              return (
                <article
                  key={`exp-${realIndex}`}
                  className="border border-white/15 bg-white/[0.025] p-5 sm:p-6 transition-all duration-200 h-[390px] sm:h-[405px] flex flex-col justify-between animate-card-switch"
                >
                  <div className="overflow-y-auto pr-1 min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {exp.role}
                      </h3>
                      <span className="font-mono text-xs sm:text-sm text-white/45 shrink-0">
                        {exp.period}
                      </span>
                    </div>

                    <p className="font-mono text-xs sm:text-sm text-emerald-400 font-medium mb-3">
                      {exp.company}
                    </p>

                    <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-4">
                      {exp.summary}
                    </p>

                    <ul className="space-y-2 text-sm sm:text-[14px] text-white/70 leading-relaxed mb-4">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5">
                          <span className="text-emerald-400 mt-0.5 shrink-0 text-xs">▸</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {exp.tech && exp.tech.length > 0 && (
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5 shrink-0 mt-3">
                      {visibleTech.map((tech) => (
                        <span
                          key={tech}
                          className="font-mono text-xs px-2.5 py-1 border border-white/15 text-white/75 bg-white/[0.03]"
                        >
                          {tech}
                        </span>
                      ))}
                      {remainingCount > 0 && (
                        <span
                          className="font-mono text-[11px] px-2 py-0.5 border border-white/10 text-white/40 bg-white/[0.01]"
                          title={exp.tech.slice(maxTags).join(', ')}
                        >
                          +{remainingCount}
                        </span>
                      )}
                    </div>
                  )}
                </article>
              )
            })()
          ) : (
            (() => {
              const proj = projItems[realIndex] || projItems[0]
              if (!proj) {
                return (
                  <div className="border border-white/15 bg-white/[0.025] p-6 text-center text-xs text-white/40 h-[200px] flex items-center justify-center font-mono">
                    No project records found.
                  </div>
                )
              }
              const maxTags = 5
              const visibleTech = proj.tech ? proj.tech.slice(0, maxTags) : []
              const remainingCount = proj.tech ? proj.tech.length - maxTags : 0

              return (
                <article
                  key={`proj-${realIndex}`}
                  className="border border-white/15 bg-white/[0.025] p-5 sm:p-6 transition-all duration-200 h-[390px] sm:h-[405px] flex flex-col justify-between animate-card-switch"
                >
                  <div className="overflow-y-auto pr-1 min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {proj.title}
                        </h3>
                        {proj.repoUrl && (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View source code for ${proj.title}`}
                            className="p-1 border border-white/10 text-white/40 hover:text-white transition-colors"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <span className="font-mono text-xs sm:text-sm text-white/45 shrink-0">
                        {proj.period}
                      </span>
                    </div>

                    <p className="font-mono text-xs sm:text-sm text-emerald-400 font-medium mb-3">
                      {proj.meta}
                    </p>

                    <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-4">
                      {proj.desc}
                    </p>

                    <ul className="space-y-2 text-sm sm:text-[14px] text-white/70 leading-relaxed mb-4">
                      {proj.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5">
                          <span className="text-emerald-400 mt-0.5 shrink-0 text-xs">▸</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {proj.tech && proj.tech.length > 0 && (
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5 shrink-0 mt-3">
                      {visibleTech.map((tech) => (
                        <span
                          key={tech}
                          className="font-mono text-xs px-2.5 py-1 border border-white/15 text-white/75 bg-white/[0.03]"
                        >
                          {tech}
                        </span>
                      ))}
                      {remainingCount > 0 && (
                        <span
                          className="font-mono text-[11px] px-2 py-0.5 border border-white/10 text-white/40 bg-white/[0.01]"
                          title={proj.tech.slice(maxTags).join(', ')}
                        >
                          +{remainingCount}
                        </span>
                      )}
                    </div>
                  )}
                </article>
              )
            })()
          )}

          <button
            type="button"
            onClick={() => setCurrentActive((realIndex + 1) % N)}
            aria-label="Next card"
            className="absolute -right-3 sm:-right-4.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 border border-white/20 bg-neutral-950/95 hover:border-emerald-400 hover:bg-emerald-950/50 text-white/70 hover:text-emerald-300 transition-all flex items-center justify-center cursor-pointer shadow-lg hover:shadow-[0_0_12px_rgba(52,211,153,0.3)] active:scale-95 group"
          >
            <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
