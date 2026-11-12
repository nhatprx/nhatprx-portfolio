import CharCounter from '../CharCounter'
import { CONTENT_LIMITS } from '../../../services/autoTranslate'
import { getInputValidationClass, handleBulletInputKeyDown } from '../utils/validation'
import type { ProjectItem } from '../../../services/contentStorage'

interface ProjectModalProps {
  projDraft: ProjectItem
  editingProjIndex: number | null
  bulletText: string
  techInput: string
  setProjDraft: React.Dispatch<React.SetStateAction<ProjectItem | null>>
  setBulletText: (val: string) => void
  setTechInput: (val: string) => void
  onAddTech: () => void
  onRemoveTech: (idx: number) => void
  onDelete: (idx: number) => void
  onClose: () => void
  onSave: () => void
}

export default function ProjectModal({
  projDraft, editingProjIndex, bulletText, techInput,
  setProjDraft, setBulletText, setTechInput,
  onAddTech, onRemoveTech, onDelete, onClose, onSave,
}: ProjectModalProps) {
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
              {editingProjIndex !== null ? 'EDIT FEATURED PROJECT' : 'ADD NEW PROJECT'}
            </h3>
            <span className="text-[10px] text-emerald-400">
              {editingProjIndex !== null
                ? `Project 0${editingProjIndex + 1} · ${projDraft.title}`
                : 'Configure new portfolio showcase project'}
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

        {/* Core Fields Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Project Title / Name</label>
              <CharCounter current={projDraft.title?.length || 0} max={CONTENT_LIMITS.work.title} />
            </div>
            <input
              type="text"
              maxLength={CONTENT_LIMITS.work.title}
              value={projDraft.title}
              placeholder="e.g. Distributed Engine"
              onChange={(e) => setProjDraft({ ...projDraft, title: e.target.value })}
              className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
                projDraft.title
              )}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Category / Meta</label>
              <CharCounter current={projDraft.meta?.length || 0} max={60} />
            </div>
            <input
              type="text"
              maxLength={60}
              value={projDraft.meta}
              placeholder="e.g. Distributed Systems · Cloud Infrastructure"
              onChange={(e) => setProjDraft({ ...projDraft, meta: e.target.value })}
              className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
                projDraft.meta
              )}`}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Period</label>
              <CharCounter
                current={projDraft.period?.length || 0}
                max={CONTENT_LIMITS.work.period}
              />
            </div>
            <input
              type="text"
              maxLength={CONTENT_LIMITS.work.period}
              placeholder="e.g. 2026"
              value={projDraft.period}
              onChange={(e) => setProjDraft({ ...projDraft, period: e.target.value })}
              className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
                projDraft.period
              )}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Repository / Demo URL</label>
              <span className="text-[9px] text-white/30">Optional</span>
            </div>
            <input
              type="text"
              placeholder="https://github.com/..."
              value={projDraft.repoUrl || ''}
              onChange={(e) => setProjDraft({ ...projDraft, repoUrl: e.target.value })}
              className={`w-full bg-white/[0.03] border p-2 text-xs text-white focus:outline-none transition-colors ${getInputValidationClass(
                projDraft.repoUrl,
                'url',
                true
              )}`}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/40 uppercase">Project Description</label>
            <CharCounter
              current={projDraft.desc?.length || 0}
              max={CONTENT_LIMITS.work.summary}
            />
          </div>
          <textarea
            rows={3}
            value={projDraft.desc}
            placeholder="High-level engineering problem and architectural solution..."
            onChange={(e) => setProjDraft({ ...projDraft, desc: e.target.value })}
            className={`w-full bg-white/[0.03] border p-2.5 text-xs focus:outline-none resize-none transition-colors ${getInputValidationClass(
              projDraft.desc,
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
                  projDraft.bullets.length >= 5 ? 'text-amber-400 font-bold' : 'text-emerald-400'
                }`}
              >
                {projDraft.bullets.length}/5 bullets {projDraft.bullets.length >= 5 ? '(MAX)' : ''}
              </span>
              <CharCounter current={bulletText.length} max={750} />
            </div>
          </div>
          <textarea
            maxLength={750}
            value={bulletText}
            placeholder="• Replaced heavy WebDriver with raw CDP WebSockets..."
            onChange={(e) => {
              const text = e.target.value
              setBulletText(text)
              const parsed = text
                .split('\n')
                .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
                .filter(Boolean)
                .slice(0, 5)
              setProjDraft({
                ...projDraft,
                bullets: parsed,
              })
            }}
            onKeyDown={(e) =>
              handleBulletInputKeyDown(e, bulletText, (updated, bullets) => {
                setBulletText(updated)
                setProjDraft({ ...projDraft, bullets })
              }, 5)
            }
            className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-xs text-white leading-relaxed focus:border-white focus:outline-none resize-none h-36 font-mono"
          />
        </div>

        {/* Tech Stack Chip Manager */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-white/40 uppercase">
              Technologies Used ({projDraft.tech.length})
            </label>
            <span className="text-[9.5px] text-white/30">Type name and press Enter</span>
          </div>

          <div className="p-3 border border-white/10 bg-white/[0.015] flex flex-wrap items-center gap-1.5 min-h-[48px]">
            {projDraft.tech.length === 0 ? (
              <span className="text-[11px] text-white/30 italic">No technologies added yet</span>
            ) : (
              projDraft.tech.map((t, tIdx) => (
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
            {editingProjIndex !== null && (
              <button
                type="button"
                onClick={() => onDelete(editingProjIndex)}
                className="px-3 py-1.5 text-xs border border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
              >
                🗑 DELETE PROJECT
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
              {editingProjIndex !== null ? 'SAVE CHANGES' : '+ CREATE PROJECT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
