import { useState } from 'react'
import type { AdminTabProps } from '../types'
import CharCounter from '../CharCounter'
import { CONTENT_LIMITS, translateExperienceItem } from '../../../services/autoTranslate'
import type { ExperienceItem, SupportedLang, TranslationDict } from '../../../services/contentStorage'

interface ExperienceTabProps extends AdminTabProps {
  allTranslations: Record<SupportedLang, TranslationDict>
}

export default function ExperienceTab({
  currentDict,
  selectedLang,
  allTranslations,
  updateCurrentDict,
  showToast,
}: ExperienceTabProps) {
  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null)
  const [expDraft, setExpDraft] = useState<ExperienceItem | null>(null)

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Experience Timeline ({selectedLang.toUpperCase()})
          </h2>
          <p className="text-[10px] text-white/40">Manage your career history, roles, and achievements</p>
        </div>
        <button
          onClick={() => {
            setEditingExpIndex(null)
            setExpDraft({
              role: 'Software Engineer',
              company: 'New Company',
              period: '2026 — PRESENT',
              summary: 'Engineered high-performance systems.',
              bullets: ['Architected scalable services.', 'Reduced latency.'],
              tech: ['React', 'TypeScript', 'Node.js'],
            })
          }}
          className="px-3 py-1.5 bg-white text-black text-xs font-semibold hover:bg-white/80 transition-colors cursor-pointer"
        >
          + ADD EXPERIENCE
        </button>
      </div>

      {/* Experience List */}
      <div className="space-y-3">
        {currentDict.experience.items.map((item, idx) => (
          <div key={idx} className="border border-white/15 p-4 bg-white/[0.02] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white">{item.role}</span>
                <span className="text-white/40 text-[10px]">@{item.company}</span>
                <span className="text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5 font-mono">
                  {item.period}
                </span>
              </div>
              <p className="text-xs text-white/60">{item.summary}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {item.tech.map((t, tIdx) => (
                  <span key={tIdx} className="text-[9px] text-white/40 border border-white/10 px-1.5 py-0.2">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditingExpIndex(idx)
                  setExpDraft({ ...item, bullets: [...item.bullets], tech: [...item.tech] })
                }}
                className="px-2.5 py-1 text-xs border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer"
              >
                EDIT
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete experience: ${item.role} @ ${item.company}?`)) {
                    updateCurrentDict((d) => ({
                      ...d,
                      experience: {
                        ...d.experience,
                        items: d.experience.items.filter((_, i) => i !== idx),
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

      {/* Experience Modal */}
      {expDraft && (
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
                {editingExpIndex !== null ? 'EDIT EXPERIENCE' : 'ADD NEW EXPERIENCE'}
              </h3>
              {selectedLang !== 'en' && (
                <button
                  type="button"
                  onClick={async () => {
                    const enItem = allTranslations.en.experience.items[editingExpIndex ?? 0] || expDraft
                    const translated = await translateExperienceItem(enItem, selectedLang as 'vi' | 'fr' | 'ja')
                    setExpDraft(translated)
                    showToast(`Auto-translated from EN to ${selectedLang.toUpperCase()}!`)
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
                  <label className="text-[10px] text-white/40 uppercase">Role Title</label>
                  <CharCounter current={expDraft.role?.length || 0} max={CONTENT_LIMITS.work.title} />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.work.title}
                  value={expDraft.role}
                  onChange={(e) => setExpDraft({ ...expDraft, role: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Company</label>
                  <CharCounter current={expDraft.company?.length || 0} max={CONTENT_LIMITS.work.company} />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.work.company}
                  value={expDraft.company}
                  onChange={(e) => setExpDraft({ ...expDraft, company: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Period (e.g. 2024 — PRESENT)</label>
                <CharCounter current={expDraft.period?.length || 0} max={CONTENT_LIMITS.work.period} />
              </div>
              <input
                type="text"
                maxLength={CONTENT_LIMITS.work.period}
                value={expDraft.period}
                onChange={(e) => setExpDraft({ ...expDraft, period: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Summary</label>
                <CharCounter current={expDraft.summary?.length || 0} max={CONTENT_LIMITS.work.summary} />
              </div>
              <textarea
                rows={2}
                maxLength={CONTENT_LIMITS.work.summary}
                value={expDraft.summary}
                onChange={(e) => setExpDraft({ ...expDraft, summary: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Bullets (One per line, Max 240 chars each)</label>
                <span className="text-[9px] text-white/30">{expDraft.bullets.length} bullets</span>
              </div>
              <textarea
                rows={4}
                value={expDraft.bullets.join('\n')}
                onChange={(e) =>
                  setExpDraft({ ...expDraft, bullets: e.target.value.split('\n').filter(Boolean) })
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
                value={expDraft.tech.join(', ')}
                onChange={(e) =>
                  setExpDraft({
                    ...expDraft,
                    tech: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setExpDraft(null)}
                className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  updateCurrentDict((d) => {
                    const items = [...d.experience.items]
                    if (editingExpIndex !== null) {
                      items[editingExpIndex] = expDraft
                    } else {
                      items.unshift(expDraft)
                    }
                    return { ...d, experience: { ...d.experience, items } }
                  })
                  setExpDraft(null)
                  showToast('Experience updated!')
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

