import { useState, useEffect, useRef } from 'react'
import Ec2Terminal from './components/Ec2Terminal'
import { TRANSLATIONS, type SupportedLang } from './data/translations'
import { BLOG_POSTS } from './data/blogData'
import BlogPostModal from './components/BlogPostModal'
import CustomCursor from './components/CustomCursor'

const CURRENT_YEAR = new Date().getFullYear()

const LANG_OPTIONS: { code: SupportedLang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'vi', label: 'Tiếng Việt', short: 'VI' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'ja', label: '日本語', short: 'JA' },
]

const SKILL_CATEGORIES = [
  {
    title: 'LANGUAGES',
    gridClass: 'grid grid-cols-3 gap-2',
    skills: ['JavaScript', 'Java', 'Python'],
  },
  {
    title: 'FRAMEWORKS',
    gridClass: 'grid grid-cols-2 gap-2',
    skills: ['Spring Boot', 'ReactJS', 'NodeJS', 'ThreeJS'],
  },
  {
    title: 'DATABASES',
    gridClass: 'grid grid-cols-3 gap-2',
    skills: ['PostgreSQL', 'MySQL', 'Redis'],
  },
  {
    title: 'DEVOPS & CLOUD',
    gridClass: 'grid grid-cols-2 gap-2',
    skills: ['AWS (EC2, S3, Lambda)', 'Google Cloud Run', 'Docker', 'Jenkins', 'Vercel', 'Render', 'Railway', 'Git'],
  },
  {
    title: 'ARCHITECTURE',
    gridClass: 'grid grid-cols-1 gap-2',
    skills: [
      'OOP & SOLID Principles',
      'RESTful API Design',
      'CI/CD Pipelines (Jenkins)',
      'Containerized Deployments (Docker, Cloud Run)',
      'AWS Well-Architected Framework',
    ],
  },
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
    </form>
  )
}

export default function App() {
  const [showTopBtn, setShowTopBtn] = useState(false)
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null)
  const [langOpen, setLangOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)

  const [lang, setLang] = useState<SupportedLang>(() => {
    const saved = localStorage.getItem('nhatprx_lang') as SupportedLang
    if (saved && ['en', 'vi', 'fr', 'ja'].includes(saved)) return saved
    return 'en'
  })

  const t = TRANSLATIONS[lang]
  const selectedPost = BLOG_POSTS.find((p) => p.slug === selectedPostSlug)

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
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
    setLang(newLang)
    localStorage.setItem('nhatprx_lang', newLang)
    setLangOpen(false)
  }

  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Animated faint grey grid background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-animated opacity-60" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_20%,transparent_0%,rgba(0,0,0,0.85)_100%)]" />

      {/* Interactive Custom Cursor with Spotlight */}
      <CustomCursor />

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 p-4 sm:p-6 lg:px-14 backdrop-blur-md bg-black/60 border-b border-white/5">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="font-mono text-xs tracking-[0.3em] text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              NHATPRX
            </button>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="font-mono text-xs text-white/40">2026</span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono tracking-wider text-white/40">
            <a href="#terminal" className="hover:text-white transition-colors">
              {t.nav.liveLab}
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              {t.nav.about}
            </a>
            <a href="#experience" className="hover:text-white transition-colors">
              {t.nav.experience}
            </a>
            <a href="#projects" className="hover:text-white transition-colors">
              {t.nav.projects}
            </a>
            <a href="#skills" className="hover:text-white transition-colors">
              {t.nav.skills}
            </a>
            <a href="#blog" className="hover:text-white transition-colors">
              {t.nav.blog}
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
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
                className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-xs border border-white/15 bg-white/[0.03] text-white/80 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
              >
                <span className="font-semibold uppercase">{lang}</span>
                <span className="text-[9px] text-white/40">{langOpen ? '▲' : '▼'}</span>
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-black/95 border border-white/20 shadow-2xl py-1 z-50 backdrop-blur-md">
                  {LANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => handleLangChange(opt.code)}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer ${
                        lang === opt.code
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

      <main className="relative z-10 pt-24">
          {/* ========== HERO ========== */}
          <section className="min-h-screen flex items-center p-6 sm:p-10 lg:p-14">
            <div className="w-full max-w-2xl mx-auto text-left my-auto">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-4">{t.hero.role}</p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95]">
                Minh Nhat
                <br />
                <span className="text-white/20">Pham.</span>
              </h1>
              <p className="mt-6 text-sm text-white/50 leading-relaxed max-w-md">
                {t.hero.desc}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black font-mono text-xs font-semibold tracking-wider hover:bg-white/80 transition-colors"
                >
                  {t.hero.getInTouch}
                  <span aria-hidden="true">→</span>
                </a>
                <a
                  href="/%5Bnhatprx%5D%20PERSONAL%20RESUME.pdf"
                  download="[nhatprx] PERSONAL RESUME.pdf"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white font-mono text-xs font-semibold tracking-wider hover:border-white/50 hover:bg-white/5 transition-colors"
                >
                  <DownloadIcon className="w-3.5 h-3.5 text-white/60" />
                  {t.hero.resume}
                </a>
              </div>
            </div>
          </section>

          {/* ========== LIVE CLOUD LAB ========== */}
          <section id="terminal" className="min-h-screen flex items-center py-24 p-6 sm:p-10 lg:p-14 border-t border-white/5">
            <div className="w-full max-w-2xl mx-auto text-left">
              <p className="font-mono text-[10px] tracking-[0.4em] text-emerald-400/90 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                {t.server.tag}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                {t.server.title}
                <br />
                <span className="text-white/30">{t.server.titleSub}</span>
              </h2>
              <p className="text-sm text-white/60 leading-relaxed mb-6">
                {t.server.desc}
              </p>

              <div className="h-[480px] w-full">
                <Ec2Terminal />
              </div>
            </div>
          </section>

          {/* ========== 01 - ABOUT ========== */}
          <section id="about" className="min-h-screen flex items-center py-24 p-6 sm:p-10 lg:p-14 border-t border-white/5">
            <div className="w-full max-w-2xl mx-auto text-left">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-6">{t.about.tag}</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
                {t.about.title}
                <br />
                <span className="text-white/30">{t.about.titleSub}</span>
              </h2>
              <div className="space-y-4 text-sm text-white/60 leading-relaxed">
                <p>{t.about.p1}</p>
                <p>{t.about.p2}</p>
              </div>

              <div className="mt-10">
                <h3 className="font-mono text-[10px] tracking-[0.25em] text-white/30 mb-4 uppercase">
                  {t.about.educationTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-white/10 p-5">
                    <div className="text-lg font-bold">{t.about.edu1School}</div>
                    <div className="font-mono text-[10px] text-white/30 mt-1">BACHELOR OF ENGINEERING</div>
                    <div className="text-xs text-white/50 mt-2">{t.about.edu1Major}</div>
                    <div className="text-[11px] text-white/30 mt-1">{t.about.edu1Dates}</div>
                  </div>
                  <div className="border border-white/10 p-5">
                    <div className="text-lg font-bold">{t.about.edu2School}</div>
                    <div className="font-mono text-[10px] text-white/30 mt-1">STUDENT EXCHANGE PROGRAM</div>
                    <div className="text-xs text-white/50 mt-2">{t.about.edu2Major}</div>
                    <div className="text-[11px] text-white/30 mt-1">{t.about.edu2Dates}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {['English (Fluent)', 'Vietnamese (Native)', 'Japanese (Basic)', 'French (Familiar)'].map(langItem => (
                  <span key={langItem} className="font-mono text-[10px] px-3 py-1.5 border border-white/10 text-white/40">
                    {langItem}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ========== 02 - EXPERIENCE ========== */}
          <section id="experience" className="min-h-screen py-24 p-6 sm:p-10 lg:p-14 border-t border-white/5">
            <div className="w-full max-w-2xl mx-auto text-left">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-6">{t.experience.tag}</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
                {t.experience.title}
                <br />
                <span className="text-white/30">{t.experience.titleSub}</span>
              </h2>

              <div className="space-y-12">
                {/* Amazon Web Services (AWS) - Cloud Infrastructure Intern */}
                <article className="border-l border-white/10 pl-6">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold">Cloud Infrastructure Intern</h3>
                    <span className="font-mono text-[10px] text-white/30 shrink-0">JAN - AUG 2026</span>
                  </div>
                  <p className="text-xs font-mono text-white/40 mb-3">AMAZON WEB SERVICES (AWS) · Ho Chi Minh City · On-site</p>
                  <p className="text-sm text-white/50 leading-relaxed mb-3">
                    Contributed to designing and optimizing cloud infrastructure for a subscription-based web application on AWS,
                    from architecture evaluation through hands-on implementation and cost optimization.
                  </p>
                  <ul className="space-y-2 text-sm text-white/50 leading-relaxed">
                    <li>• Researched and recommended AWS architecture patterns tailored to workload profiles of thousands to tens of thousands of daily requests</li>
                    <li>• Participated in architectural decisions and hands-on implementation of a subscription-based web application</li>
                    <li>• Implemented monitoring and observability using CloudWatch for faster detection of performance bottlenecks</li>
                    <li>• Optimized EC2 sizing, caching strategy, and storage configuration, contributing to ~17% cloud cost reduction</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['EC2', 'S3', 'CloudFront', 'RDS', 'Lambda', 'API Gateway', 'ElastiCache (Redis)', 'ALB', 'CloudWatch'].map(tech => (
                      <span key={tech} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">{tech}</span>
                    ))}
                  </div>
                </article>

                {/* Grevo Solutions - Founding Engineer */}
                <article className="border-l border-white/10 pl-6">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold">Founding Engineer & Project Lead</h3>
                    <span className="font-mono text-[10px] text-white/30 shrink-0">MAR 2025 - JAN 2026</span>
                  </div>
                  <p className="text-xs font-mono text-white/40 mb-3">GREVO SOLUTIONS · Ho Chi Minh City · On-site</p>
                  <p className="text-sm text-white/50 leading-relaxed mb-3">
                    Led the end-to-end design and delivery of an intelligent waste management platform,
                    serving as lead engineer across system architecture, edge integration, and cross-functional coordination.
                  </p>
                  <ul className="space-y-2 text-sm text-white/50 leading-relaxed">
                    <li>• Designed end-to-end architecture connecting edge hardware, cloud backends, and multi-tenant management dashboards</li>
                    <li>• Shipped an end-to-end platform for a multi-tenant client in Malaysia on AWS, integrating IoT edge devices with a Spring Boot and React stack</li>
                    <li>• Built high-performance RESTful APIs with Spring Boot, optimizing database schemas across PostgreSQL and Redis</li>
                    <li>• Owned production deployment pipelines using Docker, Jenkins CI/CD, and Google Cloud Run</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['Spring Boot', 'Java 21', 'ReactJS', 'PostgreSQL', 'Redis', 'Docker', 'Google Cloud Run', 'Jenkins', 'IoT'].map(tech => (
                      <span key={tech} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">{tech}</span>
                    ))}
                  </div>
                </article>

                {/* FPT Education - Technical Staff */}
                <article className="border-l border-white/10 pl-6">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold">Technical Staff · Event Operations</h3>
                    <span className="font-mono text-[10px] text-white/30 shrink-0">JAN 2023 - AUG 2024</span>
                  </div>
                  <p className="text-xs font-mono text-white/40 mb-3">FPT EDUCATION · Ho Chi Minh City · On-site</p>
                  <p className="text-sm text-white/50 leading-relaxed mb-3">
                    Provided technical and operational support for large-scale university events, workshops, and student programs.
                  </p>
                  <ul className="space-y-2 text-sm text-white/50 leading-relaxed">
                    <li>• Managed technical infrastructure (networking, sound, visual systems, livestreaming) for campus-wide events with 1,000+ attendees</li>
                    <li>• Coordinated major events including F-Camp 2023 - recognized as one of the top 20 outstanding contributors in the organization</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['Event Operations', 'Technical Infrastructure', 'Team Leadership'].map(tech => (
                      <span key={tech} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">{tech}</span>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* ========== 03 - PROJECTS ========== */}
          <section id="projects" className="min-h-screen py-24 p-6 sm:p-10 lg:p-14 border-t border-white/5">
            <div className="w-full max-w-2xl mx-auto text-left">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-6">{t.projects.tag}</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
                {t.projects.title}
                <br />
                <span className="text-white/30">{t.projects.titleSub}</span>
              </h2>

              <div className="space-y-8">
                {/* LordNine Bot */}
                <article className="border border-white/10 p-6 hover:border-white/30 transition-colors">
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3 className="text-lg font-bold">LordNine Bot · Automation Framework</h3>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://github.com/nhatprx"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View source code on GitHub"
                        title="View source on GitHub"
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                      <span className="font-mono text-[10px] text-white/30">MAR - APR 2026</span>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-white/30 mb-4">SOLO DEVELOPER · 34 PRODUCTION RELEASES</p>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    High-performance MMORPG automation framework reverse-engineered and built for extreme concurrency on consumer hardware.
                  </p>
                  <ul className="space-y-2 text-sm text-white/40">
                    <li>• Replaced Playwright with a custom CDP client, reducing per-instance memory from ~100MB to ~1KB - enabling 100+ concurrency on consumer hardware</li>
                    <li>• Implemented AIMD adaptive screenshot scheduling (150ms-800ms) and GUI queue coalescing, achieving ~90% reduction in UI update overhead</li>
                    <li>• Shipped a complete SaaS pipeline: HWID-bound license system, SHA256-verified auto-update, and Windows installer - iterated to v3.24+ across 34 releases in 2 months</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['Python 3.13', 'OpenCV', 'Chrome DevTools Protocol', 'CustomTkinter', 'SQLite', 'Vercel', 'PyInstaller', 'Inno Setup'].map(tech => (
                      <span key={tech} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">{tech}</span>
                    ))}
                  </div>
                </article>

                {/* Attenda */}
                <article className="border border-white/10 p-6 hover:border-white/30 transition-colors">
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3 className="text-lg font-bold">Attenda · Smart Attendance System</h3>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://github.com/nhatprx"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View source code on GitHub"
                        title="View source on GitHub"
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                      <span className="font-mono text-[10px] text-white/30 shrink-0">MAR - AUG 2025</span>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-white/30 mb-4">TEAM LEAD · 4 PERSON TEAM</p>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Led a 4-person team to build a cost-optimized smart attendance system for university use,
                    combining ESP32-S3 edge hardware with a cloud-connected web dashboard.
                  </p>
                  <ul className="space-y-2 text-sm text-white/40">
                    <li>• Engineered edge-based attendance hardware using ESP32-S3 with fingerprint sensor, minimizing cloud overhead through local processing; implemented TensorFlow face recognition achieving ~95% accuracy with &lt;1.5s latency</li>
                    <li>• Built a React + TypeScript dashboard managing 1,000+ student records with real-time monitoring; designed Python/PostgreSQL backend handling 500+ daily attendance events</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['ESP32-S3', 'TensorFlow', 'React', 'TypeScript', 'Python', 'Gunicorn', 'PostgreSQL'].map(tech => (
                      <span key={tech} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">{tech}</span>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* ========== 04 - SKILLS ========== */}
          <section id="skills" className="min-h-screen py-24 p-6 sm:p-10 lg:p-14 border-t border-white/5">
            <div className="w-full max-w-2xl mx-auto text-left">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-6">{t.skills.tag}</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
                {t.skills.title}
                <br />
                <span className="text-white/30">{t.skills.titleSub}</span>
              </h2>

              <div className="divide-y divide-white/10 border-t border-b border-white/10">
                {SKILL_CATEGORIES.map(group => (
                  <div key={group.title} className="py-5 sm:grid sm:grid-cols-12 sm:gap-4 items-start">
                    <h3 className="sm:col-span-4 font-mono text-[10px] tracking-[0.25em] text-white/30 mb-2 sm:mb-0 pt-2">
                      {group.title}
                    </h3>
                    <div className={`sm:col-span-8 ${group.gridClass}`}>
                      {group.skills.map(s => (
                        <span
                          key={s}
                          className="flex items-center justify-start text-left font-mono text-xs px-3 h-9 bg-white/[0.03] border border-white/10 text-white/80 hover:text-white hover:border-white/30 transition-colors w-full whitespace-nowrap"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========== 05 - BLOG ========== */}
          <section id="blog" className="min-h-screen py-24 p-6 sm:p-10 lg:p-14 border-t border-white/5">
            <div className="w-full max-w-2xl mx-auto text-left">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-6">{t.blog.tag}</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
                {t.blog.title}
                <br />
                <span className="text-white/30">{t.blog.titleSub}</span>
              </h2>

              <div className="space-y-6">
                {BLOG_POSTS.map(post => (
                  <article
                    key={post.slug}
                    onClick={() => setSelectedPostSlug(post.slug)}
                    className="border border-white/10 p-6 hover:border-white/30 transition-all cursor-pointer group bg-white/[0.01]"
                  >
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
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map(tag => (
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

          {/* ========== 06 - CONTACT ========== */}
          <section id="contact" className="min-h-screen flex items-center py-24 p-6 sm:p-10 lg:p-14 border-t border-white/5">
            <div className="w-full max-w-2xl mx-auto text-left">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-6">{t.contact.tag}</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
                {t.contact.title}
                <br />
                <span className="text-white/30">{t.contact.titleSub}</span>
              </h2>
              <p className="text-sm text-white/50 leading-relaxed mb-10">
                {t.contact.desc}
              </p>

              <ContactForm t={t} />
            </div>
          </section>

          {/* ========== FOOTER ========== */}
          <footer className="border-t border-white/5 py-8 p-6 sm:p-10 lg:p-14">
            <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-white/20">
              <span>&copy; {CURRENT_YEAR} Minh Nhat Pham. {t.footer.rights}</span>
              <span>{t.footer.edition}</span>
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
            allPosts={BLOG_POSTS}
          />
        )}

      {/* Back to top button */}
      {showTopBtn && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-6 right-6 z-40 p-3 bg-black/90 border border-white/20 text-white/70 hover:text-white hover:border-white transition-all shadow-2xl backdrop-blur-sm cursor-pointer"
        >
          <ArrowUpIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
