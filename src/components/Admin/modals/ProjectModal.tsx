import { useState } from 'react'
import AdminField from '../AdminField'
import { FIELD_RULES, applyFieldRule, validateField } from '../utils/fieldRules'
import { handleBulletInputKeyDown } from '../utils/validation'
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
  // Guidance hints appear only while the field is focused.
  const [focusedField, setFocusedField] = useState<'bullets' | 'tech' | null>(null)

  // Each bullet is limited to its own budget; the textarea cap is the sum.
  const bulletBudget = FIELD_RULES.workBullet.max * 5
  const bullets = bulletText
    .split('\n')
    .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean)
  const overBudgetBullets = bullets.filter((b) => b.length > FIELD_RULES.workBullet.max)
  const bulletError = overBudgetBullets.length
    ? `Bullet ${overBudgetBullets.length === 1 ? '' : 's'} exceed ${
        FIELD_RULES.workBullet.max
      } characters. Shorten the highlighted line(s).`
    : null

  const techError = techInput.trim() ? validateField(techInput, FIELD_RULES.workTech, true) : null

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
          <AdminField
            label="Project Title / Name"
            value={projDraft.title}
            rule={FIELD_RULES.workTitle}
            placeholder="e.g. Distributed Engine"            onChange={(val) =>
              setProjDraft({ ...projDraft, title: applyFieldRule(val, FIELD_RULES.workTitle) })
            }
          />

          <AdminField
            label="Category / Meta"
            value={projDraft.meta}
            rule={FIELD_RULES.workCompany}
            placeholder="e.g. Distributed Systems · Cloud Infrastructure"            onChange={(val) =>
              setProjDraft({ ...projDraft, meta: applyFieldRule(val, FIELD_RULES.workCompany) })
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Period"
            value={projDraft.period}
            rule={FIELD_RULES.workPeriod}
            placeholder="e.g. 2026"            onChange={(val) =>
              setProjDraft({ ...projDraft, period: applyFieldRule(val, FIELD_RULES.workPeriod) })
            }
          />

          <AdminField
            label="Repository / Demo URL"
            value={projDraft.repoUrl}
            rule={FIELD_RULES.contactUrl}
            allowEmpty
            placeholder="https://github.com/..."            onChange={(val) =>
              setProjDraft({
                ...projDraft,
                repoUrl: applyFieldRule(val.trim(), FIELD_RULES.contactUrl),
              })
            }
          />
        </div>

        {/* Description */}
        <AdminField
          label="Project Description"
          value={projDraft.desc}
          rule={FIELD_RULES.workSummary}
          multiline
          rows={3}
          allowEmpty
          placeholder="High-level engineering problem and architectural solution..."          onChange={(val) =>
            setProjDraft({ ...projDraft, desc: applyFieldRule(val, FIELD_RULES.workSummary) })
          }
        />

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
              <span
                className={`text-[9.5px] font-mono tracking-tight shrink-0 ${
                  bulletText.length > bulletBudget ? 'text-rose-400 font-bold' : 'text-white/30'
                }`}
              >
                {bulletText.length}/{bulletBudget}
              </span>
            </div>
          </div>
          <textarea
            maxLength={bulletBudget}
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
              handleBulletInputKeyDown(e, bulletText, (updated, nextBullets) => {
                setBulletText(updated)
                setProjDraft({ ...projDraft, bullets: nextBullets })
              }, 5)
            }
            onFocus={() => setFocusedField('bullets')}
            onBlur={() => setFocusedField(null)}
            className={`w-full bg-white/[0.03] border p-2.5 text-xs text-white leading-relaxed focus:outline-none resize-none h-36 font-mono ${
              bulletError
                ? 'border-rose-500/80 bg-rose-500/[0.04] focus:border-rose-400 focus:ring-1 focus:ring-rose-500/40'
                : 'border-white/20 focus:border-white'
            }`}
            aria-invalid={!!bulletError}
          />
          {bulletError ? (
            <p role="alert" className="mt-1 text-[10px] text-rose-300/90 leading-snug">
              ⚠ {bulletError}
            </p>
          ) : focusedField === 'bullets' ? (
            <p className="mt-1 text-[10px] text-white/30 leading-snug">
              {FIELD_RULES.workBullet.hint} Max {FIELD_RULES.workBullet.max} characters per bullet.
            </p>
          ) : null}
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
                maxLength={FIELD_RULES.workTech.max}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                    e.preventDefault()
                    onAddTech()
                  }
                }}
                onFocus={() => setFocusedField('tech')}
                onBlur={() => setFocusedField(null)}
                className={`bg-transparent border px-2 py-1 text-xs text-white placeholder-white/30 focus:outline-none w-28 ${
                  techError
                    ? 'border-rose-500/80 bg-rose-500/[0.04] focus:border-rose-400'
                    : 'border-white/20 focus:border-white'
                }`}
                aria-invalid={!!techError}
              />
              {techInput.trim() && (
                <button
                  type="button"
                  onClick={onAddTech}
                  disabled={!!techError}
                  className="px-2.5 py-1 text-xs bg-emerald-400 text-black font-bold hover:bg-emerald-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              )}
            </div>
          </div>
          {techError ? (
            <p role="alert" className="mt-1 text-[10px] text-rose-300/90 leading-snug">
              ⚠ {techError}
            </p>
          ) : focusedField === 'tech' ? (
            <p className="mt-1 text-[10px] text-white/30 leading-snug">
              {FIELD_RULES.workTech.hint}
            </p>
          ) : null}
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
