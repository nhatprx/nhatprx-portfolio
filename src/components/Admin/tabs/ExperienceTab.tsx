import { useState } from 'react'
import type { AdminTabProps } from '../types'
import type { ExperienceItem } from '../../../services/contentStorage'
import ExperienceModal from '../modals/ExperienceModal'
import { FIELD_RULES, validateField } from '../utils/fieldRules'

export default function ExperienceTab({
  currentDict,
  selectedLang,
  updateCurrentDict,
  showToast,
}: AdminTabProps) {
  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null)
  const [expDraft, setExpDraft] = useState<ExperienceItem | null>(null)
  const [techInput, setTechInput] = useState('')
  const [bulletText, setBulletText] = useState('')

  const openAddModal = () => {
    setEditingExpIndex(null)
    const newDraft: ExperienceItem = {
      role: 'Senior Software Engineer',
      company: 'Tech Corp',
      period: '2025 - PRESENT',
      summary: 'Architected scalable services and led core platform features.',
      bullets: [
        'Designed distributed microservices handling high concurrent workloads.',
        'Optimized database queries and cloud infrastructure to reduce latency.',
      ],
      tech: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    }
    setExpDraft(newDraft)
    setBulletText(newDraft.bullets.map((b) => (b.startsWith('• ') ? b : `• ${b}`)).join('\n'))
    setTechInput('')
  }

  const openEditModal = (item: ExperienceItem, idx: number) => {
    setEditingExpIndex(idx)
    setExpDraft({ ...item, bullets: [...item.bullets], tech: [...item.tech] })
    setBulletText(
      item.bullets.length > 0
        ? item.bullets.map((b) => (b.startsWith('• ') ? b : `• ${b}`)).join('\n')
        : '• '
    )
    setTechInput('')
  }

  const handleAddTech = () => {
    if (!expDraft) return
    const val = techInput.trim()
    if (!val) return

    const error = validateField(val, FIELD_RULES.workTech, true)
    if (error) {
      showToast(error, 'error')
      return
    }
    if (!expDraft.tech.some((t) => t.toLowerCase() === val.toLowerCase())) {
      setExpDraft({ ...expDraft, tech: [...expDraft.tech, val] })
    } else {
      showToast(`"${val}" is already in the technology list.`, 'warning')
    }
    setTechInput('')
  }

  const handleRemoveTech = (idxToRemove: number) => {
    if (!expDraft) return
    setExpDraft({
      ...expDraft,
      tech: expDraft.tech.filter((_, i) => i !== idxToRemove),
    })
  }

  const handleDelete = (idxToDelete: number) => {
    updateCurrentDict((d) => ({
      ...d,
      experience: {
        ...d.experience,
        items: d.experience.items.filter((_, i) => i !== idxToDelete),
      },
    }))
    setExpDraft(null)
    setEditingExpIndex(null)
    showToast('Experience deleted')
  }

  const handleSave = () => {
    if (!expDraft) return

    // Validate every field before writing anything, and tell the user exactly
    // what is wrong instead of saving a broken entry.
    const checks: { value: string | undefined; rule: (typeof FIELD_RULES)[keyof typeof FIELD_RULES] }[] = [
      { value: expDraft.role, rule: FIELD_RULES.workTitle },
      { value: expDraft.company, rule: FIELD_RULES.workCompany },
      { value: expDraft.period, rule: FIELD_RULES.workPeriod },
      { value: expDraft.summary, rule: FIELD_RULES.workSummary },
    ]
    for (const { value, rule } of checks) {
      const error = validateField(value, rule, rule === FIELD_RULES.workSummary)
      if (error) {
        showToast(error, 'error')
        return
      }
    }

    const cleanBullets = bulletText
      .split('\n')
      .map((b) => b.replace(/^[•\-*]\s*/, '').trim())
      .filter(Boolean)

    if (cleanBullets.length === 0) {
      showToast('At least one bullet achievement is required.', 'error')
      return
    }

    const tooLong = cleanBullets.find((b) => b.length > FIELD_RULES.workBullet.max)
    if (tooLong) {
      showToast(
        `A bullet is ${tooLong.length} characters long (max ${FIELD_RULES.workBullet.max}). Shorten it before saving.`,
        'error'
      )
      return
    }

    const finalDraft = {
      ...expDraft,
      summary: expDraft.summary || '',
      bullets: cleanBullets.slice(0, 5),
    }

    updateCurrentDict((d) => {
      const items = [...d.experience.items]
      if (editingExpIndex !== null && editingExpIndex >= 0 && editingExpIndex < items.length) {
        items[editingExpIndex] = finalDraft
      } else {
        items.unshift(finalDraft)
      }
      return { ...d, experience: { ...d.experience, items } }
    })
    setExpDraft(null)
    setEditingExpIndex(null)
    showToast(editingExpIndex !== null ? 'Experience updated' : 'Experience added')
  }

  return (
    <div className="space-y-4 font-mono">
      {/* Header Bar */}
      <div className="border border-white/10 bg-white/[0.015] p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-widest">
            03 · Career Experience
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">
            ({selectedLang.toUpperCase()})
          </span>
          <span className="text-[10px] text-white/40">
            · {currentDict.experience.items.length} ROLES
          </span>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-3 py-1.5 bg-white text-black text-xs font-bold hover:bg-white/85 transition-colors cursor-pointer"
        >
          + ADD EXPERIENCE
        </button>
      </div>

      {/* Experience List - Clean cards without description */}
      <div className="space-y-2.5">
        {currentDict.experience.items.length === 0 ? (
          <div className="border border-white/10 p-6 text-center text-xs text-white/40">
            No experience entries yet. Click "+ ADD EXPERIENCE" to create one.
          </div>
        ) : (
          currentDict.experience.items.map((item, idx) => (
            <div
              key={idx}
              className="border border-white/10 p-3.5 bg-black/40 flex items-center justify-between gap-4 hover:border-white/25 transition-colors group cursor-pointer"
              onClick={() => openEditModal(item, idx)}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                    {item.role}
                  </span>
                  <span className="text-emerald-400 text-xs">@{item.company}</span>
                  <span className="text-[9.5px] text-white/50 border border-white/10 px-1.5 py-0.5 bg-white/[0.02]">
                    {item.period}
                  </span>
                </div>

                {item.tech && item.tech.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tech.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[9.5px] text-white/40 border border-white/10 px-1.5 py-0.2 bg-white/[0.02]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="flex items-center gap-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => openEditModal(item, idx)}
                  className="px-2.5 py-1 text-xs border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer"
                >
                  EDIT
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="px-2.5 py-1 text-xs border border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Experience Edit/Add Modal */}
      {expDraft && (
        <ExperienceModal
          expDraft={expDraft}
          editingExpIndex={editingExpIndex}
          bulletText={bulletText}
          techInput={techInput}
          setExpDraft={setExpDraft}
          setBulletText={setBulletText}
          setTechInput={setTechInput}
          onAddTech={handleAddTech}
          onRemoveTech={handleRemoveTech}
          onDelete={handleDelete}
          onClose={() => setExpDraft(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
