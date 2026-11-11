import ThreeCanvas from './components/ThreeCanvas'
import { ArrowUpRight } from 'lucide-react'

export default function App() {
  return (
    <div className="relative w-screen h-screen bg-black text-white font-sans overflow-hidden select-none">
      {/* 1. Fullscreen 3D Canvas (Camera pre-framed on tower crown & helipad to the left) */}
      <ThreeCanvas />

      {/* 2. Right Side Content Overlay (Matches user's wireframe mockup) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 sm:p-10 lg:p-16">
        {/* Top Navbar / Brand Tag */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
              nhatprx.dev // 2026
            </span>
          </div>
          <div className="text-xs font-mono text-neutral-500 hidden sm:block">
            Bitexco Tower • 10.7719° N, 106.7044° E
          </div>
        </header>

        {/* Right-Aligned Hero Text (Directly aligned with user mockup "heading text here") */}
        <div className="grid grid-cols-1 lg:grid-cols-12 w-full my-auto">
          {/* Left Column: Clear transparent area for the 3D Tower */}
          <div className="hidden lg:block lg:col-span-6" />

          {/* Right Column: Hero Heading & Intro */}
          <div className="lg:col-span-6 space-y-6 pointer-events-auto text-left lg:pl-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-950/80 text-[11px] font-mono text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>Full-Stack & Creative 3D Engineer</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
              heading text here
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 max-w-lg leading-relaxed font-normal">
              Specializing in high-performance web applications, responsive user interfaces, and interactive 3D WebGL experiences.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="https://github.com/nhatprx/nhatprx-portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-neutral-200 transition-all shadow-lg shadow-white/10"
              >
                <span>View Projects</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <a
                href="mailto:nhatprx@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 hover:bg-neutral-900 text-neutral-300 font-medium text-xs tracking-wider uppercase transition-colors"
              >
                <span>Contact Me</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar Info */}
        <footer className="flex items-center justify-between text-[11px] font-mono text-neutral-500 border-t border-neutral-900 pt-4">
          <span>DRAG TO ORBIT 360° • SCROLL TO ZOOM</span>
          <span className="hidden sm:inline">PURE MONOCHROME ARCHITECTURE</span>
        </footer>
      </div>
    </div>
  )
}
