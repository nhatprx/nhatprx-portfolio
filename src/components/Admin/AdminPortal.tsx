import { useState } from 'react'
import {
  getStoredTranslations,
  saveStoredTranslations,
  resetStoredTranslations,
  getStoredTerminalCommands,
  saveStoredTerminalCommands,
  getAdminPasskey,
  setAdminPasskey,
  isAdminAuthenticated,
  setAdminAuthenticated,
  type SupportedLang,
  type TranslationDict,
  type ExperienceItem,
  type ProjectItem,
  type LocalizedBlogPost,
  type CustomTerminalCommands,
} from '../../services/contentStorage'

interface AdminPortalProps {
  onClose: () => void
  onUpdateTranslations: (data: Record<SupportedLang, TranslationDict>) => void
}

type TabType = 'sections' | 'experience' | 'projects' | 'blog' | 'terminal' | 'system'

export default function AdminPortal({ onClose, onUpdateTranslations }: AdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminAuthenticated())
  const [inputPass, setInputPass] = useState('')
  const [loginError, setLoginError] = useState('')

  // Admin Data State
  const [translations, setTranslations] = useState<Record<SupportedLang, TranslationDict>>(() => getStoredTranslations())
  const [terminalCommands, setTerminalCommands] = useState<CustomTerminalCommands>(() => getStoredTerminalCommands())
  const [selectedLang, setSelectedLang] = useState<SupportedLang>('en')
  const [activeTab, setActiveTab] = useState<TabType>('sections')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Experience form modal / state
  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null)
  const [expDraft, setExpDraft] = useState<ExperienceItem | null>(null)

  // Project form modal / state
  const [editingProjIndex, setEditingProjIndex] = useState<number | null>(null)
  const [projDraft, setProjDraft] = useState<ProjectItem | null>(null)

  // Blog form modal / state
  const [editingBlogIndex, setEditingBlogIndex] = useState<number | null>(null)
  const [blogDraft, setBlogDraft] = useState<LocalizedBlogPost | null>(null)

  // Terminal command draft
  const [newCmdName, setNewCmdName] = useState('')
  const [newCmdOutput, setNewCmdOutput] = useState('')

  // System security passkey
  const [newPasskey, setNewPasskey] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const validPass = getAdminPasskey()
    if (inputPass.trim() === validPass) {
      setAdminAuthenticated(true)
      setIsAuthenticated(true)
      setLoginError('')
    } else {
      setLoginError('Authentication failed: Invalid passkey')
    }
  }

  const handleLogout = () => {
    setAdminAuthenticated(false)
    setIsAuthenticated(false)
  }

  const handleSaveAll = () => {
    saveStoredTranslations(translations)
    saveStoredTerminalCommands(terminalCommands)
    onUpdateTranslations(translations)
    showToast('Saved successfully! Live site updated.')
  }

  const currentDict = translations[selectedLang]

  const updateCurrentDict = (updater: (prev: TranslationDict) => TranslationDict) => {
    setTranslations((prev) => {
      const next = {
        ...prev,
        [selectedLang]: updater(prev[selectedLang]),
      }
      return next
    })
  }

  // If not authenticated, render Login Gate
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md select-none font-mono">
        <div className="w-full max-w-md p-6 sm:p-8 border border-white/20 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-modal-pop text-left">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-white uppercase">AUTH://PORTAL</span>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white text-xs border border-white/10 px-2 py-0.5"
            >
              EXIT [ESC]
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] text-white/50 tracking-widest uppercase mb-1.5">
                ADMIN ACCESS PASSKEY
              </label>
              <input
                type="password"
                value={inputPass}
                onChange={(e) => {
                  setInputPass(e.target.value)
                  setLoginError('')
                }}
                autoFocus
                placeholder="Enter passkey..."
                className="w-full bg-white/[0.04] border border-white/20 px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:border-white focus:outline-none transition-colors"
              />
              {loginError && <p className="text-red-400 text-[11px] mt-2 font-mono">{loginError}</p>}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs border border-white/15 text-white/60 hover:text-white hover:border-white/40 transition-colors"
              >
                Return to Site
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-white text-black hover:bg-white/80 transition-colors cursor-pointer"
              >
                AUTHENTICATE →
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Authenticated Admin Dashboard
  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex flex-col bg-black text-white font-mono select-text overflow-hidden overscroll-contain"
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-4 py-2 text-xs font-mono backdrop-blur-md shadow-2xl flex items-center gap-2">
          <span>●</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-bold text-xs tracking-widest text-white uppercase">NHATPRX // ADMIN DASHBOARD</span>
          <span className="text-[10px] text-white/30 px-2 py-0.5 border border-white/10 hidden sm:inline">LIVE CMS</span>
        </div>

        {/* Language selector & Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center border border-white/15 p-0.5 bg-white/[0.02]">
            {(['en', 'vi', 'fr', 'ja'] as SupportedLang[]).map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLang(l)}
                className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider transition-colors ${
                  selectedLang === l ? 'bg-white text-black font-bold' : 'text-white/50 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={handleSaveAll}
            className="px-3.5 py-1.5 bg-white text-black text-xs font-bold hover:bg-white/80 transition-colors cursor-pointer"
          >
            SAVE CHANGES
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white text-xs transition-colors cursor-pointer"
          >
            VIEW SITE
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 border border-red-500/30 text-red-400 hover:border-red-500 hover:text-red-300 text-xs transition-colors cursor-pointer"
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Tabs Bar */}
      <nav className="border-b border-white/10 bg-white/[0.01] px-4 sm:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs shrink-0 [scrollbar-width:none]">
        {(
          [
            { id: 'sections', label: '1. SECTIONS & BIO' },
            { id: 'experience', label: '2. EXPERIENCE' },
            { id: 'projects', label: '3. PROJECTS' },
            { id: 'blog', label: '4. BLOG / NOTES' },
            { id: 'terminal', label: '5. TERMINAL' },
            { id: 'system', label: '6. BACKUP & PASSKEY' },
          ] as { id: TabType; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-3 text-xs tracking-wider transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-white text-white font-bold bg-white/[0.04]'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <main
        data-lenis-prevent
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain admin-scroll p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6"
      >
        {/* TAB 1: SECTIONS & BIO */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="border border-white/10 bg-white/[0.01] p-5 space-y-4">
              <h2 className="text-xs font-bold text-white/80 uppercase tracking-widest border-b border-white/10 pb-2">
                Hero Section ({selectedLang.toUpperCase()})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Role Subtitle</label>
                  <input
                    type="text"
                    value={currentDict.hero.role}
                    onChange={(e) =>
                      updateCurrentDict((d) => ({ ...d, hero: { ...d.hero, role: e.target.value } }))
                    }
                    className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Get In Touch CTA</label>
                  <input
                    type="text"
                    value={currentDict.hero.getInTouch}
                    onChange={(e) =>
                      updateCurrentDict((d) => ({ ...d, hero: { ...d.hero, getInTouch: e.target.value } }))
                    }
                    className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase mb-1">Hero Lead Description</label>
                <textarea
                  rows={3}
                  value={currentDict.hero.desc}
                  onChange={(e) =>
                    updateCurrentDict((d) => ({ ...d, hero: { ...d.hero, desc: e.target.value } }))
                  }
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.01] p-5 space-y-4">
              <h2 className="text-xs font-bold text-white/80 uppercase tracking-widest border-b border-white/10 pb-2">
                About Section ({selectedLang.toUpperCase()})
              </h2>
              <div>
                <label className="block text-[10px] text-white/40 uppercase mb-1">About Paragraph 1</label>
                <textarea
                  rows={3}
                  value={currentDict.about.p1}
                  onChange={(e) =>
                    updateCurrentDict((d) => ({ ...d, about: { ...d.about, p1: e.target.value } }))
                  }
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase mb-1">About Paragraph 2</label>
                <textarea
                  rows={3}
                  value={currentDict.about.p2}
                  onChange={(e) =>
                    updateCurrentDict((d) => ({ ...d, about: { ...d.about, p2: e.target.value } }))
                  }
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={currentDict.about.title}
                    onChange={(e) =>
                      updateCurrentDict((d) => ({ ...d, about: { ...d.about, title: e.target.value } }))
                    }
                    className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={currentDict.about.titleSub}
                    onChange={(e) =>
                      updateCurrentDict((d) => ({ ...d, about: { ...d.about, titleSub: e.target.value } }))
                    }
                    className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.01] p-5 space-y-4">
              <h2 className="text-xs font-bold text-white/80 uppercase tracking-widest border-b border-white/10 pb-2">
                Contact Section ({selectedLang.toUpperCase()})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={currentDict.contact.title}
                    onChange={(e) =>
                      updateCurrentDict((d) => ({ ...d, contact: { ...d.contact, title: e.target.value } }))
                    }
                    className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={currentDict.contact.titleSub}
                    onChange={(e) =>
                      updateCurrentDict((d) => ({ ...d, contact: { ...d.contact, titleSub: e.target.value } }))
                    }
                    className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={currentDict.contact.desc}
                  onChange={(e) =>
                    updateCurrentDict((d) => ({ ...d, contact: { ...d.contact, desc: e.target.value } }))
                  }
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  Experience Timeline ({selectedLang.toUpperCase()})
                </h2>
                <p className="text-[10px] text-white/40">Manage your career history, roles, and achievements</p>
              </div>
              <button
                onClick={() => {
                  setEditingExpIndex(null)
                  setExpDraft({
                    role: 'Software Engineer',
                    company: 'New Company',
                    period: '2026 — PRESENT',
                    summary: 'Engineered high-performance systems.',
                    bullets: ['Architected scalable services.', 'Reduced latency.'],
                    tech: ['React', 'TypeScript', 'Node.js'],
                  })
                }}
                className="px-3 py-1.5 bg-white text-black text-xs font-semibold hover:bg-white/80 transition-colors cursor-pointer"
              >
                + ADD EXPERIENCE
              </button>
            </div>

            {/* Experience List */}
            <div className="space-y-3">
              {currentDict.experience.items.map((item, idx) => (
                <div key={idx} className="border border-white/15 p-4 bg-white/[0.02] flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{item.role}</span>
                      <span className="text-white/40 text-[10px]">@{item.company}</span>
                      <span className="text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5 font-mono">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">{item.summary}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tech.map((t, tIdx) => (
                        <span key={tIdx} className="text-[9px] text-white/40 border border-white/10 px-1.5 py-0.2">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingExpIndex(idx)
                        setExpDraft({ ...item, bullets: [...item.bullets], tech: [...item.tech] })
                      }}
                      className="px-2.5 py-1 text-xs border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete experience: ${item.role} @ ${item.company}?`)) {
                          updateCurrentDict((d) => ({
                            ...d,
                            experience: {
                              ...d.experience,
                              items: d.experience.items.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                      }}
                      className="px-2.5 py-1 text-xs border border-red-500/30 text-red-400 hover:border-red-500 transition-colors"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Experience Edit Modal / Inline Panel */}
            {expDraft && (
              <div
                data-lenis-prevent
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overscroll-contain"
              >
                <div
                  data-lenis-prevent
                  className="bg-black border border-white/20 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto overscroll-contain admin-scroll space-y-4 shadow-2xl"
                >
                  <h3 className="text-xs font-bold tracking-wider uppercase border-b border-white/10 pb-2">
                    {editingExpIndex !== null ? 'EDIT EXPERIENCE' : 'ADD NEW EXPERIENCE'}
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Role Title</label>
                      <input
                        type="text"
                        value={expDraft.role}
                        onChange={(e) => setExpDraft({ ...expDraft, role: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Company</label>
                      <input
                        type="text"
                        value={expDraft.company}
                        onChange={(e) => setExpDraft({ ...expDraft, company: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase mb-1">Period (e.g. 2024 — PRESENT)</label>
                    <input
                      type="text"
                      value={expDraft.period}
                      onChange={(e) => setExpDraft({ ...expDraft, period: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase mb-1">Summary</label>
                    <textarea
                      rows={2}
                      value={expDraft.summary}
                      onChange={(e) => setExpDraft({ ...expDraft, summary: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase mb-1">Bullets (One per line)</label>
                    <textarea
                      rows={4}
                      value={expDraft.bullets.join('\n')}
                      onChange={(e) =>
                        setExpDraft({ ...expDraft, bullets: e.target.value.split('\n').filter(Boolean) })
                      }
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase mb-1">Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      value={expDraft.tech.join(', ')}
                      onChange={(e) =>
                        setExpDraft({
                          ...expDraft,
                          tech: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setExpDraft(null)}
                      className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => {
                        updateCurrentDict((d) => {
                          const items = [...d.experience.items]
                          if (editingExpIndex !== null) {
                            items[editingExpIndex] = expDraft
                          } else {
                            items.unshift(expDraft)
                          }
                          return { ...d, experience: { ...d.experience, items } }
                        })
                        setExpDraft(null)
                        showToast('Experience updated!')
                      }}
                      className="px-4 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/80"
                    >
                      SAVE ENTRY
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  Projects ({selectedLang.toUpperCase()})
                </h2>
                <p className="text-[10px] text-white/40">Manage your featured engineering projects and links</p>
              </div>
              <button
                onClick={() => {
                  setEditingProjIndex(null)
                  setProjDraft({
                    title: 'New Project',
                    meta: 'System Architecture',
                    period: '2026',
                    desc: 'A high-throughput distributed system.',
                    bullets: ['Implemented real-time telemetry.', '99.99% uptime SLA.'],
                    tech: ['Go', 'Docker', 'AWS'],
                    repoUrl: 'https://github.com/nhatprx',
                  })
                }}
                className="px-3 py-1.5 bg-white text-black text-xs font-semibold hover:bg-white/80 transition-colors cursor-pointer"
              >
                + ADD PROJECT
              </button>
            </div>

            {/* Projects List */}
            <div className="space-y-3">
              {currentDict.projects.items.map((item, idx) => (
                <div key={idx} className="border border-white/15 p-4 bg-white/[0.02] flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{item.title}</span>
                      <span className="text-white/40 text-[10px]">[{item.meta}]</span>
                      <span className="text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5 font-mono">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">{item.desc}</p>
                    {item.repoUrl && (
                      <span className="text-[10px] text-white/40 block truncate">{item.repoUrl}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingProjIndex(idx)
                        setProjDraft({ ...item, bullets: [...item.bullets], tech: [...item.tech] })
                      }}
                      className="px-2.5 py-1 text-xs border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete project: ${item.title}?`)) {
                          updateCurrentDict((d) => ({
                            ...d,
                            projects: {
                              ...d.projects,
                              items: d.projects.items.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                      }}
                      className="px-2.5 py-1 text-xs border border-red-500/30 text-red-400 hover:border-red-500 transition-colors"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Project Edit Modal */}
            {projDraft && (
              <div
                data-lenis-prevent
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overscroll-contain"
              >
                <div
                  data-lenis-prevent
                  className="bg-black border border-white/20 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto overscroll-contain admin-scroll space-y-4 shadow-2xl"
                >
                  <h3 className="text-xs font-bold tracking-wider uppercase border-b border-white/10 pb-2">
                    {editingProjIndex !== null ? 'EDIT PROJECT' : 'ADD NEW PROJECT'}
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Project Title</label>
                      <input
                        type="text"
                        value={projDraft.title}
                        onChange={(e) => setProjDraft({ ...projDraft, title: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Category / Meta</label>
                      <input
                        type="text"
                        value={projDraft.meta}
                        onChange={(e) => setProjDraft({ ...projDraft, meta: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Period (e.g. 2026)</label>
                      <input
                        type="text"
                        value={projDraft.period}
                        onChange={(e) => setProjDraft({ ...projDraft, period: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">GitHub / Demo URL</label>
                      <input
                        type="text"
                        value={projDraft.repoUrl || ''}
                        onChange={(e) => setProjDraft({ ...projDraft, repoUrl: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={projDraft.desc}
                      onChange={(e) => setProjDraft({ ...projDraft, desc: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase mb-1">Bullets (One per line)</label>
                    <textarea
                      rows={4}
                      value={projDraft.bullets.join('\n')}
                      onChange={(e) =>
                        setProjDraft({ ...projDraft, bullets: e.target.value.split('\n').filter(Boolean) })
                      }
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase mb-1">Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      value={projDraft.tech.join(', ')}
                      onChange={(e) =>
                        setProjDraft({
                          ...projDraft,
                          tech: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setProjDraft(null)}
                      className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => {
                        updateCurrentDict((d) => {
                          const items = [...d.projects.items]
                          if (editingProjIndex !== null) {
                            items[editingProjIndex] = projDraft
                          } else {
                            items.unshift(projDraft)
                          }
                          return { ...d, projects: { ...d.projects, items } }
                        })
                        setProjDraft(null)
                        showToast('Project updated!')
                      }}
                      className="px-4 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/80"
                    >
                      SAVE ENTRY
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BLOG / NOTES */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  Engineering Notes / Blog ({selectedLang.toUpperCase()})
                </h2>
                <p className="text-[10px] text-white/40">Manage blog articles displayed in the modal viewer</p>
              </div>
              <button
                onClick={() => {
                  setEditingBlogIndex(null)
                  setBlogDraft({
                    slug: `note-${Date.now().toString().slice(-4)}`,
                    title: 'New Engineering Note',
                    date: 'MAY 2026',
                    readTime: '5 MIN READ',
                    summary: 'Summary of technical insights and experiments.',
                    tags: ['Architecture', 'Performance'],
                    content: {
                      lead: 'Key takeaways and core architectural rationale.',
                      sections: [
                        {
                          heading: '1. Architecture & Design',
                          body: ['First paragraph of detailed engineering explanation.'],
                          code: {
                            language: 'typescript',
                            snippet: 'const example = "Production configuration"',
                          },
                        },
                      ],
                    },
                  })
                }}
                className="px-3 py-1.5 bg-white text-black text-xs font-semibold hover:bg-white/80 transition-colors cursor-pointer"
              >
                + ADD BLOG POST
              </button>
            </div>

            {/* Blog Post List */}
            <div className="space-y-3">
              {currentDict.blog.posts.map((post, idx) => (
                <div key={post.slug} className="border border-white/15 p-4 bg-white/[0.02] flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{post.title}</span>
                      <span className="text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5 font-mono">
                        {post.slug}
                      </span>
                      <span className="text-white/40 text-[10px]">{post.date}</span>
                    </div>
                    <p className="text-xs text-white/60">{post.summary}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {post.tags.map((t, tIdx) => (
                        <span key={tIdx} className="text-[9px] text-white/40 border border-white/10 px-1.5 py-0.2">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingBlogIndex(idx)
                        setBlogDraft(JSON.parse(JSON.stringify(post)))
                      }}
                      className="px-2.5 py-1 text-xs border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete blog post: ${post.title}?`)) {
                          updateCurrentDict((d) => ({
                            ...d,
                            blog: {
                              ...d.blog,
                              posts: d.blog.posts.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                      }}
                      className="px-2.5 py-1 text-xs border border-red-500/30 text-red-400 hover:border-red-500 transition-colors"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Blog Edit Modal */}
            {blogDraft && (
              <div
                data-lenis-prevent
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overscroll-contain"
              >
                <div
                  data-lenis-prevent
                  className="bg-black border border-white/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-contain admin-scroll space-y-4 shadow-2xl"
                >
                  <h3 className="text-xs font-bold tracking-wider uppercase border-b border-white/10 pb-2">
                    {editingBlogIndex !== null ? 'EDIT BLOG NOTE' : 'ADD NEW BLOG NOTE'}
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Title</label>
                      <input
                        type="text"
                        value={blogDraft.title}
                        onChange={(e) => setBlogDraft({ ...blogDraft, title: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">URL Slug</label>
                      <input
                        type="text"
                        value={blogDraft.slug}
                        onChange={(e) => setBlogDraft({ ...blogDraft, slug: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Date (e.g. MAY 2026)</label>
                      <input
                        type="text"
                        value={blogDraft.date}
                        onChange={(e) => setBlogDraft({ ...blogDraft, date: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Read Time (e.g. 6 MIN READ)</label>
                      <input
                        type="text"
                        value={blogDraft.readTime}
                        onChange={(e) => setBlogDraft({ ...blogDraft, readTime: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase mb-1">Card Summary (Excerpt)</label>
                    <textarea
                      rows={2}
                      value={blogDraft.summary}
                      onChange={(e) => setBlogDraft({ ...blogDraft, summary: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase mb-1">Article Lead (Opening paragraph)</label>
                    <textarea
                      rows={2}
                      value={blogDraft.content.lead}
                      onChange={(e) =>
                        setBlogDraft({
                          ...blogDraft,
                          content: { ...blogDraft.content, lead: e.target.value },
                        })
                      }
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={blogDraft.tags.join(', ')}
                      onChange={(e) =>
                        setBlogDraft({
                          ...blogDraft,
                          tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  {/* Section builder */}
                  <div className="border border-white/10 p-3 bg-white/[0.02] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/60 uppercase">Article Sections</span>
                      <button
                        type="button"
                        onClick={() => {
                          setBlogDraft({
                            ...blogDraft,
                            content: {
                              ...blogDraft.content,
                              sections: [
                                ...blogDraft.content.sections,
                                {
                                  heading: 'New Section',
                                  body: ['Section paragraph content.'],
                                },
                              ],
                            },
                          })
                        }}
                        className="text-[10px] text-white border border-white/20 px-2 py-0.5 hover:bg-white/10"
                      >
                        + Add Section
                      </button>
                    </div>

                    {blogDraft.content.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="border border-white/10 p-3 space-y-2 bg-black/40">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-white/40">Section {sIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const s = [...blogDraft.content.sections]
                              s.splice(sIdx, 1)
                              setBlogDraft({
                                ...blogDraft,
                                content: { ...blogDraft.content, sections: s },
                              })
                            }}
                            className="text-[9px] text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Section Heading"
                          value={sec.heading}
                          onChange={(e) => {
                            const s = [...blogDraft.content.sections]
                            s[sIdx].heading = e.target.value
                            setBlogDraft({
                              ...blogDraft,
                              content: { ...blogDraft.content, sections: s },
                            })
                          }}
                          className="w-full bg-white/[0.03] border border-white/20 p-1.5 text-xs text-white"
                        />
                        <textarea
                          rows={3}
                          placeholder="Paragraphs (separated by newlines)"
                          value={sec.body.join('\n\n')}
                          onChange={(e) => {
                            const s = [...blogDraft.content.sections]
                            s[sIdx].body = e.target.value.split('\n\n').filter(Boolean)
                            setBlogDraft({
                              ...blogDraft,
                              content: { ...blogDraft.content, sections: s },
                            })
                          }}
                          className="w-full bg-white/[0.03] border border-white/20 p-1.5 text-xs text-white"
                        />

                        {/* Optional code snippet */}
                        <div className="pt-1">
                          <label className="block text-[9px] text-white/40 uppercase mb-0.5">
                            Code Snippet (Optional)
                          </label>
                          <div className="flex gap-2 mb-1">
                            <input
                              type="text"
                              placeholder="Lang (e.g. yaml, ts)"
                              value={sec.code?.language || ''}
                              onChange={(e) => {
                                const s = [...blogDraft.content.sections]
                                s[sIdx].code = {
                                  language: e.target.value,
                                  snippet: s[sIdx].code?.snippet || '',
                                }
                                setBlogDraft({
                                  ...blogDraft,
                                  content: { ...blogDraft.content, sections: s },
                                })
                              }}
                              className="w-24 bg-white/[0.03] border border-white/20 p-1 text-[10px] text-white"
                            />
                          </div>
                          <textarea
                            rows={3}
                            placeholder="Snippet code..."
                            value={sec.code?.snippet || ''}
                            onChange={(e) => {
                              const s = [...blogDraft.content.sections]
                              s[sIdx].code = {
                                language: s[sIdx].code?.language || 'text',
                                snippet: e.target.value,
                              }
                              setBlogDraft({
                                ...blogDraft,
                                content: { ...blogDraft.content, sections: s },
                              })
                            }}
                            className="w-full bg-white/[0.03] border border-white/20 p-1.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setBlogDraft(null)}
                      className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => {
                        updateCurrentDict((d) => {
                          const posts = [...d.blog.posts]
                          if (editingBlogIndex !== null) {
                            posts[editingBlogIndex] = blogDraft
                          } else {
                            posts.unshift(blogDraft)
                          }
                          return { ...d, blog: { ...d.blog, posts } }
                        })
                        setBlogDraft(null)
                        showToast('Blog post updated!')
                      }}
                      className="px-4 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/80"
                    >
                      SAVE POST
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Terminal Commands & Responses
              </h2>
              <p className="text-[10px] text-white/40">
                Add custom terminal commands that users can type in the EC2 interactive console.
              </p>
            </div>

            {/* Add Command Form */}
            <div className="border border-white/15 p-5 bg-white/[0.02] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">Add / Update Command</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Command String (e.g. secret, contact)</label>
                  <input
                    type="text"
                    value={newCmdName}
                    onChange={(e) => setNewCmdName(e.target.value.toLowerCase().trim())}
                    placeholder="my-command"
                    className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase mb-1">Terminal Response Text</label>
                <textarea
                  rows={4}
                  value={newCmdOutput}
                  onChange={(e) => setNewCmdOutput(e.target.value)}
                  placeholder="Output displayed when this command is entered in the terminal..."
                  className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newCmdName) return
                  setTerminalCommands((prev) => ({
                    ...prev,
                    [newCmdName]: newCmdOutput,
                  }))
                  setNewCmdName('')
                  setNewCmdOutput('')
                  showToast(`Command '${newCmdName}' registered! Click 'SAVE CHANGES' to commit.`)
                }}
                className="px-4 py-2 bg-white text-black text-xs font-bold hover:bg-white/80 transition-colors cursor-pointer"
              >
                + REGISTER COMMAND
              </button>
            </div>

            {/* Existing Custom Commands */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">Registered Custom Commands</h3>
              {Object.keys(terminalCommands).length === 0 ? (
                <p className="text-xs text-white/30 italic">No custom commands registered yet.</p>
              ) : (
                Object.entries(terminalCommands).map(([cmd, out]) => (
                  <div key={cmd} className="border border-white/10 p-3.5 bg-black flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold text-xs">$ {cmd}</span>
                      </div>
                      <pre className="text-xs text-white/60 font-mono whitespace-pre-wrap">{out}</pre>
                    </div>
                    <button
                      onClick={() => {
                        const copy = { ...terminalCommands }
                        delete copy[cmd]
                        setTerminalCommands(copy)
                      }}
                      className="px-2 py-1 text-xs border border-red-500/30 text-red-400 hover:border-red-500"
                    >
                      DELETE
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: BACKUP & PASSKEY */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="border border-white/15 p-5 bg-white/[0.02] space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
                Security & Passkey
              </h2>
              <div className="max-w-md space-y-2">
                <label className="block text-[10px] text-white/40 uppercase">Change Admin Passkey</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="New passkey..."
                    value={newPasskey}
                    onChange={(e) => setNewPasskey(e.target.value)}
                    className="flex-1 bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      if (!newPasskey.trim()) return
                      setAdminPasskey(newPasskey)
                      setNewPasskey('')
                      showToast('Admin passkey updated!')
                    }}
                    className="px-4 py-2 bg-white text-black text-xs font-bold hover:bg-white/80"
                  >
                    UPDATE
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-white/15 p-5 bg-white/[0.02] space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
                Backup / Export & Import
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                You can export your customized content as JSON to back it up or commit it directly into the codebase.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(translations, null, 2))
                    const a = document.createElement('a')
                    a.href = dataStr
                    a.download = `portfolio-content-backup-${new Date().toISOString().slice(0, 10)}.json`
                    a.click()
                    showToast('Backup JSON downloaded!')
                  }}
                  className="px-4 py-2 border border-white/20 text-white text-xs hover:border-white transition-colors"
                >
                  DOWNLOAD JSON BACKUP
                </button>
                <button
                  onClick={() => {
                    if (confirm('Reset all content to factory default translations? Custom edits in localStorage will be wiped.')) {
                      resetStoredTranslations()
                      const defaults = getStoredTranslations()
                      setTranslations(defaults)
                      onUpdateTranslations(defaults)
                      showToast('Reset to factory defaults!')
                    }
                  }}
                  className="px-4 py-2 border border-red-500/30 text-red-400 text-xs hover:border-red-500 transition-colors"
                >
                  RESET TO FACTORY DEFAULTS
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
