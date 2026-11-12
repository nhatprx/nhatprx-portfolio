import { useState } from 'react'
import { type AdminTabProps, SKILL_GROUP_LIMITS } from '../types'
import CharCounter from '../CharCounter'
import { CONTENT_LIMITS } from '../../../services/autoTranslate'

export default function SkillsTab({
  currentDict,
  selectedLang,
  updateCurrentDict,
  showToast,
}: AdminTabProps) {
  const [skillModalCategoryIndex, setSkillModalCategoryIndex] = useState<number | null>(null)
  const [skillModalInput, setSkillModalInput] = useState<string>('')

  const handleAddSkillFromModal = () => {
    if (skillModalCategoryIndex === null) return
    const val = skillModalInput.trim()
    if (!val) return
    const rule = SKILL_GROUP_LIMITS[skillModalCategoryIndex] || { maxItems: 10, maxLen: 30 }
    const cat = currentDict.skills.categories[skillModalCategoryIndex]
    if (cat.skills.length >= rule.maxItems) {
      showToast(`Limit reached: maximum ${rule.maxItems} skills for ${cat.title}`)
      return
    }
    if (val.length > rule.maxLen) {
      showToast(`Skill length exceeds limit of ${rule.maxLen} characters`)
      return
    }
    if (cat.skills.some((s) => s.toLowerCase() === val.toLowerCase())) {
      showToast(`'${val}' already exists in ${cat.title}`)
      return
    }
    updateCurrentDict((d) => {
      const cats = [...d.skills.categories]
      cats[skillModalCategoryIndex] = {
        ...cats[skillModalCategoryIndex],
        skills: [...cats[skillModalCategoryIndex].skills, val],
      }
      return { ...d, skills: { ...d.skills, categories: cats } }
    })
    setSkillModalInput('')
    setSkillModalCategoryIndex(null)
    showToast(`Added '${val}' to ${cat.title}!`)
  }

  return (
    <div className="space-y-6 font-mono">
      <div className="border border-white/10 bg-white/[0.01] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h2 className="text-xs font-bold text-white/80 uppercase tracking-widest">
            Skills Section ({selectedLang.toUpperCase()})
          </h2>
          <span className="text-[10px] text-white/40 font-mono">
            Grid-aligned item constraints
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Title</label>
              <CharCounter current={currentDict.skills.title?.length || 0} max={CONTENT_LIMITS.skills.title} />
            </div>
            <input
              type="text"
              maxLength={CONTENT_LIMITS.skills.title}
              value={currentDict.skills.title}
              onChange={(e) =>
                updateCurrentDict((d) => ({ ...d, skills: { ...d.skills, title: e.target.value } }))
              }
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Subtitle</label>
              <CharCounter current={currentDict.skills.titleSub?.length || 0} max={CONTENT_LIMITS.skills.titleSub} />
            </div>
            <input
              type="text"
              maxLength={CONTENT_LIMITS.skills.titleSub}
              value={currentDict.skills.titleSub}
              onChange={(e) =>
                updateCurrentDict((d) => ({ ...d, skills: { ...d.skills, titleSub: e.target.value } }))
              }
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">
              Skill Groups ({currentDict.skills.categories.length})
            </h3>
            <span className="text-[9.5px] text-white/30 font-mono">
              Recommended: Grp 1 & 2 (≤14c) · Grp 3 (≤18c) · Grp 4 (≤26c) · Grp 5 (≤50c)
            </span>
          </div>

          {currentDict.skills.categories.map((cat, cIdx) => {
            const rule = SKILL_GROUP_LIMITS[cIdx] || { maxItems: 8, maxLen: 30, label: 'Custom Group' }
            const isAtCapacity = cat.skills.length >= rule.maxItems

            return (
              <div key={cIdx} className="border border-white/10 p-4 bg-black/40 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      GROUP 0{cIdx + 1}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      ({cat.skills.length}/{rule.maxItems} STACKS)
                    </span>
                  </div>
                  <CharCounter current={cat.title?.length || 0} max={30} />
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Group Title</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={cat.title}
                    onChange={(e) => {
                      updateCurrentDict((d) => {
                        const cats = [...d.skills.categories]
                        cats[cIdx] = { ...cats[cIdx], title: e.target.value }
                        return { ...d, skills: { ...d.skills, categories: cats } }
                      })
                    }}
                    className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>

                {/* Interactive Skills Badges */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-white/40 uppercase">
                      Stacks / Languages (Max {rule.maxItems} items, ≤{rule.maxLen}c)
                    </label>
                    <span className="text-[9px] text-white/30 font-mono">
                      Click ✕ to remove
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-2 border border-white/10 bg-white/[0.02] min-h-[42px] items-center">
                    {cat.skills.length === 0 ? (
                      <span className="text-xs text-white/30 italic font-mono">No skills added yet</span>
                    ) : (
                      cat.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-white/20 bg-white/[0.05] text-white font-mono hover:border-white/40 transition-colors"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => {
                              updateCurrentDict((d) => {
                                const cats = [...d.skills.categories]
                                cats[cIdx] = {
                                  ...cats[cIdx],
                                  skills: cats[cIdx].skills.filter((_, i) => i !== sIdx),
                                }
                                return { ...d, skills: { ...d.skills, categories: cats } }
                              })
                            }}
                            className="text-white/40 hover:text-rose-400 transition-colors ml-0.5 cursor-pointer font-bold text-[11px]"
                            title={`Remove ${skill}`}
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Stack Button (Modal Trigger) */}
                {!isAtCapacity ? (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSkillModalCategoryIndex(cIdx)
                        setSkillModalInput('')
                      }}
                      className="w-full py-2 border border-dashed border-white/20 text-xs font-mono text-white/70 hover:text-white hover:border-white/50 hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>+ ADD STACK</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2 border border-amber-500/20 bg-amber-500/5 text-amber-300/80 text-[10px] font-mono flex items-center gap-2">
                    <span>●</span>
                    <span>Grid capacity full ({cat.skills.length}/{rule.maxItems} stacks). Remove an item to add another.</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Skill Modal */}
      {skillModalCategoryIndex !== null && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono"
        >
          <div
            data-lenis-prevent
            className="bg-black border border-white/20 p-6 max-w-md w-full space-y-4 shadow-2xl font-mono"
          >
            {(() => {
              const cat = currentDict.skills.categories[skillModalCategoryIndex]
              const rule = SKILL_GROUP_LIMITS[skillModalCategoryIndex] || { maxItems: 8, maxLen: 30 }
              return (
                <>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div>
                      <h3 className="text-xs font-bold tracking-wider uppercase text-white">
                        ADD STACK · GROUP 0{skillModalCategoryIndex + 1}
                      </h3>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {cat.title} ({cat.skills.length}/{rule.maxItems})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSkillModalCategoryIndex(null)}
                      className="text-white/40 hover:text-white text-xs font-mono"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40 uppercase">
                        Language / Stack Name (Max {rule.maxLen} chars)
                      </label>
                      <CharCounter current={skillModalInput.length} max={rule.maxLen} />
                    </div>
                    <input
                      type="text"
                      autoFocus
                      maxLength={rule.maxLen}
                      value={skillModalInput}
                      placeholder="e.g. TypeScript, Docker, PostgreSQL..."
                      onChange={(e) => setSkillModalInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSkillFromModal()
                        }
                      }}
                      className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-xs text-white focus:border-white focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setSkillModalCategoryIndex(null)}
                      className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleAddSkillFromModal}
                      disabled={!skillModalInput.trim()}
                      className="px-4 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/80 disabled:opacity-40"
                    >
                      + ADD STACK
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
