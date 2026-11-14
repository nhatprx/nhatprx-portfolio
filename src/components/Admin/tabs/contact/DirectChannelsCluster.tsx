import type { TranslationDict } from '../../../../data/translations'
import AdminField from '../../AdminField'
import { FIELD_RULES, applyFieldRule, formatPhoneWithSpaces } from '../../utils/fieldRules'

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
            <AdminField
              label="Primary Email"
              value={currentDict.contact.directEmail}
              rule={FIELD_RULES.contactEmail}
              allowEmpty
              placeholder="nhatprx@gmail.com"              className="font-mono"
              onChange={(val) =>
                updateCurrentDict((d) => ({
                  ...d,
                  contact: {
                    ...d.contact,
                    directEmail: applyFieldRule(val.trim(), FIELD_RULES.contactEmail),
                  },
                }))
              }
            />

            <AdminField
              label="Phone Number"
              value={currentDict.contact.directPhone}
              rule={FIELD_RULES.contactPhone}
              allowEmpty
              placeholder="090 123 4567"              className="font-mono"
              aside={
                <span className="text-[9px] text-white/30 font-mono">
                  {cleanPhone.length} digits
                </span>
              }
              onChange={(val) =>
                updateCurrentDict((d) => ({
                  ...d,
                  contact: {
                    ...d.contact,
                    directPhone: formatPhoneWithSpaces(val),
                  },
                }))
              }
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField
              label="GitHub Profile URL"
              value={currentDict.contact.githubUrl}
              rule={FIELD_RULES.contactUrl}
              allowEmpty
              placeholder="https://github.com/nhatprx"              className="font-mono"
              onChange={(val) =>
                updateCurrentDict((d) => ({
                  ...d,
                  contact: {
                    ...d.contact,
                    githubUrl: applyFieldRule(val.trim(), FIELD_RULES.contactUrl),
                  },
                }))
              }
            />

            <AdminField
              label="LinkedIn Profile URL"
              value={currentDict.contact.linkedinUrl}
              rule={FIELD_RULES.contactUrl}
              allowEmpty
              placeholder="https://www.linkedin.com/in/nhatprx/"              className="font-mono"
              onChange={(val) =>
                updateCurrentDict((d) => ({
                  ...d,
                  contact: {
                    ...d.contact,
                    linkedinUrl: applyFieldRule(val.trim(), FIELD_RULES.contactUrl),
                  },
                }))
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
