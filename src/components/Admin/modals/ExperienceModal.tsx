import { useState } from 'react'
import AdminField from '../AdminField'
import { FIELD_RULES, applyFieldRule, validateField } from '../utils/fieldRules'
import { handleBulletInputKeyDown } from '../utils/validation'
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
          <AdminField
            label="Role Title"
            value={expDraft.role}
            rule={FIELD_RULES.workTitle}
            placeholder="e.g. Senior Software Engineer"            onChange={(val) =>
              setExpDraft({ ...expDraft, role: applyFieldRule(val, FIELD_RULES.workTitle) })
            }
          />

          <AdminField
            label="Company Name"
            value={expDraft.company}
            rule={FIELD_RULES.workCompany}
            placeholder="e.g. Grevo Solutions"            onChange={(val) =>
              setExpDraft({ ...expDraft, company: applyFieldRule(val, FIELD_RULES.workCompany) })
            }
          />
        </div>

        <AdminField
          label="Period"
          value={expDraft.period}
          rule={FIELD_RULES.workPeriod}
          placeholder="e.g. MAR 2025 - PRESENT"          onChange={(val) =>
            setExpDraft({ ...expDraft, period: applyFieldRule(val, FIELD_RULES.workPeriod) })
          }
        />

        {/* Summary */}
        <AdminField
          label="Executive Summary"
          value={expDraft.summary}
          rule={FIELD_RULES.workSummary}
          multiline
          rows={3}
          allowEmpty
          placeholder="High-level overview of role responsibilities and team leadership..."          onChange={(val) =>
            setExpDraft({ ...expDraft, summary: applyFieldRule(val, FIELD_RULES.workSummary) })
          }
        />

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
              handleBulletInputKeyDown(e, bulletText, (updated, nextBullets) => {
                setBulletText(updated)
                setExpDraft({ ...expDraft, bullets: nextBullets })
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
