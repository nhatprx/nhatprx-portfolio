import { useRef, useState, useEffect } from 'react'
import type { TranslationDict } from '../../data/translations'
import Ec2Terminal from '../Ec2Terminal'
import ServerTelemetry from '../ServerTelemetry'
import { DownloadIcon } from '../Icons'

function ensureDot(str?: string): string {
  if (!str) return ''
  const trimmed = str.trim()
  if (!trimmed) return ''
  if (trimmed.endsWith('.') || trimmed.endsWith('。')) return trimmed
  return `${trimmed}.`
}

function toTitleCase(str?: string): string {
  if (!str) return ''
  return str.replace(/\b([a-z])/g, (char) => char.toUpperCase())
}

interface HeroAboutSectionProps {
  t: TranslationDict
  showTerminalInMobile: boolean
  onAnchorClick: (e: React.MouseEvent, target: string) => void
}

export default function HeroAboutSection({
  t,
  showTerminalInMobile,
  onAnchorClick,
}: HeroAboutSectionProps) {
  const aboutTitleRef = useRef<HTMLHeadingElement>(null)
  const [aboutTitleWidth, setAboutTitleWidth] = useState<number | null>(null)

  useEffect(() => {
    function measureTitle() {
      if (aboutTitleRef.current) setAboutTitleWidth(aboutTitleRef.current.offsetWidth)
    }
    measureTitle()
    window.addEventListener('resize', measureTitle)
    return () => window.removeEventListener('resize', measureTitle)
  }, [t.about.title, t.about.titleSub])

  return (
    <section
      id="about"
      className="relative pt-36 pb-20 sm:pt-40 sm:pb-24 lg:pt-36 lg:pb-20 lg:min-h-screen px-6 sm:px-10 lg:px-14 flex flex-col justify-end text-left scroll-mt-28 sm:scroll-mt-32"
    >
      <div id="hero" className="absolute top-0" />

      <div className="w-full flex-1 flex flex-col justify-end gap-6 sm:gap-7">
        {/* Block 1: Hero Content */}
        <div>
          <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
            {t.hero.role}
          </p>

          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[0.98]">
            nhatprx <span className="text-white/25">.</span>
          </h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6 sm:mt-7">
            <a
              href="#contact"
              onClick={(e) => onAnchorClick(e, '#contact')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-mono text-xs font-bold tracking-wider hover:bg-white/85 transition-all shadow-[0_0_25px_rgba(255,255,255,0.12)] cursor-pointer"
            >
              {t.hero.getInTouch}
              <span aria-hidden="true">→</span>
            </a>
            <a
              href={t.hero.resumeUrl || '/%5Bnhatprx%5D%20PERSONAL%20RESUME.pdf'}
              download={t.hero.resumeFileName || '[nhatprx] PERSONAL RESUME.pdf'}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-white/20 text-white font-mono text-xs font-semibold tracking-wider hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer"
            >
              <DownloadIcon className="w-3.5 h-3.5 text-white/60" />
              {t.hero.resume}
            </a>
          </div>

          {/* Mobile-only Terminal & Telemetry */}
          {showTerminalInMobile && (
            <div className="lg:hidden mt-8 mb-4 w-full space-y-3">
              <div className="hidden md:block h-[360px] w-full shadow-xl">
                <Ec2Terminal />
              </div>
              <div className="w-full shadow-xl">
                <ServerTelemetry />
              </div>
            </div>
          )}
        </div>

        {/* Block 2: About Narrative */}
        <div className="story-reveal">
          <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
            {t.about.tag}
          </p>
          <h2
            ref={aboutTitleRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-white w-fit inline-flex flex-wrap items-baseline gap-x-2.5 sm:gap-x-3.5"
          >
            <span>{t.about.title?.trim()}</span>
            <span className="text-white/30">{ensureDot(t.about.titleSub?.trim())}</span>
          </h2>

          <div
            style={{
              width: aboutTitleWidth ? `${aboutTitleWidth}px` : undefined,
              maxWidth: '100%',
            }}
            className="text-sm text-white/70 leading-relaxed text-justify [text-justify:inter-word]"
          >
            <p>{t.about.p1}</p>
          </div>
        </div>

        {/* Block 3: Education Cards */}
        <div className="story-reveal story-delay-1 mb-0">
          <h3 className="font-mono text-[10px] tracking-[0.25em] text-white/40 mb-2.5 sm:mb-3 uppercase">
            {t.about.educationTitle}
          </h3>
          <div
            className={`grid grid-cols-1 ${
              t.about.edu2School?.trim() ? 'sm:grid-cols-2' : ''
            } gap-3`}
          >
            <div className="border border-white/10 p-3 sm:p-3.5 bg-white/[0.015] hover:border-white/25 hover:bg-white/[0.03] transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                  {toTitleCase(t.about.edu1School)}
                </div>
                <span className="font-mono text-[10px] text-white/35 shrink-0">
                  {toTitleCase(t.about.edu1Location || t.about.edu1Dates)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-2 font-mono text-[11px] min-w-0">
                <span className="text-emerald-400 font-semibold tracking-wider uppercase shrink-0 text-[10px]">
                  {t.about.edu1Degree?.toUpperCase()}
                </span>
                <span className="text-white/20 shrink-0" aria-hidden="true">
                  /
                </span>
                <span className="text-white/50 truncate text-[10.5px]">
                  {toTitleCase(t.about.edu1Major)}
                </span>
              </div>
            </div>

            {t.about.edu2School?.trim() && (
              <div className="border border-white/10 p-3 sm:p-3.5 bg-white/[0.015] hover:border-white/25 hover:bg-white/[0.03] transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                    {toTitleCase(t.about.edu2School)}
                  </div>
                  <span className="font-mono text-[10px] text-white/35 shrink-0">
                    {toTitleCase(t.about.edu2Location || t.about.edu2Dates)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-2 font-mono text-[11px] min-w-0">
                  <span className="text-emerald-400 font-semibold tracking-wider uppercase shrink-0 text-[10px]">
                    {t.about.edu2Degree?.toUpperCase()}
                  </span>
                  <span className="text-white/20 shrink-0" aria-hidden="true">
                    /
                  </span>
                  <span className="text-white/50 truncate text-[10.5px]">
                    {toTitleCase(t.about.edu2Major)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
