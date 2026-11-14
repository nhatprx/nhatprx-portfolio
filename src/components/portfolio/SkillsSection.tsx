import { useRef, useState, useEffect } from 'react'
import { ensureDot, type TranslationDict } from '../../data/translations'

interface SkillsSectionProps {
  t: TranslationDict
}

export default function SkillsSection({ t }: SkillsSectionProps) {
  const skillsTitleRef = useRef<HTMLHeadingElement>(null)
  const [skillsTitleWidth, setSkillsTitleWidth] = useState<number | null>(null)

  useEffect(() => {
    function measureTitle() {
      if (skillsTitleRef.current) setSkillsTitleWidth(skillsTitleRef.current.offsetWidth)
    }
    measureTitle()
    window.addEventListener('resize', measureTitle)
    return () => window.removeEventListener('resize', measureTitle)
  }, [t.skills.title, t.skills.titleSub])

  return (
    <section
      id="skills"
      className="relative pt-20 sm:pt-24 lg:pt-24 pb-20 sm:pb-24 lg:pb-24 px-5 sm:px-10 lg:px-14 flex flex-col scroll-mt-28 sm:scroll-mt-32"
    >
      <div id="tech-stack" className="absolute -top-28 sm:-top-32" />

      <div className="w-full text-left story-reveal">
        <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
          {t.skills.tag}
        </p>
        <h2
          ref={skillsTitleRef}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 text-white w-fit inline-flex flex-wrap items-baseline gap-x-2.5 sm:gap-x-3.5"
        >
          <span>{t.skills.title?.trim()}</span>
          <span className="text-white/30">{ensureDot(t.skills.titleSub?.trim())}</span>
        </h2>

        {t.skills.desc && (
          <div
            style={{
              width: skillsTitleWidth ? `${skillsTitleWidth}px` : undefined,
              maxWidth: '100%',
            }}
            className="mb-8 text-sm text-white/70 leading-relaxed text-justify [text-justify:inter-word]"
          >
            <p>{t.skills.desc}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 story-reveal story-delay-1">
          {t.skills.categories.map((group, idx) => {
            const isFullWidth = Boolean(group.fullWidth)

            return (
              <div
                key={`skill-cat-${idx}`}
                className={`p-4 sm:p-5 border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all flex flex-col justify-between ${
                  isFullWidth ? 'sm:col-span-2' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-white/10">
                    <h3 className="font-mono text-xs tracking-wider text-white font-semibold uppercase">
                      {group.title}
                    </h3>
                    <span className="font-mono text-[10px] text-emerald-400 font-medium">
                      0{idx + 1}
                    </span>
                  </div>

                  <div className={group.gridClass}>
                    {group.skills.map((s, sIdx) => (
                      <span
                        key={`skill-tag-${idx}-${sIdx}-${s}`}
                        className="font-mono text-[11px] sm:text-xs px-2.5 sm:px-3 py-2 border border-white/15 bg-white/[0.03] text-white/85 hover:border-emerald-400/40 hover:text-emerald-400 transition-colors flex items-center justify-center text-center"
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
      </div>
    </section>
  )
}
