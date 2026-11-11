import { ArrowRight, Code2, Sparkles, FolderGit2 } from 'lucide-react'
import ThreeCanvas from './ThreeCanvas'

interface HeroProps {
  name: string
  role: string
  tagline: string
  status: string
}

export default function Hero({ name, role, tagline, status }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:py-24">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Text & CTA */}
        <div className="lg:col-span-7 space-y-6 z-10 text-center lg:text-left">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{status}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">{name}</span>
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-slate-300">
            {role}
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {tagline}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-all shadow-lg shadow-cyan-500/20 hover:scale-102"
            >
              <FolderGit2 className="w-4 h-4" />
              View Projects
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold transition-all hover:border-slate-600"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              Let's Connect
            </a>
          </div>

          {/* Quick tech stack badges */}
          <div className="pt-6 border-t border-slate-900/80 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> React 19
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Three.js
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Tailwind CSS
            </span>
          </div>
        </div>

        {/* Right Column: 3D Interactive Canvas */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="w-full max-w-[460px] h-[500px] sm:h-[540px] rounded-2xl bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-slate-950 border border-slate-800/80 p-1 shadow-2xl relative overflow-hidden">
            <ThreeCanvas />
          </div>
        </div>
      </div>
    </section>
  )
}

