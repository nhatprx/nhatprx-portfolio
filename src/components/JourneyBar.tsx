import type { TranslationDict } from '../data/translations'
import { ArrowUpIcon } from './Icons'

interface JourneyBarProps {
  t: TranslationDict
  showTopBtn: boolean
  activeSection: string
  workTab: 'experience' | 'projects'
  scrollProgress: number
  onScrollTo: (target: string | number) => void
}

export default function JourneyBar({
  t,
  showTopBtn,
  activeSection,
  workTab,
  scrollProgress,
  onScrollTo,
}: JourneyBarProps) {
  const steps = [
    { id: 'about', num: '01', label: t.nav.about },
    { id: 'skills', num: '02', label: t.nav.skills },
    { id: 'work', num: '03', label: workTab === 'experience' ? t.nav.experience : t.nav.projects },
    { id: 'blog', num: '04', label: t.nav.blog },
    { id: 'contact', num: '05', label: t.nav.contact },
  ]

  return (
    <div
      className={`fixed bottom-4 sm:bottom-6 right-0 w-full xl:w-1/2 pr-3 sm:pr-10 xl:pr-14 pl-3 sm:pl-10 xl:pl-4 2xl:pl-8 z-40 flex items-center gap-2 transition-all duration-300 pointer-events-none ${
        showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      {/* Journey Bar */}
      <nav
        aria-label="Story Journey Navigation"
        className="flex-1 min-w-0 h-10 sm:h-11 pointer-events-auto p-1 bg-black/90 border border-white/20 shadow-2xl backdrop-blur-md flex items-center justify-between gap-1 font-mono select-none"
      >
        <div className="flex-1 grid grid-cols-5 gap-1 min-w-0 h-full">
          {steps.map((step) => {
            const isActive = activeSection === step.id
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onScrollTo(`#${step.id}`)}
                className={`h-full px-0.5 sm:px-1 border transition-all cursor-pointer flex items-center justify-center text-xs truncate ${
                  isActive
                    ? 'border-emerald-400/80 bg-emerald-400/15 text-emerald-300 font-semibold shadow-[0_0_10px_rgba(52,211,153,0.15)]'
                    : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                }`}
                title={`Jump to ${step.label}`}
              >
                <span
                  className={`text-[9px] sm:text-[10px] font-bold ${
                    isActive ? 'text-emerald-300' : 'text-emerald-400/80'
                  } mr-0.5 sm:mr-1 shrink-0`}
                >
                  {step.num}
                </span>
                <span className="hidden sm:inline text-[10px] xl:text-[10.5px] tracking-wider uppercase truncate">
                  {step.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="h-4 w-[1px] bg-white/15 mx-1.5 shrink-0 hidden md:block" aria-hidden="true" />

        <span className="w-12 text-right pr-2 text-[10.5px] text-emerald-400 font-mono font-bold tracking-wider shrink-0 hidden md:inline-block tabular-nums">
          {scrollProgress}%
        </span>
      </nav>

      {/* Move on Top Button */}
      <button
        type="button"
        onClick={() => onScrollTo(0)}
        aria-label="Back to top"
        title="Back to top"
        className="pointer-events-auto h-10 w-10 sm:h-11 sm:w-11 bg-black/90 border border-white/20 text-white/70 hover:text-white hover:border-white transition-all shadow-2xl backdrop-blur-md cursor-pointer flex items-center justify-center shrink-0"
      >
        <ArrowUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  )
}

