import { ExternalLink, Sparkles } from 'lucide-react'
import { GithubIcon } from './icons'

export interface ProjectItem {
  id: string
  title: string
  description: string
  tags: string[]
  github: string
  live: string
  featured?: boolean
}

interface ProjectsProps {
  projects: ProjectItem[]
}

export default function Projects({ projects }: ProjectsProps) {
  return (
    <section id="projects" className="py-20 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-mono mb-2">Featured Work</h2>
            <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Selected Projects
            </p>
          </div>
          <p className="mt-3 md:mt-0 text-slate-400 text-sm max-w-md">
            Production-grade systems and interactive 3D web experiments built with modern tooling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <article
              key={project.id}
              className="flex flex-col justify-between rounded-2xl bg-slate-900/40 border border-slate-800 p-6 hover:border-cyan-500/50 transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  {project.featured ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">Project</span>
                  )}
                  <div className="flex items-center gap-3">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${project.title} on GitHub`}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View live demo of ${project.title}`}
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {project.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
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
  )
}
