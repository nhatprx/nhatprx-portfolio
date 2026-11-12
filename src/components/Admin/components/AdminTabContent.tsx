import type { SupportedLang, TranslationDict, CustomTerminalCommands } from '../../../services/contentStorage'
import type { TabType } from '../types'
import HeroAboutTab from '../tabs/HeroAboutTab'
import SkillsTab from '../tabs/SkillsTab'
import ExperienceTab from '../tabs/ExperienceTab'
import ProjectsTab from '../tabs/ProjectsTab'
import BlogTab from '../tabs/BlogTab'
import ContactTab from '../tabs/ContactTab'
import TerminalTab from '../tabs/TerminalTab'
import SystemTab from '../tabs/SystemTab'

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
  showToast: (msg: string) => void
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
  switch (activeTab) {
    case 'about':
      return (
        <HeroAboutTab
          currentDict={currentDict}
          selectedLang={selectedLang}
          updateCurrentDict={updateCurrentDict}
          showToast={showToast}
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
          allTranslations={translations}
          updateCurrentDict={updateCurrentDict}
          showToast={showToast}
        />
      )
    case 'projects':
      return (
        <ProjectsTab
          currentDict={currentDict}
          selectedLang={selectedLang}
          allTranslations={translations}
          updateCurrentDict={updateCurrentDict}
          showToast={showToast}
        />
      )
    case 'blog':
      return (
        <BlogTab
          currentDict={currentDict}
          selectedLang={selectedLang}
          allTranslations={translations}
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
      return (
        <SystemTab
          translations={translations}
          setTranslations={setTranslations}
          onUpdateTranslations={onUpdateTranslations}
          showToast={showToast}
        />
      )
    default:
      return null
  }
}

