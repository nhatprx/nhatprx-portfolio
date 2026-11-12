import { useState } from 'react'
import type { AdminTabProps } from '../types'
import CharCounter from '../CharCounter'
import { CONTENT_LIMITS, translateProjectItem } from '../../../services/autoTranslate'
import type { ProjectItem, SupportedLang, TranslationDict } from '../../../services/contentStorage'

interface ProjectsTabProps extends AdminTabProps {
  allTranslations: Record<SupportedLang, TranslationDict>
}

export default function ProjectsTab({
  currentDict,
  selectedLang,
  allTranslations,
  updateCurrentDict,
  showToast,
}: ProjectsTabProps) {
  const [editingProjIndex, setEditingProjIndex] = useState<number | null>(null)
  const [projDraft, setProjDraft] = useState<ProjectItem | null>(null)

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Projects ({selectedLang.toUpperCase()})
          </h2>
          <p className="text-[10px] text-white/40">Manage your featured engineering projects and links</p>
        </div>
        <button
          onClick={() => {
            setEditingProjIndex(null)
            setProjDraft({
              title: 'New Project',
              meta: 'System Architecture',
              period: '2026',
              desc: 'A high-throughput distributed system.',
              bullets: ['Implemented real-time telemetry.', '99.99% uptime SLA.'],
              tech: ['Go', 'Docker', 'AWS'],
              repoUrl: 'https://github.com/nhatprx',
            })
          }}
          className="px-3 py-1.5 bg-white text-black text-xs font-semibold hover:bg-white/80 transition-colors cursor-pointer"
        >
          + ADD PROJECT
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {currentDict.projects.items.map((item, idx) => (
          <div key={idx} className="border border-white/15 p-4 bg-white/[0.02] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white">{item.title}</span>
                <span className="text-white/40 text-[10px]">[{item.meta}]</span>
                <span className="text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5 font-mono">
                  {item.period}
                </span>
              </div>
              <p className="text-xs text-white/60">{item.desc}</p>
              {item.repoUrl && (
                <span className="text-[10px] text-white/40 block truncate">{item.repoUrl}</span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditingProjIndex(idx)
                  setProjDraft({ ...item, bullets: [...item.bullets], tech: [...item.tech] })
                }}
                className="px-2.5 py-1 text-xs border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer"
              >
                EDIT
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete project: ${item.title}?`)) {
                    updateCurrentDict((d) => ({
                      ...d,
                      projects: {
                        ...d.projects,
                        items: d.projects.items.filter((_, i) => i !== idx),
                      },
                    }))
                  }
                }}
                className="px-2.5 py-1 text-xs border border-red-500/30 text-red-400 hover:border-red-500 transition-colors cursor-pointer"
              >
                DELETE
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Edit Modal */}
      {projDraft && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overscroll-contain"
        >
          <div
            data-lenis-prevent
            className="bg-black border border-white/20 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto overscroll-contain admin-scroll space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-xs font-bold tracking-wider uppercase">
                {editingProjIndex !== null ? 'EDIT PROJECT' : 'ADD NEW PROJECT'}
              </h3>
              {selectedLang !== 'en' && (
                <button
                  type="button"
                  onClick={async () => {
                    const enItem = allTranslations.en.projects.items[editingProjIndex ?? 0] || projDraft
                    const translated = await translateProjectItem(enItem, selectedLang as 'vi' | 'fr' | 'ja')
                    setProjDraft(translated)
                    showToast(`Auto-translated project from EN to ${selectedLang.toUpperCase()}!`)
                  }}
                  className="px-2 py-0.5 text-[10px] text-cyan-300 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                >
                  🌐 Auto-Translate from EN
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Project Title</label>
                  <CharCounter current={projDraft.title?.length || 0} max={CONTENT_LIMITS.work.title} />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.work.title}
                  value={projDraft.title}
                  onChange={(e) => setProjDraft({ ...projDraft, title: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Category / Meta</label>
                  <CharCounter current={projDraft.meta?.length || 0} max={CONTENT_LIMITS.work.company} />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.work.company}
                  value={projDraft.meta}
                  onChange={(e) => setProjDraft({ ...projDraft, meta: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Period (e.g. 2026)</label>
                  <CharCounter current={projDraft.period?.length || 0} max={CONTENT_LIMITS.work.period} />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.work.period}
                  value={projDraft.period}
                  onChange={(e) => setProjDraft({ ...projDraft, period: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase mb-1">GitHub / Demo URL</label>
                <input
                  type="text"
                  value={projDraft.repoUrl || ''}
                  onChange={(e) => setProjDraft({ ...projDraft, repoUrl: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Description</label>
                <CharCounter current={projDraft.desc?.length || 0} max={CONTENT_LIMITS.work.summary} />
              </div>
              <textarea
                rows={2}
                maxLength={CONTENT_LIMITS.work.summary}
                value={projDraft.desc}
                onChange={(e) => setProjDraft({ ...projDraft, desc: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Bullets (One per line, Max 240 chars each)</label>
                <span className="text-[9px] text-white/30">{projDraft.bullets.length} bullets</span>
              </div>
              <textarea
                rows={4}
                value={projDraft.bullets.join('\n')}
                onChange={(e) =>
                  setProjDraft({ ...projDraft, bullets: e.target.value.split('\n').filter(Boolean) })
                }
                className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Tech Stack (comma separated)</label>
                <span className="text-[9px] text-white/30">Universal keywords</span>
              </div>
              <input
                type="text"
                value={projDraft.tech.join(', ')}
                onChange={(e) =>
                  setProjDraft({
                    ...projDraft,
                    tech: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setProjDraft(null)}
                className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  updateCurrentDict((d) => {
                    const items = [...d.projects.items]
                    if (editingProjIndex !== null) {
                      items[editingProjIndex] = projDraft
                    } else {
                      items.unshift(projDraft)
                    }
                    return { ...d, projects: { ...d.projects, items } }
                  })
                  setProjDraft(null)
                  showToast('Project updated!')
                }}
                className="px-4 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/80"
              >
                SAVE ENTRY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

