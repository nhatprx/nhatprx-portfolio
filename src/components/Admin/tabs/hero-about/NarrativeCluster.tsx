import type { TranslationDict } from '../../../../data/translations'
import CharCounter from '../../CharCounter'
import { CONTENT_LIMITS } from '../../../../services/autoTranslate'

interface NarrativeClusterProps {
  currentDict: TranslationDict
  isOpen: boolean
  onToggle: () => void
  updateCurrentDict: (updater: (prev: TranslationDict) => TranslationDict) => void
}

export default function NarrativeCluster({
  currentDict,
  isOpen,
  onToggle,
  updateCurrentDict,
}: NarrativeClusterProps) {
  return (
    <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-emerald-400 font-bold">02</span>
          <div className="min-w-0">
            <span className="text-xs font-bold tracking-wider text-white uppercase block">
              About Narrative & Bio
            </span>
            <span className="text-[10px] text-white/40 font-mono truncate block mt-0.5">
              {currentDict.about.title} {currentDict.about.titleSub} —{' '}
              <span className="text-white/60">{currentDict.about.p1?.slice(0, 45)}...</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-mono px-2 py-0.5 border transition-colors ${
              isOpen
                ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                : 'border-white/15 text-white/70 hover:text-white'
            }`}
          >
            {isOpen ? '▲ CLOSE' : '▼ EDIT'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-white/10 space-y-3 bg-white/[0.01]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Section Title</label>
                <CharCounter
                  current={currentDict.about.title?.length || 0}
                  max={CONTENT_LIMITS.about.title}
                />
              </div>
              <input
                type="text"
                maxLength={CONTENT_LIMITS.about.title}
                value={currentDict.about.title}
                onChange={(e) =>
                  updateCurrentDict((d) => ({
                    ...d,
                    about: { ...d.about, title: e.target.value },
                  }))
                }
                className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Subtitle</label>
                <CharCounter
                  current={currentDict.about.titleSub?.length || 0}
                  max={CONTENT_LIMITS.about.titleSub}
                />
              </div>
              <input
                type="text"
                maxLength={CONTENT_LIMITS.about.titleSub}
                value={currentDict.about.titleSub}
                onChange={(e) =>
                  updateCurrentDict((d) => ({
                    ...d,
                    about: { ...d.about, titleSub: e.target.value },
                  }))
                }
                className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">
                About Paragraph{' '}
                <span className="text-emerald-400 font-semibold">(Locked for 100vh Baseline)</span>
              </label>
              <CharCounter
                current={currentDict.about.p1?.length || 0}
                max={CONTENT_LIMITS.about.p1}
              />
            </div>
            <textarea
              rows={3}
              maxLength={CONTENT_LIMITS.about.p1}
              value={currentDict.about.p1}
              onChange={(e) =>
                updateCurrentDict((d) => ({ ...d, about: { ...d.about, p1: e.target.value } }))
              }
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  )
}
