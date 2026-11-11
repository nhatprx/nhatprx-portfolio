import { CheckCircle2, Zap, ShieldCheck, HeartHandshake } from 'lucide-react'

export default function About() {
  const highlights = [
    {
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      title: "Performance First",
      desc: "Optimized bundle sizes, 60fps WebGL rendering, and fast initial load times.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />,
      title: "Clean Architecture",
      desc: "Strict adherence to Ponytail principles: YAGNI, standard web primitives, and zero boilerplate.",
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-emerald-400" />,
      title: "User Centric",
      desc: "Accessible, responsive layouts that work flawlessly across mobile, tablet, and desktop.",
    },
  ]

  return (
    <section id="about" className="py-20 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-mono">About Me</h2>
            <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Passionate about creating modern, intuitive digital experiences.
            </p>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              I specialize in bridging the gap between elegant design and resilient software engineering. 
              Whether crafting custom WebGL shaders, building high-throughput React interfaces, or structuring clean APIs, I focus on shipping value without needless bloat.
            </p>
            <div className="pt-2 flex flex-col gap-2.5 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>3+ years in modern React, TypeScript & Web ecosystem</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Specialized in Three.js & creative interactive 3D web</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Follows Ponytail: Minimalist, maintainable, production-ready</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="p-3 w-fit rounded-xl bg-slate-800/80 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

