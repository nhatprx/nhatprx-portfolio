const CURRENT_YEAR = new Date().getFullYear()

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

function ArrowDown({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
    </svg>
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
          <a href="https://linkedin.com/in/nhatprx" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white/40 hover:text-white transition-colors">
            <LinkedinIcon className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main Content Area: Split 50/50 Desktop Layout (Left empty, text on right) */}
      <main className="relative pt-24">
        {/* ========== HERO ========== */}
        <section className="min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full my-auto">
            {/* Left Column Spacer */}
            <div className="hidden lg:block lg:col-span-6" />

            {/* Right Column Content */}
            <div className="lg:col-span-6 max-w-xl text-left lg:pl-8">
              <p className="font-mono text-[10px] tracking-[0.4em] text-white/30 mb-4">SOFTWARE ENGINEER</p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95]">
                Minh Nhat
                <br />
                <span className="text-white/20">Pham</span>
              </h1>
              <p className="mt-6 text-sm text-white/50 leading-relaxed max-w-md">
                Software engineer with production experience across backend systems,
                cloud infrastructure, and full-stack delivery. Based in Ho Chi Minh City.
              </p>

              <div className="mt-8 flex flex-wrap gap-2 font-mono text-[11px] text-white/40">
                <span className="px-3 py-1 border border-white/10">#Backend</span>
                <span className="px-3 py-1 border border-white/10">#CloudInfra</span>
                <span className="px-3 py-1 border border-white/10">#FullStack</span>
                <span className="px-3 py-1 border border-white/10">#Automation</span>
              </div>
            </div>
          </div>

          <footer className="flex items-center justify-between pt-8">
            <button
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 text-white/30 hover:text-white transition-colors"
              aria-label="Scroll down"
            >
              <ArrowDown className="w-4 h-4 animate-bounce" />
              <span className="font-mono text-[10px] tracking-widest">SCROLL</span>
            </button>
            <span className="font-mono text-[10px] text-white/20 tracking-wider">
              10.7719° N, 106.7044° E
            </span>
          </footer>
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
                  I'm a software engineer comfortable owning a feature end-to-end — from system
                  design to deployment. I have production experience across backend systems,
                  cloud infrastructure (AWS, GCP), and full-stack delivery.
                </p>
                <p>
                  Strong understanding of CI/CD principles and system architecture. Hands-on experience
                  with automated pipelines (Jenkins), containerized deployments (Docker), and cloud services
                  (Google Cloud Run, AWS Lambda, S3, ElastiCache).
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="border border-white/10 p-5">
                  <div className="text-2xl font-bold">B.Eng</div>
                  <div className="font-mono text-[10px] text-white/30 mt-1">COMPUTER SCIENCE</div>
                  <div className="text-xs text-white/40 mt-2">Ho Chi Minh City University of Technology</div>
                </div>
                <div className="border border-white/10 p-5">
                  <div className="text-2xl font-bold">3+</div>
                  <div className="font-mono text-[10px] text-white/30 mt-1">YEARS IN TECH</div>
                  <div className="text-xs text-white/40 mt-2">Backend, Cloud, Full-Stack</div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {['English', 'Vietnamese', 'Japanese (Basic)'].map(lang => (
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
                {/* Mao — Cloud Infrastructure Intern */}
                <article className="border-l border-white/10 pl-6">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold">Cloud Infrastructure Intern</h3>
                    <span className="font-mono text-[10px] text-white/30 shrink-0">JAN — AUG 2026</span>
                  </div>
                  <p className="text-xs font-mono text-white/40 mb-3">MAO SERVICES · Ho Chi Minh City</p>
                  <ul className="space-y-2 text-sm text-white/50 leading-relaxed">
                    <li>• Contributed to designing and optimizing cloud infrastructure for a subscription-based web application</li>
                    <li>• Researched and recommended architecture patterns tailored to workload profiles of thousands to tens of thousands of daily requests</li>
                    <li>• Implemented monitoring and observability using CloudWatch for faster detection of performance bottlenecks</li>
                    <li>• Optimized S3 sizing, caching strategy and storage configuration, contributing to ~17% cloud cost reduction</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['AWS S3', 'CloudFront', 'Lambda', 'API Gateway', 'ElastiCache', 'Redis', 'CloudWatch'].map(t => (
                      <span key={t} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">{t}</span>
                    ))}
                  </div>
                </article>

                {/* Reoolutions — Founding Engineer */}
                <article className="border-l border-white/10 pl-6">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold">Founding Engineer & Project Lead</h3>
                    <span className="font-mono text-[10px] text-white/30 shrink-0">JAN 2025 — JAN 2026</span>
                  </div>
                  <p className="text-xs font-mono text-white/40 mb-3">REOOLUTIONS · Ho Chi Minh City</p>
                  <ul className="space-y-2 text-sm text-white/50 leading-relaxed">
                    <li>• Led end-to-end technical ownership of a production-grade urban waste management platform</li>
                    <li>• Led a team of 4 engineers across backend, frontend, and cloud infrastructure</li>
                    <li>• Built a Spring Boot backend with 91 APIs supporting citizen, collector, enterprise, and admin workflows</li>
                    <li>• Built an Arab-inspired intelligent dispatch engine with zone-based collector matching, coordinate smoothing, and dynamic order batching — reducing manual coordination by ~40%</li>
                    <li>• Built a WebSocket-based real-time communication layer for task assignment, status updates, and live tracking</li>
                    <li>• Implemented production-grade security with OAuth2 and over 81% unit/integration test coverage</li>
                    <li>• Managed CI/CD via Jenkins, containerized deployments on Google Cloud Run, migrated media storage to Amazon S3</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'WebSocket', 'Docker', 'Jenkins', 'GCP', 'AWS S3'].map(t => (
                      <span key={t} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">{t}</span>
                    ))}
                  </div>
                </article>

                {/* University IT — Technical Staff */}
                <article className="border-l border-white/10 pl-6">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold">Technical Staff</h3>
                    <span className="font-mono text-[10px] text-white/30 shrink-0">JAN 2023 — AUG 2024</span>
                  </div>
                  <p className="text-xs font-mono text-white/40 mb-3">HO CHI MINH CITY UNIVERSITY OF TECHNOLOGY</p>
                  <ul className="space-y-2 text-sm text-white/50 leading-relaxed">
                    <li>• Built and maintained internal student management web applications serving the education division</li>
                    <li>• Managed and maintained computer equipment and technical facilities</li>
                    <li>• Coordinated major events including Camp 2023 — recognized as one of the top 20 outstanding contributors</li>
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
                Personal
                <br />
                <span className="text-white/30">projects.</span>
              </h2>

              <div className="space-y-10">
                {/* Ordine — Automation Framework */}
                <article className="border border-white/10 p-6 hover:border-white/30 transition-colors">
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3 className="text-lg font-bold">Ordine Automation Framework</h3>
                    <span className="font-mono text-[10px] text-white/30">2026</span>
                  </div>
                  <p className="text-xs font-mono text-white/30 mb-4">SaaS PRODUCT · SHIPPED</p>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Built and shipped a production-grade automation framework as a SaaS product handling
                    100+ concurrent instances with a full distribution pipeline. Iterated across 34 releases in 2 months.
                  </p>
                  <ul className="space-y-1.5 text-sm text-white/40">
                    <li>• No-code visual flowchart engine — ~85% task completion rate</li>
                    <li>• 99.99% visual state detection accuracy via template matching</li>
                    <li>• Custom client reducing per-instance memory from ~100MB to ~1MB</li>
                    <li>• Adaptive screenshot scheduling (150ms → 800ms) — ~90% overhead reduction</li>
                    <li>• Complete SaaS pipeline: bound licenses, 256 verified auto-update, Windows installer</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['Python 3.13', 'OpenCV', 'Chrome DevTools Protocol', 'Custom Tkinter', 'Excel', 'NSIS Installer'].map(t => (
                      <span key={t} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-white/30">{t}</span>
                    ))}
                  </div>
                </article>

                {/* Smart Attendance System */}
                <article className="border border-white/10 p-6 hover:border-white/30 transition-colors">
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3 className="text-lg font-bold">Smart Attendance System</h3>
                    <span className="font-mono text-[10px] text-white/30">2025</span>
                  </div>
                  <p className="text-xs font-mono text-white/30 mb-4">TEAM LEAD · 4 PERSON TEAM</p>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    Led a team to build a cost-optimized smart attendance system for university use,
                    combining ESP32/ESP32S3 edge hardware with a cloud-connected web dashboard.
                  </p>
                  <ul className="space-y-1.5 text-sm text-white/40">
                    <li>• Fingerprint sensor + face recognition achieving ~95% accuracy with &lt;15s latency</li>
                    <li>• React + TypeScript dashboard managing 1000+ student records with real-time monitoring</li>
                    <li>• Python/Unicorn/PostgreSQL backend handling 500+ daily attendance events</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['ESP32', 'Sensor', 'React', 'TypeScript', 'Python', 'PostgreSQL'].map(t => (
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/30 mb-4">LANGUAGES</h3>
                  <div className="flex flex-wrap gap-2">
                    {['JavaScript', 'TypeScript', 'Java', 'Python', 'SQL'].map(s => (
                      <span key={s} className="text-sm px-3 py-1.5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/30 mb-4">FRAMEWORKS</h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Node.js', 'Spring Boot', 'Three.js', 'Next.js'].map(s => (
                      <span key={s} className="text-sm px-3 py-1.5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/30 mb-4">DATABASES</h3>
                  <div className="flex flex-wrap gap-2">
                    {['PostgreSQL', 'Redis', 'MongoDB'].map(s => (
                      <span key={s} className="text-sm px-3 py-1.5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/30 mb-4">DEVOPS & CLOUD</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Docker', 'Jenkins', 'Google Cloud Run', 'AWS (S3, Lambda, CloudFront)', 'GitHub Actions'].map(s => (
                      <span key={s} className="text-sm px-3 py-1.5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <h3 className="font-mono text-[10px] tracking-[0.3em] text-white/30 mb-4">ARCHITECTURE & PRACTICES</h3>
                  <div className="flex flex-wrap gap-2">
                    {['CI/CD Pipelines', 'Microservices', 'REST APIs', 'WebSocket', 'OAuth2', 'Well-Architected Framework', 'Clean Architecture'].map(s => (
                      <span key={s} className="text-sm px-3 py-1.5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors">{s}</span>
                    ))}
                  </div>
                </div>
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

              <div className="space-y-4">
                <a href="mailto:nhatprx@gmail.com" className="flex items-center gap-4 p-4 border border-white/10 hover:border-white/30 transition-colors group">
                  <MailIcon className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                  <div>
                    <div className="text-sm font-bold">nhatprx@gmail.com</div>
                    <div className="text-xs text-white/30">Email</div>
                  </div>
                </a>

                <a href="tel:+84879888965" className="flex items-center gap-4 p-4 border border-white/10 hover:border-white/30 transition-colors group">
                  <PhoneIcon className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                  <div>
                    <div className="text-sm font-bold">+84 879 888 965</div>
                    <div className="text-xs text-white/30">Phone</div>
                  </div>
                </a>

                <a href="https://github.com/nhatprx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border border-white/10 hover:border-white/30 transition-colors group">
                  <GithubIcon className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                  <div>
                    <div className="text-sm font-bold">github.com/nhatprx</div>
                    <div className="text-xs text-white/30">GitHub</div>
                  </div>
                </a>

                <a href="https://linkedin.com/in/nhatprx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border border-white/10 hover:border-white/30 transition-colors group">
                  <LinkedinIcon className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                  <div>
                    <div className="text-sm font-bold">linkedin.com/in/nhatprx</div>
                    <div className="text-xs text-white/30">LinkedIn</div>
                  </div>
                </a>
              </div>
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
