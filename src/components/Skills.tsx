import { Code, Box, Server, Wrench } from 'lucide-react'

interface SkillCategory {
  category: string
  items: string[]
}

interface SkillsProps {
  skills: SkillCategory[]
}

const iconsMap: Record<string, React.ReactNode> = {
  'Frontend & UI': <Code className="w-5 h-5 text-cyan-400" />,
  '3D & Creative Tech': <Box className="w-5 h-5 text-purple-400" />,
  'Backend & Systems': <Server className="w-5 h-5 text-emerald-400" />,
  'Tools & DevOps': <Wrench className="w-5 h-5 text-amber-400" />,
}

export default function Skills({ skills }: SkillsProps) {
  return (
    <section id="skills" className="py-20 border-t border-slate-900 bg-slate-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-mono mb-2">Technical Proficiency</h2>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Skills & Tech Stack
          </p>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Crafting scalable web architectures, fluid user interfaces, and immersive 3D graphics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skillGroup) => (
            <div
              key={skillGroup.category}
              className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-6 hover:border-slate-700 transition-all hover:-translate-y-1 group"
            >
              <div className="p-3 w-fit rounded-xl bg-slate-800/60 mb-4 group-hover:scale-105 transition-transform">
                {iconsMap[skillGroup.category] || <Code className="w-5 h-5 text-cyan-400" />}
              </div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((item) => (
                  <span
                    key={item}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

