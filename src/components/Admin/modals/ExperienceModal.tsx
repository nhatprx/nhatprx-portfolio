import CharCounter from '../CharCounter'
import { CONTENT_LIMITS } from '../../../services/autoTranslate'
import { getInputValidationClass, handleBulletInputKeyDown } from '../utils/validation'
import type { ExperienceItem } from '../../../services/contentStorage'

interface ExperienceModalProps {
  expDraft: ExperienceItem
  editingExpIndex: number | null
  bulletText: string
  techInput: string
  setExpDraft: React.Dispatch<React.SetStateAction<ExperienceItem | null>>
  setBulletText: (val: string) => void
  setTechInput: (val: string) => void
  onAddTech: () => void
  onRemoveTech: (idx: number) => void
  onDelete: (idx: number) => void
  onClose: () => void
  onSave: () => void
}

export default function ExperienceModal({
  expDraft,
  editingExpIndex,
  bulletText,
  techInput,
  setExpDraft,
  setBulletText,
  setTechInput,
  onAddTech,
  onRemoveTech,
  onDelete,
  onClose,
  onSave,
}: ExperienceModalProps) {
  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overscroll-contain font-mono"
    >
      <div
        data-lenis-prevent
        className="bg-neutral-950 border border-white/20 p-6 sm:p-7 max-w-3xl w-full max-h-[90vh] overflow-y-auto overscroll-contain admin-scroll space-y-5 shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-white">
              {editingExpIndex !== null ? 'EDIT CAREER EXPERIENCE' : 'ADD NEW EXPERIENCE'}
            </h3>
            <span className="text-[10px] text-emerald-400">
              {editingExpIndex !== null
                ? `Role 0${editingExpIndex + 1} · ${expDraft.role}`
                : 'Create new role entry'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white text-sm cursor-pointer p-1"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Core Details Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Role Title</label>
              <CharCounter current={expDraft.role?.length || 0} max={CONTENT_LIMITS.work.title} />
            </div>
            <input
              type="text"
              maxLength={CONTENT_LIMITS.work.title}
              value={expDraft.role}
              placeholder="e.g. Senior Software Engineer"
              onChange={(e) => setExpDraft({ ...expDraft, role: e.target.value })}
              className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
                expDraft.role
              )}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Company Name</label>
              <CharCounter current={expDraft.company?.length || 0} max={60} />
            </div>
            <input
              type="text"
              maxLength={60}
              value={expDraft.company}
              placeholder="e.g. Grevo Solutions"
              onChange={(e) => setExpDraft({ ...expDraft, company: e.target.value })}
              className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
                expDraft.company
              )}`}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/40 uppercase">Period</label>
            <CharCounter current={expDraft.period?.length || 0} max={CONTENT_LIMITS.work.period} />
          </div>
          <input
            type="text"
            maxLength={CONTENT_LIMITS.work.period}
            placeholder="e.g. MAR 2025 — PRESENT"
            value={expDraft.period}
            onChange={(e) => setExpDraft({ ...expDraft, period: e.target.value })}
            className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
              expDraft.period
            )}`}
          />
        </div>

        {/* Summary */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/40 uppercase">Executive Summary</label>
            <CharCounter current={expDraft.summary?.length || 0} max={CONTENT_LIMITS.work.summary} />
          </div>
          <textarea
            rows={3}
            value={expDraft.summary}
            placeholder="High-level overview of role responsibilities and team leadership..."
            onChange={(e) => setExpDraft({ ...expDraft, summary: e.target.value })}
            className={`w-full bg-white/[0.03] border p-2.5 text-xs focus:outline-none resize-none transition-colors ${getInputValidationClass(
              expDraft.summary,
              'default',
              true,
              CONTENT_LIMITS.work.summary
            )}`}
          />
        </div>

        {/* Highlights & Bullets */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/40 uppercase">Key Achievements</label>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] ${
                  expDraft.bullets.length >= 5 ? 'text-amber-400 font-bold' : 'text-emerald-400'
                }`}
              >
                {expDraft.bullets.length}/5 bullets {expDraft.bullets.length >= 5 ? '(MAX)' : ''}
              </span>
              <CharCounter current={bulletText.length} max={750} />
            </div>
          </div>
          <textarea
            maxLength={750}
            value={bulletText}
            placeholder="• Architected distributed microservices handling 8,000 req/s..."
            onChange={(e) => {
              const text = e.target.value
              setBulletText(text)
              const parsed = text
                .split('\n')
                .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
                .filter(Boolean)
                .slice(0, 5)
              setExpDraft({
                ...expDraft,
                bullets: parsed,
              })
            }}
            onKeyDown={(e) =>
              handleBulletInputKeyDown(e, bulletText, (updated, bullets) => {
                setBulletText(updated)
                setExpDraft({ ...expDraft, bullets })
              }, 5)
            }
            className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-xs text-white leading-relaxed focus:border-white focus:outline-none resize-none h-36 font-mono"
          />
        </div>

        {/* Tech Stack Chip Manager */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-white/40 uppercase">
              Associated Technologies ({expDraft.tech.length})
            </label>
            <span className="text-[9.5px] text-white/30">Type name and press Enter</span>
          </div>

          <div className="p-3 border border-white/10 bg-white/[0.015] flex flex-wrap items-center gap-1.5 min-h-[48px]">
            {expDraft.tech.length === 0 ? (
              <span className="text-[11px] text-white/30 italic">No technologies added yet</span>
            ) : (
              expDraft.tech.map((t, tIdx) => (
                <span
                  key={tIdx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-white/20 bg-white/[0.05] text-white hover:border-white/40 transition-colors"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveTech(tIdx)}
                    className="text-white/40 hover:text-rose-400 text-[10px] cursor-pointer ml-0.5"
                    title={`Remove ${t}`}
                  >
                    ✕
                  </button>
                </span>
              ))
            )}

            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                placeholder="+ Add tech..."
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                    e.preventDefault()
                    onAddTech()
                  }
                }}
                className="bg-transparent border border-white/20 px-2 py-1 text-xs text-white placeholder-white/30 focus:border-white focus:outline-none w-28"
              />
              {techInput.trim() && (
                <button
                  type="button"
                  onClick={onAddTech}
                  className="px-2.5 py-1 text-xs bg-emerald-400 text-black font-bold hover:bg-emerald-300 cursor-pointer"
                >
                  +
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            {editingExpIndex !== null && (
              <button
                type="button"
                onClick={() => onDelete(editingExpIndex)}
                className="px-3 py-1.5 text-xs border border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
              >
                🗑 DELETE ROLE
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={onSave}
              className="px-5 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/85 cursor-pointer shadow-lg"
            >
              {editingExpIndex !== null ? 'SAVE CHANGES' : '+ CREATE ROLE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
