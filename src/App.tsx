import { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import Ec2Terminal from './components/Ec2Terminal'
import ServerTelemetry from './components/ServerTelemetry'
import { TRANSLATIONS, type SupportedLang } from './data/translations'
import CustomCursor from './components/CustomCursor'
import AdminPortal from './components/Admin/AdminPortal'
import BlogPostModal from './components/BlogPostModal'
import { getStoredTranslations } from './services/contentStorage'

const CURRENT_YEAR = new Date().getFullYear()

const LANG_OPTIONS: { code: SupportedLang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'vi', label: 'Tiếng Việt', short: 'VI' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'ja', label: '日本語', short: 'JA' },
]

// Inline SVG icons (zero dep)
function GithubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function LinkedinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function MailIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function PhoneIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function DownloadIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}

function ChevronLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function ArrowUpIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}



export default function App() {
  const [showTopBtn, setShowTopBtn] = useState(false)
  const [scrolledHeaderActions, setScrolledHeaderActions] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState('about')
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [loaderMounted, setLoaderMounted] = useState(true)
  const [isLangSwitching, setIsLangSwitching] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('INITIALIZING ENVIRONMENT...')
  const lenisRef = useRef<Lenis | null>(null)

  const [allTranslations, setAllTranslations] = useState(() => getStoredTranslations())
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.location.hash === '#admin' || window.location.pathname === '/admin'
  })

  const [langOpen, setLangOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)

  const aboutTitleRef = useRef<HTMLHeadingElement>(null)
  const [aboutTitleWidth, setAboutTitleWidth] = useState<number | undefined>(undefined)

  const skillsTitleRef = useRef<HTMLHeadingElement>(null)
  const [skillsTitleWidth, setSkillsTitleWidth] = useState<number | undefined>(undefined)

  const workTitleRef = useRef<HTMLHeadingElement>(null)
  const [workTitleWidth, setWorkTitleWidth] = useState<number | undefined>(undefined)

  const blogTitleRef = useRef<HTMLHeadingElement>(null)
  const [blogTitleWidth, setBlogTitleWidth] = useState<number | undefined>(undefined)
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null)
  const [blogPage, setBlogPage] = useState(1)
  const [blogSearch, setBlogSearch] = useState('')

  const [workTab, setWorkTab] = useState<'experience' | 'projects'>('projects')
  const [activeExp, setActiveExp] = useState(0)
  const [activeProj, setActiveProj] = useState(0)

  const [lang, setLang] = useState<SupportedLang>(() => {
    const saved = localStorage.getItem('nhatprx_lang') as SupportedLang
    if (saved && ['en', 'vi', 'fr', 'ja'].includes(saved)) return saved
    return 'en'
  })

  const t = allTranslations[lang] || TRANSLATIONS[lang]

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminOpen(window.location.hash === '#admin' || window.location.pathname === '/admin')
    }
    const handleKeyNav = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        window.location.hash = '#admin'
      }
    }
    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('keydown', handleKeyNav)
    return () => {
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('keydown', handleKeyNav)
    }
  }, [])

  // Initialize Lenis smooth scrolling with optimized checkpoint responsiveness
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
    })
    lenisRef.current = lenis

    // Force immediate anchor to top Hero section on reload / first load
    window.scrollTo(0, 0)
    lenis.scrollTo(0, { immediate: true })

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  const scrollTo = (target: string | number) => {
    if (typeof target === 'number') {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { duration: 0.9 })
      } else {
        window.scrollTo({ top: target, behavior: 'smooth' })
      }
      return
    }

    if (target === '#hero' || target === '#about' || target === '#top') {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { duration: 0.9 })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    // Normalize alias IDs to their canonical section containers
    let resolvedTarget = target
    if (target === '#tech-stack') resolvedTarget = '#skills'
    if (target === '#experience' || target === '#projects') resolvedTarget = '#work'

    const el = document.querySelector(resolvedTarget) as HTMLElement | null
    if (!el) return

    // Position section cleanly below the fixed header (header height: 68px on lg, 58px on mobile)
    const elTop = el.getBoundingClientRect().top + window.scrollY
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
    const headerHeight = isDesktop ? 68 : 58
    const targetY = Math.max(0, Math.round(elTop - headerHeight))

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, { duration: 0.85 })
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' })
    }
  }

  // Pause Lenis smooth scrolling on main page while admin is open
  useEffect(() => {
    if (isAdminOpen) {
      lenisRef.current?.stop()
      return () => {
        lenisRef.current?.start()
      }
    }
  }, [isAdminOpen])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
      window.scrollTo(0, 0)
      lenisRef.current?.scrollTo(0, { immediate: true })
      const unmountTimer = setTimeout(() => {
        setLoaderMounted(false)
      }, 350)
      return () => clearTimeout(unmountTimer)
    }, 450)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const innerHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const maxScroll = docHeight - innerHeight

      setScrolledHeaderActions(scrollY > 200)
      setShowTopBtn(scrollY > 200)

      const pct = maxScroll > 0 ? Math.min(100, Math.max(0, Math.round((scrollY / maxScroll) * 100))) : 0
      setScrollProgress(pct)

      // 1. Bottom boundary: activate contact when near or at bottom
      if (maxScroll > 0 && innerHeight + scrollY >= docHeight - 60) {
        setActiveSection('contact')
        return
      }

      // 2. Top boundary: activate about when near top
      if (scrollY < 160) {
        setActiveSection('about')
        return
      }

      // 3. Focal scan line: reading zone at 35% of viewport height
      const scanLine = Math.round(innerHeight * 0.35)
      const sectionIds = ['contact', 'blog', 'work', 'skills', 'about']

      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= scanLine && rect.bottom > 116) {
            setActiveSection(id)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!aboutTitleRef.current) return
    setAboutTitleWidth(aboutTitleRef.current.offsetWidth)
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setAboutTitleWidth(entry.contentRect.width)
    })
    ro.observe(aboutTitleRef.current)
    return () => ro.disconnect()
  }, [lang])

  useEffect(() => {
    if (!skillsTitleRef.current) return
    setSkillsTitleWidth(skillsTitleRef.current.offsetWidth)
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setSkillsTitleWidth(entry.contentRect.width)
    })
    ro.observe(skillsTitleRef.current)
    return () => ro.disconnect()
  }, [lang])

  useEffect(() => {
    if (!workTitleRef.current) return
    setWorkTitleWidth(workTitleRef.current.offsetWidth)
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWorkTitleWidth(entry.contentRect.width)
    })
    ro.observe(workTitleRef.current)
    return () => ro.disconnect()
  }, [lang, workTab])

  useEffect(() => {
    if (!blogTitleRef.current) return
    setBlogTitleWidth(blogTitleRef.current.offsetWidth)
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setBlogTitleWidth(entry.contentRect.width)
    })
    ro.observe(blogTitleRef.current)
    return () => ro.disconnect()
  }, [lang])

  // Storytelling scroll reveal observer
  useEffect(() => {
    if (typeof window === 'undefined') return
    const elements = document.querySelectorAll('.story-reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [lang, workTab, blogPage, blogSearch])

  const handleLangChange = (newLang: SupportedLang) => {
    setLangOpen(false)
    if (newLang === lang) return

    setIsLangSwitching(true)

    const labelMap: Record<SupportedLang, string> = {
      en: 'SWITCHING TO ENGLISH...',
      vi: 'ĐANG CHUYỂN SANG TIẾNG VIỆT...',
      fr: 'CHARGEMENT EN FRANÇAIS...',
      ja: '日本語に切り替え中...',
    }
    setLoadingLabel(labelMap[newLang] || 'SWITCHING LOCALE...')

    setTimeout(() => {
      setLang(newLang)
      localStorage.setItem('nhatprx_lang', newLang)
      setTimeout(() => {
        setIsLangSwitching(false)
      }, 300)
    }, 250)
  }

  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Animated faint grey grid background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-animated opacity-75" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_30%,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {/* Interactive Custom Cursor */}
      <CustomCursor />

      {/* Screen Loader (Initial & Language Switch) */}
      {(loaderMounted || isLangSwitching) && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black font-mono text-white select-none transition-opacity duration-300 pointer-events-none ${
            isInitialLoading || isLangSwitching ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-64 space-y-4 text-center px-4">
            <div className="flex items-center justify-between text-[11px] text-white/60 tracking-wider">
              <span className="truncate">{loadingLabel}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-2 shrink-0" />
            </div>

            <div className="w-full h-[2px] bg-white/10 overflow-hidden relative">
              <div className="h-full w-full bg-white animate-loading-bar" />
            </div>

            <div className="flex items-center justify-between text-[10px] text-white/30 tracking-widest pt-1">
              <span>SYS · PORTFOLIO</span>
              <span>NHATPRX · 2026</span>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 w-full min-h-screen">
        {/* Top Content Fade Mask / Shield (Hides content scrolling past header) */}
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 w-full lg:w-1/2 h-24 sm:h-26 lg:h-28 pointer-events-none z-30 bg-gradient-to-b from-black via-black/90 to-transparent"
        />

        {/* Top Header - Floating Slab Strictly Constrained to Left Column */}
        <div className="fixed top-0 left-0 w-full lg:w-1/2 z-40 p-4 sm:p-6 lg:px-10 lg:pt-6 pointer-events-none">
          <header
            className={`w-full pointer-events-auto px-5 sm:px-8 py-4 sm:py-5 bg-black/95 backdrop-blur-xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex items-center justify-between transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
              !isInitialLoading ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <button
              type="button"
              onClick={() => scrollTo(0)}
              className="text-left group cursor-pointer"
              aria-label="Scroll to top"
            >
              <p className="font-mono text-[8.5px] sm:text-[9px] tracking-[0.25em] text-emerald-400 uppercase font-medium mb-0.5">
                {t.hero.role}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none">
                nhatprx <span className="text-white/25">.</span>
              </h2>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Scroll-activated Quick CTA Buttons with 2-way Slide & Fade Transition */}
              <div
                className={`flex items-center gap-1.5 sm:gap-2 transition-all duration-500 ease-out overflow-hidden ${
                  scrolledHeaderActions
                    ? 'opacity-100 max-w-[360px] p-0.5 translate-x-0 pointer-events-auto'
                    : 'opacity-0 max-w-0 p-0 translate-x-3 pointer-events-none'
                }`}
              >
                <a
                  href="#contact"
                  tabIndex={scrolledHeaderActions ? 0 : -1}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollTo('#contact')
                  }}
                  className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-white text-black font-mono text-[10px] sm:text-[11px] font-bold tracking-wider hover:bg-white/85 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>{t.hero.getInTouch}</span>
                  <span aria-hidden="true" className="text-[10px]">→</span>
                </a>
                <a
                  href={t.hero.resumeUrl || '/%5Bnhatprx%5D%20PERSONAL%20RESUME.pdf'}
                  download={t.hero.resumeFileName || '[nhatprx] PERSONAL RESUME.pdf'}
                  tabIndex={scrolledHeaderActions ? 0 : -1}
                  className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 border border-white/20 text-white font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider hover:border-white/50 hover:bg-white/5 transition-all whitespace-nowrap shrink-0"
                >
                  <DownloadIcon className="w-3 h-3 text-white/60" />
                  <span>{t.hero.resume}</span>
                </a>
              </div>

              {/* GitHub & LinkedIn Socials */}
              <div className={`items-center gap-1.5 ${scrolledHeaderActions ? 'hidden md:flex' : 'flex'}`}>
                <a
                  href="https://github.com/nhatprx"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  className="p-2 border border-white/10 hover:border-white/30 text-white/60 hover:text-white transition-colors bg-white/[0.02]"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/nhatprx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="p-2 border border-white/10 hover:border-white/30 text-white/60 hover:text-white transition-colors bg-white/[0.02]"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="h-4 w-[1px] bg-white/10" aria-hidden="true" />

              {/* Language Dropdown (Dropbox) */}
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
                        onClick={() => handleLangChange(opt.code)}
                        className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer ${lang === opt.code
                          ? 'text-white bg-white/10 font-semibold'
                          : 'text-white/60'
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
        </div>

        {/* Left Scrollable Content Column (50/50 Split) */}
        <div
          className={`w-full lg:w-1/2 lg:min-h-screen flex flex-col transition-all duration-700 delay-100 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
            !isInitialLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          {/* ========== 01 - HERO & ABOUT (UNIFIED SECTION) ========== */}
          <section
            id="about"
            className="relative pt-36 pb-20 sm:pt-40 sm:pb-24 lg:pt-36 lg:pb-20 lg:min-h-screen px-6 sm:px-10 lg:px-14 flex flex-col justify-end text-left scroll-mt-28 sm:scroll-mt-32"
          >
            {/* Alias anchor for any links expecting #hero */}
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
                    onClick={(e) => {
                      e.preventDefault()
                      scrollTo('#contact')
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-mono text-xs font-bold tracking-wider hover:bg-white/85 transition-all shadow-[0_0_25px_rgba(255,255,255,0.12)] cursor-pointer"
                  >
                    {t.hero.getInTouch}
                    <span aria-hidden="true">→</span>
                  </a>
                  <a
                    href={t.hero.resumeUrl || '/%5Bnhatprx%5D%20PERSONAL%20RESUME.pdf'}
                    download={t.hero.resumeFileName || '[nhatprx] PERSONAL RESUME.pdf'}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-white/20 text-white font-mono text-xs font-semibold tracking-wider hover:border-white/50 hover:bg-white/5 transition-all"
                  >
                    <DownloadIcon className="w-3.5 h-3.5 text-white/60" />
                    {t.hero.resume}
                  </a>
                </div>

                {/* Mobile-only Terminal & Telemetry (terminal hidden on phone devices) */}
                <div className="lg:hidden mt-8 mb-4 w-full space-y-3">
                  <div className="hidden md:block h-[360px] w-full shadow-xl">
                    <Ec2Terminal />
                  </div>

                  <div className="w-full shadow-xl">
                    <ServerTelemetry />
                  </div>
                </div>
              </div>

              {/* Block 2: About Narrative */}
              <div className="story-reveal">
                <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
                  {t.about.tag}
                </p>
                <h2
                  ref={aboutTitleRef}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-white w-fit"
                >
                  {t.about.title} <span className="text-white/30">{t.about.titleSub}</span>
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

              {/* Block 3: Education Cards (Anchored to match Node Telemetry bottom baseline) */}
              <div className="story-reveal story-delay-1 mb-0">
                <h3 className="font-mono text-[10px] tracking-[0.25em] text-white/40 mb-2.5 sm:mb-3 uppercase">
                  {t.about.educationTitle}
                </h3>
                <div className={`grid grid-cols-1 ${t.about.edu2School?.trim() ? 'sm:grid-cols-2' : ''} gap-3`}>
                  <div className="border border-white/10 p-3 sm:p-3.5 bg-white/[0.015] hover:border-white/25 hover:bg-white/[0.03] transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                        {t.about.edu1School}
                      </div>
                      <span className="font-mono text-[10px] text-white/35 shrink-0">
                        {t.about.edu1Location || t.about.edu1Dates}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 font-mono text-[11px] min-w-0">
                      <span className="text-emerald-400 font-semibold tracking-wider uppercase shrink-0 text-[10px]">
                        {t.about.edu1Degree}
                      </span>
                      <span className="text-white/20 shrink-0" aria-hidden="true">/</span>
                      <span className="text-white/50 truncate text-[10.5px]">
                        {t.about.edu1Major}
                      </span>
                    </div>
                  </div>

                  {t.about.edu2School?.trim() && (
                    <div className="border border-white/10 p-3 sm:p-3.5 bg-white/[0.015] hover:border-white/25 hover:bg-white/[0.03] transition-all flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                          {t.about.edu2School}
                        </div>
                        <span className="font-mono text-[10px] text-white/35 shrink-0">
                          {t.about.edu2Location || t.about.edu2Dates}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 font-mono text-[11px] min-w-0">
                        <span className="text-emerald-400 font-semibold tracking-wider uppercase shrink-0 text-[10px]">
                          {t.about.edu2Degree}
                        </span>
                        <span className="text-white/20 shrink-0" aria-hidden="true">/</span>
                        <span className="text-white/50 truncate text-[10.5px]">
                          {t.about.edu2Major}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ========== 02 - TECHNICAL STACK ========== */}
          <section
            id="skills"
            className="relative pt-20 sm:pt-24 lg:pt-24 pb-20 sm:pb-24 lg:pb-24 px-6 sm:px-10 lg:px-14 flex flex-col scroll-mt-28 sm:scroll-mt-32"
          >
            {/* Alias anchor for any links expecting #tech-stack */}
            <div id="tech-stack" className="absolute -top-28 sm:-top-32" />

            <div className="w-full text-left story-reveal">
              <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
                {t.skills.tag}
              </p>
              <h2
                ref={skillsTitleRef}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 text-white w-fit"
              >
                {t.skills.title} <span className="text-white/30">{t.skills.titleSub}</span>
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
                      key={group.title}
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
                          {group.skills.map((s) => (
                            <span
                              key={s}
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

          {/* ========== 03 - WORK (EXPERIENCE & PROJECTS UNIFIED) ========== */}
          {(() => {
            const isExp = workTab === 'experience'
            const expItems = t.experience.items
            const projItems = t.projects.items
            const items = isExp ? expItems : projItems
            const N = items.length
            const currentActive = isExp ? activeExp : activeProj
            const setCurrentActive = isExp ? setActiveExp : setActiveProj
            const realIndex = ((currentActive % N) + N) % N

            return (
              <section
                id="work"
                className="relative pt-20 sm:pt-24 lg:pt-24 pb-20 sm:pb-24 lg:pb-24 px-6 sm:px-10 lg:px-14 flex flex-col scroll-mt-28 sm:scroll-mt-32"
              >
                <div id="experience" className="absolute -top-28 sm:-top-32" />
                <div id="projects" className="absolute -top-28 sm:-top-32" />

                <div className="w-full text-left story-reveal">
                  {/* Tag, Title & Subtitle */}
                  <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
                    {isExp ? t.experience.tag : t.projects.tag}
                  </p>
                  <h2
                    ref={workTitleRef}
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-white w-fit"
                  >
                    {isExp ? t.experience.title : t.projects.title}{' '}
                    <span className="text-white/30">{isExp ? t.experience.titleSub : t.projects.titleSub}</span>
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
                    {/* Previous Button (Left Side) */}
                    <button
                      type="button"
                      onClick={() => setCurrentActive((realIndex - 1 + N) % N)}
                      aria-label="Previous card"
                      className="absolute -left-3 sm:-left-4.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 border border-white/20 bg-neutral-950/95 hover:border-emerald-400 hover:bg-emerald-950/50 text-white/70 hover:text-emerald-300 transition-all flex items-center justify-center cursor-pointer shadow-lg hover:shadow-[0_0_12px_rgba(52,211,153,0.3)] active:scale-95 group"
                    >
                      <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    </button>

                    {/* Single Active Card Display (Fixed Compact Dimensions) */}
                    {isExp ? (() => {
                      const exp = expItems[realIndex]
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
                    })() : (() => {
                      const proj = projItems[realIndex]
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
                    })()}

                    {/* Next Button (Right Side) */}
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
          })()}

          {/* ========== 04 - BLOG ========== */}
          <section
            id="blog"
            className="relative pt-20 sm:pt-24 lg:pt-24 pb-20 sm:pb-24 lg:pb-24 px-6 sm:px-10 lg:px-14 flex flex-col scroll-mt-28 sm:scroll-mt-32"
          >
            <div className="w-full text-left story-reveal">
              <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
                {t.blog.tag}
              </p>
              <h2
                ref={blogTitleRef}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-white w-fit"
              >
                {t.blog.title} <span className="text-white/30">{t.blog.titleSub}</span>
              </h2>
              <p
                style={{
                  width: blogTitleWidth ? `${blogTitleWidth}px` : undefined,
                  maxWidth: '100%',
                }}
                className="text-sm text-white/65 leading-relaxed mb-8 text-justify [text-justify:inter-word]"
              >
                {t.blog.desc}
              </p>

              {/* Blog Posts Vertical Stack (Paginated: max 3 per page + Search) */}
              {(() => {
                const postsPerPage = 3
                const q = blogSearch.trim().toLowerCase()
                const filteredPosts = t.blog.posts.filter((post) => {
                  if (!q) return true
                  return (
                    post.title.toLowerCase().includes(q) ||
                    post.summary.toLowerCase().includes(q) ||
                    post.tags.some((tag) => tag.toLowerCase().includes(q))
                  )
                })
                const totalBlogPages = Math.ceil(filteredPosts.length / postsPerPage)
                const currentBlogPage = Math.min(Math.max(1, blogPage), totalBlogPages || 1)
                const paginatedPosts = filteredPosts.slice(
                  (currentBlogPage - 1) * postsPerPage,
                  currentBlogPage * postsPerPage
                )

                return (
                  <>
                    {paginatedPosts.length === 0 ? (
                      <div className="p-8 border border-white/10 bg-white/[0.015] text-center font-mono">
                        <p className="text-xs text-white/40 mb-2.5">
                          NO NOTES FOUND MATCHING "{blogSearch}"
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setBlogSearch('')
                            setBlogPage(1)
                          }}
                          className="text-xs text-emerald-400 hover:underline cursor-pointer font-medium"
                        >
                          RESET SEARCH →
                        </button>
                      </div>
                    ) : (
                      <div key={currentBlogPage} className="space-y-2.5 animate-card-switch story-reveal story-delay-1">
                        {paginatedPosts.map((post) => (
                          <article
                            key={post.slug}
                            onClick={() => setActiveBlogSlug(post.slug)}
                            className="group border border-white/10 hover:border-emerald-400/50 bg-white/[0.015] hover:bg-white/[0.035] p-3.5 sm:p-4 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-[11px] text-white/40">
                              <span>{post.date}</span>
                              <span className="text-emerald-400/80 font-medium">{post.readTime}</span>
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight mb-1.5 leading-snug line-clamp-1">
                              {post.title}
                            </h3>

                            <p className="text-xs text-white/60 leading-relaxed mb-3 truncate line-clamp-1">
                              {post.summary}
                            </p>

                            <div className="flex items-center justify-end pt-2.5 border-t border-white/10">
                              <span className="font-mono text-[11px] text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                                {t.blog.readNote}
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}

                    {/* Bottom Toolbar: Search Box (Replaced PAGE 01/02 text) + Pagination Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 mt-6 font-mono text-xs">
                      {/* Search Box */}
                      <div className="relative flex items-center w-full sm:w-60">
                        <span className="absolute left-2.5 text-white/30 text-xs font-mono select-none">/</span>
                        <input
                          type="text"
                          value={blogSearch}
                          onChange={(e) => {
                            setBlogSearch(e.target.value)
                            setBlogPage(1)
                          }}
                          placeholder="SEARCH NOTES..."
                          aria-label="Search blog notes"
                          className="w-full bg-white/[0.03] border border-white/10 focus:border-emerald-400/80 focus:bg-white/[0.05] pl-6 pr-7 py-1 text-xs font-mono text-white placeholder:text-white/30 outline-none transition-all"
                        />
                        {blogSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setBlogSearch('')
                              setBlogPage(1)
                            }}
                            aria-label="Clear search"
                            className="absolute right-2 text-white/40 hover:text-white text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Pagination Controls */}
                      {totalBlogPages > 1 ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={currentBlogPage === 1}
                            onClick={() => setBlogPage((prev) => Math.max(1, prev - 1))}
                            className="p-1.5 border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:hover:border-white/10 disabled:cursor-not-allowed text-white transition-all cursor-pointer flex items-center justify-center"
                            aria-label="Previous page"
                          >
                            <ChevronLeftIcon className="w-3.5 h-3.5" />
                          </button>

                          {Array.from({ length: totalBlogPages }).map((_, idx) => {
                            const pageNum = idx + 1
                            const isActive = pageNum === currentBlogPage
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setBlogPage(pageNum)}
                                className={`w-7 h-7 border text-xs transition-all cursor-pointer ${
                                  isActive
                                    ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300 font-semibold shadow-sm'
                                    : 'border-white/10 bg-white/[0.02] text-white/50 hover:text-white hover:border-white/30'
                                }`}
                              >
                                0{pageNum}
                              </button>
                            )
                          })}

                          <button
                            type="button"
                            disabled={currentBlogPage === totalBlogPages}
                            onClick={() => setBlogPage((prev) => Math.min(totalBlogPages, prev + 1))}
                            className="p-1.5 border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:hover:border-white/10 disabled:cursor-not-allowed text-white transition-all cursor-pointer flex items-center justify-center"
                            aria-label="Next page"
                          >
                            <ChevronRightIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-white/30 font-mono text-[11px]">
                          {filteredPosts.length} {filteredPosts.length === 1 ? 'NOTE' : 'NOTES'}
                        </span>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>
          </section>

          {/* ========== 05 - CONTACT ========== */}
          <section
            id="contact"
            className="relative pt-20 sm:pt-24 lg:pt-24 pb-12 sm:pb-16 lg:pb-16 px-6 sm:px-10 lg:px-14 flex flex-col justify-between scroll-mt-28 sm:scroll-mt-32"
          >
            <div className="w-full text-left story-reveal">
              <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
                {t.contact.tag}
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-white">
                {t.contact.title} <span className="text-white/30">{t.contact.titleSub}</span>
              </h2>
              <p className="text-sm text-white/60 leading-relaxed max-w-lg mb-7">
                {t.contact.desc}
              </p>

              {/* Direct Channels Cards Grid (Optimized compact 2-col cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 mb-5 story-reveal story-delay-1">
                <a
                  href="mailto:nhatprx@gmail.com"
                  className="group p-4 sm:p-4.5 border border-white/10 hover:border-white/30 bg-white/[0.015] hover:bg-white/[0.04] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">EMAIL</span>
                    <MailIcon className="w-3.5 h-3.5 text-white/40 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div>
                    <p className="font-mono text-xs sm:text-sm text-white font-medium group-hover:text-emerald-400 transition-colors truncate">
                      nhatprx@gmail.com
                    </p>
                    <span className="font-mono text-[10px] text-white/30 group-hover:text-white/80 mt-2 flex items-center gap-1 transition-colors">
                      Compose Email →
                    </span>
                  </div>
                </a>

                <a
                  href="tel:+84879888965"
                  className="group p-4 sm:p-4.5 border border-white/10 hover:border-white/30 bg-white/[0.015] hover:bg-white/[0.04] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">PHONE</span>
                    <PhoneIcon className="w-3.5 h-3.5 text-white/40 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div>
                    <p className="font-mono text-xs sm:text-sm text-white font-medium group-hover:text-emerald-400 transition-colors">
                      +84 879 888 965
                    </p>
                    <span className="font-mono text-[10px] text-white/30 group-hover:text-white/80 mt-2 flex items-center gap-1 transition-colors">
                      Direct Call / SMS →
                    </span>
                  </div>
                </a>

                <a
                  href="https://github.com/nhatprx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 sm:p-4.5 border border-white/10 hover:border-white/30 bg-white/[0.015] hover:bg-white/[0.04] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">GITHUB</span>
                    <GithubIcon className="w-3.5 h-3.5 text-white/40 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div>
                    <p className="font-mono text-xs sm:text-sm text-white font-medium group-hover:text-emerald-400 transition-colors">
                      github.com/nhatprx
                    </p>
                    <span className="font-mono text-[10px] text-white/30 group-hover:text-white/80 mt-2 flex items-center gap-1 transition-colors">
                      View Repositories →
                    </span>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/in/nhatprx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 sm:p-4.5 border border-white/10 hover:border-white/30 bg-white/[0.015] hover:bg-white/[0.04] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">LINKEDIN</span>
                    <LinkedinIcon className="w-3.5 h-3.5 text-white/40 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div>
                    <p className="font-mono text-xs sm:text-sm text-white font-medium group-hover:text-emerald-400 transition-colors truncate">
                      linkedin.com/in/nhatprx
                    </p>
                    <span className="font-mono text-[10px] text-white/30 group-hover:text-white/80 mt-2 flex items-center gap-1 transition-colors">
                      Connect on LinkedIn →
                    </span>
                  </div>
                </a>
              </div>

              {/* Location & Status Bar */}
              <div className="p-3.5 sm:p-4 border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 font-mono text-xs story-reveal story-delay-2">
                <span className="text-white/40 uppercase tracking-widest text-[10px]">CURRENT AVAILABILITY</span>
                <span className="text-emerald-400/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ho Chi Minh City, Vietnam · Available for Roles & Contracts
                </span>
              </div>
            </div>

            {/* ========== INTEGRATED FOOTER ========== */}
            <footer className="pt-8 border-t border-white/5 text-xs font-mono text-white/20">
              <span>&copy; {CURRENT_YEAR} nhatprx. {t.footer.rights}</span>
            </footer>
          </section>
        </div>

        {/* Desktop Fixed Terminal & Live Metric on the Right (Aligned to Top Header & Bottom Baseline) */}
        <aside
          aria-label="Interactive Live Cloud Node Terminal & Telemetry"
          className={`hidden lg:flex fixed top-0 right-0 bottom-0 w-1/2 pt-6 pb-12 sm:pb-16 lg:pb-20 pr-6 sm:pr-10 lg:pr-14 pl-4 xl:pl-6 2xl:pl-8 flex-col justify-between pointer-events-none z-30 transition-opacity duration-700 delay-150 ease-out motion-reduce:transition-none ${
            !isInitialLoading ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-full h-full flex flex-col gap-3.5 pointer-events-auto min-h-0">
            <div className="flex-1 w-full shadow-2xl min-h-[360px]">
              <Ec2Terminal />
            </div>

            {/* Streamlined Minimal Live Telemetry Metric under Terminal */}
            <div className="w-full shadow-xl shrink-0">
              <ServerTelemetry />
            </div>
          </div>
        </aside>
      </main>

      {/* Bottom Floating Bar: Journey Bar + Move on Top Button (Spans from Terminal Left Edge to Move on Top) */}
      <div
        className={`fixed bottom-6 right-0 w-full lg:w-1/2 pr-6 sm:pr-10 lg:pr-14 pl-6 sm:pl-10 lg:pl-4 xl:pl-6 2xl:pl-8 z-40 flex items-center gap-2 transition-all duration-300 pointer-events-none ${
          showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {/* Journey Bar - Stretches from Terminal Left Edge to Move on Top Button */}
        <nav
          aria-label="Story Journey Navigation"
          className="flex-1 min-w-0 h-10 sm:h-11 pointer-events-auto p-1 bg-black/90 border border-white/20 shadow-2xl backdrop-blur-md flex items-center justify-between gap-1 font-mono select-none"
        >
          <div className="flex-1 grid grid-cols-5 gap-1 min-w-0 h-full">
            {[
              { id: 'about', num: '01', label: t.nav.about },
              { id: 'skills', num: '02', label: t.nav.skills },
              { id: 'work', num: '03', label: workTab === 'experience' ? t.nav.experience : t.nav.projects },
              { id: 'blog', num: '04', label: t.nav.blog },
              { id: 'contact', num: '05', label: t.nav.contact },
            ].map((step) => {
              const isActive = activeSection === step.id
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => scrollTo(`#${step.id}`)}
                  className={`h-full px-1 border transition-all cursor-pointer flex items-center justify-center text-xs truncate ${
                    isActive
                      ? 'border-emerald-400/80 bg-emerald-400/15 text-emerald-300 font-semibold shadow-[0_0_10px_rgba(52,211,153,0.15)]'
                      : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Jump to ${step.label}`}
                >
                  <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-300' : 'text-emerald-400/80'} mr-1 shrink-0`}>
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

          {/* Progress Percent (Fixed width + tabular-nums prevents width jump when hitting 100%) */}
          <span className="w-12 text-right pr-2 text-[10.5px] text-emerald-400 font-mono font-bold tracking-wider shrink-0 hidden md:inline-block tabular-nums">
            {scrollProgress}%
          </span>
        </nav>

        {/* Move on Top Button */}
        <button
          type="button"
          onClick={() => scrollTo(0)}
          aria-label="Back to top"
          title="Back to top"
          className="pointer-events-auto h-10 w-10 sm:h-11 sm:w-11 bg-black/90 border border-white/20 text-white/70 hover:text-white hover:border-white transition-all shadow-2xl backdrop-blur-md cursor-pointer flex items-center justify-center shrink-0"
        >
          <ArrowUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Blog Post Detail Modal */}
      {(() => {
        const activePost = activeBlogSlug ? t.blog.posts.find((p) => p.slug === activeBlogSlug) : null
        if (!activePost) return null
        return (
          <BlogPostModal
            post={activePost}
            t={t}
            onClose={() => setActiveBlogSlug(null)}
            onSelectPost={(slug) => setActiveBlogSlug(slug)}
            allPosts={t.blog.posts}
          />
        )
      })()}

      {/* Hidden Admin Portal */}
      {isAdminOpen && (
        <AdminPortal
          onClose={() => {
            setIsAdminOpen(false)
            if (window.location.hash === '#admin') {
              window.history.replaceState(null, '', window.location.pathname)
            }
          }}
          onUpdateTranslations={(updated) => setAllTranslations(updated)}
        />
      )}
    </div>
  )
}
