import { useState } from 'react'
import type {
  SupportedLang,
  TranslationDict,
  CustomTerminalCommands,
  ContentPreset,
} from '../../../services/contentStorage'
import TerminalTab from './TerminalTab'
import SystemTab from './SystemTab'
import PresetsTab from './PresetsTab'
import type { ToastVariant } from '../Toast'

type ControlPane = 'terminal' | 'presets' | 'system'

interface ControlTabProps {
  translations: Record<SupportedLang, TranslationDict>
  currentDict: TranslationDict
  selectedLang: SupportedLang
  terminalCommands: CustomTerminalCommands
  setTerminalCommands: React.Dispatch<React.SetStateAction<CustomTerminalCommands>>
  setTranslations: React.Dispatch<React.SetStateAction<Record<SupportedLang, TranslationDict>>>
  updateCurrentDict: (updater: (prev: TranslationDict) => TranslationDict) => void
  onUpdateTranslations: (data: Record<SupportedLang, TranslationDict>) => void
  onLoadPreset: (preset: ContentPreset) => void
  showToast: (msg: string, variant?: ToastVariant) => void
}

/** Terminal commands, content presets and system settings in one place. */
export default function ControlTab({
  translations,
  currentDict,
  selectedLang,
  terminalCommands,
  setTerminalCommands,
  setTranslations,
  onUpdateTranslations,
  onLoadPreset,
  showToast,
}: ControlTabProps) {
  const [pane, setPane] = useState<ControlPane>('terminal')

  const panes: { id: ControlPane; label: string }[] = [
    { id: 'terminal', label: 'TERMINAL COMMANDS' },
    { id: 'presets', label: 'PRESETS' },
    { id: 'system', label: 'SYSTEM & BACKUP' },
  ]

  return (
    <div className="space-y-3 font-mono">
      <div className="border border-white/10 bg-white/[0.015] p-3.5 flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-widest">Control</span>
        <span className="text-[10px] text-white/40">TERMINAL · PRESETS · SYSTEM</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {panes.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPane(p.id)}
            className={`px-2.5 py-2 text-[10px] tracking-wider border text-left cursor-pointer transition-colors ${
              pane === p.id
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                : 'border-white/10 bg-white/[0.02] text-white/50 hover:text-white hover:border-white/30'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {pane === 'terminal' && (
        <TerminalTab
          terminalCommands={terminalCommands}
          setTerminalCommands={setTerminalCommands}
          showToast={showToast}
        />
      )}

      {pane === 'presets' && (
        <PresetsTab
          translations={translations}
          currentDict={currentDict}
          selectedLang={selectedLang}
          resumeUrl={currentDict.hero?.resumeUrl}
          resumeFileName={currentDict.hero?.resumeFileName}
          onLoadPreset={onLoadPreset}
          showToast={showToast}
        />
      )}

      {pane === 'system' && (
        <SystemTab
          translations={translations}
          setTranslations={setTranslations}
          onUpdateTranslations={onUpdateTranslations}
          showToast={showToast}
        />
      )}
    </div>
  )
}
