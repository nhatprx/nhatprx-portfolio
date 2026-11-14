import { useState } from 'react'
import {
  getStoredPresets,
  savePreset,
  deletePreset,
  type SupportedLang,
  type TranslationDict,
  type ContentPreset,
} from '../../../services/contentStorage'
import type { ToastVariant } from '../Toast'

interface PresetsTabProps {
  translations: Record<SupportedLang, TranslationDict>
  currentDict: TranslationDict
  selectedLang: SupportedLang
  resumeUrl?: string
  resumeFileName?: string
  onLoadPreset: (preset: ContentPreset) => void
  showToast: (msg: string, variant?: ToastVariant) => void
}

export default function PresetsTab({
  translations,
  resumeUrl,
  resumeFileName,
  onLoadPreset,
  showToast,
}: PresetsTabProps) {
  const [presets, setPresets] = useState<ContentPreset[]>(getStoredPresets())
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      showToast('Preset name is required', 'error')
      return
    }

    setIsSaving(true)
    try {
      const preset = savePreset(presetName.trim(), '', translations, resumeUrl, resumeFileName)
      setPresets(getStoredPresets())
      setPresetName('')
      setShowSaveForm(false)
      showToast(`Preset "${preset.name}" saved successfully`)
    } catch (err) {
      showToast('Failed to save preset', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadPreset = (preset: ContentPreset) => {
    if (confirm(`Load preset "${preset.name}"? Current edits will be replaced.`)) {
      onLoadPreset(preset)
      showToast(`Loaded preset: ${preset.name}`)
    }
  }

  const handleDeletePreset = (id: string, name: string) => {
    if (confirm(`Delete preset "${name}"? This cannot be undone.`)) {
      deletePreset(id)
      setPresets(getStoredPresets())
      showToast(`Deleted preset: ${name}`)
    }
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="border border-white/10 bg-white/[0.015] p-3.5 flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-widest">
          Content Presets
        </span>
        <span className="text-xs text-white/60">{presets.length} saved preset(s)</span>
      </div>

      {/* Save New Preset */}
      <div className="border border-emerald-500/20 p-5 bg-emerald-500/[0.02] space-y-4">
        <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-emerald-500/20 pb-2">
          Save Current Content as Preset
        </h2>
        <p className="text-xs text-white/60 leading-relaxed">
          Save your current portfolio content + resume PDF as a named preset. You can later switch between different presets.
        </p>

        {showSaveForm ? (
          <div className="space-y-3 border border-white/10 p-4 bg-black/40">
            <div>
              <label className="block text-xs text-white/70 mb-1.5 font-semibold">Preset Name</label>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., Senior Engineer Profile"
                className="w-full px-3 py-2 border border-white/20 bg-black/60 text-white text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                autoFocus
              />
            </div>
            <div className="border border-white/10 p-3 bg-black/60 rounded text-xs text-white/60">
              <div className="font-semibold text-white/80 mb-1.5">Resume to save with this preset:</div>
              {resumeFileName ? (
                <div className="text-emerald-400">Attached: {resumeFileName}</div>
              ) : (
                <div className="text-amber-400">No resume (default will be used)</div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowSaveForm(false)
                  setPresetName('')
                }}
                className="px-3 py-1.5 border border-white/20 text-white/70 hover:text-white text-xs transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSavePreset}
                disabled={isSaving}
                className="px-3 py-1.5 border border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 text-xs font-bold transition-colors"
              >
                {isSaving ? 'SAVING...' : 'SAVE PRESET'}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSaveForm(true)}
            className="px-4 py-2 border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 hover:border-emerald-500 transition-colors"
          >
            + SAVE AS NEW PRESET
          </button>
        )}
      </div>

      {/* Presets List */}
      <div className="border border-white/15 p-5 bg-white/[0.02] space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
          Your Presets
        </h2>

        {presets.length === 0 ? (
          <p className="text-xs text-white/50 italic">No presets saved yet. Create one to get started!</p>
        ) : (
          <div className="space-y-2">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="border border-white/10 p-3 bg-black/40 hover:border-white/20 transition-colors"
              >
                <div className="mb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{preset.name}</h3>
                      <div className="text-[10px] text-white/40 mt-1.5 space-y-0.5">
                        <div>{new Date(preset.timestamp).toLocaleDateString()}</div>
                        {preset.resumeFileName && (
                          <div className="text-emerald-400/70">Resume: {preset.resumeFileName}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleLoadPreset(preset)}
                    className="px-2.5 py-1 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400 hover:text-emerald-200 text-xs font-semibold transition-colors"
                  >
                    LOAD
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePreset(preset.id, preset.name)}
                    className="px-2.5 py-1 border border-red-500/40 bg-red-500/10 text-red-400 hover:border-red-500 hover:text-red-300 text-xs transition-colors"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
