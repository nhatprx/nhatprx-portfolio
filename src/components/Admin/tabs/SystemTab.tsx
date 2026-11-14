import {
  resetStoredTranslations,
  getStoredTranslations,
  saveRemoteTranslations,
  type SupportedLang,
  type TranslationDict,
} from '../../../services/contentStorage'
import type { ToastVariant } from '../Toast'

interface SystemTabProps {
  translations: Record<SupportedLang, TranslationDict>
  setTranslations: React.Dispatch<React.SetStateAction<Record<SupportedLang, TranslationDict>>>
  onUpdateTranslations: (data: Record<SupportedLang, TranslationDict>) => void
  showToast: (msg: string, variant?: ToastVariant) => void
}

export default function SystemTab({
  translations,
  setTranslations,
  onUpdateTranslations,
  showToast,
}: SystemTabProps) {
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
          Wipe all customized content overrides (local cache and S3) and restore default factory
          translations for all languages. Uploaded resume files stay in the bucket.
        </p>
        <div>
          <button
            type="button"
            onClick={async () => {
              if (
                confirm(
                  'Are you sure you want to reset all data to default? All custom edits will be wiped.'
                )
              ) {
                resetStoredTranslations()
                const defaults = getStoredTranslations()
                setTranslations(defaults)
                onUpdateTranslations(defaults)
                await saveRemoteTranslations(defaults)
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
        <p className="text-xs text-white/60 leading-relaxed">
          The admin passkey is verified server-side (PBKDF2 hash on the API host). It cannot be
          changed from this dashboard because that would require storing a new hash on the server.
        </p>
        <div className="border border-white/10 bg-black/40 p-3 text-[11px] font-mono text-white/50">
          <div className="text-white/30 uppercase text-[9.5px] mb-1">To rotate the passkey</div>
          Run this on the server host:
          <pre className="mt-1.5 whitespace-pre-wrap break-all text-emerald-400/90">
{`sudo bash ~/nhatprx-api/setup-secrets.sh "your-new-passkey"
sudo systemctl restart nhatprx-api`}
          </pre>
        </div>
      </div>

      {/* Local Development Setup */}
      <div className="border border-white/15 p-5 bg-white/[0.02] space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
          Local Development Setup
        </h2>
        <p className="text-xs text-white/60 leading-relaxed">
          Run the API from the <span className="text-emerald-400/90">server/</span> folder so it
          picks up the local secrets and proxies correctly.
        </p>
        <div className="border border-white/10 bg-black/40 p-3 text-[11px] font-mono text-white/50">
          <div className="text-white/30 uppercase text-[9.5px] mb-1">One-time setup</div>
          <pre className="mt-1.5 whitespace-pre-wrap break-all text-emerald-400/90">
{`cd server
npm install
npm run setup:secrets   # writes .testdata/passkey.hash (passkey: admin2026)
npm run setup:cors      # allows browser PUT uploads to the resume bucket`}
          </pre>
        </div>
        <div className="border border-white/10 bg-black/40 p-3 text-[11px] font-mono text-white/50">
          <div className="text-white/30 uppercase text-[9.5px] mb-1">Run the API</div>
          <pre className="mt-1.5 whitespace-pre-wrap break-all text-emerald-400/90">
{`cd server && npm start   # listens on 127.0.0.1:8787
npm run dev             # in a second terminal, proxies /api to the API`}
          </pre>
        </div>
      </div>
    </div>
  )
}
