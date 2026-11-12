import { useState } from 'react'
import type { TranslationDict } from '../../../data/translations'
import { GithubIcon, ChevronLeftIcon, ChevronRightIcon } from '../PreviewIcons'

interface PreviewWorkProps {
  t: TranslationDict
  activeSection?: string
}

export default function PreviewWork({ t, activeSection }: PreviewWorkProps) {
  const [workTab, setWorkTab] = useState<'experience' | 'projects'>('projects')
  const [activeExp, setActiveExp] = useState(0)
  const [activeProj, setActiveProj] = useState(0)

  const isExp =
    activeSection === 'experience'
      ? true
      : activeSection === 'projects'
      ? false
      : workTab === 'experience'

  const expItems = t.experience.items
  const projItems = t.projects.items
  const items = isExp ? expItems : projItems
  const N = Math.max(1, items.length)
  const currentActive = isExp ? activeExp : activeProj
  const realIndex = ((currentActive % N) + N) % N

  return (
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
            className={`px-3 py-1 font-mono text-xs tracking-wider transition-all cursor-pointer ${
              isExp ? 'bg-white text-black font-semibold' : 'text-white/50 hover:text-white'
            }`}
          >
            {t.nav.experience} ({expItems.length})
          </button>
          <button
            type="button"
            onClick={() => setWorkTab('projects')}
            className={`px-3 py-1 font-mono text-xs tracking-wider transition-all cursor-pointer ${
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
          onClick={() =>
            isExp
              ? setActiveExp((prev) => (prev - 1 + N) % N)
              : setActiveProj((prev) => (prev - 1 + N) % N)
          }
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 border border-white/20 bg-neutral-950 text-white flex items-center justify-center hover:border-emerald-400 cursor-pointer"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" />
        </button>

        {isExp ? (
          (() => {
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
                      <span
                        key={tech}
                        className="font-mono text-[10px] px-2 py-0.5 border border-white/15 text-white/75 bg-white/[0.03]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            )
          })()
        ) : (
          (() => {
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
                      <span
                        key={tech}
                        className="font-mono text-[10px] px-2 py-0.5 border border-white/15 text-white/75 bg-white/[0.03]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            )
          })()
        )}

        <button
          type="button"
          onClick={() =>
            isExp
              ? setActiveExp((prev) => (prev + 1) % N)
              : setActiveProj((prev) => (prev + 1) % N)
          }
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 border border-white/20 bg-neutral-950 text-white flex items-center justify-center hover:border-emerald-400 cursor-pointer"
        >
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  )
}

