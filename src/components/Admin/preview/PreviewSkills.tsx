import type { TranslationDict } from '../../../data/translations'

interface PreviewSkillsProps {
  t: TranslationDict
}

export default function PreviewSkills({ t }: PreviewSkillsProps) {
  return (
    <section id="preview-skills" className="flex flex-col gap-4 text-left border-t border-white/10 pt-8">
      <div>
        <p className="font-mono text-xs tracking-[0.35em] text-emerald-400 uppercase mb-2 font-medium">
          {t.skills.tag}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-white">
          {t.skills.title} <span className="text-white/30">{t.skills.titleSub}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {t.skills.categories.map((group, idx) => {
          const isFullWidth = Boolean(group.fullWidth)
          return (
            <div
              key={group.title}
              className={`p-3.5 border border-white/10 bg-white/[0.02] flex flex-col justify-between ${
                isFullWidth ? 'sm:col-span-2' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
                  <h3 className="font-mono text-[11px] tracking-wider text-white font-semibold uppercase">
                    {group.title}
                  </h3>
                  <span className="font-mono text-[10px] text-emerald-400">0{idx + 1}</span>
                </div>
                <div className={group.gridClass}>
                  {group.skills.map((s) => (
                    <span
                      key={s}
                      className="font-mono text-[10px] px-2 py-1.5 border border-white/15 bg-white/[0.03] text-white/85 text-center flex items-center justify-center"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

