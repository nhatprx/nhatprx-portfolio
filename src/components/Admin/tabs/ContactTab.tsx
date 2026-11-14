import { useState } from 'react'
import type { AdminTabProps } from '../types'
import AdminField from '../AdminField'
import { FIELD_RULES, applyFieldRule } from '../utils/fieldRules'
import DirectChannelsCluster from './contact/DirectChannelsCluster'

type ContactClusterKey = 'headings' | 'channels' | 'availability' | null

export default function ContactTab({
  currentDict,
  updateCurrentDict,
}: AdminTabProps) {
  const [activeCluster, setActiveCluster] = useState<ContactClusterKey>(null)

  const toggleCluster = (key: 'headings' | 'channels' | 'availability') => {
    setActiveCluster((prev) => (prev === key ? null : key))
  }

  const isAvailable = currentDict.contact.isAvailableForRoles ?? true

  return (
    <div className="space-y-3 font-mono">
      {/* Top Header Bar */}
      <div className="border border-white/10 bg-white/[0.015] p-3.5 flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-widest">
          06 · Contact
        </span>
      </div>

      {/* CLUSTER 01: SECTION HEADINGS & NARRATIVE DESCRIPTION */}
      <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => toggleCluster('headings')}
          className="w-full p-3.5 flex items-center text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-mono text-emerald-400 font-bold">01</span>
            <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
              Section Headings & Description
            </span>
          </div>
        </button>

        {activeCluster === 'headings' && (
          <div className="p-4 pt-1 border-t border-white/10 space-y-3.5 bg-white/[0.01]">
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField
                label="Section Heading"
                value={currentDict.contact.title}
                rule={FIELD_RULES.contactTitle}
                placeholder="Let's build"                onChange={(val) =>
                  updateCurrentDict((d) => ({
                    ...d,
                    contact: {
                      ...d.contact,
                      title: applyFieldRule(val, FIELD_RULES.contactTitle),
                    },
                  }))
                }
              />

              <AdminField
                label="Subtitle"
                value={currentDict.contact.titleSub}
                rule={FIELD_RULES.contactTitleSub}
                placeholder="together."                onChange={(val) =>
                  updateCurrentDict((d) => ({
                    ...d,
                    contact: {
                      ...d.contact,
                      titleSub: applyFieldRule(val, FIELD_RULES.contactTitleSub),
                    },
                  }))
                }
                onBlur={() => {
                  const val = (currentDict.contact.titleSub || '').trim()
                  if (val && !val.endsWith('.') && !val.endsWith('。')) {
                    updateCurrentDict((d) => ({
                      ...d,
                      contact: { ...d.contact, titleSub: `${val}.` },
                    }))
                  }
                }}
              />
            </div>

            <AdminField
              label="Narrative Description"
              value={currentDict.contact.desc}
              rule={FIELD_RULES.contactDesc}
              multiline
              rows={4}
              placeholder="Available for full-time engineering roles, freelance opportunities..."              onChange={(val) =>
                updateCurrentDict((d) => ({
                  ...d,
                  contact: {
                    ...d.contact,
                    desc: applyFieldRule(val, FIELD_RULES.contactDesc),
                  },
                }))
              }
            />
          </div>
        )}
      </div>

      {/* CLUSTER 02: DIRECT CONTACT CHANNELS */}
      <DirectChannelsCluster
        currentDict={currentDict}
        updateCurrentDict={updateCurrentDict}
        isOpen={activeCluster === 'channels'}
        onToggle={() => toggleCluster('channels')}
      />

      {/* CLUSTER 03: CURRENT AVAILABILITY & STATUS */}
      <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => toggleCluster('availability')}
          className="w-full p-3.5 flex items-center text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-mono text-emerald-400 font-bold">03</span>
            <span className="text-xs font-bold tracking-wider text-white uppercase block truncate">
              Current Availability & Status
            </span>
          </div>
        </button>

        {activeCluster === 'availability' && (
          <div className="p-4 pt-1 border-t border-white/10 space-y-4 bg-white/[0.01]">
            <AdminField
              label="Location"
              value={currentDict.contact.availabilityLocation || 'Ho Chi Minh City, Vietnam'}
              rule={FIELD_RULES.contactLocation}
              placeholder="Ho Chi Minh City, Vietnam"              onChange={(val) =>
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
                  Available for Roles & Contracts
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
