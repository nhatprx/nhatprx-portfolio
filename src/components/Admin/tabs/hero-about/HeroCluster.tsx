import type { TranslationDict } from '../../../../data/translations'
import CharCounter from '../../CharCounter'
import { saveFileToIndexedDB } from '../../../../services/fileStorage'
import { getInputValidationClass } from '../../utils/validation'

interface HeroClusterProps {
  currentDict: TranslationDict
  isOpen: boolean
  onToggle: () => void
  updateCurrentDict: (updater: (prev: TranslationDict) => TranslationDict) => void
  showToast: (msg: string) => void
}

export default function HeroCluster({
  currentDict,
  isOpen,
  onToggle,
  updateCurrentDict,
  showToast,
}: HeroClusterProps) {
  const handleResumeFileUpload = async (file: File) => {
    try {
      const blobUrl = await saveFileToIndexedDB('resume_file', file)
      updateCurrentDict((d) => ({
        ...d,
        hero: { ...d.hero, resumeUrl: blobUrl, resumeFileName: file.name },
      }))
      showToast(`Resume stored: ${file.name}`)
    } catch {
      updateCurrentDict((d) => ({
        ...d,
        hero: { ...d.hero, resumeUrl: `/${file.name}`, resumeFileName: file.name },
      }))
      showToast(`Resume saved: ${file.name}`)
    }
  }

  const handleResetDefaultResume = () => {
    updateCurrentDict((d) => ({
      ...d,
      hero: {
        ...d.hero,
        resumeUrl: '/[nhatprx] PERSONAL RESUME.pdf',
        resumeFileName: '[nhatprx] PERSONAL RESUME.pdf',
      },
    }))
    showToast('Reset to default resume')
  }

  return (
    <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors font-mono">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-3.5 flex items-center text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-emerald-400 font-bold">01</span>
          <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
            Hero Profile & Resume
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-white/10 space-y-3.5 bg-white/[0.01]">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">Role Subtitle</label>
              <CharCounter current={currentDict.hero.role?.length || 0} max={40} />
            </div>
            <input
              type="text"
              maxLength={40}
              value={currentDict.hero.role}
              onChange={(e) =>
                updateCurrentDict((d) => ({ ...d, hero: { ...d.hero, role: e.target.value } }))
              }
              className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
                currentDict.hero.role
              )}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-white/40 uppercase">
                Resume / CV Document
              </label>
              {currentDict.hero.resumeUrl && (
                <button
                  type="button"
                  onClick={handleResetDefaultResume}
                  className="text-[9.5px] text-white/40 hover:text-white underline cursor-pointer"
                >
                  Reset Default
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={currentDict.hero.resumeUrl || ''}
                placeholder="/[nhatprx] PERSONAL RESUME.pdf"
                onChange={(e) =>
                  updateCurrentDict((d) => ({
                    ...d,
                    hero: { ...d.hero, resumeUrl: e.target.value },
                  }))
                }
                className="flex-1 bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none font-mono text-[11px]"
              />
              <label className="px-3 py-2 border border-white/20 text-[10px] text-white/80 hover:text-white hover:border-white cursor-pointer bg-white/[0.04] flex items-center shrink-0">
                <span>CHOOSE FILE</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleResumeFileUpload(file)
                  }}
                />
              </label>
            </div>

            {currentDict.hero.resumeFileName && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-emerald-400 font-mono">
                  ● Active: {currentDict.hero.resumeFileName}
                </span>
                {currentDict.hero.resumeUrl && (
                  <a
                    href={currentDict.hero.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-white/50 hover:text-white underline"
                  >
                    Preview File ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
