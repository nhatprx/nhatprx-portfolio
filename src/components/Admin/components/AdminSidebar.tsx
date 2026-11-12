import type { SupportedLang } from '../../../services/contentStorage'
import type { TabType } from '../types'

interface AdminSidebarProps {
  selectedLang: SupportedLang
  activeTab: TabType
  onSelectTab: (tab: TabType) => void
  counts: {
    skills: number
    experience: number
    projects: number
    blog: number
    terminal: number
  }
}

export default function AdminSidebar({
  selectedLang,
  activeTab,
  onSelectTab,
  counts,
}: AdminSidebarProps) {
  const tabs: { id: TabType; num: string; label: string; count?: number }[] = [
    { id: 'about', num: '01', label: 'HERO & ABOUT' },
    { id: 'skills', num: '02', label: 'SKILLS', count: counts.skills },
    { id: 'experience', num: '03', label: 'EXPERIENCE', count: counts.experience },
    { id: 'projects', num: '04', label: 'PROJECTS', count: counts.projects },
    { id: 'blog', num: '05', label: 'BLOG / NOTES', count: counts.blog },
    { id: 'contact', num: '06', label: 'CONTACT' },
    { id: 'terminal', num: '07', label: 'TERMINAL', count: counts.terminal },
    { id: 'system', num: '08', label: 'BACKUP & PASSKEY' },
  ]

  return (
    <aside
      data-lenis-prevent
      className="w-44 sm:w-52 border-r border-white/10 bg-black/60 flex flex-col shrink-0 overflow-y-auto overscroll-contain admin-scroll p-3 space-y-1 select-none font-mono"
    >
      <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-white/30 uppercase border-b border-white/5 mb-1 flex items-center justify-between">
        <span>SECTIONS</span>
        <span className="text-[9px] text-emerald-400 font-bold">{selectedLang.toUpperCase()}</span>
      </div>

      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
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
  )
}

