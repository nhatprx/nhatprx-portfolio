import type { TranslationDict } from '../../../../data/translations'
import CharCounter from '../../CharCounter'
import { CONTENT_LIMITS } from '../../../../services/autoTranslate'
import { getInputValidationClass } from '../../utils/validation'

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
    <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors font-mono">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-3.5 flex items-center text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-emerald-400 font-bold">02</span>
          <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
            About Narrative
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-white/10 space-y-3 bg-white/[0.01]">
          <div className="grid gap-3 sm:grid-cols-2">
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
                className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
                  currentDict.about.title
                )}`}
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
                onBlur={(e) => {
                  const val = e.target.value.trim()
                  if (val && !val.endsWith('.') && !val.endsWith('。')) {
                    updateCurrentDict((d) => ({
                      ...d,
                      about: { ...d.about, titleSub: `${val}.` },
                    }))
                  }
                }}
                className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
                  currentDict.about.titleSub
                )}`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">About Paragraph</label>
              <CharCounter
                current={currentDict.about.p1?.length || 0}
                max={CONTENT_LIMITS.about.p1}
              />
            </div>
            <textarea
              rows={4}
              value={currentDict.about.p1}
              onChange={(e) =>
                updateCurrentDict((d) => ({ ...d, about: { ...d.about, p1: e.target.value } }))
              }
              className={`w-full bg-white/[0.03] border p-2.5 text-xs focus:outline-none resize-none h-28 transition-colors ${getInputValidationClass(
                currentDict.about.p1,
                'default',
                false,
                CONTENT_LIMITS.about.p1
              )}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
