import type { TranslationDict } from '../../../../data/translations'
import AdminField from '../../AdminField'
import { FIELD_RULES, applyFieldRule, formatPhoneWithSpaces } from '../../utils/fieldRules'

interface IdentityClusterProps {
  currentDict: TranslationDict
  /** Applies the identity to every language so one edit reaches the whole site. */
  updateIdentityAcrossAllLangs: (
    identity: Partial<TranslationDict['identity']>
  ) => void
  isOpen: boolean
  onToggle: () => void
}

/**
 * Global identity - display name, email, phone, GitHub and LinkedIn.
 *
 * These values are not translated: they are written once and shared by every
 * language, so a link changed here shows up in the header, the contact section
 * and the footer on all locales at once.
 */
export default function IdentityCluster({
  currentDict,
  updateIdentityAcrossAllLangs,
  isOpen,
  onToggle,
}: IdentityClusterProps) {
  const { identity } = currentDict
  const cleanPhone = identity.phone.replace(/\s+/g, '')

  const setField = (patch: Partial<TranslationDict['identity']>) =>
    updateIdentityAcrossAllLangs(patch)

  return (
    <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-emerald-400 font-bold">02</span>
          <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
            Global Identity &amp; Contact Channels
          </span>
        </div>
        <span className="text-[10px] text-white/40 tracking-wider shrink-0">
          {isOpen ? '[ COLLAPSE ]' : '[ EXPAND ]'}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-white/10 space-y-3.5 bg-white/[0.01]">
          <p className="text-[10px] text-white/40 leading-snug">
            These values are shared by every language and shown in the header, the hero and the
            contact section.
          </p>

          <AdminField
            label="Display Name"
            value={identity.displayName}
            rule={FIELD_RULES.identityName}
            placeholder="Pham Minh Nhat"
            className="font-mono"
            onChange={(val) =>
              setField({ displayName: applyFieldRule(val, FIELD_RULES.identityName) })
            }
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField
              label="Primary Email"
              value={identity.email}
              rule={FIELD_RULES.contactEmail}
              allowEmpty
              placeholder="nhatprx@gmail.com"
              className="font-mono"
              onChange={(val) =>
                setField({ email: applyFieldRule(val.trim(), FIELD_RULES.contactEmail) })
              }
            />

            <AdminField
              label="Phone Number"
              value={identity.phone}
              rule={FIELD_RULES.contactPhone}
              allowEmpty
              placeholder="090 123 4567"
              className="font-mono"
              aside={
                <span className="text-[9px] text-white/30 font-mono">
                  {cleanPhone.length} digits
                </span>
              }
              onChange={(val) => setField({ phone: formatPhoneWithSpaces(val) })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField
              label="GitHub Profile URL"
              value={identity.githubUrl}
              rule={FIELD_RULES.contactUrl}
              allowEmpty
              placeholder="https://github.com/nhatprx"
              className="font-mono"
              onChange={(val) =>
                setField({ githubUrl: applyFieldRule(val.trim(), FIELD_RULES.contactUrl) })
              }
            />

            <AdminField
              label="LinkedIn Profile URL"
              value={identity.linkedinUrl}
              rule={FIELD_RULES.contactUrl}
              allowEmpty
              placeholder="https://www.linkedin.com/in/nhatprx/"
              className="font-mono"
              onChange={(val) =>
                setField({ linkedinUrl: applyFieldRule(val.trim(), FIELD_RULES.contactUrl) })
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
