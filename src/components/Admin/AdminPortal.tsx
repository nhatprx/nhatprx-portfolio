import { useState, useEffect, useRef } from 'react'
import {
  getStoredTranslations,
  saveStoredTranslations,
  getStoredTerminalCommands,
  saveStoredTerminalCommands,
  loadRemoteTranslations,
  saveRemoteTranslations,
  type SupportedLang,
  type TranslationDict,
  type CustomTerminalCommands,
} from '../../services/contentStorage'
import { login as apiLogin, logout as apiLogout, isLoggedIn, translatePortfolio } from '../../services/adminApi'
import SitePreview from './SitePreview'
import AdminHeader from './components/AdminHeader'
import type { SyncStatus } from './components/AdminHeader'
import AdminSidebar from './components/AdminSidebar'
import AdminTabContent from './components/AdminTabContent'
import LoginGate from './components/LoginGate'
import Toast, { type ToastVariant } from './Toast'
import type { TabType } from './types'
import { mergeValidDict } from './utils/validation'

interface AdminPortalProps {
  onClose: () => void
  onUpdateTranslations: (data: Record<SupportedLang, TranslationDict>) => void
}

export default function AdminPortal({ onClose, onUpdateTranslations }: AdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isLoggedIn())
  const [inputPass, setInputPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)

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
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null)
  const [isAutoTranslating, setIsAutoTranslating] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  // Auto-Save Engine (syncs automatically to localStorage, S3 and the live site on every change)
  const isFirstMount = useRef(true)
  const lastPersistedRef = useRef(translations)

  const showToast = (msg: string, variant: ToastVariant = 'success') => {
    setToast({ message: msg, variant })
  }

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    const timer = setTimeout(async () => {
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
      // Publish the same sanitized dict that is persisted, otherwise the live
      // site shows a different value than the one stored in S3.
      onUpdateTranslations(updatedToSave)
      
      if (isAuthenticated) {
        setSyncStatus('saving')
        const success = await saveRemoteTranslations(updatedToSave)
        setSyncStatus(success ? 'saved' : 'error')
        if (!success) {
          showToast('Failed to sync to cloud (saved locally)', 'error')
          setTimeout(() => setSyncStatus('idle'), 2000)
        } else {
          setTimeout(() => setSyncStatus('idle'), 1500)
        }
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [translations, terminalCommands, onUpdateTranslations, selectedLang, isAuthenticated])

  // Pull the shared content from S3 once the admin is authenticated.
  useEffect(() => {
    if (!isAuthenticated) return
    let active = true
    loadRemoteTranslations().then((remote) => {
      if (!active) return
      setTranslations(remote)
      lastPersistedRef.current = remote
      onUpdateTranslations(remote)
    })
    return () => {
      active = false
    }
  }, [isAuthenticated, onUpdateTranslations])

  const handleCloseAndSync = async () => {
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
    
    if (isAuthenticated) {
      setSyncStatus('saving')
      const success = await saveRemoteTranslations(updatedToSave)
      if (success) {
        showToast('✓ Changes saved to cloud', 'success')
      } else {
        showToast('✗ Failed to sync to cloud (saved locally)', 'error')
      }
    }
    
    onClose()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputPass.trim()) {
      setLoginError('Authentication failed: Invalid passkey')
      return
    }
    setIsAuthenticating(true)
    setLoginError('')
    try {
      await apiLogin(inputPass.trim())
      setIsAuthenticated(true)
    } catch {
      setLoginError('Authentication failed: Invalid passkey')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLogout = () => {
    apiLogout()
    setIsAuthenticated(false)
  }

  const handleAutoTranslate = async () => {
    if (isAutoTranslating) return

    const targetLangs = (['vi', 'fr', 'ja'] as const).filter((lang) => lang !== selectedLang)
    if (targetLangs.length === 0) return

    if (
      !confirm(
        `Dịch toàn bộ nội dung từ ${selectedLang.toUpperCase()} sang ${targetLangs
          .map((lang) => lang.toUpperCase())
          .join(', ')}? Nội dung hiện tại của các ngôn ngữ đích sẽ được thay thế.`
      )
    ) {
      return
    }

    setIsAutoTranslating(true)
    try {
      const source = translations[selectedLang]
      const translated: Partial<Record<SupportedLang, TranslationDict>> = {}

      for (const lang of targetLangs) {
        const result = await translatePortfolio({
          source: source as unknown as Record<string, unknown>,
          sourceLang: selectedLang,
          targetLang: lang,
          onProgress: (message) => showToast(message, 'info'),
        })
        translated[lang] = result as unknown as TranslationDict
      }

      setTranslations((prev) => ({
        ...prev,
        ...translated,
      }))
      showToast(`Đã dịch và áp dụng cho ${targetLangs.join(', ').toUpperCase()}.`)
    } catch (error) {
      console.error('Auto translation failed:', error)
      showToast('Không thể dịch bằng AWS Bedrock. Nội dung nguồn đã được giữ nguyên.', 'error')
    } finally {
      setIsAutoTranslating(false)
    }
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
        isSubmitting={isAuthenticating}
      />
    )
  }

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex bg-black text-white font-mono select-text overflow-hidden overscroll-contain"
    >
      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
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
            onAutoTranslate={handleAutoTranslate}
            isAutoTranslating={isAutoTranslating}
            syncStatus={syncStatus}
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
