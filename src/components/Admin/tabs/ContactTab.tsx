import { useState } from 'react'
import type { AdminTabProps } from '../types'
import CharCounter from '../CharCounter'
import { getInputValidationClass } from '../utils/validation'
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
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Section Heading</label>
                  <CharCounter current={currentDict.contact.title?.length || 0} max={40} />
                </div>
                <input
                  type="text"
                  maxLength={40}
                  value={currentDict.contact.title}
                  placeholder="Let's build"
                  onChange={(e) =>
                    updateCurrentDict((d) => ({
                      ...d,
                      contact: { ...d.contact, title: e.target.value },
                    }))
                  }
                  className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
                    currentDict.contact.title
                  )}`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Subtitle</label>
                  <CharCounter current={currentDict.contact.titleSub?.length || 0} max={50} />
                </div>
                <input
                  type="text"
                  maxLength={50}
                  value={currentDict.contact.titleSub}
                  placeholder="together."
                  onChange={(e) =>
                    updateCurrentDict((d) => ({
                      ...d,
                      contact: { ...d.contact, titleSub: e.target.value },
                    }))
                  }
                  onBlur={(e) => {
                    const val = e.target.value.trim()
                    if (val && !val.endsWith('.') && !val.endsWith('。')) {
                      updateCurrentDict((d) => ({
                        ...d,
                        contact: { ...d.contact, titleSub: `${val}.` },
                      }))
                    }
                  }}
                  className={`w-full bg-white/[0.03] border p-2 text-xs focus:outline-none transition-colors ${getInputValidationClass(
                    currentDict.contact.titleSub
                  )}`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Narrative Description</label>
                <CharCounter current={currentDict.contact.desc?.length || 0} max={450} />
              </div>
              <textarea
                rows={4}
                value={currentDict.contact.desc}
                placeholder="Available for full-time engineering roles, freelance opportunities..."
                onChange={(e) =>
                  updateCurrentDict((d) => ({
                    ...d,
                    contact: { ...d.contact, desc: e.target.value },
                  }))
                }
                className={`w-full bg-white/[0.03] border p-2.5 text-xs focus:outline-none resize-none transition-colors ${getInputValidationClass(
                  currentDict.contact.desc,
                  'default',
                  false,
                  450
                )}`}
              />
            </div>
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
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">Location</label>
                <CharCounter
                  current={(currentDict.contact.availabilityLocation || 'Ho Chi Minh City, Vietnam').length}
                  max={50}
                />
              </div>
              <input
                type="text"
                maxLength={50}
                value={currentDict.contact.availabilityLocation || 'Ho Chi Minh City, Vietnam'}
                placeholder="Ho Chi Minh City, Vietnam"
                onChange={(e) =>
                  updateCurrentDict((d) => ({
                    ...d,
                    contact: { ...d.contact, availabilityLocation: e.target.value },
                  }))
                }
                className={`w-full bg-white/[0.03] border p-2 text-xs text-white focus:outline-none transition-colors ${getInputValidationClass(
                  currentDict.contact.availabilityLocation || 'Ho Chi Minh City, Vietnam',
                  'location'
                )}`}
              />
            </div>

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
