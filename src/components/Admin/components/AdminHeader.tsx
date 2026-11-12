import type { SupportedLang } from '../../../services/contentStorage'

interface AdminHeaderProps {
  selectedLang: SupportedLang
  onSelectLang: (lang: SupportedLang) => void
  mobilePane: 'editor' | 'preview'
  onToggleMobilePane: (pane: 'editor' | 'preview') => void
  isTranslating: boolean
  translateStatus: string
  onSyncTranslateAll: () => void
  saveStatus: 'saved' | 'saving'
  onManualSave: () => void
  onCloseAndSync: () => void
  onLogout: () => void
}

export default function AdminHeader({
  selectedLang,
  onSelectLang,
  mobilePane,
  onToggleMobilePane,
  isTranslating,
  translateStatus,
  onSyncTranslateAll,
  saveStatus,
  onManualSave,
  onCloseAndSync,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-black/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 font-mono">
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
              onClick={() => onSelectLang(l)}
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
            onClick={() => onToggleMobilePane('editor')}
            className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider transition-colors ${
              mobilePane === 'editor' ? 'bg-white text-black font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            EDIT
          </button>
          <button
            type="button"
            onClick={() => onToggleMobilePane('preview')}
            className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider transition-colors ${
              mobilePane === 'preview' ? 'bg-white text-black font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            PREVIEW
          </button>
        </div>

        <button
          onClick={onSyncTranslateAll}
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
          onClick={onManualSave}
          title="All changes are auto-saved in real-time. Click to force save immediately."
          className="px-3.5 py-1.5 bg-white text-black text-xs font-bold hover:bg-white/80 transition-colors cursor-pointer"
        >
          SAVE CHANGES
        </button>
        <button
          onClick={onCloseAndSync}
          className="px-3.5 py-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white text-xs transition-colors cursor-pointer"
        >
          VIEW SITE
        </button>
        <button
          onClick={onLogout}
          className="px-3 py-1.5 border border-red-500/30 text-red-400 hover:border-red-500 hover:text-red-300 text-xs transition-colors cursor-pointer"
        >
          LOGOUT
        </button>
      </div>
    </header>
  )
}

