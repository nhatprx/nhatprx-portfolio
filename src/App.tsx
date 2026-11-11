import { useState } from 'react'
import ThreeCanvas from './components/ThreeCanvas'
import {
  ArrowDown,
  ArrowUpRight,
  ExternalLink,
  Code2,
  Box,
  Server,
  Sparkles,
  Terminal,
  Send,
  CheckCircle2,
  Cpu,
} from 'lucide-react'

// Simple SVG Icons for GitHub and LinkedIn (zero dependency bloat)
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

export default function App() {
  const [formSent, setFormSent] = useState(false)
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' })

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSent(true)
    setTimeout(() => {
      setFormSent(false)
      setContactData({ name: '', email: '', message: '' })
    }, 4000)
  }

  const projects = [
    {
      title: 'Interactive 3D Bitexco Studio',
      desc: 'Real-time WebGL architectural visualization of Ho Chi Minh City’s iconic landmark with precision camera framing, PBR glass shaders, and CAD STL geometry.',
      tags: ['React 19', 'Three.js', 'STL Pipeline', 'Tailwind v4'],
      github: 'https://github.com/nhatprx/nhatprx-portfolio',
      live: 'https://github.com/nhatprx/nhatprx-portfolio',
      badge: 'Featured Work',
    },
    {
      title: 'Cloud Telemetry & Real-Time Dashboard',
      desc: 'High-throughput system monitoring platform with sub-second WebSocket streaming, responsive charts, and role-based access management.',
      tags: ['TypeScript', 'Next.js', 'Tailwind CSS', 'PostgreSQL'],
      github: 'https://github.com/nhatprx',
      live: 'https://github.com/nhatprx',
      badge: 'Enterprise',
    },
    {
      title: '3D Configurator & E-Commerce Viewer',
      desc: 'Interactive 360-degree product customizer allowing real-time material swapping, texture loading, and exploded view rendering.',
      tags: ['React Three Fiber', 'Drei', 'Zustand', 'GLSL'],
      github: 'https://github.com/nhatprx',
      live: 'https://github.com/nhatprx',
      badge: 'Creative Tech',
    },
  ]

  const skills = [
    {
      category: 'Frontend & UI',
      icon: <Code2 className="w-5 h-5 text-cyan-400" />,
      items: ['React 19', 'TypeScript', 'Next.js', 'Tailwind CSS v4', 'Vite', 'HTML5 / CSS3'],
    },
    {
      category: '3D & Creative Tech',
      icon: <Box className="w-5 h-5 text-purple-400" />,
      items: ['Three.js', 'React Three Fiber', 'Drei', 'WebGL', 'STL / GLTF Pipeline', 'Shader GLSL'],
    },
    {
      category: 'Backend & Systems',
      icon: <Server className="w-5 h-5 text-emerald-400" />,
      items: ['Node.js', 'Express', 'RESTful APIs', 'PostgreSQL', 'Prisma ORM', 'WebSocket'],
    },
    {
      category: 'Engineering & DevOps',
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
      items: ['Git & GitHub', 'Docker', 'Vercel', 'Ponytail Clean Architecture', 'Performance 60fps'],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* ============================================================ */}
      {/* 1. HERO SECTION (Full viewport with 3D Bitexco Model)         */}
      {/* ============================================================ */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Fullscreen 3D Canvas */}
        <ThreeCanvas />

        {/* Hero Overlay Container */}
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
          {/* Top Sticky-style Header */}
          <header className="flex items-center justify-between pointer-events-auto">
            <a href="#" className="flex items-center gap-2.5 text-white font-bold tracking-tight hover:text-cyan-400 transition-colors">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-sm tracking-wider">NHATPRX.DEV</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
                2026
              </span>
            </a>

            {/* Nav anchors */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-mono tracking-wider text-slate-400">
              <a href="#projects" className="hover:text-cyan-400 transition-colors">PROJECTS</a>
              <a href="#skills" className="hover:text-cyan-400 transition-colors">SKILLS</a>
              <a href="#about" className="hover:text-cyan-400 transition-colors">ABOUT</a>
              <a href="#contact" className="hover:text-cyan-400 transition-colors">CONTACT</a>
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/nhatprx"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/80 transition-all border border-transparent hover:border-slate-800"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-medium px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-sm shadow-cyan-500/20"
              >
                Get In Touch &rarr;
              </a>
            </div>
          </header>

          {/* Right-Aligned Hero Text Column (Aligned with user's mockup) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full my-auto">
            {/* Left Column: Transparent area dedicated for the 3D Tower */}
            <div className="hidden lg:block lg:col-span-6" />

            {/* Right Column: Hero Heading & Details */}
            <div className="lg:col-span-6 space-y-6 pointer-events-auto text-left lg:pl-8">
              {/* Role badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-800/60 bg-cyan-950/40 text-xs font-mono text-cyan-300 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span>Full-Stack & Creative 3D Engineer</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                Crafting Next-Gen Web{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">
                  With 3D WebGL
                </span>
              </h1>

              {/* Bio summary */}
              <p className="text-base sm:text-lg text-slate-300 max-w-lg leading-relaxed font-normal">
                Hi, I'm <strong className="text-white font-semibold">Nguyen Nhat</strong>. 
                I bridge the gap between resilient software engineering and immersive 3D digital experiences, based in Ho Chi Minh City.
              </p>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-cyan-300 border border-cyan-900/60">
                  #React19
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-purple-300 border border-purple-900/60">
                  #Three.js
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-sky-300 border border-sky-900/60">
                  #TypeScript
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-teal-300 border border-teal-900/60">
                  #TailwindV4
                </span>
              </div>

              {/* CTAs */}
              <div className="pt-3 flex flex-wrap items-center gap-4">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 hover:scale-102"
                >
                  <span>View Projects</span>
                  <ArrowDown className="w-4 h-4" />
                </a>

                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 font-semibold text-xs tracking-wider uppercase transition-colors"
                >
                  <span>Contact Me</span>
                  <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar Info */}
          <footer className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-900 pt-4">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              DRAG TO ROTATE 360° • SCROLL TO ZOOM
            </span>
            <span className="hidden sm:inline text-slate-400">
              BITEXCO TOWER // 10.7719° N, 106.7044° E
            </span>
          </footer>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. FEATURED PROJECTS SECTION (#projects)                     */}
      {/* ============================================================ */}
      <section id="projects" className="py-24 border-t border-slate-900 bg-slate-950/80 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Selected Works
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Featured Engineering Projects
              </h2>
            </div>
            <p className="mt-3 md:mt-0 text-slate-400 text-sm max-w-md">
              A curated selection of 3D WebGL experiences and full-stack software systems engineered with modern web standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj, idx) => (
              <article
                key={idx}
                className="flex flex-col justify-between rounded-2xl bg-slate-900/40 border border-slate-800 p-7 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
              >
                {/* Subtle card glow on hover */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                      {proj.badge}
                    </span>
                    <div className="flex items-center gap-3">
                      <a
                        href={proj.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors"
                        aria-label="GitHub repo"
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                      <a
                        href={proj.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-cyan-400 transition-colors"
                        aria-label="Live preview"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2.5">
                    {proj.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {proj.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SKILLS MATRIX (#skills)                                   */}
      {/* ============================================================ */}
      <section id="skills" className="py-24 border-t border-slate-900 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-mono mb-2">Technical Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Skills & Architecture
            </p>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Specialized in the modern TypeScript ecosystem, high-performance WebGL graphics, and scalable full-stack architectures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((group) => (
              <div
                key={group.category}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 hover:border-slate-700 transition-all hover:-translate-y-1"
              >
                <div className="p-3 w-fit rounded-xl bg-slate-800/80 mb-5">
                  {group.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-4">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. ABOUT & VALUES (#about)                                   */}
      {/* ============================================================ */}
      <section id="about" className="py-24 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="text-xs uppercase tracking-widest text-cyan-400 font-mono">About Developer</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineering with precision, aesthetics, and zero bloat.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              I’m an engineer who values clean code and high-fidelity design equally. 
              My workflow strictly follows the <strong className="text-cyan-400">Ponytail principles</strong> (YAGNI, platform primitives, minimal footprint) 
              ensuring that every project delivers ultra-fast load times, intuitive user experiences, and rock-solid maintainability.
            </p>
            <div className="space-y-3 pt-2 text-sm text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>3+ years building modern React, TypeScript & WebGL applications</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Deep focus on 60fps performance and responsive 3D WebGL</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Located in Ho Chi Minh City, Vietnam (District 1)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="text-3xl font-extrabold text-white mb-1">3+</div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">Years In Tech</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                Hands-on frontend, 3D graphics, and cloud web architectures.
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="text-3xl font-extrabold text-white mb-1">20+</div>
              <div className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-2">Projects Shipped</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                From interactive 3D web apps to enterprise cloud dashboards.
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="text-3xl font-extrabold text-white mb-1">60 FPS</div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">WebGL Performance</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                Resource-conscious shaders, geometry optimization & memory disposal.
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="text-3xl font-extrabold text-white mb-1">YAGNI</div>
              <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">Ponytail Aligned</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                Zero bloated libraries, semantic web primitives, and maintainable diffs.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. CONTACT SECTION (#contact)                                */}
      {/* ============================================================ */}
      <section id="contact" className="py-24 border-t border-slate-900 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-mono mb-2">Get In Touch</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Let's Build Something Exceptional
            </p>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Available for freelance opportunities, full-time engineering roles, and creative 3D web projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Direct Connect Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Direct Channels
                </h3>

                <a
                  href="mailto:nhatprx@gmail.com"
                  className="flex items-center gap-3 text-sm text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <span>nhatprx@gmail.com</span>
                </a>

                <a
                  href="https://github.com/nhatprx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                    <GithubIcon className="w-4 h-4" />
                  </div>
                  <span>github.com/nhatprx</span>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-slate-800 text-sky-400">
                    <LinkedinIcon className="w-4 h-4" />
                  </div>
                  <span>LinkedIn Profile</span>
                </a>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="md:col-span-3">
              <form
                onSubmit={handleContactSubmit}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 space-y-4"
              >
                <div>
                  <label htmlFor="name" className="block text-xs font-mono text-slate-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={contactData.name}
                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                    placeholder="Nguyen Van A"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-mono text-slate-300 mb-1.5">
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    placeholder="you@domain.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-mono text-slate-300 mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={contactData.message}
                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                    placeholder="Tell me about your project, idea or opportunity..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formSent}
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-80"
                >
                  {formSent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      Message Sent Successfully!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. MINIMALIST FOOTER                                         */}
      {/* ============================================================ */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>&copy; {new Date().getFullYear()} NHATPRX. ALL RIGHTS RESERVED.</span>
          </div>

          <div className="flex items-center gap-2">
            <span>BUILT WITH REACT 19 • THREE.JS • TAILWIND V4</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
