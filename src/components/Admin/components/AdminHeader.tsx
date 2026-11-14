import type { SupportedLang } from '../../../services/contentStorage'

interface AdminHeaderProps {
  selectedLang: SupportedLang
  onSelectLang: (lang: SupportedLang) => void
  mobilePane: 'editor' | 'preview'
  onToggleMobilePane: (pane: 'editor' | 'preview') => void
  onCloseAndSync: () => void
  onLogout: () => void
  onAutoTranslate: () => void
  isAutoTranslating: boolean
}

export default function AdminHeader({
  selectedLang,
  onSelectLang,
  mobilePane,
  onToggleMobilePane,
  onCloseAndSync,
  onLogout,
  onAutoTranslate,
  isAutoTranslating,
}: AdminHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-black/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 font-mono">
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-bold text-xs tracking-widest text-white uppercase">
          ADMIN DASHBOARD
        </span>
      </div>

      {/* Language selector & Navigation controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Tabs */}
        <div className="flex items-center border border-white/15 p-0.5 bg-white/[0.02]">
          {(['en', 'vi', 'fr', 'ja'] as SupportedLang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onSelectLang(l)}
              className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider transition-colors cursor-pointer ${
                selectedLang === l
                  ? 'bg-white text-black font-bold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* View Mode Switcher for mobile screens */}
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
          type="button"
          onClick={onAutoTranslate}
          disabled={isAutoTranslating}
          className="px-2.5 py-1 border border-emerald-500/30 text-emerald-300 hover:border-emerald-400 hover:text-emerald-200 disabled:opacity-50 disabled:cursor-wait text-xs transition-colors cursor-pointer"
          title={`Dịch nội dung ${selectedLang.toUpperCase()} sang các ngôn ngữ còn lại`}
        >
          {isAutoTranslating ? 'TRANSLATING...' : 'AUTO-TRANSLATE'}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="px-2.5 py-1 border border-red-500/30 text-red-400 hover:border-red-500 hover:text-red-300 text-xs transition-colors cursor-pointer"
        >
          LOGOUT
        </button>

        {/* Close Admin Portal */}
        <button
          type="button"
          onClick={onCloseAndSync}
          className="px-2.5 py-1 border border-white/20 text-white/70 hover:text-white hover:border-white text-xs transition-colors cursor-pointer"
          title="Close Admin Portal"
        >
          ✕ CLOSE
        </button>
      </div>
    </header>
  )
}
