import CharCounter from '../CharCounter'
import { SKILL_GROUP_LIMITS } from '../types'
import type { TranslationDict } from '../../../data/translations'

interface AddSkillModalProps {
  modalCatIndex: number
  modalInput: string
  currentDict: TranslationDict
  setModalInput: (val: string) => void
  onClose: () => void
  onAdd: () => void
}

export default function AddSkillModal({
  modalCatIndex,
  modalInput,
  currentDict,
  setModalInput,
  onClose,
  onAdd,
}: AddSkillModalProps) {
  const cat = currentDict.skills.categories[modalCatIndex]
  const rule = SKILL_GROUP_LIMITS[modalCatIndex] || { maxItems: 10, maxLen: 30 }

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono"
    >
      <div
        data-lenis-prevent
        className="bg-neutral-950 border border-white/20 p-5 max-w-sm w-full space-y-4 shadow-2xl font-mono"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div>
            <h3 className="text-xs font-bold tracking-wider uppercase text-white">
              ADD STACK · GROUP 0{modalCatIndex + 1}
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">
              {cat.title} ({cat.skills.length}/{rule.maxItems})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-white/40 uppercase">
              Stack Name (≤{rule.maxLen} chars)
            </label>
            <CharCounter current={modalInput.length} max={rule.maxLen} />
          </div>
          <input
            type="text"
            autoFocus
            maxLength={rule.maxLen}
            value={modalInput}
            placeholder="e.g. TypeScript, Docker, PostgreSQL..."
            onChange={(e) => setModalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                onAdd()
              }
            }}
            className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onAdd}
            disabled={!modalInput.trim()}
            className="px-4 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/80 disabled:opacity-40 cursor-pointer"
          >
            + ADD STACK
          </button>
        </div>
      </div>
    </div>
  )
}

