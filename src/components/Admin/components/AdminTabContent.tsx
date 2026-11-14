import type { SupportedLang, TranslationDict, CustomTerminalCommands, ContentPreset } from '../../../services/contentStorage'
import type { TabType } from '../types'
import HeroAboutTab from '../tabs/HeroAboutTab'
import SkillsTab from '../tabs/SkillsTab'
import ExperienceTab from '../tabs/ExperienceTab'
import ProjectsTab from '../tabs/ProjectsTab'
import BlogTab from '../tabs/BlogTab'
import ContactTab from '../tabs/ContactTab'
import TerminalTab from '../tabs/TerminalTab'
import SystemTab from '../tabs/SystemTab'
import PresetsTab from '../tabs/PresetsTab'
import type { ToastVariant } from '../Toast'

interface AdminTabContentProps {
  activeTab: TabType
  currentDict: TranslationDict
  selectedLang: SupportedLang
  translations: Record<SupportedLang, TranslationDict>
  terminalCommands: CustomTerminalCommands
  setTerminalCommands: React.Dispatch<React.SetStateAction<CustomTerminalCommands>>
  setTranslations: React.Dispatch<React.SetStateAction<Record<SupportedLang, TranslationDict>>>
  updateCurrentDict: (updater: (prev: TranslationDict) => TranslationDict) => void
  onUpdateTranslations: (data: Record<SupportedLang, TranslationDict>) => void
  showToast: (msg: string, variant?: ToastVariant) => void
}

export default function AdminTabContent({
  activeTab,
  currentDict,
  selectedLang,
  translations,
  terminalCommands,
  setTerminalCommands,
  setTranslations,
  updateCurrentDict,
  onUpdateTranslations,
  showToast,
}: AdminTabContentProps) {
  const handleUpdateResumeAcrossAllLangs = (resumeUrl: string, resumeFileName: string) => {
    setTranslations((prev) => {
      const next = { ...prev }
      for (const code of ['en', 'vi', 'fr', 'ja'] as SupportedLang[]) {
        if (next[code]) {
          next[code] = {
            ...next[code],
            hero: {
              ...next[code].hero,
              resumeUrl,
              resumeFileName,
            },
          }
        }
      }
      return next
    })
  }

  // The identity is global: one edit is written to every language so the
  // header, hero, footer and contact section always agree.
  const handleUpdateIdentityAcrossAllLangs = (
    patch: Partial<TranslationDict['identity']>
  ) => {
    setTranslations((prev) => {
      const next = { ...prev }
      for (const code of ['en', 'vi', 'fr', 'ja'] as SupportedLang[]) {
        if (next[code]) {
          next[code] = {
            ...next[code],
            identity: { ...next[code].identity, ...patch },
          }
        }
      }
      return next
    })
  }

  switch (activeTab) {
    case 'about':
      return (
        <HeroAboutTab
          currentDict={currentDict}
          selectedLang={selectedLang}
          updateCurrentDict={updateCurrentDict}
          showToast={showToast}
          updateResumeAcrossAllLangs={handleUpdateResumeAcrossAllLangs}
        />
      )
    case 'skills':
      return (
        <SkillsTab
          currentDict={currentDict}
          selectedLang={selectedLang}
          updateCurrentDict={updateCurrentDict}
          showToast={showToast}
        />
      )
    case 'experience':
      return (
        <ExperienceTab
          currentDict={currentDict}
          selectedLang={selectedLang}
          updateCurrentDict={updateCurrentDict}
          showToast={showToast}
        />
      )
    case 'projects':
      return (
        <ProjectsTab
          currentDict={currentDict}
          selectedLang={selectedLang}
          updateCurrentDict={updateCurrentDict}
          showToast={showToast}
        />
      )
    case 'blog':
      return (
        <BlogTab
          currentDict={currentDict}
          selectedLang={selectedLang}
          updateCurrentDict={updateCurrentDict}
          showToast={showToast}
        />
      )
    case 'contact':
      return (
        <ContactTab
          currentDict={currentDict}
          selectedLang={selectedLang}
          updateCurrentDict={updateCurrentDict}
          updateIdentityAcrossAllLangs={handleUpdateIdentityAcrossAllLangs}
          showToast={showToast}
        />
      )
    case 'terminal':
      return (
        <TerminalTab
          terminalCommands={terminalCommands}
          setTerminalCommands={setTerminalCommands}
          showToast={showToast}
        />
      )
    case 'system':
    case 'settings':
      return (
        <SystemTab
          translations={translations}
          setTranslations={setTranslations}
          onUpdateTranslations={onUpdateTranslations}
          showToast={showToast}
        />
      )
    case 'presets':
      return (
        <PresetsTab
          translations={translations}
          currentDict={currentDict}
          selectedLang={selectedLang}
          resumeUrl={currentDict.hero?.resumeUrl}
          resumeFileName={currentDict.hero?.resumeFileName}
          onLoadPreset={(preset: ContentPreset) => {
            setTranslations(preset.translations)
            onUpdateTranslations(preset.translations)
            if (preset.resumeUrl) {
              handleUpdateResumeAcrossAllLangs(preset.resumeUrl, preset.resumeFileName || 'resume.pdf')
            }
          }}
          showToast={showToast}
        />
      )
    default:
      return null
  }
}

