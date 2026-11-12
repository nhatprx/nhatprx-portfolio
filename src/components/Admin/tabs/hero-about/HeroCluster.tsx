import type { TranslationDict } from '../../../../data/translations'
import CharCounter from '../../CharCounter'
import { saveFileToIndexedDB } from '../../../../services/fileStorage'

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
      showToast(`Loaded and safely stored: ${file.name}`)
    } catch {
      updateCurrentDict((d) => ({
        ...d,
        hero: { ...d.hero, resumeUrl: `/${file.name}`, resumeFileName: file.name },
      }))
      showToast(`Saved reference: ${file.name}`)
    }
  }

  return (
    <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-emerald-400 font-bold">01</span>
          <div className="min-w-0">
            <span className="text-xs font-bold tracking-wider text-white uppercase block">
              Hero Profile & Resume
            </span>
            <span className="text-[10px] text-white/40 font-mono truncate block mt-0.5">
              Role: <span className="text-white/70">{currentDict.hero.role || '—'}</span> · CV:{' '}
              <span className="text-white/70">
                {currentDict.hero.resumeFileName ||
                  (currentDict.hero.resumeUrl ? 'Custom File' : 'Default PDF')}
              </span>
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
              className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-white/40 uppercase mb-1">
              Resume / CV File (PDF / Link / Local File)
            </label>
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
                <span>CHOOSE</span>
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
              <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                Active file: {currentDict.hero.resumeFileName}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
