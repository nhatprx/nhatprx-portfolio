import { useState } from 'react'
import Ec2Terminal from './components/Ec2Terminal'

const CURRENT_YEAR = new Date().getFullYear()

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

function ContactForm() {
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
          Accept: 'application/json'
        },
        body: JSON.stringify({
          _subject: `Portfolio Inquiry from ${email}`,
          email,
          message
        })
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
      setErrorMessage('Could not deliver directly. Please email me directly at nhatprx@gmail.com')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-10 space-y-4">
      <div>
        <label htmlFor="contact-email" className="block font-mono text-[10px] tracking-widest text-white/40 mb-2">
          YOUR EMAIL
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
          MESSAGE
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me about your project, team, or opportunity..."
          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors resize-none"
        />
      </div>

      {status === 'success' && (
        <div className="p-3 bg-white/10 border border-white/20 text-xs font-mono text-white/90">
          ✓ Message sent! Thank you, I will reply to your email soon.
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
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-mono text-xs font-semibold tracking-wider hover:bg-white/80 transition-colors disabled:opacity-50"
        >
          {status === 'sending' ? 'SENDING...' : 'SEND MESSAGE →'}
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
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 sm:p-10 lg:px-14 backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-[0.3em] text-white/80">NHATPRX</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="font-mono text-xs text-white/40">2026</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider text-white/40">
          <a href="#about" className="hover:text-white transition-colors">ABOUT</a>
          <a href="#experience" className="hover:text-white transition-colors">EXPERIENCE</a>
          <a href="#projects" className="hover:text-white transition-colors">PROJECTS</a>
          <a href="#skills" className="hover:text-white transition-colors">SKILLS</a>
          <a href="#contact" className="hover:text-white transition-colors">CONTACT</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="https://github.com/nhatprx" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-white/40 hover:text-white transition-colors">
            <GithubIcon className="w-4 h-4" />
          </a>
          <a href="https://www.linkedin.com/in/nhatprx/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white/40 hover:text-white transition-colors">
            <LinkedinIcon className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Fixed Left Half: Live AWS EC2 Linux Terminal (Desktop only) */}
      <aside aria-label="AWS EC2 Terminal" className="hidden lg:block fixed left-0 top-24 w-1/2 h-[calc(100vh-8rem)] p-6 lg:pl-14 lg:pr-8 z-30 pointer-events-auto">
        <Ec2Terminal />
      </aside>

      {/* Main Content Area: Split 50/50 Desktop Layout (Left empty, text on right) */}
      <main className="relative pt-24">
        {/* ========== HERO ========== */}
        <section className="min-h-screen flex items-center p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full my-auto">
            {/* Left Column Spacer */}
            <div className="hidden lg:block lg:col-span-6" />

            {/* Right Column Content */}
            <div className="lg:col-span-6 max-w-xl text-left lg:pl-8">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-4">SOFTWARE ENGINEER</p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95]">
                Minh Nhat
                <br />
                <span className="text-white/20">Pham.</span>
              </h1>
              <p className="mt-6 text-sm text-white/50 leading-relaxed max-w-md">
                Software Engineer with production experience across backend systems,
                cloud infrastructure, and full-stack delivery. Built and shipped real systems
                at Grevo Solutions and contributed to AWS infrastructure design during an internship at Amazon.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black font-mono text-xs font-semibold tracking-wider hover:bg-white/80 transition-colors"
                >
                  GET IN TOUCH
                  <span aria-hidden="true">→</span>
                </a>
                <a
                  href="/%5Bnhatprx%5D%20PERSONAL%20RESUME.pdf"
                  download="[nhatprx] PERSONAL RESUME.pdf"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white font-mono text-xs font-semibold tracking-wider hover:border-white/50 hover:bg-white/5 transition-colors"
                >
                  <DownloadIcon className="w-3.5 h-3.5 text-white/60" />
                  RESUME
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 01 — ABOUT ========== */}
        <section id="about" className="min-h-screen flex items-center py-24 p-6 sm:p-10 lg:p-14 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
            <div className="hidden lg:block lg:col-span-6" />
            <div className="lg:col-span-6 max-w-xl text-left lg:pl-8">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-6">01 — ABOUT</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
                Building systems
                <br />
                <span className="text-white/30">that scale.</span>
              </h2>
              <div className="space-y-4 text-sm text-white/60 leading-relaxed">
                <p>
                  Software Engineer comfortable owning a feature end-to-end — from system design
                  to deployment. Production experience across backend systems, cloud infrastructure,
                  and full-stack delivery. Built and shipped real systems at Grevo Solutions and
                  contributed to AWS infrastructure design during an internship at Amazon.
                </p>
                <p>
                  Strong understanding of OOP, SOLID principles, and RESTful API design. Hands-on experience
                  with CI/CD pipelines (Jenkins) and containerized deployments (Docker, Google Cloud Run).
                  Familiar with AWS Well-Architected Framework across security, reliability, and performance pillars.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-white/10 p-5">
                  <div className="text-xl font-bold">FPT University</div>
                  <div className="font-mono text-[10px] text-white/30 mt-1">BACHELOR OF ENGINEERING</div>
                  <div className="text-xs text-white/50 mt-2">Computer Science · Sep 2022 – Present</div>
                  <div className="text-[11px] text-white/30 mt-1">Ho Chi Minh City, VN</div>
                </div>
                <div className="border border-white/10 p-5">
                  <div className="text-xl font-bold">Multimedia University</div>
                  <div className="font-mono text-[10px] text-white/30 mt-1">STUDENT EXCHANGE PROGRAM</div>
                  <div className="text-xs text-white/50 mt-2">Interpersonal Communication · Jan – Apr 2023</div>
                  <div className="text-[11px] text-white/30 mt-1">Malaysia</div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {['English', 'Vietnamese (Native)', 'Japanese (Basic)'].map(lang => (
                  <span key={lang} className="font-mono text-[10px] px-3 py-1.5 border border-white/10 text-white/40">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== 02 — EXPERIENCE ========== */}
        <section id="experience" className="min-h-screen py-24 p-6 sm:p-10 lg:p-14 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
            <div className="hidden lg:block lg:col-span-6" />
            <div className="lg:col-span-6 max-w-xl text-left lg:pl-8">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-6">02 — EXPERIENCE</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
                Where I've
                <br />
                <span className="text-white/30">shipped code.</span>
              </h2>

              <div className="space-y-12">
                {/* Amazon Web Services (AWS) — Cloud Infrastructure Intern */}
                <article className="border-l border-white/10 pl-6">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold">Cloud Infrastructure Intern</h3>
                    <span className="font-mono text-[10px] text-white/30 shrink-0">JAN — AUG 2026</span>
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
                    {['EC2', 'S3', 'CloudFront', 'RDS', 'Lambda', 'API Gateway', 'ElastiCache (Redis)', 'ALB', 'CloudWatch'].map(t => (
                      <span key={t} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">{t}</span>
                    ))}
                  </div>
                </article>

                {/* Grevo Solutions — Founding Engineer */}
                <article className="border-l border-white/10 pl-6">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold">Founding Engineer & Project Lead</h3>
                    <span className="font-mono text-[10px] text-white/30 shrink-0">MAR 2025 — JAN 2026</span>
                  </div>
                  <p className="text-xs font-mono text-white/40 mb-3">GREVO SOLUTIONS · Ho Chi Minh City · On-site</p>
                  <p className="text-sm text-white/50 leading-relaxed mb-3">
                    Led end-to-end technical ownership of a production-grade urban waste management platform,
                    driving architecture decisions and team delivery from system design through cloud deployment.
                  </p>
                  <ul className="space-y-2 text-sm text-white/50 leading-relaxed">
                    <li>• Led a team of 4 engineers across backend, frontend, and cloud infrastructure, owning architecture, code quality, and end-to-end delivery</li>
                    <li>• Designed and implemented a Spring Boot backend with 91 REST APIs supporting citizen, collector, enterprise, and admin workflows</li>
                    <li>• Built a Grab-inspired intelligent dispatch engine with GPS-based collector matching, coordinate smoothing, and dynamic order batching/splitting, reducing manual coordination by ~40%</li>
                    <li>• Built a WebSocket-based real-time communication layer for task assignment, status updates, and live tracking</li>
                    <li>• Implemented production-grade security and quality standards with JWT, OAuth2, RBAC, and over 81% unit/integration test coverage</li>
                    <li>• Managed CI/CD via Jenkins, containerized deployments on Google Cloud Run, and migrated media storage to Amazon S3 for improved reliability and maintainability</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'WebSocket', 'Docker', 'Jenkins', 'Google Cloud Run', 'AWS S3', 'VietMap API'].map(t => (
                      <span key={t} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">{t}</span>
                    ))}
                  </div>
                </article>

                {/* FPT Education — Technical Staff */}
                <article className="border-l border-white/10 pl-6">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold">Technical Staff</h3>
                    <span className="font-mono text-[10px] text-white/30 shrink-0">JAN 2023 — AUG 2024</span>
                  </div>
                  <p className="text-xs font-mono text-white/40 mb-3">FPT EDUCATION · Ho Chi Minh City · On-site</p>
                  <p className="text-sm text-white/50 leading-relaxed mb-3">
                    Supported technical operations and internal software development at FPT Education, while contributing to organizational events and student-facing initiatives.
                  </p>
                  <ul className="space-y-2 text-sm text-white/50 leading-relaxed">
                    <li>• Built and maintained internal student management web applications serving the FPT Education division, handling user account management and reporting workflows</li>
                    <li>• Managed and maintained computer equipment and technical facilities to ensure system availability</li>
                    <li>• Coordinated major events including F-Camp 2023 — recognized as one of the top 20 outstanding contributors in the organization</li>
                  </ul>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 03 — PROJECTS ========== */}
        <section id="projects" className="min-h-screen py-24 p-6 sm:p-10 lg:p-14 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
            <div className="hidden lg:block lg:col-span-6" />
            <div className="lg:col-span-6 max-w-xl text-left lg:pl-8">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-6">03 — PROJECTS</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
                Personal &
                <br />
                <span className="text-white/30">featured projects.</span>
              </h2>

              <div className="space-y-10">
                {/* LordNine Bot — MMORPG Automation Framework */}
                <article className="border border-white/10 p-6 hover:border-white/30 transition-colors">
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3 className="text-lg font-bold">LordNine Bot · Automation Framework</h3>
                    <div className="flex items-center gap-3 shrink-0">
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
                      <span className="font-mono text-[10px] text-white/30">MAR — APR 2026</span>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-white/30 mb-4">PERSONAL PROJECT · SAAS PRODUCT</p>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Built and shipped a production-grade MMORPG automation framework as a SaaS product, handling
                    100+ concurrent instances with a full distribution pipeline iterated across 34 releases in 2 months.
                  </p>
                  <ul className="space-y-2 text-sm text-white/40">
                    <li>• Built a production-grade NPC automation engine controlling 100+ concurrent instances with sessions up to 36 hours</li>
                    <li>• Designed a no-code visual flowchart engine achieving ~85% task completion rate and 99.99% visual state detection accuracy via OpenCV template matching</li>
                    <li>• Replaced Playwright with a custom CDP client, reducing per-instance memory from ~100MB to ~1KB — enabling 100+ concurrency on consumer hardware</li>
                    <li>• Implemented AIMD adaptive screenshot scheduling (150ms–800ms) and GUI queue coalescing, achieving ~90% reduction in UI update overhead</li>
                    <li>• Shipped a complete SaaS pipeline: HWID-bound license system, SHA256-verified auto-update, and Windows installer — iterated to v3.24+ across 34 releases in 2 months</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['Python 3.13', 'OpenCV', 'Chrome DevTools Protocol', 'CustomTkinter', 'SQLite', 'Vercel', 'PyInstaller', 'Inno Setup'].map(t => (
                      <span key={t} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">{t}</span>
                    ))}
                  </div>
                </article>

                {/* Attenda — Smart Attendance System */}
                <article className="border border-white/10 p-6 hover:border-white/30 transition-colors">
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3 className="text-lg font-bold">Attenda · Smart Attendance System</h3>
                    <div className="flex items-center gap-3 shrink-0">
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
                      <span className="font-mono text-[10px] text-white/30 shrink-0">MAR — AUG 2025</span>
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
                    {['ESP32-S3', 'TensorFlow', 'React', 'TypeScript', 'Python', 'Gunicorn', 'PostgreSQL'].map(t => (
                      <span key={t} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">{t}</span>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 04 — SKILLS ========== */}
        <section id="skills" className="min-h-screen py-24 p-6 sm:p-10 lg:p-14 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
            <div className="hidden lg:block lg:col-span-6" />
            <div className="lg:col-span-6 max-w-xl text-left lg:pl-8">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-6">04 — SKILLS</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
                Technical
                <br />
                <span className="text-white/30">stack.</span>
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
          </div>
        </section>

        {/* ========== 05 — CONTACT ========== */}
        <section id="contact" className="min-h-screen flex items-center py-24 p-6 sm:p-10 lg:p-14 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
            <div className="hidden lg:block lg:col-span-6" />
            <div className="lg:col-span-6 max-w-xl text-left lg:pl-8">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-6">05 — CONTACT</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
                Let's build
                <br />
                <span className="text-white/30">together.</span>
              </h2>
              <p className="text-sm text-white/50 leading-relaxed mb-10">
                Available for full-time engineering roles, freelance opportunities,
                and collaborative projects. Currently based in Ho Chi Minh City, Vietnam.
              </p>

              <ContactForm />
            </div>
        </div>
      </section>

        {/* ========== FOOTER ========== */}
        <footer className="border-t border-white/5 py-8 p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
            <div className="hidden lg:block lg:col-span-6" />
            <div className="lg:col-span-6 max-w-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-white/20 lg:pl-8">
              <span>&copy; {CURRENT_YEAR} Minh Nhat Pham. All rights reserved.</span>
              <span>Minimal Monochrome Edition</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
