import { useState } from 'react'
import type { AdminTabProps } from '../types'
import CharCounter from '../CharCounter'
import { CONTENT_LIMITS } from '../../../services/autoTranslate'
import { saveFileToIndexedDB } from '../../../services/fileStorage'
import SecondaryEduModal from '../modals/SecondaryEduModal'

type Section1ClusterKey = 'hero' | 'narrative' | 'education' | null

export default function HeroAboutTab({
  currentDict,
  selectedLang,
  updateCurrentDict,
  showToast,
}: AdminTabProps) {
  const [activeCluster, setActiveCluster] = useState<Section1ClusterKey>(null)
  const [isSecondaryEduModalOpen, setIsSecondaryEduModalOpen] = useState(false)
  const [secondaryEduDraft, setSecondaryEduDraft] = useState({
    school: '',
    location: '',
    degree: '',
    major: '',
  })

  const toggleCluster = (key: 'hero' | 'narrative' | 'education') => {
    setActiveCluster((prev) => (prev === key ? null : key))
  }

  const handleSaveSecondaryEdu = () => {
    if (!secondaryEduDraft.school.trim()) {
      showToast('Please enter the School / University name.')
      return
    }
    updateCurrentDict((d) => ({
      ...d,
      about: {
        ...d.about,
        edu2School: secondaryEduDraft.school.trim(),
        edu2Location: secondaryEduDraft.location.trim(),
        edu2Degree: secondaryEduDraft.degree.trim(),
        edu2Major: secondaryEduDraft.major.trim(),
        edu2Dates: secondaryEduDraft.location.trim(),
      },
    }))
    setIsSecondaryEduModalOpen(false)
    showToast('Secondary education saved!')
  }

  const handleResumeFileUpload = async (file: File) => {
    try {
      // Store in IndexedDB to prevent localStorage quota exhaustion (~5MB limit)
      const blobUrl = await saveFileToIndexedDB('resume_file', file)
      updateCurrentDict((d) => ({
        ...d,
        hero: { ...d.hero, resumeUrl: blobUrl, resumeFileName: file.name },
      }))
      showToast(`Loaded and safely stored: ${file.name}`)
    } catch {
      // Fallback: standard relative path
      updateCurrentDict((d) => ({
        ...d,
        hero: { ...d.hero, resumeUrl: `/${file.name}`, resumeFileName: file.name },
      }))
      showToast(`Saved reference: ${file.name}`)
    }
  }

  return (
    <div className="space-y-4 font-mono">
      {/* Section Header */}
      <div className="border border-white/10 bg-white/[0.01] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold text-white/90 uppercase tracking-widest flex items-center gap-2">
            <span>Section 01 · Hero & About</span>
            <span className="text-[10px] text-emerald-400 font-mono">({selectedLang.toUpperCase()})</span>
          </h2>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">
            Opening a cluster automatically collapses the other · Default collapsed
          </p>
        </div>
        {activeCluster && (
          <button
            type="button"
            onClick={() => setActiveCluster(null)}
            className="px-2.5 py-1 text-[10px] border border-white/20 text-white/70 hover:text-white hover:border-white transition-colors font-mono cursor-pointer"
          >
            ▲ CLOSE ALL
          </button>
        )}
      </div>

      {/* CLUSTER 01: HERO CONTENT */}
      <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => toggleCluster('hero')}
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
                <span className="text-white/70">{currentDict.hero.resumeFileName || (currentDict.hero.resumeUrl ? 'Custom File' : 'Default PDF')}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] font-mono px-2 py-0.5 border transition-colors ${
              activeCluster === 'hero'
                ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                : 'border-white/15 text-white/70 hover:text-white'
            }`}>
              {activeCluster === 'hero' ? '▲ CLOSE' : '▼ EDIT'}
            </span>
          </div>
        </button>

        {activeCluster === 'hero' && (
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

      {/* CLUSTER 02: ABOUT NARRATIVE */}
      <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => toggleCluster('narrative')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-mono text-emerald-400 font-bold">02</span>
            <div className="min-w-0">
              <span className="text-xs font-bold tracking-wider text-white uppercase block">
                About Narrative & Bio
              </span>
              <span className="text-[10px] text-white/40 font-mono truncate block mt-0.5">
                {currentDict.about.title} {currentDict.about.titleSub} —{' '}
                <span className="text-white/60">{currentDict.about.p1?.slice(0, 45)}...</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] font-mono px-2 py-0.5 border transition-colors ${
              activeCluster === 'narrative'
                ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                : 'border-white/15 text-white/70 hover:text-white'
            }`}>
              {activeCluster === 'narrative' ? '▲ CLOSE' : '▼ EDIT'}
            </span>
          </div>
        </button>

        {activeCluster === 'narrative' && (
          <div className="p-4 pt-1 border-t border-white/10 space-y-3 bg-white/[0.01]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Section Title</label>
                  <CharCounter current={currentDict.about.title?.length || 0} max={CONTENT_LIMITS.about.title} />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.about.title}
                  value={currentDict.about.title}
                  onChange={(e) =>
                    updateCurrentDict((d) => ({ ...d, about: { ...d.about, title: e.target.value } }))
                  }
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/40 uppercase">Subtitle</label>
                  <CharCounter current={currentDict.about.titleSub?.length || 0} max={CONTENT_LIMITS.about.titleSub} />
                </div>
                <input
                  type="text"
                  maxLength={CONTENT_LIMITS.about.titleSub}
                  value={currentDict.about.titleSub}
                  onChange={(e) =>
                    updateCurrentDict((d) => ({ ...d, about: { ...d.about, titleSub: e.target.value } }))
                  }
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-white/40 uppercase">
                  About Paragraph <span className="text-emerald-400 font-semibold">(Locked for 100vh Baseline)</span>
                </label>
                <CharCounter current={currentDict.about.p1?.length || 0} max={CONTENT_LIMITS.about.p1} />
              </div>
              <textarea
                rows={3}
                maxLength={CONTENT_LIMITS.about.p1}
                value={currentDict.about.p1}
                onChange={(e) =>
                  updateCurrentDict((d) => ({ ...d, about: { ...d.about, p1: e.target.value } }))
                }
                className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* CLUSTER 03: EDUCATION CREDENTIALS */}
      <div className="border border-white/10 bg-black/40 overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => toggleCluster('education')}
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
                  <span> · Secondary: <span className="text-cyan-400">{currentDict.about.edu2School}</span></span>
                ) : (
                  <span> · Secondary: <span className="text-white/30">None (Primary only)</span></span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] font-mono px-2 py-0.5 border transition-colors ${
              activeCluster === 'education'
                ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                : 'border-white/15 text-white/70 hover:text-white'
            }`}>
              {activeCluster === 'education' ? '▲ CLOSE' : '▼ EDIT'}
            </span>
          </div>
        </button>

        {activeCluster === 'education' && (
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
                    <CharCounter current={currentDict.about.edu1School?.length || 0} max={CONTENT_LIMITS.about.eduSchool} />
                  </div>
                  <input
                    type="text"
                    maxLength={CONTENT_LIMITS.about.eduSchool}
                    value={currentDict.about.edu1School || ''}
                    onChange={(e) =>
                      updateCurrentDict((d) => ({ ...d, about: { ...d.about, edu1School: e.target.value } }))
                    }
                    className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-white/40 uppercase">Location</label>
                    <CharCounter current={currentDict.about.edu1Location?.length || 0} max={CONTENT_LIMITS.about.eduLocation} />
                  </div>
                  <input
                    type="text"
                    maxLength={CONTENT_LIMITS.about.eduLocation}
                    value={currentDict.about.edu1Location || ''}
                    onChange={(e) =>
                      updateCurrentDict((d) => ({
                        ...d,
                        about: { ...d.about, edu1Location: e.target.value, edu1Dates: e.target.value },
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
                    <CharCounter current={currentDict.about.edu1Degree?.length || 0} max={CONTENT_LIMITS.about.eduDegree} />
                  </div>
                  <input
                    type="text"
                    maxLength={CONTENT_LIMITS.about.eduDegree}
                    value={currentDict.about.edu1Degree || ''}
                    onChange={(e) =>
                      updateCurrentDict((d) => ({ ...d, about: { ...d.about, edu1Degree: e.target.value } }))
                    }
                    className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-white/40 uppercase">Major / Field</label>
                    <CharCounter current={currentDict.about.edu1Major?.length || 0} max={CONTENT_LIMITS.about.eduMajor} />
                  </div>
                  <input
                    type="text"
                    maxLength={CONTENT_LIMITS.about.eduMajor}
                    value={currentDict.about.edu1Major || ''}
                    onChange={(e) =>
                      updateCurrentDict((d) => ({ ...d, about: { ...d.about, edu1Major: e.target.value } }))
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
                      onClick={() => {
                        setSecondaryEduDraft({
                          school: currentDict.about.edu2School || '',
                          location: currentDict.about.edu2Location || '',
                          degree: currentDict.about.edu2Degree || '',
                          major: currentDict.about.edu2Major || '',
                        })
                        setIsSecondaryEduModalOpen(true)
                      }}
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
                    <span className="block text-[10px] text-white/40 uppercase mb-0.5">School / University</span>
                    <span className="text-xs text-white font-mono">{currentDict.about.edu2School}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40 uppercase mb-0.5">Location</span>
                    <span className="text-xs text-white font-mono">{currentDict.about.edu2Location || '—'}</span>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="block text-[10px] text-white/40 uppercase mb-0.5">Degree Title</span>
                    <span className="text-xs text-white font-mono">{currentDict.about.edu2Degree || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40 uppercase mb-0.5">Major / Field</span>
                    <span className="text-xs text-white font-mono">{currentDict.about.edu2Major || '—'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-white/15 p-3.5 bg-white/[0.01] flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-white/70 font-mono block">Secondary Education (Optional)</span>
                  <span className="text-[10px] text-white/35 font-mono">Not active — only primary education will show</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSecondaryEduDraft({
                      school: '',
                      location: '',
                      degree: '',
                      major: '',
                    })
                    setIsSecondaryEduModalOpen(true)
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-white text-black hover:bg-white/80 transition-colors cursor-pointer shrink-0"
                >
                  + ADD SECONDARY
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Secondary Education Add / Edit Modal */}
      <SecondaryEduModal
        isOpen={isSecondaryEduModalOpen}
        isEditing={Boolean(currentDict.about.edu2School?.trim())}
        draft={secondaryEduDraft}
        setDraft={setSecondaryEduDraft}
        onSave={handleSaveSecondaryEdu}
        onClose={() => setIsSecondaryEduModalOpen(false)}
      />
    </div>
  )
}
