import { useState, useRef, useEffect } from 'react'
import type { TranslationDict, SupportedLang } from '../data/translations'
import { DownloadIcon, GithubIcon, LinkedinIcon, MailIcon } from './Icons'

const LANG_OPTIONS: { code: SupportedLang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'vi', label: 'Tiếng Việt', short: 'VI' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'ja', label: '日本語', short: 'JA' },
]

interface SiteHeaderProps {
  t: TranslationDict
  lang: SupportedLang
  scrolledHeaderActions?: boolean
  onScrollToTop?: () => void
  onScrollToContact?: () => void
  onLangChange?: (newLang: SupportedLang) => void
  className?: string
  isAnimated?: boolean
}

export default function SiteHeader({
  t,
  lang,
  scrolledHeaderActions = false,
  onScrollToTop,
  onScrollToContact,
  onLangChange,
  className = '',
  isAnimated = true,
}: SiteHeaderProps) {
  const [langOpen, setLangOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header
      className={`w-full pointer-events-auto px-5 sm:px-8 py-4 sm:py-5 bg-black/95 backdrop-blur-xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex items-center justify-between transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      } ${className}`}
    >
      <button
        type="button"
        onClick={onScrollToTop}
        className="text-left group cursor-pointer min-w-0 shrink"
        aria-label="Scroll to top"
      >
        <p className="font-mono text-[8.5px] sm:text-[9px] tracking-[0.25em] text-emerald-400 uppercase font-medium mb-0.5 truncate">
          {t.hero.role}
        </p>
        <h2 className="font-sans text-lg xs:text-xl sm:text-2xl font-bold tracking-tight text-white leading-none truncate">
          {t.identity.displayName} <span className="text-white/25">.</span>
        </h2>
      </button>

      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Scroll-activated Quick CTA Buttons with 2-way Slide & Fade Transition */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 transition-all duration-500 ease-out overflow-hidden ${
            scrolledHeaderActions
              ? 'opacity-100 max-w-[min(360px,45vw)] p-0.5 translate-x-0 pointer-events-auto'
              : 'opacity-0 max-w-0 p-0 translate-x-3 pointer-events-none'
          }`}
        >
          {/* GET IN TOUCH: Full button on xs+, icon-only on mobile */}
          <a
            href="#contact"
            tabIndex={scrolledHeaderActions ? 0 : -1}
            onClick={(e) => {
              e.preventDefault()
              if (onScrollToContact) onScrollToContact()
            }}
            className="inline-flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 bg-white text-black font-mono text-[10px] sm:text-[11px] font-bold tracking-wider hover:bg-white/85 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer whitespace-nowrap shrink-0"
            title={t.hero.getInTouch}
          >
            <MailIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black/70 shrink-0" />
            <span className="hidden xs:inline">{t.hero.getInTouch}</span>
            <span aria-hidden="true" className="hidden xs:inline text-[10px]">
              →
            </span>
          </a>

          {/* RESUME: Full button on xs+, icon-only on mobile */}
          <a
            href={t.hero.resumeUrl || '/%5Bnhatprx%5D%20PERSONAL%20RESUME.pdf'}
            download={t.hero.resumeFileName || '[nhatprx] PERSONAL RESUME.pdf'}
            tabIndex={scrolledHeaderActions ? 0 : -1}
            className="inline-flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 border border-white/20 text-white font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider hover:border-white/50 hover:bg-white/5 transition-all whitespace-nowrap shrink-0"
            title={t.hero.resume}
          >
            <DownloadIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/60 shrink-0" />
            <span className="hidden xs:inline">{t.hero.resume}</span>
          </a>
        </div>

        {/* GitHub & LinkedIn Socials */}
        <div
          className={`items-center gap-1.5 ${
            scrolledHeaderActions ? 'hidden md:flex' : 'flex'
          }`}
        >
          <a
            href={t.identity.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="p-2 border border-white/10 hover:border-white/30 text-white/60 hover:text-white transition-colors bg-white/[0.02]"
          >
            <GithubIcon className="w-3.5 h-3.5" />
          </a>
          <a
            href={t.identity.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="p-2 border border-white/10 hover:border-white/30 text-white/60 hover:text-white transition-colors bg-white/[0.02]"
          >
            <LinkedinIcon className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="h-4 w-[1px] bg-white/10 hidden sm:block" aria-hidden="true" />

        {/* Language Dropdown */}
        <div ref={langMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setLangOpen((prev) => !prev)}
            aria-expanded={langOpen}
            aria-haspopup="true"
            aria-label="Select Language"
            className="flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs border border-white/15 bg-white/[0.03] text-white/80 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
          >
            <span className="font-semibold uppercase text-[11px]">{lang}</span>
            <span className="text-[8px] text-white/40">{langOpen ? '▲' : '▼'}</span>
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-2 w-36 bg-black/95 border border-white/20 shadow-2xl py-1 z-50 backdrop-blur-md">
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setLangOpen(false)
                    if (onLangChange) onLangChange(opt.code)
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer ${
                    lang === opt.code ? 'text-white bg-white/10 font-semibold' : 'text-white/60'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[10px] text-white/30">{opt.short}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
