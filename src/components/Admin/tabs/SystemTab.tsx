import { useState } from 'react'
import {
  setAdminPasskey,
  resetStoredTranslations,
  getStoredTranslations,
  type SupportedLang,
  type TranslationDict,
} from '../../../services/contentStorage'

interface SystemTabProps {
  translations: Record<SupportedLang, TranslationDict>
  setTranslations: React.Dispatch<React.SetStateAction<Record<SupportedLang, TranslationDict>>>
  onUpdateTranslations: (data: Record<SupportedLang, TranslationDict>) => void
  showToast: (msg: string) => void
}

export default function SystemTab({
  translations,
  setTranslations,
  onUpdateTranslations,
  showToast,
}: SystemTabProps) {
  const [newPasskey, setNewPasskey] = useState('')

  return (
    <div className="space-y-6 font-mono">
      {/* Top Header Bar */}
      <div className="border border-white/10 bg-white/[0.015] p-3.5 flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-widest">
          Settings & System Controls
        </span>
      </div>

      {/* Reset Data for Default */}
      <div className="border border-red-500/20 p-5 bg-red-500/[0.02] space-y-4">
        <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider border-b border-red-500/20 pb-2">
          Data Reset & Factory Defaults
        </h2>
        <p className="text-xs text-white/60 leading-relaxed">
          Wipe all customized content overrides from local storage and restore default factory translations for all languages.
        </p>
        <div>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to reset all data to default? All custom edits in localStorage will be wiped.'
                )
              ) {
                resetStoredTranslations()
                const defaults = getStoredTranslations()
                setTranslations(defaults)
                onUpdateTranslations(defaults)
                showToast('Reset data to default successfully!')
              }
            }}
            className="px-4 py-2 border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 hover:border-red-500 transition-colors cursor-pointer"
          >
            ↺ RESET DATA TO DEFAULT
          </button>
        </div>
      </div>

      {/* Backup / Export */}
      <div className="border border-white/15 p-5 bg-white/[0.02] space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
          Backup / Export
        </h2>
        <p className="text-xs text-white/60 leading-relaxed">
          Export your current content as JSON to keep a safe offline backup or commit directly into the repository.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              const dataStr =
                'data:text/json;charset=utf-8,' +
                encodeURIComponent(JSON.stringify(translations, null, 2))
              const a = document.createElement('a')
              a.href = dataStr
              a.download = `portfolio-content-backup-${new Date().toISOString().slice(0, 10)}.json`
              a.click()
              showToast('Backup JSON downloaded!')
            }}
            className="px-4 py-2 border border-white/20 text-white text-xs hover:border-white transition-colors cursor-pointer"
          >
            DOWNLOAD JSON BACKUP
          </button>
        </div>
      </div>

      {/* Security & Passkey */}
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
              className="flex-1 bg-white/[0.03] border border-white/20 p-2 text-xs text-white focus:outline-none focus:border-white font-mono"
            />
            <button
              type="button"
              onClick={() => {
                if (!newPasskey.trim()) return
                setAdminPasskey(newPasskey)
                setNewPasskey('')
                showToast('Admin passkey updated!')
              }}
              className="px-4 py-2 bg-white text-black text-xs font-bold hover:bg-white/80 cursor-pointer"
            >
              UPDATE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
