import { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import Ec2Terminal from './components/Ec2Terminal'
import ServerTelemetry from './components/ServerTelemetry'
import { TRANSLATIONS, type SupportedLang } from './data/translations'
import BlogPostModal from './components/BlogPostModal'
import CustomCursor from './components/CustomCursor'
import AdminPortal from './components/Admin/AdminPortal'
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

function ContactForm({
  t,
}: {
  t: (typeof TRANSLATIONS)['en']
}) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !message) return

    setStatus('sending')
    setErrorMessage('')

    try {
      // shortcut: FormSubmit.co forwards messages to email without a backend; upgrade to custom domain API/Resend when custom domain email is live
      const res = await fetch('https://formsubmit.co/ajax/nhatprx@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `Portfolio Inquiry from ${email}`,
          email,
          message,
        }),
      })

      if (res.ok) {
        setStatus('success')
        setEmail('')
        setMessage('')
      } else {
        throw new Error('Failed to send message')
      }
    } catch {
      setStatus('error')
      setErrorMessage(t.contact.errorMsg)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-10 space-y-4">
      <div>
        <label htmlFor="contact-email" className="block font-mono text-[10px] tracking-widest text-white/40 mb-2">
          {t.contact.emailLabel}
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block font-mono text-[10px] tracking-widest text-white/40 mb-2">
          {t.contact.msgLabel}
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.contact.desc}
          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors resize-none"
        />
      </div>

      {status === 'success' && (
        <div className="p-3 bg-white/10 border border-white/20 text-xs font-mono text-white/90">
          {t.contact.successMsg}
        </div>
      )}

      {status === 'error' && (
        <div className="p-3 bg-red-950/30 border border-red-500/30 text-xs font-mono text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-mono text-xs font-semibold tracking-wider hover:bg-white/80 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {status === 'sending' ? t.contact.sendingBtn : t.contact.sendBtn}
        </button>

        <div className="flex items-center gap-2">
          <a
            href="mailto:nhatprx@gmail.com"
            aria-label="Email: nhatprx@gmail.com"
            title="nhatprx@gmail.com"
            className="p-3 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors"
          >
            <MailIcon className="w-4 h-4" />
          </a>
          <a
            href="tel:+84879888965"
            aria-label="Phone: +84 879 888 965"
            title="+84 879 888 965"
            className="p-3 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors"
          >
            <PhoneIcon className="w-4 h-4" />
          </a>
          <a
            href="https://github.com/nhatprx"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub: nhatprx"
            title="github.com/nhatprx"
            className="p-3 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
          <a
            href="https://www.linkedin.com/in/nhatprx/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn: nhatprx"
            title="linkedin.com/in/nhatprx"
            className="p-3 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors"
          >
            <LinkedinIcon className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-white/50">
        <div>
          <span className="block text-[10px] tracking-widest text-white/30 uppercase mb-1">DIRECT REACH</span>
          <span className="text-white/80">nhatprx@gmail.com</span>
        </div>
        <div>
          <span className="block text-[10px] tracking-widest text-white/30 uppercase mb-1">AVAILABILITY</span>
          <span className="text-emerald-400/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Open for Engineering Roles
          </span>
        </div>
      </div>
    </form>
  )
}

export default function App() {
  const [showTopBtn, setShowTopBtn] = useState(false)
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null)
  const [langOpen, setLangOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLangSwitching, setIsLangSwitching] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('INITIALIZING ENVIRONMENT...')
  const langMenuRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)

  const [allTranslations, setAllTranslations] = useState(() => getStoredTranslations())
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.location.hash === '#admin' || window.location.pathname === '/admin'
  })
  const [workTab, setWorkTab] = useState<'experience' | 'projects'>('experience')
  const [activeExp, setActiveExp] = useState(0)
  const [activeProj, setActiveProj] = useState(0)
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1000))
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const [lang, setLang] = useState<SupportedLang>(() => {
    const saved = localStorage.getItem('nhatprx_lang') as SupportedLang
    if (saved && ['en', 'vi', 'fr', 'ja'].includes(saved)) return saved
    return 'en'
  })

  const t = allTranslations[lang] || TRANSLATIONS[lang]
  const selectedPost = t.blog.posts.find((p) => p.slug === selectedPostSlug)

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

  // Initialize Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })
    lenisRef.current = lenis

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
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 1.1 })
    } else {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' })
      } else {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Pause Lenis smooth scrolling on main page while modal or admin is open
  useEffect(() => {
    if (selectedPost || isAdminOpen) {
      lenisRef.current?.stop()
      return () => {
        lenisRef.current?.start()
      }
    }
  }, [selectedPost, isAdminOpen])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 550)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400)
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

  const handleLangChange = (newLang: SupportedLang) => {
    if (newLang === lang) {
      setLangOpen(false)
      return
    }

    setLangOpen(false)
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
      {(isInitialLoading || isLangSwitching) && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black font-mono text-white select-none transition-opacity duration-200">
          <div className="w-64 space-y-4 text-center px-4">
            <div className="flex items-center justify-between text-[11px] text-white/60 tracking-wider">
              <span className="truncate">{loadingLabel}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-2 shrink-0" />
            </div>

            <div className="w-full h-[2px] bg-white/10 overflow-hidden relative">
              <div className="h-full w-full bg-white animate-loading-bar" />
            </div>

            <div className="flex items-center justify-between text-[10px] text-white/30 tracking-widest pt-1">
              <span>SYS://PORTFOLIO</span>
              <span>NHATPRX · 2026</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 p-4 sm:p-6 lg:px-14 backdrop-blur-md bg-black/80 border-b border-white/10">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => scrollTo(0)}
              className="font-mono text-xs tracking-[0.3em] text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              NHATPRX
            </button>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="font-mono text-xs text-white/40">2026</span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono tracking-wider text-white/40">
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault()
                scrollTo('#about')
              }}
              className="hover:text-white transition-colors"
            >
              {t.nav.about}
            </a>
            <a
              href="#work"
              onClick={(e) => {
                e.preventDefault()
                setWorkTab('experience')
                scrollTo('#work')
              }}
              className="hover:text-white transition-colors"
            >
              {t.nav.experience}
            </a>
            <a
              href="#work"
              onClick={(e) => {
                e.preventDefault()
                setWorkTab('projects')
                scrollTo('#work')
              }}
              className="hover:text-white transition-colors"
            >
              {t.nav.projects}
            </a>
            <a
              href="#blog"
              onClick={(e) => {
                e.preventDefault()
                scrollTo('#blog')
              }}
              className="hover:text-white transition-colors"
            >
              {t.nav.blog}
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                scrollTo('#contact')
              }}
              className="hover:text-white transition-colors"
            >
              {t.nav.contact}
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {/* Language Dropdown (Dropbox) */}
            <div ref={langMenuRef} className="relative">
              <button
                onClick={() => setLangOpen((prev) => !prev)}
                aria-expanded={langOpen}
                aria-haspopup="true"
                aria-label="Select Language"
                className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs border border-white/20 bg-white/[0.04] text-white/90 hover:text-white hover:border-white/40 transition-all cursor-pointer"
              >
                <span className="font-semibold uppercase">{lang}</span>
                <span className="text-[9px] text-white/50">{langOpen ? '▲' : '▼'}</span>
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-black/95 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.85)] py-1.5 z-50 backdrop-blur-md animate-dropdown divide-y divide-white/5">
                  <div className="px-3.5 py-1 font-mono text-[9px] text-white/30 tracking-widest uppercase">
                    LOCALE
                  </div>
                  <div className="py-1">
                    {LANG_OPTIONS.map((opt) => (
                      <button
                        key={opt.code}
                        onClick={() => handleLangChange(opt.code)}
                        className={`w-full text-left px-3.5 py-2 text-xs font-mono flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer ${lang === opt.code
                          ? 'text-white bg-white/10 font-semibold'
                          : 'text-white/60'
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${lang === opt.code ? 'bg-emerald-400' : 'bg-transparent'}`} />
                          <span>{opt.label}</span>
                        </span>
                        <span className="text-[10px] text-white/30 px-1.5 py-0.5 border border-white/10 bg-white/5">
                          {opt.short}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <a
              href="https://github.com/nhatprx"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-white/40 hover:text-white transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/nhatprx/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-white/40 hover:text-white transition-colors"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-14 sm:pt-16">
        {/* ========== HERO & TERMINAL (STACKED: HERO CONTENT ON TOP OF TERMINAL, BALANCED WITHIN 100VH) ========== */}
        <section
          id="hero"
          className="h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] min-h-[560px] max-h-screen flex flex-col justify-evenly px-6 sm:px-10 lg:px-14 py-2 sm:py-4"
        >
          {/* Top: Hero Content */}
          <div className="w-full text-left">
            <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase mb-1.5">{t.hero.role}</p>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[0.95]">
                  Minh Nhat <span className="text-white/20">Pham.</span>
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-white/50 leading-relaxed max-w-2xl">
                  {t.hero.desc}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollTo('#contact')
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white text-black font-mono text-xs font-semibold tracking-wider hover:bg-white/80 transition-colors cursor-pointer"
                >
                  {t.hero.getInTouch}
                  <span aria-hidden="true">→</span>
                </a>
                <a
                  href={t.hero.resumeUrl || '/%5Bnhatprx%5D%20PERSONAL%20RESUME.pdf'}
                  download={t.hero.resumeFileName || '[nhatprx] PERSONAL RESUME.pdf'}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 border border-white/20 text-white font-mono text-xs font-semibold tracking-wider hover:border-white/50 hover:bg-white/5 transition-colors"
                >
                  <DownloadIcon className="w-3.5 h-3.5 text-white/60" />
                  {t.hero.resume}
                </a>
              </div>
            </div>
          </div>

          {/* Bottom: Terminal */}
          <div id="terminal" className="w-full flex flex-col justify-center">
            <div className="flex items-center justify-between gap-4 mb-2">
              <p className="font-mono text-[10px] tracking-[0.4em] text-emerald-400/90 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block shrink-0" />
                {t.server.tag}
              </p>
              <span className="text-[10px] font-mono text-white/30 tracking-widest hidden sm:inline">
                LIVE CLOUD NODE // AP-SOUTHEAST-1
              </span>
            </div>
            <div className="h-[290px] sm:h-[330px] md:h-[360px] lg:h-[390px] xl:h-[420px] w-full">
              <Ec2Terminal />
            </div>
          </div>
        </section>

        {/* ========== 01 - ABOUT & TECH STACK (2-COLUMN UNIFIED) ========== */}
        <section id="about" className="min-h-screen py-24 p-6 sm:p-10 lg:p-14 flex items-center">
          <div className="w-full text-left">
            <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-3">{t.about.tag}</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-8">
              {t.about.title} <span className="text-white/30">{t.about.titleSub}</span>
            </h2>

            {/* 2-Column Grid: Left About & Education, Right Tech Stack */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
              {/* Left Column: Bio, Education, Languages */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  <p>{t.about.p1}</p>
                  <p>{t.about.p2}</p>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] tracking-[0.25em] text-white/40 mb-3 uppercase">
                    {t.about.educationTitle}
                  </h3>
                  <div className="space-y-3">
                    {/* Education Card 1: FPT University */}
                    <div className="border border-white/10 hover:border-white/25 p-4 transition-colors flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white tracking-tight truncate">
                          {t.about.edu1School}
                        </span>
                        <span className="font-mono text-[9px] text-white/50 flex items-center gap-1.5 shrink-0 uppercase">
                          <span className="w-1 h-1 rounded-full bg-white/40" />
                          {t.about.edu1Degree}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2 font-mono text-xs text-white/50">
                        <span className="truncate">{t.about.edu1Major}</span>
                        <span className="text-white/30 text-[10px] shrink-0">{t.about.edu1Location || t.about.edu1Dates}</span>
                      </div>
                    </div>

                    {/* Education Card 2: Multimedia University */}
                    <div className="border border-white/10 hover:border-white/25 p-4 transition-colors flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white tracking-tight truncate">
                          {t.about.edu2School}
                        </span>
                        <span className="font-mono text-[9px] text-white/50 flex items-center gap-1.5 shrink-0 uppercase">
                          <span className="w-1 h-1 rounded-full bg-white/40" />
                          {t.about.edu2Degree}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2 font-mono text-xs text-white/50">
                        <span className="truncate">{t.about.edu2Major}</span>
                        <span className="text-white/30 text-[10px] shrink-0">{t.about.edu2Location || t.about.edu2Dates}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="block font-mono text-[10px] tracking-[0.25em] text-white/40 mb-2 uppercase">
                    LANGUAGES
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {t.about.languages.map((langItem) => (
                      <span key={langItem} className="font-mono text-[10px] px-3 py-1.5 border border-white/10 text-white/50 bg-white/[0.02]">
                        {langItem}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Tech Stack Modular Cards */}
              <div id="skills" className="lg:col-span-7 scroll-mt-24">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                  <div>
                    <h3 className="font-mono text-xs tracking-[0.25em] text-white/90 uppercase font-semibold">
                      {t.nav.skills} // ARCHITECTURAL STACK
                    </h3>
                    {t.skills.desc && (
                      <p className="text-xs font-mono text-white/40 mt-1 max-w-xl">
                        {t.skills.desc}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-white/30 shrink-0">
                    {t.skills.categories.length} MODULES
                  </span>
                </div>

                {/* Modular Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
                  {t.skills.categories.map((group, gIdx) => (
                    <div
                      key={group.title}
                      className={`border border-white/10 hover:border-white/25 transition-all p-4.5 flex flex-col justify-between ${
                        gIdx === 4 ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
                          <h4 className="font-mono text-xs tracking-[0.2em] text-white/90 font-semibold truncate pr-2 uppercase">
                            {group.title}
                          </h4>
                          <span className="font-mono text-[10px] text-white/40 shrink-0">
                            // 0{gIdx + 1}
                          </span>
                        </div>

                        <div className={gIdx === 4 ? 'grid grid-cols-1 sm:grid-cols-2 gap-1.5' : 'space-y-1.5'}>
                          {group.skills.map((s) => (
                            <div
                              key={s}
                              className="flex items-start gap-2 font-mono text-[11px] leading-snug text-white/75 hover:text-white px-2.5 py-1.5 border border-white/5 hover:border-white/20 transition-colors"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0 mt-1" />
                              <span title={s} className="truncate sm:whitespace-normal">
                                {s}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/30">
                        <span>STACK</span>
                        <span>{group.skills.length} MODULES</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 02 - WORK: EXPERIENCE & PROJECTS (TABBED 3-CARD INFINITE LOOP STAGE) ========== */}
        {(() => {
          const isExp = workTab === 'experience'
          const expItems = t.experience.items
          const projItems = t.projects.items
          const N = isExp ? expItems.length : projItems.length
          const currentActive = isExp ? activeExp : activeProj
          const setCurrentActive = isExp ? setActiveExp : setActiveProj
          const cardWidth = Math.min(windowWidth - 48, 560)
          const gap = windowWidth < 640 ? 16 : 28

          // 5 slots around currentActive: 2 left, 1 center, 2 right for seamless infinite transition
          const slots = [currentActive - 2, currentActive - 1, currentActive, currentActive + 1, currentActive + 2]

          return (
            <section
              id="work"
              className="min-h-screen py-24 p-6 sm:p-10 lg:p-14 flex items-center justify-center overflow-hidden relative"
            >
              <div id="experience" className="absolute -top-10" />
              <div id="projects" className="absolute -top-10" />

              <div className="w-full text-left">
                {/* Header, Title & Tab Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 px-2 sm:px-4">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-2">
                      {isExp ? t.experience.tag : t.projects.tag}
                    </p>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
                      {isExp ? t.experience.title : t.projects.title}{' '}
                      <span className="text-white/30">
                        {isExp ? t.experience.titleSub : t.projects.titleSub}
                      </span>
                    </h2>

                    {(isExp ? t.experience.desc : t.projects.desc) && (
                      <p className="text-sm sm:text-base text-white/50 leading-relaxed max-w-2xl mb-4">
                        {isExp ? t.experience.desc : t.projects.desc}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-1">
                      <div className="inline-flex p-1 border border-white/20 bg-white/[0.04]">
                        <button
                          type="button"
                          onClick={() => setWorkTab('experience')}
                          className={`px-4 py-2 font-mono text-xs tracking-wider transition-all cursor-pointer ${
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
                          className={`px-4 py-2 font-mono text-xs tracking-wider transition-all cursor-pointer ${
                            !isExp
                              ? 'bg-white text-black font-semibold shadow-sm'
                              : 'text-white/50 hover:text-white'
                          }`}
                        >
                          {t.nav.projects} ({projItems.length})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Chevrons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCurrentActive((prev) => prev - 1)}
                      aria-label="Previous item (infinite loop)"
                      className="p-2 border border-white/10 hover:border-white/30 text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentActive((prev) => prev + 1)}
                      aria-label="Next item (infinite loop)"
                      className="p-2 border border-white/10 hover:border-white/30 text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3-Card Stage with Infinite Loop */}
                <div
                  className="relative w-full h-[480px] overflow-hidden outline-none"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      e.preventDefault()
                      setCurrentActive((prev) => prev + 1)
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault()
                      setCurrentActive((prev) => prev - 1)
                    }
                  }}
                  onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
                  onTouchEnd={(e) => {
                    if (touchStartX === null) return
                    const diff = touchStartX - e.changedTouches[0].clientX
                    if (diff > 40) {
                      setCurrentActive((prev) => prev + 1)
                    } else if (diff < -40) {
                      setCurrentActive((prev) => prev - 1)
                    }
                    setTouchStartX(null)
                  }}
                  role="region"
                  aria-label="3-card interactive infinite stage"
                >
                  {slots.map((slot) => {
                    const itemIndex = ((slot % N) + N) % N
                    const offset = slot - currentActive // -2, -1, 0, 1, 2
                    const isCenter = offset === 0

                    if (isExp) {
                      const exp = expItems[itemIndex]
                      return (
                        <div
                          key={`exp-${slot}`}
                          onClick={() => Math.abs(offset) === 1 && setCurrentActive((prev) => prev + offset)}
                          style={{
                            width: `${cardWidth}px`,
                            transform: `translateX(calc(-50% + ${offset * (cardWidth + gap)}px)) scale(${isCenter ? 1 : 0.94})`,
                            left: '50%',
                            opacity: isCenter ? 1 : Math.abs(offset) === 1 ? 0.38 : 0,
                            zIndex: isCenter ? 20 : 10 - Math.abs(offset),
                            pointerEvents: Math.abs(offset) > 1 ? 'none' : 'auto',
                            transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease',
                          }}
                          className={`absolute top-0 bottom-0 select-none ${
                            Math.abs(offset) === 1 ? 'cursor-pointer hover:opacity-60' : ''
                          }`}
                        >
                          <article
                            className={`h-full flex flex-col justify-between p-6 sm:p-8 border transition-all duration-300 ${
                              isCenter
                                ? 'border-white/30 bg-white/[0.04] shadow-[0_0_50px_rgba(255,255,255,0.06)]'
                                : 'border-white/10 bg-white/[0.01]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                      isCenter ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'
                                    }`}
                                  />
                                  <span className="font-mono text-[10px] tracking-[0.25em] text-white/50 uppercase">
                                    0{itemIndex + 1} // EXPERIENCE
                                  </span>
                                </div>
                                <span className="font-mono text-[10px] text-white/40 border border-white/10 px-2 py-0.5">
                                  {exp.period}
                                </span>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{exp.role}</h3>
                              </div>
                              <p className="text-xs font-mono text-emerald-400/90 mb-4">{exp.company}</p>
                              <p className="text-sm text-white/60 leading-relaxed mb-4">
                                {exp.summary}
                              </p>
                              <ul className="space-y-2 text-sm text-white/50 leading-relaxed mb-6">
                                {exp.bullets.map((b, bIdx) => (
                                  <li key={bIdx}>• {b}</li>
                                ))}
                              </ul>
                            </div>
                            {exp.tech && exp.tech.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-1.5">
                                {exp.tech.map((tech) => (
                                  <span
                                    key={tech}
                                    className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30 bg-white/[0.02]"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </article>
                        </div>
                      )
                    }

                    // Render Project Card
                    const proj = projItems[itemIndex]
                    return (
                      <div
                        key={`proj-${slot}`}
                        onClick={() => Math.abs(offset) === 1 && setCurrentActive((prev) => prev + offset)}
                        style={{
                          width: `${cardWidth}px`,
                          transform: `translateX(calc(-50% + ${offset * (cardWidth + gap)}px)) scale(${isCenter ? 1 : 0.94})`,
                          left: '50%',
                          opacity: isCenter ? 1 : Math.abs(offset) === 1 ? 0.38 : 0,
                          zIndex: isCenter ? 20 : 10 - Math.abs(offset),
                          pointerEvents: Math.abs(offset) > 1 ? 'none' : 'auto',
                          transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease',
                        }}
                        className={`absolute top-0 bottom-0 select-none ${
                          Math.abs(offset) === 1 ? 'cursor-pointer hover:opacity-60' : ''
                        }`}
                      >
                        <article
                          className={`h-full flex flex-col justify-between p-6 sm:p-8 border transition-all duration-300 ${
                            isCenter
                              ? 'border-white/30 bg-white/[0.04] shadow-[0_0_50px_rgba(255,255,255,0.06)]'
                              : 'border-white/10 bg-white/[0.01]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                    isCenter ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'
                                  }`}
                                />
                                <span className="font-mono text-[10px] tracking-[0.25em] text-white/50 uppercase">
                                  0{itemIndex + 1} // PROJECT
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {proj.repoUrl && (
                                  <a
                                    href={proj.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="View source code on GitHub"
                                    title="View source on GitHub"
                                    className="text-white/40 hover:text-white transition-colors"
                                  >
                                    <GithubIcon className="w-4 h-4" />
                                  </a>
                                )}
                                <span className="font-mono text-[10px] text-white/40 border border-white/10 px-2 py-0.5">
                                  {proj.period}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{proj.title}</h3>
                            </div>
                            <p className="text-xs font-mono text-emerald-400/90 mb-4">{proj.meta}</p>
                            <p className="text-sm text-white/60 leading-relaxed mb-4">
                              {proj.desc}
                            </p>
                            <ul className="space-y-2 text-sm text-white/50 leading-relaxed mb-6">
                              {proj.bullets.map((b, bIdx) => (
                                <li key={bIdx}>• {b}</li>
                              ))}
                            </ul>
                          </div>
                          {proj.tech && proj.tech.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-1.5">
                              {proj.tech.map((tech) => (
                                <span
                                  key={tech}
                                  className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30 bg-white/[0.02]"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </article>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )
        })()}

        {/* ========== 05 - BLOG ========== */}
        <section id="blog" className="min-h-screen py-24 p-6 sm:p-10 lg:p-14">
          <div className="w-full text-left">
            <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-3">{t.blog.tag}</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              {t.blog.title} <span className="text-white/30">{t.blog.titleSub}</span>
            </h2>
            {t.blog.desc && (
              <p className="text-sm sm:text-base text-white/50 leading-relaxed max-w-2xl mb-8">
                {t.blog.desc}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {t.blog.posts.map((post) => (
                <article
                  key={post.slug}
                  onClick={() => setSelectedPostSlug(post.slug)}
                  className="border border-white/10 p-6 hover:border-white/30 transition-all cursor-pointer group bg-white/[0.01] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                      <span className="font-mono text-[10px] text-white/40 tracking-wider">
                        {post.date} · {post.readTime}
                      </span>
                      <span className="font-mono text-[10px] text-white/40 group-hover:text-white transition-colors">
                        {t.blog.readNote}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight mb-3 text-white group-hover:text-white/90">
                      {post.title}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-4">
                      {post.summary}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ========== 04 - CONTACT & LIVE TELEMETRY (2-COLUMN) ========== */}
        <section id="contact" className="min-h-screen py-24 p-6 sm:p-10 lg:p-14 flex items-center">
          <div className="w-full text-left">
            <div className="mb-8 lg:mb-10">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-2">{t.contact.tag}</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
                {t.contact.title} <span className="text-white/30">{t.contact.titleSub}</span>
              </h2>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-2xl">
                {t.contact.desc}
              </p>
            </div>

            {/* 2-Column Grid: Left Contact Form, Right Live Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-stretch">
              <div className="lg:col-span-7 flex flex-col justify-between">
                <ContactForm t={t} />
              </div>

              <div className="lg:col-span-5 h-[480px] sm:h-[500px] lg:h-full min-h-[460px] flex flex-col">
                <ServerTelemetry />
              </div>
            </div>
          </div>
        </section>

        {/* ========== FOOTER ========== */}
        <footer className="py-8 p-6 sm:p-10 lg:p-14">
          <div className="w-full text-xs font-mono text-white/20">
            <span>&copy; {CURRENT_YEAR} Minh Nhat Pham. {t.footer.rights}</span>
          </div>
        </footer>
      </main>

      {/* Large Blog Post Modal */}
      {selectedPost && (
        <BlogPostModal
          post={selectedPost}
          t={t}
          onClose={() => setSelectedPostSlug(null)}
          onSelectPost={(slug) => setSelectedPostSlug(slug)}
          allPosts={t.blog.posts}
        />
      )}

      {/* Back to top button */}
      {showTopBtn && (
        <button
          onClick={() => scrollTo(0)}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-6 right-6 z-40 p-3 bg-black/90 border border-white/20 text-white/70 hover:text-white hover:border-white transition-all shadow-2xl backdrop-blur-sm cursor-pointer"
        >
          <ArrowUpIcon className="w-4 h-4" />
        </button>
      )}

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
