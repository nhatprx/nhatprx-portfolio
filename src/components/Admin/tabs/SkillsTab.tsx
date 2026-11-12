import { useState } from 'react'
import { type AdminTabProps, SKILL_GROUP_LIMITS } from '../types'
import CharCounter from '../CharCounter'
import { CONTENT_LIMITS } from '../../../services/autoTranslate'
import { getInputValidationClass } from '../utils/validation'
import AddSkillModal from '../modals/AddSkillModal'

export default function SkillsTab({
  currentDict,
  updateCurrentDict,
  showToast,
}: AdminTabProps) {
  const [activeCluster, setActiveCluster] = useState<string | null>(null)
  const [modalCatIndex, setModalCatIndex] = useState<number | null>(null)
  const [modalInput, setModalInput] = useState<string>('')

  const toggleCluster = (key: string) => {
    setActiveCluster((prev) => (prev === key ? null : key))
  }

  const handleAddSkill = () => {
    if (modalCatIndex === null) return
    const val = modalInput.trim()
    if (!val) return

    const rule = SKILL_GROUP_LIMITS[modalCatIndex] || { maxItems: 10, maxLen: 30 }
    const cat = currentDict.skills.categories[modalCatIndex]

    if (cat.skills.length >= rule.maxItems) {
      showToast(`Limit reached: maximum ${rule.maxItems} items for ${cat.title}`)
      return
    }
    if (val.length > rule.maxLen) {
      showToast(`Item exceeds limit of ${rule.maxLen} characters`)
      return
    }
    if (cat.skills.some((s) => s.toLowerCase() === val.toLowerCase())) {
      showToast(`'${val}' already exists in ${cat.title}`)
      return
    }

    updateCurrentDict((d) => {
      const cats = [...d.skills.categories]
      cats[modalCatIndex] = {
        ...cats[modalCatIndex],
        skills: [...cats[modalCatIndex].skills, val],
      }
      return { ...d, skills: { ...d.skills, categories: cats } }
    })

    setModalInput('')
    setModalCatIndex(null)
    showToast(`Added '${val}' to ${cat.title}`)
  }

  const handleRemoveSkill = (catIdx: number, skillIdx: number) => {
    updateCurrentDict((d) => {
      const cats = [...d.skills.categories]
      cats[catIdx] = {
        ...cats[catIdx],
        skills: cats[catIdx].skills.filter((_, i) => i !== skillIdx),
      }
      return { ...d, skills: { ...d.skills, categories: cats } }
    })
  }

  const handleUpdateCatTitle = (catIdx: number, newTitle: string) => {
    updateCurrentDict((d) => {
      const cats = [...d.skills.categories]
      if (!cats[catIdx]) return d
      cats[catIdx] = { ...cats[catIdx], title: newTitle }
      return { ...d, skills: { ...d.skills, categories: cats } }
    })
  }

  return (
    <div className="space-y-3 font-mono">
      {/* Top Header Bar */}
      <div className="border border-white/10 bg-white/[0.015] p-3.5 flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-widest">
          02 · Technical Arsenal
        </span>
      </div>

      {/* CLUSTER 01: SECTION HEADINGS */}
      <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => toggleCluster('headings')}
          className="w-full p-3.5 flex items-center text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-mono text-emerald-400 font-bold">01</span>
            <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
              Section Headings
            </span>
          </div>
        </button>

        {activeCluster === 'headings' && (
          <div className="p-4 pt-1 border-t border-white/10 space-y-3 bg-white/[0.01]">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Section Heading</label>
                  <CharCounter
                    current={currentDict.skills.title?.length || 0}
                    max={CONTENT_LIMITS.skills.title}
                  />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.skills.title}
                  value={currentDict.skills.title}
                  onChange={(e) =>
                    updateCurrentDict((d) => ({
                      ...d,
                      skills: { ...d.skills, title: e.target.value },
                    }))
                  }
                  className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
                    currentDict.skills.title
                  )}`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Subtitle</label>
                  <CharCounter
                    current={currentDict.skills.titleSub?.length || 0}
                    max={CONTENT_LIMITS.skills.titleSub}
                  />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.skills.titleSub}
                  value={currentDict.skills.titleSub}
                  onChange={(e) =>
                    updateCurrentDict((d) => ({
                      ...d,
                      skills: { ...d.skills, titleSub: e.target.value },
                    }))
                  }
                  onBlur={(e) => {
                    const val = e.target.value.trim()
                    if (val && !val.endsWith('.') && !val.endsWith('。')) {
                      updateCurrentDict((d) => ({
                        ...d,
                        skills: { ...d.skills, titleSub: `${val}.` },
                      }))
                    }
                  }}
                  className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
                    currentDict.skills.titleSub
                  )}`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CLUSTERS 02+: SKILL GROUPS (ONE PER CATEGORY) */}
      {currentDict.skills.categories.map((cat, cIdx) => {
        const clusterKey = `cat-${cIdx}`
        const isOpen = activeCluster === clusterKey
        const rule = SKILL_GROUP_LIMITS[cIdx] || { maxItems: 10, maxLen: 30 }
        const isAtCapacity = cat.skills.length >= rule.maxItems
        const groupNum = String(cIdx + 2).padStart(2, '0')

        return (
          <div
            key={cIdx}
            className="border border-white/10 bg-black/40 overflow-hidden transition-colors"
          >
            {/* Header: Click to Toggle, No Edit button, Minimal text */}
            <button
              type="button"
              onClick={() => toggleCluster(clusterKey)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-emerald-400 font-bold">{groupNum}</span>
                <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
                  {cat.title || `Skill Group ${cIdx + 1}`}
                </span>
              </div>

              <span
                className={`text-[9.5px] px-1.5 py-0.5 border font-mono shrink-0 ${
                  isAtCapacity
                    ? 'border-amber-500/30 text-amber-300 bg-amber-500/10'
                    : 'border-white/15 text-white/50 bg-white/[0.02]'
                }`}
              >
                {cat.skills.length}/{rule.maxItems} STACKS
              </span>
            </button>

            {/* Expanded Cluster Form */}
            {isOpen && (
              <div className="p-4 pt-1 border-t border-white/10 space-y-3 bg-white/[0.01]">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-white/40 uppercase">Group Title</label>
                    <CharCounter current={cat.title?.length || 0} max={30} />
                  </div>
                  <input
                    type="text"
                    maxLength={30}
                    value={cat.title}
                    placeholder="Group Title"
                    onChange={(e) => handleUpdateCatTitle(cIdx, e.target.value)}
                    className={`w-full bg-white/[0.03] border p-2 text-xs font-bold tracking-wider focus:outline-none transition-colors ${getInputValidationClass(
                      cat.title
                    )}`}
                  />
                </div>

                {/* Stacks Badges Area */}
                <div>
                  <div className="mb-1">
                    <label className="text-[10px] text-white/40 uppercase">
                      Configured Stacks
                    </label>
                  </div>

                  <div className="p-2.5 border border-white/10 bg-white/[0.015] min-h-[52px] flex flex-wrap items-center gap-1.5">
                    {cat.skills.length === 0 ? (
                      <span className="text-[11px] text-white/30 italic">No stacks yet</span>
                    ) : (
                      cat.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-white/20 bg-white/[0.05] text-white hover:border-white/40 transition-colors"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(cIdx, sIdx)}
                            className="text-white/40 hover:text-rose-400 transition-colors ml-0.5 cursor-pointer text-[10px]"
                            title={`Remove ${skill}`}
                            aria-label={`Remove ${skill}`}
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    )}

                    {!isAtCapacity && (
                      <button
                        type="button"
                        onClick={() => {
                          setModalCatIndex(cIdx)
                          setModalInput('')
                        }}
                        className="inline-flex items-center justify-center px-2 py-1 text-xs border border-dashed border-white/30 text-emerald-400/90 hover:text-emerald-300 hover:border-emerald-400 hover:bg-emerald-400/[0.05] transition-colors cursor-pointer font-bold"
                        title="Add stack"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Add Skill Modal */}
      {modalCatIndex !== null && (
        <AddSkillModal
          modalCatIndex={modalCatIndex}
          modalInput={modalInput}
          currentDict={currentDict}
          setModalInput={setModalInput}
          onClose={() => setModalCatIndex(null)}
          onAdd={handleAddSkill}
        />
      )}
    </div>
  )
}
