import { useState, useEffect, useRef } from 'react'
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
import {
  CONTENT_LIMITS,
  translateEntireDict,
  translateExperienceItem,
  translateProjectItem,
  translateBlogPost,
} from '../../services/autoTranslate'
import SitePreview from './SitePreview'

function CharCounter({ current, max }: { current: number; max: number }) {
  const isOver = current > max
  const isNear = current >= max * 0.85
  return (
    <span
      className={`text-[9.5px] font-mono tracking-tight shrink-0 ${
        isOver
          ? 'text-rose-400 font-bold'
          : isNear
            ? 'text-amber-400 font-medium'
            : 'text-white/30'
      }`}
    >
      {current}/{max}
    </span>
  )
}

interface AdminPortalProps {
  onClose: () => void
  onUpdateTranslations: (data: Record<SupportedLang, TranslationDict>) => void
}

type TabType =
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'blog'
  | 'contact'
  | 'terminal'
  | 'system'

const SKILL_GROUP_LIMITS: Record<number, { maxItems: number; maxLen: number; label: string }> = {
  0: { maxItems: 3, maxLen: 14, label: 'Languages (Max 3 items, ≤14 chars)' },
  1: { maxItems: 3, maxLen: 14, label: 'Databases (Max 3 items, ≤14 chars)' },
  2: { maxItems: 4, maxLen: 18, label: 'Frameworks (Max 4 items, ≤18 chars)' },
  3: { maxItems: 8, maxLen: 26, label: 'DevOps & Cloud (Max 8 items, ≤26 chars)' },
  4: { maxItems: 5, maxLen: 50, label: 'Architecture (Max 5 items, ≤50 chars)' },
}

export default function AdminPortal({ onClose, onUpdateTranslations }: AdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminAuthenticated())
  const [inputPass, setInputPass] = useState('')
  const [loginError, setLoginError] = useState('')

  // Admin Data State
  const [translations, setTranslations] = useState<Record<SupportedLang, TranslationDict>>(() => getStoredTranslations())
  const [terminalCommands, setTerminalCommands] = useState<CustomTerminalCommands>(() => getStoredTerminalCommands())
  const [selectedLang, setSelectedLang] = useState<SupportedLang>('en')
  const [activeTab, setActiveTab] = useState<TabType>('about')
  const [mobilePane, setMobilePane] = useState<'editor' | 'preview'>('editor')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Section 01 Exclusive Accordion (defaults to collapsed, only 1 open at a time)
  type Section1ClusterKey = 'hero' | 'narrative' | 'education' | null
  const [activeSection1Cluster, setActiveSection1Cluster] = useState<Section1ClusterKey>(null)

  const toggleSection1Cluster = (key: 'hero' | 'narrative' | 'education') => {
    setActiveSection1Cluster((prev) => (prev === key ? null : key))
  }

  // Skill Add Modal state
  const [skillModalCategoryIndex, setSkillModalCategoryIndex] = useState<number | null>(null)
  const [skillModalInput, setSkillModalInput] = useState<string>('')

  // Secondary Education Modal state
  const [isSecondaryEduModalOpen, setIsSecondaryEduModalOpen] = useState<boolean>(false)
  const [secondaryEduDraft, setSecondaryEduDraft] = useState({
    school: '',
    location: '',
    degree: '',
    major: '',
  })

  // Experience form modal / state
  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null)
  const [expDraft, setExpDraft] = useState<ExperienceItem | null>(null)

  // Project form modal / state
  const [editingProjIndex, setEditingProjIndex] = useState<number | null>(null)
  const [projDraft, setProjDraft] = useState<ProjectItem | null>(null)

  // Blog form modal / state
  const [editingBlogIndex, setEditingBlogIndex] = useState<number | null>(null)
  const [blogDraft, setBlogDraft] = useState<LocalizedBlogPost | null>(null)

  // Terminal command modal state
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState<boolean>(false)
  const [editingCmdName, setEditingCmdName] = useState<string | null>(null)
  const [terminalDraft, setTerminalDraft] = useState({ name: '', output: '' })

  // Translation Automation State
  const [isTranslating, setIsTranslating] = useState<boolean>(false)
  const [translateStatus, setTranslateStatus] = useState<string>('')

  // System security passkey
  const [newPasskey, setNewPasskey] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Full-site Auto Translation from English
  const handleSyncTranslateAll = async () => {
    if (isTranslating) return
    const confirmRun = confirm(
      'Translate all content from English (EN) to Vietnamese (VI), French (FR), and Japanese (JA)?\n\n' +
      '• Layout limits will be strictly preserved.\n' +
      '• Technical keywords and code blocks will stay intact.'
    )
    if (!confirmRun) return

    setIsTranslating(true)
    try {
      const enSource = translations.en
      const targetLangs: ('vi' | 'fr' | 'ja')[] = ['vi', 'fr', 'ja']
      const updatedDicts: Partial<Record<SupportedLang, TranslationDict>> = {}

      for (const lang of targetLangs) {
        setTranslateStatus(`Translating EN → ${lang.toUpperCase()}...`)
        const translated = await translateEntireDict(enSource, lang, (step) => setTranslateStatus(step))
        updatedDicts[lang] = translated
      }

      const mergedTranslations: Record<SupportedLang, TranslationDict> = {
        ...translations,
        vi: updatedDicts.vi || translations.vi,
        fr: updatedDicts.fr || translations.fr,
        ja: updatedDicts.ja || translations.ja,
      }

      setTranslations(mergedTranslations)
      saveStoredTranslations(mergedTranslations)
      onUpdateTranslations(mergedTranslations)
      showToast('All languages auto-translated and synced!')
    } catch (err) {
      console.error('Translation failed:', err)
      showToast('Translation encountered an error. Check network.')
    } finally {
      setIsTranslating(false)
      setTranslateStatus('')
    }
  }

  const handleAddSkillFromModal = () => {
    if (skillModalCategoryIndex === null) return
    const val = skillModalInput.trim()
    if (!val) return
    const rule = SKILL_GROUP_LIMITS[skillModalCategoryIndex] || { maxItems: 10, maxLen: 30 }
    const cat = currentDict.skills.categories[skillModalCategoryIndex]
    if (cat.skills.length >= rule.maxItems) {
      showToast(`Limit reached: maximum ${rule.maxItems} skills for ${cat.title}`)
      return
    }
    if (val.length > rule.maxLen) {
      showToast(`Skill length exceeds limit of ${rule.maxLen} characters`)
      return
    }
    if (cat.skills.some((s) => s.toLowerCase() === val.toLowerCase())) {
      showToast(`'${val}' already exists in ${cat.title}`)
      return
    }
    updateCurrentDict((d) => {
      const cats = [...d.skills.categories]
      cats[skillModalCategoryIndex] = {
        ...cats[skillModalCategoryIndex],
        skills: [...cats[skillModalCategoryIndex].skills, val],
      }
      return { ...d, skills: { ...d.skills, categories: cats } }
    })
    setSkillModalInput('')
    setSkillModalCategoryIndex(null)
    showToast(`Added '${val}' to ${cat.title}!`)
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

  const handleSaveTerminalCommand = () => {
    const name = terminalDraft.name.toLowerCase().trim()
    if (!name) {
      showToast('Please enter a command name.')
      return
    }
    setTerminalCommands((prev) => {
      const copy = { ...prev }
      if (editingCmdName && editingCmdName !== name) {
        delete copy[editingCmdName]
      }
      copy[name] = terminalDraft.output
      return copy
    })
    setIsTerminalModalOpen(false)
    setEditingCmdName(null)
    setTerminalDraft({ name: '', output: '' })
    showToast(`Command '${name}' saved! Click 'SAVE CHANGES' to commit.`)
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

  // Auto-Save Engine (syncs automatically to localStorage and live site on every change)
  const isFirstMount = useRef(true)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    setSaveStatus('saving')
    const timer = setTimeout(() => {
      saveStoredTranslations(translations)
      saveStoredTerminalCommands(terminalCommands)
      onUpdateTranslations(translations)
      setSaveStatus('saved')
    }, 350)

    return () => clearTimeout(timer)
  }, [translations, terminalCommands, onUpdateTranslations])

  const handleSaveAll = () => {
    saveStoredTranslations(translations)
    saveStoredTerminalCommands(terminalCommands)
    onUpdateTranslations(translations)
    setSaveStatus('saved')
    showToast('Saved successfully! Live site updated.')
  }

  const handleCloseAndSync = () => {
    saveStoredTranslations(translations)
    saveStoredTerminalCommands(terminalCommands)
    onUpdateTranslations(translations)
    onClose()
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
              <span className="text-xs font-bold tracking-widest text-white uppercase">AUTH · PORTAL</span>
            </div>
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
          <span className="font-bold text-xs tracking-widest text-white uppercase">NHATPRX · ADMIN DASHBOARD</span>
          <span className="text-[10px] text-emerald-400/80 px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/5 hidden sm:inline">
            🛡️ LAYOUT LIMITS ACTIVE
          </span>
          {isTranslating && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>{translateStatus || 'Translating...'}</span>
            </div>
          )}
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

          {/* View Mode Switcher for mobile / smaller screens */}
          <div className="lg:hidden flex items-center border border-white/15 p-0.5 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setMobilePane('editor')}
              className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider transition-colors ${
                mobilePane === 'editor' ? 'bg-white text-black font-bold' : 'text-white/50 hover:text-white'
              }`}
            >
              EDIT
            </button>
            <button
              type="button"
              onClick={() => setMobilePane('preview')}
              className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider transition-colors ${
                mobilePane === 'preview' ? 'bg-white text-black font-bold' : 'text-white/50 hover:text-white'
              }`}
            >
              PREVIEW
            </button>
          </div>

          <button
            onClick={handleSyncTranslateAll}
            disabled={isTranslating}
            title="Auto-translate entire site content from English to Vietnamese, French, and Japanese respecting layout limits"
            className="px-3 py-1.5 border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>🌐</span>
            <span className="hidden md:inline">AUTO TRANSLATE</span>
            <span className="text-[10px] opacity-80">(EN → ALL)</span>
          </button>

          {/* Live Auto-Save Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono border transition-colors ${
              saveStatus === 'saving'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span className="font-semibold tracking-wider">
              {saveStatus === 'saving' ? 'SAVING...' : 'AUTO-SAVED'}
            </span>
          </div>

          <button
            onClick={handleSaveAll}
            title="All changes are auto-saved in real-time. Click to force save immediately."
            className="px-3.5 py-1.5 bg-white text-black text-xs font-bold hover:bg-white/80 transition-colors cursor-pointer"
          >
            SAVE CHANGES
          </button>
          <button
            onClick={handleCloseAndSync}
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

      {/* Body with Left Sidebar */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside
          data-lenis-prevent
          className="w-44 sm:w-52 border-r border-white/10 bg-black/60 flex flex-col shrink-0 overflow-y-auto overscroll-contain admin-scroll p-3 space-y-1 select-none"
        >
          <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-white/30 uppercase border-b border-white/5 mb-1 flex items-center justify-between">
            <span>SECTIONS</span>
            <span className="text-[9px] text-emerald-400 font-bold">{selectedLang.toUpperCase()}</span>
          </div>

          {(
            [
              { id: 'about', num: '01', label: 'HERO & ABOUT' },
              { id: 'skills', num: '02', label: 'SKILLS', count: currentDict.skills.categories.length },
              { id: 'experience', num: '03', label: 'EXPERIENCE', count: currentDict.experience.items.length },
              { id: 'projects', num: '04', label: 'PROJECTS', count: currentDict.projects.items.length },
              { id: 'blog', num: '05', label: 'BLOG / NOTES', count: currentDict.blog.posts.length },
              { id: 'contact', num: '06', label: 'CONTACT' },
              { id: 'terminal', num: '07', label: 'TERMINAL', count: Object.keys(terminalCommands).length },
              { id: 'system', num: '08', label: 'BACKUP & PASSKEY' },
            ] as { id: TabType; num: string; label: string; count?: number }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3 py-2.5 text-xs font-mono tracking-wider flex items-center justify-between transition-colors border-l-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-white text-white font-bold bg-white/10'
                  : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-[10px] text-white/30">{tab.num}</span>
                <span className="truncate">{tab.label}</span>
              </div>
              {tab.count !== undefined && (
                <span className="text-[9px] text-white/40 px-1.5 py-0.2 border border-white/10 bg-white/5">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Center Main Editor Area (5/5 Split) */}
        <main
          data-lenis-prevent
          className={`w-full lg:w-1/2 flex-1 min-w-0 border-r border-white/10 min-h-0 overflow-y-auto overscroll-contain admin-scroll p-4 sm:p-6 lg:p-8 space-y-6 ${
            mobilePane === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* SECTION 01: HERO & ABOUT ME */}
          {activeTab === 'about' && (
            <div className="space-y-4">
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
                {activeSection1Cluster && (
                  <button
                    type="button"
                    onClick={() => setActiveSection1Cluster(null)}
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
                  onClick={() => toggleSection1Cluster('hero')}
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
                      activeSection1Cluster === 'hero'
                        ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                        : 'border-white/15 text-white/70 hover:text-white'
                    }`}>
                      {activeSection1Cluster === 'hero' ? '▲ CLOSE' : '▼ EDIT'}
                    </span>
                  </div>
                </button>

                {activeSection1Cluster === 'hero' && (
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
                              if (!file) return
                              const reader = new FileReader()
                              reader.onload = () => {
                                const result = reader.result as string
                                updateCurrentDict((d) => ({
                                  ...d,
                                  hero: { ...d.hero, resumeUrl: result, resumeFileName: file.name },
                                }))
                                showToast(`Loaded file: ${file.name}`)
                              }
                              reader.readAsDataURL(file)
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
                  onClick={() => toggleSection1Cluster('narrative')}
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
                      activeSection1Cluster === 'narrative'
                        ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                        : 'border-white/15 text-white/70 hover:text-white'
                    }`}>
                      {activeSection1Cluster === 'narrative' ? '▲ CLOSE' : '▼ EDIT'}
                    </span>
                  </div>
                </button>

                {activeSection1Cluster === 'narrative' && (
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
                  onClick={() => toggleSection1Cluster('education')}
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
                      activeSection1Cluster === 'education'
                        ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                        : 'border-white/15 text-white/70 hover:text-white'
                    }`}>
                      {activeSection1Cluster === 'education' ? '▲ CLOSE' : '▼ EDIT'}
                    </span>
                  </div>
                </button>

                {activeSection1Cluster === 'education' && (
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
              {isSecondaryEduModalOpen && (
                <div
                  data-lenis-prevent
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                >
                  <div
                    data-lenis-prevent
                    className="bg-black border border-white/20 p-6 max-w-lg w-full space-y-4 shadow-2xl font-mono"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h3 className="text-xs font-bold tracking-wider uppercase text-white">
                        {currentDict.about.edu2School?.trim() ? 'EDIT SECONDARY EDUCATION' : 'ADD SECONDARY EDUCATION'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsSecondaryEduModalOpen(false)}
                        className="text-white/40 hover:text-white text-xs font-mono"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-white/40 uppercase">School / University</label>
                          <CharCounter current={secondaryEduDraft.school.length} max={CONTENT_LIMITS.about.eduSchool} />
                        </div>
                        <input
                          type="text"
                          autoFocus
                          maxLength={CONTENT_LIMITS.about.eduSchool}
                          value={secondaryEduDraft.school}
                          placeholder="Multimedia University"
                          onChange={(e) => setSecondaryEduDraft((prev) => ({ ...prev, school: e.target.value }))}
                          className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-white/40 uppercase">Location</label>
                          <CharCounter current={secondaryEduDraft.location.length} max={CONTENT_LIMITS.about.eduLocation} />
                        </div>
                        <input
                          type="text"
                          maxLength={CONTENT_LIMITS.about.eduLocation}
                          value={secondaryEduDraft.location}
                          placeholder="Cyberjaya, Malaysia"
                          onChange={(e) => setSecondaryEduDraft((prev) => ({ ...prev, location: e.target.value }))}
                          className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] text-white/40 uppercase">Degree Title</label>
                            <CharCounter current={secondaryEduDraft.degree.length} max={CONTENT_LIMITS.about.eduDegree} />
                          </div>
                          <input
                            type="text"
                            maxLength={CONTENT_LIMITS.about.eduDegree}
                            value={secondaryEduDraft.degree}
                            placeholder="EXCHANGE PROGRAM"
                            onChange={(e) => setSecondaryEduDraft((prev) => ({ ...prev, degree: e.target.value }))}
                            className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] text-white/40 uppercase">Major / Field</label>
                            <CharCounter current={secondaryEduDraft.major.length} max={CONTENT_LIMITS.about.eduMajor} />
                          </div>
                          <input
                            type="text"
                            maxLength={CONTENT_LIMITS.about.eduMajor}
                            value={secondaryEduDraft.major}
                            placeholder="Computer Science"
                            onChange={(e) => setSecondaryEduDraft((prev) => ({ ...prev, major: e.target.value }))}
                            className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsSecondaryEduModalOpen(false)}
                        className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white"
                      >
                        CANCEL
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSecondaryEdu}
                        className="px-4 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/80"
                      >
                        SAVE SECONDARY
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="border border-white/10 bg-white/[0.01] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h2 className="text-xs font-bold text-white/80 uppercase tracking-widest">
                    Skills Section ({selectedLang.toUpperCase()})
                  </h2>
                  <span className="text-[10px] text-white/40 font-mono">
                    Grid-aligned item constraints
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40 uppercase">Title</label>
                      <CharCounter current={currentDict.skills.title?.length || 0} max={CONTENT_LIMITS.skills.title} />
                    </div>
                    <input
                      type="text"
                      maxLength={CONTENT_LIMITS.skills.title}
                      value={currentDict.skills.title}
                      onChange={(e) =>
                        updateCurrentDict((d) => ({ ...d, skills: { ...d.skills, title: e.target.value } }))
                      }
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40 uppercase">Subtitle</label>
                      <CharCounter current={currentDict.skills.titleSub?.length || 0} max={CONTENT_LIMITS.skills.titleSub} />
                    </div>
                    <input
                      type="text"
                      maxLength={CONTENT_LIMITS.skills.titleSub}
                      value={currentDict.skills.titleSub}
                      onChange={(e) =>
                        updateCurrentDict((d) => ({ ...d, skills: { ...d.skills, titleSub: e.target.value } }))
                      }
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">
                      Skill Groups ({currentDict.skills.categories.length})
                    </h3>
                    <span className="text-[9.5px] text-white/30 font-mono">
                      Recommended: Grp 1 & 2 (≤14c) · Grp 3 (≤18c) · Grp 4 (≤26c) · Grp 5 (≤50c)
                    </span>
                  </div>

                  {currentDict.skills.categories.map((cat, cIdx) => {
                    const rule = SKILL_GROUP_LIMITS[cIdx] || { maxItems: 8, maxLen: 30, label: 'Custom Group' }
                    const isAtCapacity = cat.skills.length >= rule.maxItems

                    return (
                      <div key={cIdx} className="border border-white/10 p-4 bg-black/40 space-y-3">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">
                              GROUP 0{cIdx + 1}
                            </span>
                            <span className="text-[10px] text-white/40 font-mono">
                              ({cat.skills.length}/{rule.maxItems} STACKS)
                            </span>
                          </div>
                          <CharCounter current={cat.title?.length || 0} max={30} />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/40 uppercase mb-1">Group Title</label>
                          <input
                            type="text"
                            maxLength={30}
                            value={cat.title}
                            onChange={(e) => {
                              updateCurrentDict((d) => {
                                const cats = [...d.skills.categories]
                                cats[cIdx] = { ...cats[cIdx], title: e.target.value }
                                return { ...d, skills: { ...d.skills, categories: cats } }
                              })
                            }}
                            className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:border-white focus:outline-none"
                          />
                        </div>

                        {/* Interactive Skills Badges */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[10px] text-white/40 uppercase">
                              Stacks / Languages (Max {rule.maxItems} items, ≤{rule.maxLen}c)
                            </label>
                            <span className="text-[9px] text-white/30 font-mono">
                              Click ✕ to remove
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 p-2 border border-white/10 bg-white/[0.02] min-h-[42px] items-center">
                            {cat.skills.length === 0 ? (
                              <span className="text-xs text-white/30 italic font-mono">No skills added yet</span>
                            ) : (
                              cat.skills.map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-white/20 bg-white/[0.05] text-white font-mono hover:border-white/40 transition-colors"
                                >
                                  <span>{skill}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateCurrentDict((d) => {
                                        const cats = [...d.skills.categories]
                                        cats[cIdx] = {
                                          ...cats[cIdx],
                                          skills: cats[cIdx].skills.filter((_, i) => i !== sIdx),
                                        }
                                        return { ...d, skills: { ...d.skills, categories: cats } }
                                      })
                                    }}
                                    className="text-white/40 hover:text-rose-400 transition-colors ml-0.5 cursor-pointer font-bold text-[11px]"
                                    title={`Remove ${skill}`}
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Add Stack Button (Modal Trigger) */}
                        {!isAtCapacity ? (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSkillModalCategoryIndex(cIdx)
                                setSkillModalInput('')
                              }}
                              className="w-full py-2 border border-dashed border-white/20 text-xs font-mono text-white/70 hover:text-white hover:border-white/50 hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>+ ADD STACK</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-2 border border-amber-500/20 bg-amber-500/5 text-amber-300/80 text-[10px] font-mono flex items-center gap-2">
                            <span>●</span>
                            <span>Grid capacity full ({cat.skills.length}/{rule.maxItems} stacks). Remove an item to add another.</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Add Skill Modal */}
              {skillModalCategoryIndex !== null && (
                <div
                  data-lenis-prevent
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                >
                  <div
                    data-lenis-prevent
                    className="bg-black border border-white/20 p-6 max-w-md w-full space-y-4 shadow-2xl font-mono"
                  >
                    {(() => {
                      const cat = currentDict.skills.categories[skillModalCategoryIndex]
                      const rule = SKILL_GROUP_LIMITS[skillModalCategoryIndex] || { maxItems: 8, maxLen: 30 }
                      return (
                        <>
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <div>
                              <h3 className="text-xs font-bold tracking-wider uppercase text-white">
                                ADD STACK · GROUP 0{skillModalCategoryIndex + 1}
                              </h3>
                              <span className="text-[10px] text-emerald-400 font-mono">
                                {cat.title} ({cat.skills.length}/{rule.maxItems})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSkillModalCategoryIndex(null)}
                              className="text-white/40 hover:text-white text-xs font-mono"
                            >
                              ✕
                            </button>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] text-white/40 uppercase">
                                Language / Stack Name (Max {rule.maxLen} chars)
                              </label>
                              <CharCounter current={skillModalInput.length} max={rule.maxLen} />
                            </div>
                            <input
                              type="text"
                              autoFocus
                              maxLength={rule.maxLen}
                              value={skillModalInput}
                              placeholder="e.g. TypeScript, Docker, PostgreSQL..."
                              onChange={(e) => setSkillModalInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleAddSkillFromModal()
                                }
                              }}
                              className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-xs text-white focus:border-white focus:outline-none font-mono"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                            <button
                              type="button"
                              onClick={() => setSkillModalCategoryIndex(null)}
                              className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white"
                            >
                              CANCEL
                            </button>
                            <button
                              type="button"
                              onClick={handleAddSkillFromModal}
                              disabled={!skillModalInput.trim()}
                              className="px-4 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/80 disabled:opacity-40"
                            >
                              + ADD STACK
                            </button>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* TAB 4: EXPERIENCE */}
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
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-bold tracking-wider uppercase">
                      {editingExpIndex !== null ? 'EDIT EXPERIENCE' : 'ADD NEW EXPERIENCE'}
                    </h3>
                    {selectedLang !== 'en' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const enItem = translations.en.experience.items[editingExpIndex ?? 0] || expDraft
                          const translated = await translateExperienceItem(enItem, selectedLang as 'vi' | 'fr' | 'ja')
                          setExpDraft(translated)
                          showToast(`Auto-translated from EN to ${selectedLang.toUpperCase()}!`)
                        }}
                        className="px-2 py-0.5 text-[10px] text-cyan-300 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                      >
                        🌐 Auto-Translate from EN
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-white/40 uppercase">Role Title</label>
                        <CharCounter current={expDraft.role?.length || 0} max={CONTENT_LIMITS.work.title} />
                      </div>
                      <input
                        type="text"
                        maxLength={CONTENT_LIMITS.work.title}
                        value={expDraft.role}
                        onChange={(e) => setExpDraft({ ...expDraft, role: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-white/40 uppercase">Company</label>
                        <CharCounter current={expDraft.company?.length || 0} max={CONTENT_LIMITS.work.company} />
                      </div>
                      <input
                        type="text"
                        maxLength={CONTENT_LIMITS.work.company}
                        value={expDraft.company}
                        onChange={(e) => setExpDraft({ ...expDraft, company: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40 uppercase">Period (e.g. 2024 — PRESENT)</label>
                      <CharCounter current={expDraft.period?.length || 0} max={CONTENT_LIMITS.work.period} />
                    </div>
                    <input
                      type="text"
                      maxLength={CONTENT_LIMITS.work.period}
                      value={expDraft.period}
                      onChange={(e) => setExpDraft({ ...expDraft, period: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40 uppercase">Summary</label>
                      <CharCounter current={expDraft.summary?.length || 0} max={CONTENT_LIMITS.work.summary} />
                    </div>
                    <textarea
                      rows={2}
                      maxLength={CONTENT_LIMITS.work.summary}
                      value={expDraft.summary}
                      onChange={(e) => setExpDraft({ ...expDraft, summary: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40 uppercase">Bullets (One per line, Max 240 chars each)</label>
                      <span className="text-[9px] text-white/30">{expDraft.bullets.length} bullets</span>
                    </div>
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40 uppercase">Tech Stack (comma separated)</label>
                      <span className="text-[9px] text-white/30">Universal keywords</span>
                    </div>
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
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-bold tracking-wider uppercase">
                      {editingProjIndex !== null ? 'EDIT PROJECT' : 'ADD NEW PROJECT'}
                    </h3>
                    {selectedLang !== 'en' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const enItem = translations.en.projects.items[editingProjIndex ?? 0] || projDraft
                          const translated = await translateProjectItem(enItem, selectedLang as 'vi' | 'fr' | 'ja')
                          setProjDraft(translated)
                          showToast(`Auto-translated project from EN to ${selectedLang.toUpperCase()}!`)
                        }}
                        className="px-2 py-0.5 text-[10px] text-cyan-300 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                      >
                        🌐 Auto-Translate from EN
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-white/40 uppercase">Project Title</label>
                        <CharCounter current={projDraft.title?.length || 0} max={CONTENT_LIMITS.work.title} />
                      </div>
                      <input
                        type="text"
                        maxLength={CONTENT_LIMITS.work.title}
                        value={projDraft.title}
                        onChange={(e) => setProjDraft({ ...projDraft, title: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-white/40 uppercase">Category / Meta</label>
                        <CharCounter current={projDraft.meta?.length || 0} max={CONTENT_LIMITS.work.company} />
                      </div>
                      <input
                        type="text"
                        maxLength={CONTENT_LIMITS.work.company}
                        value={projDraft.meta}
                        onChange={(e) => setProjDraft({ ...projDraft, meta: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-white/40 uppercase">Period (e.g. 2026)</label>
                        <CharCounter current={projDraft.period?.length || 0} max={CONTENT_LIMITS.work.period} />
                      </div>
                      <input
                        type="text"
                        maxLength={CONTENT_LIMITS.work.period}
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40 uppercase">Description</label>
                      <CharCounter current={projDraft.desc?.length || 0} max={CONTENT_LIMITS.work.summary} />
                    </div>
                    <textarea
                      rows={2}
                      maxLength={CONTENT_LIMITS.work.summary}
                      value={projDraft.desc}
                      onChange={(e) => setProjDraft({ ...projDraft, desc: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40 uppercase">Bullets (One per line, Max 240 chars each)</label>
                      <span className="text-[9px] text-white/30">{projDraft.bullets.length} bullets</span>
                    </div>
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40 uppercase">Tech Stack (comma separated)</label>
                      <span className="text-[9px] text-white/30">Universal keywords</span>
                    </div>
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
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-bold tracking-wider uppercase">
                      {editingBlogIndex !== null ? 'EDIT BLOG NOTE' : 'ADD NEW BLOG NOTE'}
                    </h3>
                    {selectedLang !== 'en' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const enItem = translations.en.blog.posts[editingBlogIndex ?? 0] || blogDraft
                          const translated = await translateBlogPost(enItem, selectedLang as 'vi' | 'fr' | 'ja')
                          setBlogDraft(translated)
                          showToast(`Auto-translated note from EN to ${selectedLang.toUpperCase()}!`)
                        }}
                        className="px-2 py-0.5 text-[10px] text-cyan-300 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                      >
                        🌐 Auto-Translate from EN
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-white/40 uppercase">Title</label>
                        <CharCounter current={blogDraft.title?.length || 0} max={CONTENT_LIMITS.blog.title} />
                      </div>
                      <input
                        type="text"
                        maxLength={CONTENT_LIMITS.blog.title}
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-white/40 uppercase">Date (e.g. MAY 2026)</label>
                        <CharCounter current={blogDraft.date?.length || 0} max={CONTENT_LIMITS.blog.date} />
                      </div>
                      <input
                        type="text"
                        maxLength={CONTENT_LIMITS.blog.date}
                        value={blogDraft.date}
                        onChange={(e) => setBlogDraft({ ...blogDraft, date: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-white/40 uppercase">Read Time (e.g. 6 MIN READ)</label>
                        <CharCounter current={blogDraft.readTime?.length || 0} max={CONTENT_LIMITS.blog.readTime} />
                      </div>
                      <input
                        type="text"
                        maxLength={CONTENT_LIMITS.blog.readTime}
                        value={blogDraft.readTime}
                        onChange={(e) => setBlogDraft({ ...blogDraft, readTime: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40 uppercase">Card Summary (Excerpt)</label>
                      <CharCounter current={blogDraft.summary?.length || 0} max={CONTENT_LIMITS.blog.summary} />
                    </div>
                    <textarea
                      rows={2}
                      maxLength={CONTENT_LIMITS.blog.summary}
                      value={blogDraft.summary}
                      onChange={(e) => setBlogDraft({ ...blogDraft, summary: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40 uppercase">Article Lead (Opening paragraph)</label>
                      <CharCounter current={blogDraft.content.lead?.length || 0} max={CONTENT_LIMITS.blog.lead} />
                    </div>
                    <textarea
                      rows={2}
                      maxLength={CONTENT_LIMITS.blog.lead}
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
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9.5px] text-white/30 uppercase">Heading</span>
                          <CharCounter current={sec.heading?.length || 0} max={CONTENT_LIMITS.blog.sectionHeading} />
                        </div>
                        <input
                          type="text"
                          maxLength={CONTENT_LIMITS.blog.sectionHeading}
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

        {/* TAB 7: CONTACT */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
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

        {/* TAB 7: TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  Terminal Commands & Responses
                </h2>
                <p className="text-[10px] text-white/40">
                  Custom terminal commands executable in the EC2 interactive console.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCmdName(null)
                  setTerminalDraft({ name: '', output: '' })
                  setIsTerminalModalOpen(true)
                }}
                className="px-3 py-1.5 bg-white text-black text-xs font-semibold hover:bg-white/80 transition-colors cursor-pointer"
              >
                + ADD COMMAND
              </button>
            </div>

            {/* Existing Custom Commands */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
                  Registered Custom Commands ({Object.keys(terminalCommands).length})
                </h3>
              </div>
              {Object.keys(terminalCommands).length === 0 ? (
                <p className="text-xs text-white/30 italic font-mono">No custom commands registered yet.</p>
              ) : (
                Object.entries(terminalCommands).map(([cmd, out]) => (
                  <div key={cmd} className="border border-white/10 p-3.5 bg-black flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <span className="text-emerald-400 font-bold text-xs font-mono">$ {cmd}</span>
                      <pre className="text-xs text-white/60 font-mono whitespace-pre-wrap break-words">{out}</pre>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCmdName(cmd)
                          setTerminalDraft({ name: cmd, output: out })
                          setIsTerminalModalOpen(true)
                        }}
                        className="px-2.5 py-1 text-xs border border-white/20 text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer"
                      >
                        EDIT
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete command '$ ${cmd}'?`)) {
                            const copy = { ...terminalCommands }
                            delete copy[cmd]
                            setTerminalCommands(copy)
                            showToast(`Deleted command '${cmd}'`)
                          }
                        }}
                        className="px-2.5 py-1 text-xs border border-red-500/30 text-red-400 hover:border-red-500 transition-colors cursor-pointer"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Terminal Command Modal */}
            {isTerminalModalOpen && (
              <div
                data-lenis-prevent
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              >
                <div
                  data-lenis-prevent
                  className="bg-black border border-white/20 p-6 max-w-lg w-full space-y-4 shadow-2xl font-mono"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-white">
                      {editingCmdName ? `EDIT COMMAND: $ ${editingCmdName}` : 'ADD TERMINAL COMMAND'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsTerminalModalOpen(false)}
                      className="text-white/40 hover:text-white text-xs font-mono"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">
                        Command String (e.g. secret, certs, ping)
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={terminalDraft.name}
                        onChange={(e) =>
                          setTerminalDraft((prev) => ({
                            ...prev,
                            name: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                          }))
                        }
                        placeholder="my-command"
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white font-mono focus:border-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">
                        Terminal Response Text
                      </label>
                      <textarea
                        rows={5}
                        value={terminalDraft.output}
                        onChange={(e) => setTerminalDraft((prev) => ({ ...prev, output: e.target.value }))}
                        placeholder="Output displayed when this command is entered in EC2 interactive console..."
                        className="w-full bg-white/[0.03] border border-white/20 p-2 text-xs text-white font-mono focus:border-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsTerminalModalOpen(false)}
                      className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveTerminalCommand}
                      className="px-4 py-1.5 text-xs bg-white text-black font-semibold hover:bg-white/80"
                    >
                      SAVE COMMAND
                    </button>
                  </div>
                </div>
              </div>
            )}
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

      {/* Right Split Pane: Live Site Preview (5/5 Split) */}
      <div
        className={`w-full lg:w-1/2 flex-1 min-w-0 min-h-0 overflow-hidden ${
          mobilePane === 'editor' ? 'hidden lg:flex' : 'flex'
        } flex-col`}
      >
        <SitePreview
          dict={currentDict}
          lang={selectedLang}
          activeSection={activeTab}
        />
      </div>
      </div>
    </div>
  )
}
