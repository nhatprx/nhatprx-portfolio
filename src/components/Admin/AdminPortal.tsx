import { useState, useEffect, useRef } from 'react'
import {
  getStoredTranslations,
  saveStoredTranslations,
  getStoredTerminalCommands,
  saveStoredTerminalCommands,
  getAdminPasskey,
  isAdminAuthenticated,
  setAdminAuthenticated,
  type SupportedLang,
  type TranslationDict,
  type CustomTerminalCommands,
} from '../../services/contentStorage'
import { translateEntireDict } from '../../services/autoTranslate'
import SitePreview from './SitePreview'
import AdminHeader from './components/AdminHeader'
import AdminSidebar from './components/AdminSidebar'
import type { TabType } from './types'

// Tab components
import HeroAboutTab from './tabs/HeroAboutTab'
import SkillsTab from './tabs/SkillsTab'
import ExperienceTab from './tabs/ExperienceTab'
import ProjectsTab from './tabs/ProjectsTab'
import BlogTab from './tabs/BlogTab'
import ContactTab from './tabs/ContactTab'
import TerminalTab from './tabs/TerminalTab'
import SystemTab from './tabs/SystemTab'

interface AdminPortalProps {
  onClose: () => void
  onUpdateTranslations: (data: Record<SupportedLang, TranslationDict>) => void
}

export default function AdminPortal({ onClose, onUpdateTranslations }: AdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminAuthenticated())
  const [inputPass, setInputPass] = useState('')
  const [loginError, setLoginError] = useState('')

  // Admin Data State
  const [translations, setTranslations] = useState<Record<SupportedLang, TranslationDict>>(() =>
    getStoredTranslations()
  )
  const [terminalCommands, setTerminalCommands] = useState<CustomTerminalCommands>(() =>
    getStoredTerminalCommands()
  )
  const [selectedLang, setSelectedLang] = useState<SupportedLang>('en')
  const [activeTab, setActiveTab] = useState<TabType>('about')
  const [mobilePane, setMobilePane] = useState<'editor' | 'preview'>('editor')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Translation Automation State
  const [isTranslating, setIsTranslating] = useState<boolean>(false)
  const [translateStatus, setTranslateStatus] = useState<string>('')

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

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleManualSave = () => {
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

  const currentDict = translations[selectedLang]

  const updateCurrentDict = (updater: (prev: TranslationDict) => TranslationDict) => {
    setTranslations((prev) => ({
      ...prev,
      [selectedLang]: updater(prev[selectedLang]),
    }))
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

      {/* Header */}
      <AdminHeader
        selectedLang={selectedLang}
        onSelectLang={setSelectedLang}
        mobilePane={mobilePane}
        onToggleMobilePane={setMobilePane}
        isTranslating={isTranslating}
        translateStatus={translateStatus}
        onSyncTranslateAll={handleSyncTranslateAll}
        saveStatus={saveStatus}
        onManualSave={handleManualSave}
        onCloseAndSync={handleCloseAndSync}
        onLogout={handleLogout}
      />

      {/* Main Split Layout */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <AdminSidebar
          selectedLang={selectedLang}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          counts={{
            skills: currentDict.skills.categories.length,
            experience: currentDict.experience.items.length,
            projects: currentDict.projects.items.length,
            blog: currentDict.blog.posts.length,
            terminal: Object.keys(terminalCommands).length,
          }}
        />

        {/* Center Main Editor Area (5/5 Split) */}
        <main
          data-lenis-prevent
          className={`w-full lg:w-1/2 flex-1 min-w-0 border-r border-white/10 min-h-0 overflow-y-auto overscroll-contain admin-scroll p-4 sm:p-6 lg:p-8 space-y-6 ${
            mobilePane === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {activeTab === 'about' && (
            <HeroAboutTab
              currentDict={currentDict}
              selectedLang={selectedLang}
              updateCurrentDict={updateCurrentDict}
              showToast={showToast}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsTab
              currentDict={currentDict}
              selectedLang={selectedLang}
              updateCurrentDict={updateCurrentDict}
              showToast={showToast}
            />
          )}

          {activeTab === 'experience' && (
            <ExperienceTab
              currentDict={currentDict}
              selectedLang={selectedLang}
              allTranslations={translations}
              updateCurrentDict={updateCurrentDict}
              showToast={showToast}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsTab
              currentDict={currentDict}
              selectedLang={selectedLang}
              allTranslations={translations}
              updateCurrentDict={updateCurrentDict}
              showToast={showToast}
            />
          )}

          {activeTab === 'blog' && (
            <BlogTab
              currentDict={currentDict}
              selectedLang={selectedLang}
              allTranslations={translations}
              updateCurrentDict={updateCurrentDict}
              showToast={showToast}
            />
          )}

          {activeTab === 'contact' && (
            <ContactTab
              currentDict={currentDict}
              selectedLang={selectedLang}
              updateCurrentDict={updateCurrentDict}
              showToast={showToast}
            />
          )}

          {activeTab === 'terminal' && (
            <TerminalTab
              terminalCommands={terminalCommands}
              setTerminalCommands={setTerminalCommands}
              showToast={showToast}
            />
          )}

          {activeTab === 'system' && (
            <SystemTab
              translations={translations}
              setTranslations={setTranslations}
              onUpdateTranslations={onUpdateTranslations}
              showToast={showToast}
            />
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
