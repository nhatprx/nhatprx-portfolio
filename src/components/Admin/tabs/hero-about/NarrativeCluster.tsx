import type { TranslationDict } from '../../../../data/translations'
import AdminField from '../../AdminField'
import { FIELD_RULES, applyFieldRule } from '../../utils/fieldRules'

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
            <AdminField
              label="Section Title"
              value={currentDict.about.title}
              rule={FIELD_RULES.aboutTitle}
              placeholder="Building systems"              onChange={(val) =>
                updateCurrentDict((d) => ({
                  ...d,
                  about: {
                    ...d.about,
                    title: applyFieldRule(val, FIELD_RULES.aboutTitle),
                  },
                }))
              }
            />

            <AdminField
              label="Subtitle"
              value={currentDict.about.titleSub}
              rule={FIELD_RULES.aboutTitleSub}
              placeholder="that scale."              onChange={(val) =>
                updateCurrentDict((d) => ({
                  ...d,
                  about: {
                    ...d.about,
                    titleSub: applyFieldRule(val, FIELD_RULES.aboutTitleSub),
                  },
                }))
              }
              onBlur={() => {
                const val = (currentDict.about.titleSub || '').trim()
                if (val && !val.endsWith('.') && !val.endsWith('。')) {
                  updateCurrentDict((d) => ({
                    ...d,
                    about: { ...d.about, titleSub: `${val}.` },
                  }))
                }
              }}
            />
          </div>

          <AdminField
            label="About Paragraph"
            value={currentDict.about.p1}
            rule={FIELD_RULES.aboutP1}
            multiline
            rows={4}
            placeholder="Software Engineer comfortable owning a feature end-to-end..."            onChange={(val) =>
              updateCurrentDict((d) => ({
                ...d,
                about: { ...d.about, p1: applyFieldRule(val, FIELD_RULES.aboutP1) },
              }))
            }
          />
        </div>
      )}
    </div>
  )
}
