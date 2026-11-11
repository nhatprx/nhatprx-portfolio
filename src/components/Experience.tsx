import { Briefcase } from 'lucide-react'

interface ExperienceItem {
  role: string
  company: string
  period: string
  description: string
}

interface ExperienceProps {
  experience: ExperienceItem[]
}

export default function Experience({ experience }: ExperienceProps) {
  return (
    <section id="experience" className="py-20 border-t border-slate-900 bg-slate-950/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-mono mb-2">Career Journey</h2>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Work Experience
          </p>
        </div>

        <div className="relative border-l border-slate-800 ml-4 md:ml-32 space-y-10">
          {experience.map((item, index) => (
            <div key={index} className="relative pl-8 group">
              {/* Timeline marker */}
              <div className="absolute -left-3.5 top-1 w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 group-hover:scale-110 transition-all">
                <Briefcase className="w-3.5 h-3.5" />
              </div>

              {/* Date tag for desktop layout */}
              <div className="md:absolute md:-left-36 md:top-1.5 text-xs font-mono text-cyan-400/90 mb-1 md:mb-0">
                {item.period}
              </div>

              <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 p-5 hover:border-slate-700 transition-colors">
                <h3 className="text-lg font-bold text-white">
                  {item.role}
                </h3>
                <p className="text-sm font-medium text-slate-300 mb-2">
                  {item.company}
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

