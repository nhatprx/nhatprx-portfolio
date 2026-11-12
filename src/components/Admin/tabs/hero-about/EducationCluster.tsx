import type { TranslationDict } from '../../../../data/translations'
import CharCounter from '../../CharCounter'
import { CONTENT_LIMITS } from '../../../../services/autoTranslate'

interface SecondaryEduDraft {
  school: string
  location: string
  degree: string
  major: string
}

interface EducationClusterProps {
  currentDict: TranslationDict
  isOpen: boolean
  onToggle: () => void
  updateCurrentDict: (updater: (prev: TranslationDict) => TranslationDict) => void
  onOpenSecondaryModal: (draft: SecondaryEduDraft) => void
  showToast: (msg: string) => void
}

export default function EducationCluster({
  currentDict,
  isOpen,
  onToggle,
  updateCurrentDict,
  onOpenSecondaryModal,
  showToast,
}: EducationClusterProps) {
  return (
    <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-emerald-400 font-bold">03</span>
          <div className="min-w-0">
            <span className="text-xs font-bold tracking-wider text-white uppercase block">
              Education Credentials
            </span>
            <span className="text-[10px] text-white/40 font-mono truncate block mt-0.5">
              Primary: <span className="text-white/70">{currentDict.about.edu1School || '—'}</span>
              {currentDict.about.edu2School?.trim() ? (
                <span>
                  {' '}
                  · Secondary: <span className="text-cyan-400">{currentDict.about.edu2School}</span>
                </span>
              ) : (
                <span>
                  {' '}
                  · Secondary: <span className="text-white/30">None (Primary only)</span>
                </span>
              )}
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
        <div className="p-4 pt-1 border-t border-white/10 space-y-4 bg-white/[0.01]">
          {/* Education Card 1 */}
          <div className="border border-white/10 p-3.5 bg-white/[0.015] space-y-3">
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase block">
              Education Card 01 (Primary)
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">School / University</label>
                  <CharCounter
                    current={currentDict.about.edu1School?.length || 0}
                    max={CONTENT_LIMITS.about.eduSchool}
                  />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.about.eduSchool}
                  value={currentDict.about.edu1School || ''}
                  onChange={(e) =>
                    updateCurrentDict((d) => ({
                      ...d,
                      about: { ...d.about, edu1School: e.target.value },
                    }))
                  }
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Location</label>
                  <CharCounter
                    current={currentDict.about.edu1Location?.length || 0}
                    max={CONTENT_LIMITS.about.eduLocation}
                  />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.about.eduLocation}
                  value={currentDict.about.edu1Location || ''}
                  onChange={(e) =>
                    updateCurrentDict((d) => ({
                      ...d,
                      about: {
                        ...d.about,
                        edu1Location: e.target.value,
                        edu1Dates: e.target.value,
                      },
                    }))
                  }
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Degree Title</label>
                  <CharCounter
                    current={currentDict.about.edu1Degree?.length || 0}
                    max={CONTENT_LIMITS.about.eduDegree}
                  />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.about.eduDegree}
                  value={currentDict.about.edu1Degree || ''}
                  onChange={(e) =>
                    updateCurrentDict((d) => ({
                      ...d,
                      about: { ...d.about, edu1Degree: e.target.value },
                    }))
                  }
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Major / Field</label>
                  <CharCounter
                    current={currentDict.about.edu1Major?.length || 0}
                    max={CONTENT_LIMITS.about.eduMajor}
                  />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.about.eduMajor}
                  value={currentDict.about.edu1Major || ''}
                  onChange={(e) =>
                    updateCurrentDict((d) => ({
                      ...d,
                      about: { ...d.about, edu1Major: e.target.value },
                    }))
                  }
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Education Card 2 (Secondary) */}
          {currentDict.about.edu2School?.trim() ? (
            <div className="border border-white/10 p-3.5 bg-white/[0.015] space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase block">
                  Education Card 02 (Secondary)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenSecondaryModal({
                        school: currentDict.about.edu2School || '',
                        location: currentDict.about.edu2Location || '',
                        degree: currentDict.about.edu2Degree || '',
                        major: currentDict.about.edu2Major || '',
                      })
                    }
                    className="px-2.5 py-0.5 text-[10px] border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer"
                  >
                    EDIT
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateCurrentDict((d) => ({
                        ...d,
                        about: {
                          ...d.about,
                          edu2School: '',
                          edu2Degree: '',
                          edu2Major: '',
                          edu2Location: '',
                          edu2Dates: '',
                        },
                      }))
                      showToast('Secondary education card removed.')
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 font-mono transition-colors cursor-pointer"
                  >
                    ✕ REMOVE
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="block text-[10px] text-white/40 uppercase mb-0.5">
                    School / University
                  </span>
                  <span className="text-xs text-white font-mono">
                    {currentDict.about.edu2School}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase mb-0.5">Location</span>
                  <span className="text-xs text-white font-mono">
                    {currentDict.about.edu2Location || '—'}
                  </span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="block text-[10px] text-white/40 uppercase mb-0.5">
                    Degree Title
                  </span>
                  <span className="text-xs text-white font-mono">
                    {currentDict.about.edu2Degree || '—'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase mb-0.5">
                    Major / Field
                  </span>
                  <span className="text-xs text-white font-mono">
                    {currentDict.about.edu2Major || '—'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-white/15 p-3.5 bg-white/[0.01] flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-white/70 font-mono block">
                  Secondary Education (Optional)
                </span>
                <span className="text-[10px] text-white/35 font-mono">
                  Not active — only primary education will show
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onOpenSecondaryModal({
                    school: '',
                    location: '',
                    degree: '',
                    major: '',
                  })
                }
                className="px-3 py-1.5 text-xs font-semibold bg-white text-black hover:bg-white/80 transition-colors cursor-pointer shrink-0"
              >
                + ADD SECONDARY
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
