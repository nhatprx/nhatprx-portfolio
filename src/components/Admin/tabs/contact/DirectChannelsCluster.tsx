import type { TranslationDict } from '../../../../data/translations'
import CharCounter from '../../CharCounter'
import {
  formatPhoneWithSpaces,
  getInputValidationClass,
} from '../../utils/validation'

interface DirectChannelsClusterProps {
  currentDict: TranslationDict
  updateCurrentDict: (updater: (prev: TranslationDict) => TranslationDict) => void
  isOpen: boolean
  onToggle: () => void
}

export default function DirectChannelsCluster({
  currentDict,
  updateCurrentDict,
  isOpen,
  onToggle,
}: DirectChannelsClusterProps) {
  const cleanPhone = (currentDict.contact.directPhone || '').replace(/\s+/g, '')

  return (
    <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-3.5 flex items-center text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-emerald-400 font-bold">02</span>
          <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
            Direct Contact Channels
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-white/10 space-y-3.5 bg-white/[0.01]">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Primary Email</label>
              </div>
              <input
                type="email"
                value={currentDict.contact.directEmail || ''}
                placeholder="nhatprx@gmail.com"
                onChange={(e) =>
                  updateCurrentDict((d) => ({
                    ...d,
                    contact: { ...d.contact, directEmail: e.target.value.trim() },
                  }))
                }
                className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors font-mono ${getInputValidationClass(
                  currentDict.contact.directEmail,
                  'email'
                )}`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Phone Number</label>
                <CharCounter current={cleanPhone.length} max={12} />
              </div>
              <input
                type="text"
                maxLength={16}
                value={currentDict.contact.directPhone || ''}
                placeholder="090 123 4567"
                onChange={(e) => {
                  const formatted = formatPhoneWithSpaces(e.target.value)
                  updateCurrentDict((d) => ({
                    ...d,
                    contact: { ...d.contact, directPhone: formatted },
                  }))
                }}
                className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors font-mono ${getInputValidationClass(
                  currentDict.contact.directPhone,
                  'phone'
                )}`}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">GitHub Profile URL</label>
              </div>
              <input
                type="url"
                value={currentDict.contact.githubUrl || ''}
                placeholder="https://github.com/nhatprx"
                onChange={(e) =>
                  updateCurrentDict((d) => ({
                    ...d,
                    contact: { ...d.contact, githubUrl: e.target.value.trim() },
                  }))
                }
                className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors font-mono ${getInputValidationClass(
                  currentDict.contact.githubUrl,
                  'url'
                )}`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">LinkedIn Profile URL</label>
              </div>
              <input
                type="url"
                value={currentDict.contact.linkedinUrl || ''}
                placeholder="https://www.linkedin.com/in/nhatprx/"
                onChange={(e) =>
                  updateCurrentDict((d) => ({
                    ...d,
                    contact: { ...d.contact, linkedinUrl: e.target.value.trim() },
                  }))
                }
                className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors font-mono ${getInputValidationClass(
                  currentDict.contact.linkedinUrl,
                  'url'
                )}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
