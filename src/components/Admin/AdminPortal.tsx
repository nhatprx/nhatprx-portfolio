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
import SitePreview from './SitePreview'
import AdminHeader from './components/AdminHeader'
import AdminSidebar from './components/AdminSidebar'
import AdminTabContent from './components/AdminTabContent'
import LoginGate from './components/LoginGate'
import type { TabType } from './types'
import { mergeValidDict } from './utils/validation'

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

  // Auto-Save Engine (syncs automatically to localStorage and live site on every change)
  const isFirstMount = useRef(true)
  const lastPersistedRef = useRef(translations)

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    const timer = setTimeout(() => {
      const current = translations[selectedLang]
      const lastSaved = lastPersistedRef.current[selectedLang] || current
      const safeDict = mergeValidDict(current, lastSaved)

      const updatedToSave = {
        ...translations,
        [selectedLang]: safeDict,
      }
      lastPersistedRef.current = updatedToSave

      saveStoredTranslations(updatedToSave)
      saveStoredTerminalCommands(terminalCommands)
      onUpdateTranslations(translations)
    }, 350)

    return () => clearTimeout(timer)
  }, [translations, terminalCommands, onUpdateTranslations, selectedLang])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleCloseAndSync = () => {
    const current = translations[selectedLang]
    const lastSaved = lastPersistedRef.current[selectedLang] || current
    const safeDict = mergeValidDict(current, lastSaved)

    const updatedToSave = {
      ...translations,
      [selectedLang]: safeDict,
    }
    saveStoredTranslations(updatedToSave)
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

  const currentDict = translations[selectedLang]

  const updateCurrentDict = (updater: (prev: TranslationDict) => TranslationDict) => {
    setTranslations((prev) => ({
      ...prev,
      [selectedLang]: updater(prev[selectedLang]),
    }))
  }

  if (!isAuthenticated) {
    return (
      <LoginGate
        inputPass={inputPass}
        setInputPass={setInputPass}
        loginError={loginError}
        setLoginError={setLoginError}
        onLogin={handleLogin}
        onClose={onClose}
      />
    )
  }

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex bg-black text-white font-mono select-text overflow-hidden overscroll-contain"
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-4 py-2 text-xs font-mono backdrop-blur-md shadow-2xl flex items-center gap-2">
          <span>●</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Split Layout: Left = Homepage Content Preview, Right = Dashboard Area (in place of Terminal) */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* LEFT 50%: Homepage Main Content Area (Scrollable Live View with animated grid) */}
        <div
          className={`w-full lg:w-1/2 flex-1 min-w-0 min-h-0 overflow-hidden ${mobilePane === 'editor' ? 'hidden lg:flex' : 'flex'
            } flex-col border-r border-white/10`}
        >
          <SitePreview
            dict={currentDict}
            lang={selectedLang}
            activeSection={activeTab}
            onLangChange={setSelectedLang}
          />
        </div>

        {/* RIGHT 50%: Admin Dashboard Window (Occupies Terminal Area, Header is placed here ONLY) */}
        <div
          className={`w-full lg:w-1/2 flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-black/95 ${mobilePane === 'preview' ? 'hidden lg:flex' : 'flex'
            }`}
        >
          {/* Header positioned exclusively on the right pane */}
          <AdminHeader
            selectedLang={selectedLang}
            onSelectLang={setSelectedLang}
            mobilePane={mobilePane}
            onToggleMobilePane={setMobilePane}
            onCloseAndSync={handleCloseAndSync}
            onLogout={handleLogout}
          />

          {/* Sub-container: Sidebar + Editor Content */}
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Dashboard Navigation Sidebar */}
            <AdminSidebar
              selectedLang={selectedLang}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              counts={{
                skills: currentDict.skills.categories.length,
                experience: currentDict.experience.items.length,
                projects: currentDict.projects.items.length,
                blog: currentDict.blog.posts.length,
              }}
            />

            {/* Dashboard Section Editor */}
            <main
              data-lenis-prevent
              className="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-contain admin-scroll p-4 sm:p-6 lg:p-8 space-y-6"
            >
              <AdminTabContent
                activeTab={activeTab}
                currentDict={currentDict}
                selectedLang={selectedLang}
                translations={translations}
                terminalCommands={terminalCommands}
                setTerminalCommands={setTerminalCommands}
                setTranslations={setTranslations}
                updateCurrentDict={updateCurrentDict}
                onUpdateTranslations={onUpdateTranslations}
                showToast={showToast}
              />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
