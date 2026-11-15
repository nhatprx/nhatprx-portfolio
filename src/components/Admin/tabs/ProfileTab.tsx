import { useState } from 'react'
import type { AdminTabProps } from '../types'
import AdminField from '../AdminField'
import IdentityCluster from './contact/IdentityCluster'
import EducationCluster from './hero-about/EducationCluster'
import HeroCluster from './hero-about/HeroCluster'
import { FIELD_RULES, applyFieldRule } from '../utils/fieldRules'

type ProfileClusterKey = 'identity' | 'education' | 'resume' | 'availability' | null

interface ProfileTabProps extends AdminTabProps {
  /** Applies the identity to every language so one edit reaches the whole site. */
  updateIdentityAcrossAllLangs: (
    identity: Partial<AdminTabProps['currentDict']['identity']>
  ) => void
}

/**
 * Everything about the person behind the site: name, contact channels, role,
 * education, resume and availability.
 */
export default function ProfileTab({
  currentDict,
  updateCurrentDict,
  updateIdentityAcrossAllLangs,
  updateResumeAcrossAllLangs,
  showToast,
}: ProfileTabProps) {
  const [activeCluster, setActiveCluster] = useState<ProfileClusterKey>(null)

  const toggleCluster = (key: Exclude<ProfileClusterKey, null>) => {
    setActiveCluster((prev) => (prev === key ? null : key))
  }

  const isAvailable = currentDict.contact.isAvailableForRoles ?? true

  return (
    <div className="space-y-3 font-mono">
      <div className="border border-white/10 bg-white/[0.015] p-3.5 flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-widest">
          User Profile &amp; Info
        </span>
        <span className="text-[10px] text-white/40">SHARED ACROSS ALL LANGUAGES</span>
      </div>

      {/* CLUSTER 01: IDENTITY - NAME / ROLE / EMAIL / PHONE / SOCIAL LINKS */}
      <IdentityCluster
        currentDict={currentDict}
        updateIdentityAcrossAllLangs={updateIdentityAcrossAllLangs}
        updateRole={(role) =>
          updateCurrentDict((d) => ({ ...d, hero: { ...d.hero, role } }))
        }
        isOpen={activeCluster === 'identity'}
        onToggle={() => toggleCluster('identity')}
      />

      {/* CLUSTER 02: EDUCATION CREDENTIALS */}
      <EducationCluster
        currentDict={currentDict}
        isOpen={activeCluster === 'education'}
        onToggle={() => toggleCluster('education')}
        updateCurrentDict={updateCurrentDict}
      />

      {/* CLUSTER 04: RESUME DOCUMENT */}
      <HeroCluster
        currentDict={currentDict}
        isOpen={activeCluster === 'resume'}
        onToggle={() => toggleCluster('resume')}
        updateCurrentDict={updateCurrentDict}
        showToast={showToast}
        updateResumeAcrossAllLangs={updateResumeAcrossAllLangs}
      />

      {/* CLUSTER 05: AVAILABILITY */}
      <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => toggleCluster('availability')}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-mono text-emerald-400 font-bold">04</span>
            <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
              Current Availability &amp; Status
            </span>
          </div>
          <span className="text-[10px] text-white/40 tracking-wider shrink-0">
            {activeCluster === 'availability' ? '[ COLLAPSE ]' : '[ EXPAND ]'}
          </span>
        </button>

        {activeCluster === 'availability' && (
          <div className="p-4 pt-1 border-t border-white/10 space-y-4 bg-white/[0.01]">
            <AdminField
              label="Location"
              value={currentDict.contact.availabilityLocation || 'Ho Chi Minh City, Vietnam'}
              rule={FIELD_RULES.contactLocation}
              placeholder="Ho Chi Minh City, Vietnam"
              onChange={(val) =>
                updateCurrentDict((d) => ({
                  ...d,
                  contact: {
                    ...d.contact,
                    availabilityLocation: applyFieldRule(val, FIELD_RULES.contactLocation),
                  },
                }))
              }
            />

            <div className="flex items-center justify-between p-3 border border-white/10 bg-white/[0.02]">
              <div>
                <span className="text-xs text-white font-medium block">
                  Available for Roles &amp; Contracts
                </span>
                <span className="text-[10px] text-white/40 block mt-0.5">
                  Toggle badge status and pulse indicator on homepage
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateCurrentDict((d) => ({
                    ...d,
                    contact: {
                      ...d.contact,
                      isAvailableForRoles: !(d.contact.isAvailableForRoles ?? true),
                    },
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                  isAvailable ? 'bg-emerald-500' : 'bg-white/20'
                }`}
                aria-label="Toggle availability for roles and contracts"
                aria-pressed={isAvailable}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAvailable ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
